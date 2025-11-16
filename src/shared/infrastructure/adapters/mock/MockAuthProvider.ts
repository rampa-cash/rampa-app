/**
 * Mock Authentication Provider (Adapter)
 *
 * Mock implementation for testing purposes.
 * Does not require actual Para SDK or external services.
 */

import {
    AuthProvider,
    AuthState,
    SessionImportResult,
    VerificationResult,
} from '../../ports/AuthProvider';

export class MockAuthProvider implements AuthProvider {
    private mockUserId: string | null = null;
    private mockEmail: string | null = null;
    private mockPhone: string | null = null;
    private mockSessionToken: string | null = null;
    private isInitialized = false;
    private mockAuthState: any = null;

    async initialize(): Promise<void> {
        this.isInitialized = true;
    }

    async signUpOrLogInWithEmail(email: string): Promise<AuthState> {
        // Mock: existing user if email is 'existing@example.com'
        if (email === 'existing@example.com') {
            return { stage: 'login', needsVerification: false };
        }
        return {
            stage: 'verify',
            needsVerification: true,
            authState: { email },
        };
    }

    async signUpOrLogInWithPhone(phoneNumber: string): Promise<AuthState> {
        // Mock: existing user if phone is '+1234567890'
        if (phoneNumber === '+1234567890') {
            return { stage: 'login', needsVerification: false };
        }
        return {
            stage: 'verify',
            needsVerification: true,
            authState: { phone: phoneNumber },
        };
    }

    async signUpOrLogInWithOAuth(
        provider: 'google' | 'apple'
    ): Promise<AuthState> {
        // Mock: OAuth always succeeds
        return {
            stage: 'login',
            needsVerification: false,
            authState: { provider },
        };
    }

    async verifyNewAccount(
        verificationCode: string,
        authState?: any
    ): Promise<VerificationResult> {
        // Mock: accept any code except '000000' for testing
        if (verificationCode === '000000') {
            return { success: false };
        }

        this.mockAuthState = authState || { verified: true };
        return {
            success: true,
            authState: this.mockAuthState,
        };
    }

    async resendVerificationCode(): Promise<void> {
        // Mock: resend always succeeds
        // In real implementation, this would trigger Para SDK to resend the code
    }

    async registerPasskey(authState: any): Promise<VerificationResult> {
        // Mock: passkey registration always succeeds
        // Note: Session import will be called separately after this
        return {
            success: true,
        };
    }

    async loginWithPasskey(): Promise<VerificationResult> {
        // Mock: passkey login always succeeds
        // Note: Session import will be called separately after this
        return {
            success: true,
        };
    }

    async isSessionActive(): Promise<boolean> {
        return this.mockSessionToken !== null;
    }

    async keepSessionAlive(): Promise<boolean> {
        // Mock: extend session if active
        if (this.mockSessionToken) {
            return true;
        }
        return false;
    }

    exportSession(options?: { excludeSigners?: boolean }): string {
        // Mock: return a mock session export
        return JSON.stringify({
            token: this.mockSessionToken,
            userId: this.mockUserId,
            excludeSigners: options?.excludeSigners || false,
        });
    }

    async importSessionToBackend(): Promise<SessionImportResult> {
        // Mock: simulate session import to backend
        // In real implementation, this would POST to /auth/session/import
        this.mockUserId = this.mockUserId || 'mock-user-id';
        this.mockEmail = this.mockEmail || 'user@example.com';
        this.mockSessionToken =
            this.mockSessionToken || 'mock-backend-session-token';

        return {
            sessionToken: this.mockSessionToken,
            user: {
                id: this.mockUserId,
                email: this.mockEmail,
                phone: this.mockPhone || undefined,
                authProvider: 'para',
                verificationStatus: 'verified',
                isVerified: true,
            },
            expiresAt: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(), // 2 hours from now
        };
    }

    async logout(): Promise<void> {
        this.mockUserId = null;
        this.mockEmail = null;
        this.mockPhone = null;
        this.mockSessionToken = null;
        this.mockAuthState = null;
    }

    // Test helpers
    setMockUser(
        userId: string,
        email: string,
        sessionToken: string,
        phone?: string
    ): void {
        this.mockUserId = userId;
        this.mockEmail = email;
        this.mockPhone = phone || null;
        this.mockSessionToken = sessionToken;
    }

    reset(): void {
        this.mockUserId = null;
        this.mockEmail = null;
        this.mockPhone = null;
        this.mockSessionToken = null;
        this.mockAuthState = null;
        this.isInitialized = false;
    }
}
