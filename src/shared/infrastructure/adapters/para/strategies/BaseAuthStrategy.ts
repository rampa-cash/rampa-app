/**
 * Base Authentication Strategy
 *
 * Abstract base class that provides shared logic for all authentication strategies.
 * Contains common patterns like loginUrl handling and portal URL handling.
 */

import { ParaMobile } from '@getpara/react-native-wallet';
import { AuthState } from '../../../ports/AuthProvider';
import { BrowserAuthService } from '../services/BrowserAuthService';
import { SessionService } from '../services/SessionService';
import { AuthStrategy } from './AuthStrategy';

export abstract class BaseAuthStrategy implements AuthStrategy {
    constructor(
        protected paraClient: ParaMobile,
        protected browserAuth: BrowserAuthService,
        protected sessionService: SessionService
    ) {}

    abstract signUpOrLogIn(
        identifier: string | 'google' | 'apple'
    ): Promise<AuthState>;

    abstract getName(): string;

    /**
     * Shared method: Handle loginUrl flow (used by email and phone)
     * This handles the one-click login/signup flow via browser
     */
    protected async handleLoginUrlFlow(
        loginUrl: string,
        nextStage: string,
        signupAuthMethods: string[],
        context: { email?: string; phone?: string }
    ): Promise<AuthState> {
        const identifier = context.email || context.phone || 'user';
        console.log(
            `[BaseAuthStrategy] loginUrl detected for ${this.getName()} - opening browser for one-click authentication`,
            {
                loginUrl: loginUrl.substring(0, 100) + '...',
                nextStage,
                identifier,
            }
        );

        try {
            // Open browser for authentication
            const result = await this.browserAuth.openAuthSession(loginUrl);

            if (result.type !== 'success') {
                throw new Error('Browser authentication cancelled');
            }

            const isOneClickLogin = nextStage === 'login';

            if (isOneClickLogin) {
                // One-click login - wait for login to complete
                console.log(
                    `[BaseAuthStrategy] One-click login flow for ${this.getName()} - waiting for login to complete`
                );
                await this.browserAuth.waitForLogin();
                await this.sessionService.touchSession();

                const sessionImport =
                    await this.sessionService.importSessionToBackend();
                console.log(
                    `[BaseAuthStrategy] One-click ${this.getName()} login completed successfully`,
                    {
                        userId: sessionImport.user.id,
                    }
                );

                return {
                    stage: 'login',
                    needsVerification: false,
                    authState: null,
                    user: sessionImport.user as any,
                    sessionToken: sessionImport.sessionToken,
                } as any;
            } else {
                // One-click signup - wait for signup to complete
                console.log(
                    `[BaseAuthStrategy] One-click signup flow for ${this.getName()} - waiting for signup to complete`
                );
                await this.browserAuth.waitForSignup();

                // Check if signup method is BASIC_LOGIN (password-based)
                // If so, wait for wallet creation to complete
                if (signupAuthMethods.includes('BASIC_LOGIN')) {
                    console.log(
                        `[BaseAuthStrategy] Password-based signup detected - waiting for wallet creation`
                    );
                    await this.browserAuth.waitForWalletCreation();
                }

                await this.sessionService.touchSession();

                const sessionImport =
                    await this.sessionService.importSessionToBackend();
                console.log(
                    `[BaseAuthStrategy] One-click ${this.getName()} signup completed successfully`,
                    {
                        userId: sessionImport.user.id,
                    }
                );

                return {
                    stage: 'login',
                    needsVerification: false,
                    authState: null,
                    user: sessionImport.user as any,
                    sessionToken: sessionImport.sessionToken,
                } as any;
            }
        } catch (error: any) {
            const errorMessage = error?.message || 'Unknown error';
            console.error(
                `[BaseAuthStrategy] Browser authentication flow failed for ${this.getName()}`,
                {
                    error: errorMessage,
                    fullError: error,
                }
            );
            throw new Error(`Browser authentication failed: ${errorMessage}`);
        }
    }

    /**
     * Shared method: Handle portal URLs (passkeyUrl, passwordUrl, pinUrl)
     * Returns AuthState if portal URL was handled, null otherwise
     */
    protected async handlePortalUrls(
        authState: any,
        context: { email?: string; phone?: string }
    ): Promise<AuthState | null> {
        const passkeyUrl =
            authState?.passkeyUrl ?? authState?.passkeyKnownDeviceUrl;
        const passwordUrl = authState?.passwordUrl;
        const pinUrl = authState?.pinUrl;

        const identifier = context.email || context.phone || 'user';
        console.log(
            `[BaseAuthStrategy] Existing ${this.getName()} user - checking portal URLs`,
            {
                identifier,
                stage: authState.stage,
                hasPasskeyUrl: !!passkeyUrl,
                hasPasswordUrl: !!passwordUrl,
                hasPinUrl: !!pinUrl,
            }
        );

        // Priority: passkeyUrl > passwordUrl > pinUrl
        if (passkeyUrl) {
            return this.handlePortalUrl(passkeyUrl, 'passkey', identifier);
        } else if (passwordUrl) {
            return this.handlePortalUrl(passwordUrl, 'password', identifier);
        } else if (pinUrl) {
            return this.handlePortalUrl(pinUrl, 'pin', identifier);
        }

        return null; // No portal URLs
    }

    /**
     * Handle a single portal URL
     */
    private async handlePortalUrl(
        url: string,
        type: string,
        identifier: string
    ): Promise<AuthState> {
        console.log(
            `[BaseAuthStrategy] Opening ${type} portal URL for ${this.getName()} user`
        );
        try {
            const result = await this.browserAuth.openAuthSession(url);

            if (result.type !== 'success') {
                throw new Error(`${type} login cancelled`);
            }

            await this.browserAuth.waitForLogin();
            await this.sessionService.touchSession();

            const sessionImport =
                await this.sessionService.importSessionToBackend();
            console.log(
                `[BaseAuthStrategy] ${type} login completed successfully for ${this.getName()}`,
                {
                    userId: sessionImport.user.id,
                    identifier,
                }
            );

            return {
                stage: 'login',
                needsVerification: false,
                authState: null,
                user: sessionImport.user as any,
                sessionToken: sessionImport.sessionToken,
            } as any;
        } catch (error: any) {
            console.error(
                `[BaseAuthStrategy] ${type} login failed for ${this.getName()}`,
                {
                    error: error?.message,
                    identifier,
                }
            );
            throw new Error(
                `${type} login failed: ${error?.message || 'Unknown error'}`
            );
        }
    }
}
