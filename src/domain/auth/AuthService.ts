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

            // Preserve user and sessionToken if present (from browser flow)
            const result: AuthResult = {
                stage: authState.stage,
                needsVerification: authState.needsVerification,
                authState: authState.authState,
            };

            // If browser flow completed, preserve user and sessionToken
            const authStateWithUser = authState as any;
            if (authStateWithUser.user && authStateWithUser.sessionToken) {
                (result as any).user = authStateWithUser.user;
                (result as any).sessionToken = authStateWithUser.sessionToken;
            }

            return result;
        } catch (error) {
            // Don't log here - let useAuth handle logging with proper context
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

            // Preserve user and sessionToken if present (from browser flow)
            const result: AuthResult = {
                stage: authState.stage,
                needsVerification: authState.needsVerification,
                authState: authState.authState,
            };

            // If browser flow completed, preserve user and sessionToken
            const authStateWithUser = authState as any;
            if (authStateWithUser.user && authStateWithUser.sessionToken) {
                (result as any).user = authStateWithUser.user;
                (result as any).sessionToken = authStateWithUser.sessionToken;
            }

            return result;
        } catch (error) {
            // Don't log here - let useAuth handle logging with proper context
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
            // Don't log here - let useAuth handle logging with proper context
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

            // If result already has user and sessionToken (from loginWithPasskey fallback),
            // return it directly
            // Note: These properties may be added by ParaAuthProvider even though they're not in the port interface
            if (
                result.success &&
                (result as any).user &&
                (result as any).sessionToken
            ) {
                return {
                    success: true,
                    user: (result as any).user,
                    sessionToken: (result as any).sessionToken,
                };
            }

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
        } catch (error: any) {
            const errorMessage = error?.message || 'Unknown error';
            console.error('[AuthService] Verification failed', {
                error: errorMessage,
                fullError: error,
            });

            // If error is "Account already exists", the ParaAuthProvider should have
            // already tried loginWithPasskey, but if it didn't work, re-throw
            if (
                errorMessage.includes('Account already exists') ||
                errorMessage.includes('already exists')
            ) {
                // Try loginWithPasskey as fallback
                console.log(
                    '[AuthService] Attempting loginWithPasskey as fallback'
                );
                try {
                    const passkeyResult =
                        await this.authProvider.loginWithPasskey();
                    if (passkeyResult.success) {
                        // Import session to get user and sessionToken
                        const sessionImport =
                            await this.authProvider.importSessionToBackend();
                        return {
                            success: true,
                            user: sessionImport.user as User,
                            sessionToken: sessionImport.sessionToken,
                        };
                    }
                } catch (passkeyError) {
                    console.error(
                        '[AuthService] loginWithPasskey fallback also failed',
                        {
                            error: passkeyError,
                        }
                    );
                }
            }

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
            // Check if OAuth signup already completed (user and sessionToken already provided)
            // This happens when OAuthAuthStrategy handles signup and wallet creation internally
            if (
                authState &&
                typeof authState === 'object' &&
                'user' in authState &&
                'sessionToken' in authState &&
                authState.user &&
                authState.sessionToken
            ) {
                console.log(
                    '[AuthService] OAuth signup already completed with wallet creation',
                    {
                        userId: authState.user.id,
                    }
                );
                return {
                    success: true,
                    sessionToken: authState.sessionToken,
                    user: authState.user as User,
                };
            }

            // For OAuth, handle different stages:
            // - 'signup' or 'verify': New user - register passkey
            // - 'login': Existing user - login with passkey
            // - 'done': User already fully authenticated - just import session
            if (authState?.stage === 'done') {
                // User is already fully authenticated - session should be active
                // Verify session is active before importing
                const isActive = await this.authProvider.isSessionActive();
                if (!isActive) {
                    throw new Error(
                        'Session is not active after OAuth completion'
                    );
                }

                // Import the session to backend to get backend session token and user info
                const sessionImport =
                    await this.authProvider.importSessionToBackend();

                return {
                    success: true,
                    sessionToken: sessionImport.sessionToken,
                    user: sessionImport.user as User,
                };
            } else if (
                authState?.stage === 'verify' ||
                authState?.stage === 'signup'
            ) {
                // New user - register passkey
                // Note: If wallet creation was already handled in OAuthAuthStrategy,
                // this should still work as passkey registration happens after wallet creation
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
                // Existing user (stage === 'login') - login with passkey
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
     * Uses backend /auth/me endpoint to get current user info
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

            // Get session token from auth store (set during login)
            const state = useAuthStore.getState();
            const sessionToken = state.sessionToken;

            if (!sessionToken) {
                throw new Error('No session token found');
            }

            // Get user info from backend /auth/me endpoint
            // The sessionToken is stored in auth store and will be used by authApiClient
            // Note: Backend returns User object directly (not wrapped in { success, data })
            let response;
            try {
                response = await authApiClient.getCurrentUser();
            } catch (error: any) {
                // If the request itself failed (network error, 401, etc.)
                const statusCode = error?.status || error?.statusCode;
                if (statusCode === 401 || statusCode === 403) {
                    throw new Error(
                        'Session expired or invalid - please login again'
                    );
                }
                // Handle 404 as session not found (user doesn't exist or session invalid)
                if (statusCode === 404) {
                    throw new Error(
                        'Session not found - please login again'
                    );
                }
                throw new Error(
                    `Failed to retrieve user information: ${error?.message || 'Unknown error'}`
                );
            }

            // Handle different response formats:
            // 1. Wrapped format: { success: true, data: User }
            // 2. Direct format: User (as per OpenAPI spec)
            // 3. Array format: [User, ...] (backend bug, but handle gracefully)
            let user: User | null = null;

            if (response && typeof response === 'object') {
                // Check if it's wrapped format
                if (
                    'success' in response &&
                    'data' in response &&
                    response.success
                ) {
                    user = response.data as User;
                }
                // Check if it's an array (backend bug - should return single user)
                else if (Array.isArray(response)) {
                    // Take first user from array (workaround for backend bug)
                    console.warn(
                        '[AuthService] Backend returned array instead of single user, using first element'
                    );
                    user = response[0] as User;
                }
                // Check if it's direct User object (expected format per OpenAPI spec)
                else if ('id' in response && 'email' in response) {
                    user = response as User;
                }
            }

            if (!user || !user.id) {
                console.error(
                    '[AuthService] Invalid response from getCurrentUser',
                    {
                        responseType: Array.isArray(response)
                            ? 'array'
                            : typeof response,
                        hasId: user?.id ? true : false,
                        response: JSON.stringify(response).substring(0, 200),
                    }
                );
                throw new Error(
                    'Failed to retrieve user information from backend: Invalid response format'
                );
            }

            return {
                user,
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
