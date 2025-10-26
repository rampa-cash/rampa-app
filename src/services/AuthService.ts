import { para } from '../lib/para';
import { User } from '../types/User';

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
    /**
     * Sign up or log in user with email
     */
    async signUpOrLogIn(email: string): Promise<AuthResult> {
        try {
            const authState = await para.signUpOrLogIn({ auth: { email } });

            if (authState?.stage === 'verify') {
                return { stage: 'verify', needsVerification: true };
            } else if (authState?.stage === 'login') {
                await para.loginWithPasskey();
                return { stage: 'login', success: true };
            }

            throw new Error('Invalid authentication state');
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
            const authState = await para.verifyNewAccount({ verificationCode });
            await para.registerPasskey(authState);

            // TODO: Validate session with backend and get user data
            return { success: true };
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
            // TODO: Implement backend session validation
            // This would call your backend API to validate the Para session
            // and return user data and JWT token
            throw new Error('Backend session validation not implemented');
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
            // TODO: Implement logout logic
            // Clear local session data
            // Call backend logout endpoint
        } catch (error) {
            console.error('Logout failed:', error);
            throw new Error('Logout failed');
        }
    }
}
