/**
 * OAuth Authentication Strategy
 *
 * Handles OAuth-based authentication flow (Google, Apple)
 */

import * as WebBrowser from 'expo-web-browser';
import { AuthState } from '../../../ports/AuthProvider';
import { ParaErrorHandler } from '../services/ErrorHandler';
import { BaseAuthStrategy } from './BaseAuthStrategy';

// App scheme for OAuth redirects (must match app.json scheme)
const APP_SCHEME = 'rampaapp';

export class OAuthAuthStrategy extends BaseAuthStrategy {
    getName(): string {
        return 'oauth';
    }

    async signUpOrLogIn(provider: 'google' | 'apple'): Promise<AuthState> {
        try {
            // Convert provider to Para SDK format (uppercase)
            const oauthMethod = provider.toUpperCase() as 'GOOGLE' | 'APPLE';

            // Step 1: Get OAuth URL from Para SDK
            const oauthUrl = await this.paraClient.getOAuthUrl({
                method: oauthMethod,
                appScheme: APP_SCHEME,
            });

            // Step 2: Open OAuth browser session
            // This will redirect to the OAuth provider (Google/Apple) and back to the app
            const result = await WebBrowser.openAuthSessionAsync(
                oauthUrl,
                APP_SCHEME,
                {
                    preferEphemeralSession: false,
                }
            );

            // Check if user cancelled the OAuth flow
            if (result.type === 'cancel') {
                const cancelError = new Error(
                    'OAuth authentication was cancelled'
                );
                (cancelError as any).isCancelled = true;
                throw cancelError;
            }

            // Step 3: Verify OAuth with Para SDK
            // This completes the OAuth flow and returns the auth state
            const verifiedAuthState = await this.paraClient.verifyOAuth({
                method: oauthMethod,
            });

            if (!verifiedAuthState) {
                throw new Error('OAuth verification returned no auth state');
            }

            // Log the verified auth state for debugging
            const isNewUser = (verifiedAuthState as any).isNewUser === true;
            const passwordUrl = (verifiedAuthState as any).passwordUrl;
            const authMethods = (verifiedAuthState as any).authMethods || [];

            console.log('[OAuthAuthStrategy] OAuth verification completed', {
                stage: verifiedAuthState.stage,
                isNewUser,
                hasPasswordUrl: !!passwordUrl,
                hasPasskeyUrl: !!(verifiedAuthState as any).passkeyUrl,
                authMethods,
            });

            // PRIMARY DECISION: Use isNewUser flag as primary indicator
            // (Para team confirmed: stage can be confusing due to legacy behavior)
            // When isNewUser === true, always create wallet using userSetupAfterLogin()

            if (isNewUser) {
                // NEW USER FLOW
                // Always create wallet for new users using userSetupAfterLogin()
                // This handles all cases: stage="done", stage="login", stage="signup"
                console.log(
                    '[OAuthAuthStrategy] New user detected - starting signup flow to create wallet',
                    {
                        stage: verifiedAuthState.stage,
                        note: 'Using isNewUser flag as primary indicator (handles legacy stage="done" behavior)',
                    }
                );

                try {
                    // New user needs signup flow to create wallet
                    // Based on Para example: waitForSignup() → userSetupAfterLogin()
                    await this.browserAuth.waitForSignup();

                    // userSetupAfterLogin() is required to hydrate session and create wallet
                    // Para team confirmed this is the correct method
                    await this.browserAuth.userSetupAfterLogin();

                    await this.sessionService.touchSession();

                    const sessionImport =
                        await this.sessionService.importSessionToBackend();

                    console.log(
                        '[OAuthAuthStrategy] New user signup completed successfully (wallet created)',
                        {
                            userId: sessionImport.user.id,
                        }
                    );

                    // Return complete auth state with user and sessionToken
                    return {
                        stage: 'login',
                        needsVerification: false,
                        authState: null,
                        user: sessionImport.user as any,
                        sessionToken: sessionImport.sessionToken,
                    } as any;
                } catch (error: any) {
                    console.warn(
                        '[OAuthAuthStrategy] Signup flow failed for new user, will fall back to passkey registration',
                        {
                            error: error?.message,
                        }
                    );

                    // Fall back to passkey registration in completeOAuth
                    return {
                        stage: 'verify', // Map to 'verify' for passkey registration
                        needsVerification: false,
                        authState: verifiedAuthState,
                    };
                }
            } else {
                // EXISTING USER FLOW
                // Handle based on authentication method (password vs passkey)
                console.log(
                    '[OAuthAuthStrategy] Existing user - handling based on auth method',
                    {
                        stage: verifiedAuthState.stage,
                        hasPasswordUrl: !!passwordUrl,
                    }
                );

                if (passwordUrl) {
                    // Password-based user - open password portal
                    const result =
                        await this.browserAuth.openAuthSession(passwordUrl);

                    if (result.type !== 'success') {
                        throw new Error('Password login cancelled');
                    }

                    // Wait for login to complete and check if wallet creation is needed
                    const waitForLoginResult =
                        await this.browserAuth.waitForLogin();

                    console.log('[OAuthAuthStrategy] waitForLogin result', {
                        needsWallet:
                            waitForLoginResult &&
                            typeof waitForLoginResult === 'object' &&
                            'needsWallet' in waitForLoginResult
                                ? (waitForLoginResult as any).needsWallet
                                : undefined,
                    });

                    // Check if wallet creation is needed (from Para example pattern)
                    if (
                        waitForLoginResult &&
                        typeof waitForLoginResult === 'object' &&
                        'needsWallet' in waitForLoginResult &&
                        waitForLoginResult.needsWallet
                    ) {
                        console.log(
                            '[OAuthAuthStrategy] Wallet creation needed after login - waiting for wallet creation'
                        );
                        await this.browserAuth.waitForWalletCreation();
                    }

                    await this.sessionService.touchSession();
                }
                // If no passwordUrl, user has passkey-based security (handled in completeOAuth)

                return {
                    stage: 'login',
                    needsVerification: false,
                    authState: verifiedAuthState,
                };
            }
        } catch (error: any) {
            // Handle cancellation separately
            if (ParaErrorHandler.isCancellationError(error)) {
                throw error; // Re-throw cancellation errors as-is
            }

            const errorInfo = ParaErrorHandler.extractErrorInfo(error);
            throw ParaErrorHandler.createAuthError(provider, errorInfo);
        }
    }
}
