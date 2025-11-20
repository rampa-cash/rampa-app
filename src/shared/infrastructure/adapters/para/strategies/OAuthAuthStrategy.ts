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

            // Handle different auth states
            if (verifiedAuthState.stage === 'done') {
                // User is already fully authenticated - session is active
                // Just return 'login' stage so completeOAuth can import the session
                return {
                    stage: 'login',
                    needsVerification: false,
                    authState: verifiedAuthState,
                };
            } else if (verifiedAuthState.stage === 'login') {
                // Existing user - check if they use password or passkey
                // Note: passwordUrl is only present for password-based users
                if ((verifiedAuthState as any).passwordUrl) {
                    // User has password-based security - open password URL
                    const passwordUrl = (verifiedAuthState as any).passwordUrl;
                    const result =
                        await this.browserAuth.openAuthSession(passwordUrl);

                    if (result.type !== 'success') {
                        throw new Error('Password login cancelled');
                    }

                    // Wait for login to complete and check if wallet creation is needed
                    const waitForLoginResult = await this.browserAuth.waitForLogin();
                    
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
            } else if (verifiedAuthState.stage === 'signup') {
                // New user - wait for signup to complete and setup user
                // Based on Para example: https://github.com/getpara/examples-hub/blob/2.0.0-alpha/mobile/with-expo/src/components/OAuthAuth.tsx
                // The example calls waitForSignup() then userSetupAfterLogin() (not waitForWalletCreation)
                console.log(
                    '[OAuthAuthStrategy] New user signup - waiting for signup to complete'
                );
                
                try {
                    await this.browserAuth.waitForSignup();
                    
                    // userSetupAfterLogin() is required to hydrate session after signup
                    // This is what actually creates/sets up the wallet for new OAuth users
                    // Based on Para example finalizeSignup() pattern
                    console.log(
                        '[OAuthAuthStrategy] Setting up user after signup (hydrating session)'
                    );
                    await this.browserAuth.userSetupAfterLogin();
                    
                    await this.sessionService.touchSession();
                    
                    // Import session to get user and sessionToken (similar to phone/email one-click signup)
                    const sessionImport =
                        await this.sessionService.importSessionToBackend();
                    
                    console.log(
                        '[OAuthAuthStrategy] OAuth signup completed successfully',
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
                    // If waitForSignup or userSetupAfterLogin fails, fall back to passkey registration
                    // This allows the flow to continue with passkey registration in completeOAuth
                    console.warn(
                        '[OAuthAuthStrategy] Error during signup/user setup, will fall back to passkey registration',
                        {
                            error: error?.message,
                        }
                    );
                    
                    // Return signup stage so completeOAuth can handle passkey registration
                    return {
                        stage: 'verify', // Map 'signup' to 'verify' for consistency
                        needsVerification: false,
                        authState: verifiedAuthState,
                    };
                }
            }

            throw new Error(
                `Unexpected auth state from Para SDK: ${(verifiedAuthState as any).stage}`
            );
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
