import { AuthProvider, ProviderFactory } from '../../shared/infrastructure';
import { authApiClient } from './apiClient';
import { useAuthStore } from './authStore';
import { User } from './types';

export interface AuthResult {
    stage: 'verify' | 'login';
    needsVerification?: boolean;
    success?: boolean;
    authState?: any; // For passkey registration
}

export interface VerificationResult {
    success: boolean;
    user?: User;
    sessionToken?: string;
}

export class AuthService {
    private currentAuthState: any = null;

    constructor(
        private authProvider: AuthProvider = ProviderFactory.createAuthProvider()
    ) {}

    /**
     * Sign up or log in user with email
     */
    async signUpOrLogInWithEmail(email: string): Promise<AuthResult> {
        try {
            const authState =
                await this.authProvider.signUpOrLogInWithEmail(email);
            this.currentAuthState = authState.authState;

            return {
                stage: authState.stage,
                needsVerification: authState.needsVerification,
                authState: authState.authState,
            };
        } catch (error) {
            console.error('Email authentication failed:', error);
            throw error;
        }
    }

    /**
     * Sign up or log in user with phone number
     */
    async signUpOrLogInWithPhone(phoneNumber: string): Promise<AuthResult> {
        try {
            const authState =
                await this.authProvider.signUpOrLogInWithPhone(phoneNumber);
            this.currentAuthState = authState.authState;

            return {
                stage: authState.stage,
                needsVerification: authState.needsVerification,
                authState: authState.authState,
            };
        } catch (error) {
            console.error('Phone authentication failed:', error);
            throw error;
        }
    }

    /**
     * Sign up or log in user with OAuth provider
     */
    async signUpOrLogInWithOAuth(
        provider: 'google' | 'apple'
    ): Promise<AuthResult> {
        try {
            const authState =
                await this.authProvider.signUpOrLogInWithOAuth(provider);
            this.currentAuthState = authState.authState;

            return {
                stage: authState.stage,
                needsVerification: authState.needsVerification,
                authState: authState.authState,
            };
        } catch (error) {
            console.error(`${provider} authentication failed:`, error);
            throw error;
        }
    }

    /**
     * Resend verification code (for email or phone)
     */
    async resendVerificationCode(): Promise<void> {
        try {
            await this.authProvider.resendVerificationCode();
        } catch (error) {
            console.error('Failed to resend verification code:', error);
            throw new Error('Failed to resend verification code');
        }
    }

    /**
     * Verify new account with verification code (for email or phone)
     */
    async verifyNewAccount(
        verificationCode: string
    ): Promise<VerificationResult> {
        try {
            const result = await this.authProvider.verifyNewAccount(
                verificationCode,
                this.currentAuthState
            );

            if (!result.success) {
                return { success: false };
            }

            // Store the verified auth state for passkey registration
            this.currentAuthState = result.authState;

            // Register passkey for new user
            const passkeyResult = await this.authProvider.registerPasskey(
                result.authState
            );

            if (!passkeyResult.success) {
                return { success: false };
            }

            // Import session to backend to get backend session token and user info
            const sessionImport =
                await this.authProvider.importSessionToBackend();

            return {
                success: true,
                sessionToken: sessionImport.sessionToken,
                user: sessionImport.user as User,
            };
        } catch (error) {
            console.error('Verification failed:', error);
            throw new Error('Verification failed');
        }
    }

    /**
     * Login existing user with passkey
     */
    async loginWithPasskey(): Promise<VerificationResult> {
        try {
            const result = await this.authProvider.loginWithPasskey();

            if (!result.success) {
                return { success: false };
            }

            // Import session to backend to get backend session token and user info
            const sessionImport =
                await this.authProvider.importSessionToBackend();

            return {
                success: true,
                sessionToken: sessionImport.sessionToken,
                user: sessionImport.user as User,
            };
        } catch (error) {
            console.error('Passkey login failed:', error);
            throw new Error('Passkey login failed');
        }
    }

    /**
     * Complete OAuth authentication (register or login with passkey)
     */
    async completeOAuth(authState: any): Promise<VerificationResult> {
        try {
            // For OAuth, if stage is 'verify', register passkey; if 'login', login with passkey
            // The authState from signUpOrLogInWithOAuth contains the stage info
            if (authState?.stage === 'verify') {
                // New user - register passkey
                const result =
                    await this.authProvider.registerPasskey(authState);
                if (!result.success) {
                    return { success: false };
                }

                // Import session to backend to get backend session token and user info
                const sessionImport =
                    await this.authProvider.importSessionToBackend();

                return {
                    success: true,
                    sessionToken: sessionImport.sessionToken,
                    user: sessionImport.user as User,
                };
            } else {
                // Existing user - login with passkey
                return await this.loginWithPasskey();
            }
        } catch (error) {
            console.error('OAuth completion failed:', error);
            throw new Error('OAuth completion failed');
        }
    }

    /**
     * Check if session is active
     */
    async isSessionActive(): Promise<boolean> {
        try {
            return await this.authProvider.isSessionActive();
        } catch (error) {
            console.error('Failed to check session status:', error);
            return false;
        }
    }

    /**
     * Keep session alive (extend active session)
     */
    async keepSessionAlive(): Promise<boolean> {
        try {
            return await this.authProvider.keepSessionAlive();
        } catch (error) {
            console.error('Failed to keep session alive:', error);
            return false;
        }
    }

    /**
     * Export session for server
     */
    exportSession(options?: { excludeSigners?: boolean }): string {
        try {
            return this.authProvider.exportSession(options);
        } catch (error) {
            console.error('Failed to export session:', error);
            throw new Error('Failed to export session');
        }
    }

    /**
     * Validate session with backend
     * Uses backend /user endpoint to get current user info
     */
    async validateSessionWithBackend(): Promise<{
        user: User;
        sessionToken: string;
    }> {
        try {
            // Check if session is active using auth provider
            const isActive = await this.authProvider.isSessionActive();
            if (!isActive) {
                throw new Error('Session is not active');
            }

            // Get user info from backend /user endpoint
            // The sessionToken is stored in auth store and will be used by authApiClient
            const response = await authApiClient.getCurrentUser();

            if (!response.success || !response.data) {
                throw new Error(
                    'Failed to retrieve user information from backend'
                );
            }

            // Get session token from auth store (set during login)
            const state = useAuthStore.getState();
            const sessionToken = state.sessionToken;

            if (!sessionToken) {
                throw new Error('Session token not found');
            }

            return {
                user: response.data,
                sessionToken,
            };
        } catch (error) {
            console.error('Session validation failed:', error);
            throw new Error('Session validation failed');
        }
    }

    /**
     * Logout user
     */
    async logout(): Promise<void> {
        try {
            await this.authProvider.logout();
        } catch (error) {
            console.error('Logout failed:', error);
            throw new Error('Logout failed');
        }
    }
}
