/**
 * Para Authentication Provider (Adapter)
 *
 * Implements AuthProvider interface using Para SDK
 * Based on Para SDK documentation: https://docs.getpara.com/v2/react-native/setup/expo
 */

import { ParaMobile } from '@getpara/react-native-wallet';
import { authApiClient } from '../../../../domain/auth/apiClient';
import {
    AuthProvider,
    AuthState,
    SessionImportResult,
    VerificationResult,
} from '../../ports/AuthProvider';
import { para } from './paraClient';

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
        } catch (error) {
            console.error('Failed to sign up or log in with email:', error);
            throw new Error(
                `Email authentication failed: ${error instanceof Error ? error.message : 'Unknown error'}`
            );
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
        } catch (error) {
            console.error('Failed to sign up or log in with phone:', error);
            throw new Error(
                `Phone authentication failed: ${error instanceof Error ? error.message : 'Unknown error'}`
            );
        }
    }

    async signUpOrLogInWithOAuth(
        provider: 'google' | 'apple'
    ): Promise<AuthState> {
        try {
            // Para SDK OAuth format - use type assertion as OAuth is not in the strict Auth type
            const authState = await this.paraClient.signUpOrLogIn({
                auth: { oauth: { provider } },
            } as any);

            // OAuth typically returns 'login' for existing users or 'verify' for new users
            if (authState?.stage === 'verify') {
                return {
                    stage: 'verify',
                    needsVerification: false, // OAuth doesn't need OTP verification
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
        } catch (error) {
            console.error(
                `Failed to sign up or log in with ${provider}:`,
                error
            );
            throw new Error(
                `${provider} authentication failed: ${error instanceof Error ? error.message : 'Unknown error'}`
            );
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
            // Para SDK: para.resendVerificationCode()
            await this.paraClient.resendVerificationCode();
        } catch (error) {
            console.error('Failed to resend verification code:', error);
            throw new Error('Failed to resend verification code');
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
            // 1. Export Para session
            const serializedSession = this.exportSession({
                excludeSigners: true,
            });

            // 2. Import session to backend via API
            const result = await authApiClient.importSession(serializedSession);

            // 3. Return backend session token, user, and expiration
            return {
                sessionToken: result.sessionToken,
                user: result.user,
                expiresAt: result.expiresAt,
            };
        } catch (error) {
            console.error('Failed to import session to backend:', error);
            throw new Error(
                `Session import failed: ${error instanceof Error ? error.message : 'Unknown error'}`
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
