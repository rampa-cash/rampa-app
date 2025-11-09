import { AuthProvider, ProviderFactory } from '../../shared/infrastructure';
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
            const authState = await this.authProvider.signUpOrLogInWithEmail(email);
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
            const authState = await this.authProvider.signUpOrLogInWithPhone(phoneNumber);
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
    async signUpOrLogInWithOAuth(provider: 'google' | 'apple'): Promise<AuthResult> {
        try {
            const authState = await this.authProvider.signUpOrLogInWithOAuth(provider);
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
            const passkeyResult = await this.authProvider.registerPasskey(result.authState);

            if (!passkeyResult.success) {
                return { success: false };
            }

            return {
                success: true,
                sessionToken: passkeyResult.sessionToken,
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

            return {
                success: true,
                sessionToken: result.sessionToken,
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
                const result = await this.authProvider.registerPasskey(authState);
                if (!result.success) {
                    return { success: false };
                }
                return {
                    success: true,
                    sessionToken: result.sessionToken,
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
     * Validate session with backend
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

            // Get user info from auth provider
            const userId = await this.authProvider.getUserId();
            const email = await this.authProvider.getEmail();
            const phone = await this.authProvider.getPhone();
            const sessionToken = await this.authProvider.getSessionToken();

            if (!userId || !sessionToken) {
                throw new Error('Failed to retrieve user information');
            }

            // Mock user data - replace with actual backend call
            const user: User = {
                id: userId,
                email: email || 'user@example.com', // Fallback if email is null
                firstName: 'John',
                lastName: 'Doe',
                country: 'US',
                kycStatus: 'verified',
                preferences: {
                    currency: 'USD',
                    language: 'en',
                    notifications: {
                        transactionUpdates: true,
                        educationalContent: true,
                        marketing: false,
                        securityAlerts: true,
                        pushEnabled: true,
                        emailEnabled: true,
                    },
                    privacy: {
                        dataSharing: false,
                        analytics: true,
                        crashReporting: true,
                        marketingData: false,
                    },
                    theme: 'system',
                },
                createdAt: new Date(),
                updatedAt: new Date(),
            };

            return { user, sessionToken };
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
