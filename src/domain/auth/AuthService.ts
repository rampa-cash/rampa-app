import { AuthProvider, ProviderFactory } from '../../shared/infrastructure';
import { User } from './types';

export interface AuthResult {
    stage: 'verify' | 'login';
    needsVerification?: boolean;
    success?: boolean;
}

export interface VerificationResult {
    success: boolean;
    user?: User;
    sessionToken?: string;
}

export class AuthService {
    constructor(
        private authProvider: AuthProvider = ProviderFactory.createAuthProvider()
    ) {}

    /**
     * Sign up or log in user with email
     */
    async signUpOrLogIn(email: string): Promise<AuthResult> {
        try {
            const userExists = await this.authProvider.checkUserExists(email);

            if (userExists) {
                // User exists, proceed to login
                return { stage: 'login', needsVerification: false };
            } else {
                // New user, needs verification
                return { stage: 'verify', needsVerification: true };
            }
        } catch (error) {
            console.error('Authentication failed:', error);
            throw new Error('Authentication failed');
        }
    }

    /**
     * Verify new account with verification code
     */
    async verifyNewAccount(
        verificationCode: string
    ): Promise<VerificationResult> {
        try {
            const result =
                await this.authProvider.verifyEmail(verificationCode);

            if (!result.success) {
                return { success: false };
            }

            // If verification successful, get user info
            // Note: User data will come from backend API after session validation
            return {
                success: true,
                sessionToken: result.sessionToken,
            };
        } catch (error) {
            console.error('Verification failed:', error);
            throw new Error('Verification failed');
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
            const sessionToken = await this.authProvider.getSessionToken();

            if (!userId || !email || !sessionToken) {
                throw new Error('Failed to retrieve user information');
            }

            // Mock user data - replace with actual backend call
            const user: User = {
                id: userId,
                email: email,
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
