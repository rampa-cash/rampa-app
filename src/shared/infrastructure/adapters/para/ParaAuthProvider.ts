/**
 * Para Authentication Provider (Adapter)
 *
 * Implements AuthProvider interface using Para SDK
 * Based on Para SDK documentation: https://docs.getpara.com/v2/react-native/setup/expo
 * OAuth implementation based on: https://docs.getpara.com/v2/react-native/guides/social-login
 */

import { ParaMobile } from '@getpara/react-native-wallet';
import * as WebBrowser from 'expo-web-browser';
import { authApiClient } from '../../../../domain/auth/apiClient';
import {
    AuthProvider,
    AuthState,
    SessionImportResult,
    VerificationResult,
} from '../../ports/AuthProvider';
import { para } from './paraClient';

// App scheme for OAuth redirects (must match app.json scheme)
const APP_SCHEME = 'rampaapp';
const APP_SCHEME_REDIRECT_URL = `${APP_SCHEME}://para`;

export class ParaAuthProvider implements AuthProvider {
    constructor(private paraClient: ParaMobile = para) {}

    async initialize(): Promise<void> {
        try {
            await this.paraClient.init();
        } catch (error) {
            console.error('Failed to initialize Para SDK:', error);
            throw new Error('Para SDK initialization failed');
        }
    }

    async signUpOrLogInWithEmail(email: string): Promise<AuthState> {
        try {
            const authState = await this.paraClient.signUpOrLogIn({
                auth: { email },
            });

            if (authState?.stage === 'verify') {
                return {
                    stage: 'verify',
                    needsVerification: true,
                    authState,
                };
            } else if (authState?.stage === 'login') {
                return {
                    stage: 'login',
                    needsVerification: false,
                    authState,
                };
            }

            throw new Error('Unexpected auth state from Para SDK');
        } catch (error: any) {
            // Extract error information from Para SDK error
            let errorMessage = 'Unknown error';
            if (error instanceof Error) {
                errorMessage = error.message;
            } else if (error?.message) {
                errorMessage = error.message;
            }
            
            // Include status code and error code if available
            const statusCode = error?.status || error?.statusCode;
            const errorCode = error?.code;
            
            if (statusCode) {
                errorMessage = `${errorMessage} (Status: ${statusCode})`;
            }
            if (errorCode) {
                errorMessage = `${errorMessage} (Code: ${errorCode})`;
            }
            
            // Create error with preserved context (don't log here - useAuth will log)
            const authError = new Error(`Email authentication failed: ${errorMessage}`);
            (authError as any).originalError = error;
            (authError as any).statusCode = statusCode;
            (authError as any).errorCode = errorCode;
            
            throw authError;
        }
    }

    async signUpOrLogInWithPhone(phoneNumber: string): Promise<AuthState> {
        try {
            // Para SDK requires phone numbers in E.164 format: +{number}
            // Ensure phone number starts with + and contains only digits after
            const formattedPhone = phoneNumber.startsWith('+')
                ? phoneNumber
                : `+${phoneNumber.replace(/[^\d]/g, '')}`;

            // Type assertion needed because Para SDK expects template literal type `+${number}`
            const authState = await this.paraClient.signUpOrLogIn({
                auth: { phone: formattedPhone as `+${number}` },
            } as any);

            if (authState?.stage === 'verify') {
                return {
                    stage: 'verify',
                    needsVerification: true,
                    authState,
                };
            } else if (authState?.stage === 'login') {
                return {
                    stage: 'login',
                    needsVerification: false,
                    authState,
                };
            }

            throw new Error('Unexpected auth state from Para SDK');
        } catch (error: any) {
            // Extract error information from Para SDK error
            let errorMessage = 'Unknown error';
            if (error instanceof Error) {
                errorMessage = error.message;
            } else if (error?.message) {
                errorMessage = error.message;
            }
            
            // Include status code and error code if available
            const statusCode = error?.status || error?.statusCode;
            const errorCode = error?.code;
            
            if (statusCode) {
                errorMessage = `${errorMessage} (Status: ${statusCode})`;
            }
            if (errorCode) {
                errorMessage = `${errorMessage} (Code: ${errorCode})`;
            }
            
            // Create error with preserved context (don't log here - useAuth will log)
            const authError = new Error(`Phone authentication failed: ${errorMessage}`);
            (authError as any).originalError = error;
            (authError as any).statusCode = statusCode;
            (authError as any).errorCode = errorCode;
            
            throw authError;
        }
    }

    async signUpOrLogInWithOAuth(
        provider: 'google' | 'apple'
    ): Promise<AuthState> {
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
            const result = await WebBrowser.openAuthSessionAsync(oauthUrl, APP_SCHEME, {
                preferEphemeralSession: false,
            });

            // Check if user cancelled the OAuth flow
            if (result.type === 'cancel') {
                const cancelError = new Error('OAuth authentication was cancelled');
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
                    await WebBrowser.openAuthSessionAsync(
                        (verifiedAuthState as any).passwordUrl,
                        APP_SCHEME_REDIRECT_URL,
                        {
                            preferEphemeralSession: false,
                        }
                    );
                    // Wait for login to complete
                    await this.paraClient.waitForLogin({});
                }
                // If no passwordUrl, user has passkey-based security (handled in completeOAuth)

                return {
                    stage: 'login',
                    needsVerification: false,
                    authState: verifiedAuthState,
                };
            } else if (verifiedAuthState.stage === 'signup') {
                // New user - will need to register passkey (handled in completeOAuth)
                return {
                    stage: 'verify', // Map 'signup' to 'verify' for consistency
                    needsVerification: false,
                    authState: verifiedAuthState,
                };
            }

            throw new Error(`Unexpected auth state from Para SDK: ${(verifiedAuthState as any).stage}`);
        } catch (error: any) {
            // Handle cancellation separately
            if (error?.isCancelled) {
                throw error; // Re-throw cancellation errors as-is
            }

            // Extract error information from Para SDK error
            let errorMessage = 'Unknown error';
            if (error instanceof Error) {
                errorMessage = error.message;
            } else if (error?.message) {
                errorMessage = error.message;
            }
            
            // Include status code and error code if available
            const statusCode = error?.status || error?.statusCode;
            const errorCode = error?.code;
            
            // Build detailed error message for logging
            let detailedMessage = errorMessage;
            if (statusCode) {
                detailedMessage = `${detailedMessage} (Status: ${statusCode})`;
            }
            if (errorCode) {
                detailedMessage = `${detailedMessage} (Code: ${errorCode})`;
            }
            
            // Create error with detailed message
            const authError = new Error(
                `${provider} authentication failed: ${detailedMessage}`
            );
            // Preserve original error details for useAuth to handle
            (authError as any).originalError = error;
            (authError as any).statusCode = statusCode;
            (authError as any).errorCode = errorCode;
            
            // Don't log here - let useAuth handle logging with proper context
            // This prevents duplicate logs
            throw authError;
        }
    }

    async verifyNewAccount(
        verificationCode: string,
        authState?: any
    ): Promise<VerificationResult> {
        try {
            // Para SDK: para.verifyNewAccount({ verificationCode })
            const verifiedAuthState = await this.paraClient.verifyNewAccount({
                verificationCode,
            });

            return {
                success: true,
                authState: verifiedAuthState, // This will be used for passkey registration
            };
        } catch (error) {
            console.error('Failed to verify new account:', error);
            return {
                success: false,
            };
        }
    }

    async resendVerificationCode(): Promise<void> {
        try {
            // Para SDK: para.resendVerificationCode({ type?: 'SIGNUP' | 'LINK_ACCOUNT' | 'LOGIN' })
            // For new account verification, we use 'SIGNUP'
            await this.paraClient.resendVerificationCode({ type: 'SIGNUP' });
        } catch (error: any) {
            console.error('Failed to resend verification code:', error);
            
            // Extract error information from Para SDK error
            let errorMessage = 'Failed to resend verification code';
            if (error instanceof Error) {
                errorMessage = error.message;
            } else if (error?.message) {
                errorMessage = error.message;
            }
            
            // Include status code and error code if available
            const statusCode = error?.status || error?.statusCode;
            const errorCode = error?.code;
            
            if (statusCode) {
                errorMessage = `${errorMessage} (Status: ${statusCode})`;
            }
            if (errorCode) {
                errorMessage = `${errorMessage} (Code: ${errorCode})`;
            }
            
            throw new Error(errorMessage);
        }
    }

    async registerPasskey(authState: any): Promise<VerificationResult> {
        try {
            // Para SDK: para.registerPasskey(authState)
            // authState comes from verifyNewAccount response
            await this.paraClient.registerPasskey(authState);

            // After passkey registration, import session to backend
            // This will get the backend session token and user info
            await this.importSessionToBackend();

            return {
                success: true,
            };
        } catch (error) {
            console.error('Failed to register passkey:', error);
            return {
                success: false,
            };
        }
    }

    async loginWithPasskey(): Promise<VerificationResult> {
        try {
            // Para SDK: para.loginWithPasskey()
            // No authState needed - uses existing session context
            await this.paraClient.loginWithPasskey();

            // After passkey login, import session to backend
            // This will get the backend session token and user info
            await this.importSessionToBackend();

            return {
                success: true,
            };
        } catch (error) {
            console.error('Failed to login with passkey:', error);
            return {
                success: false,
            };
        }
    }

    async isSessionActive(): Promise<boolean> {
        try {
            // Para SDK: para.isSessionActive()
            // Reference: https://docs.getpara.com/v2/react-native/guides/sessions
            return await this.paraClient.isSessionActive();
        } catch (error) {
            console.error('Failed to check session status:', error);
            return false;
        }
    }

    async keepSessionAlive(): Promise<boolean> {
        try {
            // Para SDK: para.keepSessionAlive()
            // Extends an active session without requiring full reauthentication
            // Reference: https://docs.getpara.com/v2/react-native/guides/sessions
            return await this.paraClient.keepSessionAlive();
        } catch (error) {
            console.error('Failed to keep session alive:', error);
            return false;
        }
    }

    exportSession(options?: { excludeSigners?: boolean }): string {
        try {
            // Para SDK: para.exportSession({ excludeSigners?: boolean })
            // Exports session state to send to server
            // Reference: https://docs.getpara.com/v2/react-native/guides/sessions
            return this.paraClient.exportSession(options || {});
        } catch (error) {
            console.error('Failed to export session:', error);
            throw new Error('Failed to export session');
        }
    }

    async importSessionToBackend(): Promise<SessionImportResult> {
        try {
            // 1. Verify session is active before exporting
            const isActive = await this.isSessionActive();
            if (!isActive) {
                throw new Error('Cannot export session: session is not active');
            }

            // 2. Export Para session
            const serializedSession = this.exportSession({
                excludeSigners: true,
            });

            // Validate exported session
            if (!serializedSession || serializedSession.trim().length === 0) {
                throw new Error('Exported session is empty or invalid');
            }

            // 3. Import session to backend via API
            const result = await authApiClient.importSession(serializedSession);

            // 4. Return backend session token, user, and expiration
            return {
                sessionToken: result.sessionToken,
                user: result.user,
                expiresAt: result.expiresAt,
            };
        } catch (error) {
            console.error('Failed to import session to backend:', error);
            
            // Extract more detailed error information
            let errorMessage = 'Unknown error';
            if (error instanceof Error) {
                errorMessage = error.message;
            } else if (error && typeof error === 'object' && 'message' in error) {
                errorMessage = String(error.message);
            }
            
            // Check if it's a 401 error specifically
            const statusCode = (error as any)?.status || (error as any)?.statusCode;
            if (statusCode === 401) {
                errorMessage = `Session import unauthorized (401). The Para session may be invalid or expired. Original: ${errorMessage}`;
            }
            
            throw new Error(
                `Session import failed: ${errorMessage}`
            );
        }
    }

    async logout(): Promise<void> {
        try {
            await this.paraClient.logout();
        } catch (error) {
            console.error('Failed to logout:', error);
            throw new Error('Logout failed');
        }
    }
}
