/**
 * Mock Authentication Provider (Adapter)
 *
 * Mock implementation for testing purposes.
 * Does not require actual Para SDK or external services.
 */

import { AuthProvider, AuthState, VerificationResult } from '../../ports/AuthProvider';

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
        return { stage: 'verify', needsVerification: true, authState: { email } };
    }

    async signUpOrLogInWithPhone(phoneNumber: string): Promise<AuthState> {
        // Mock: existing user if phone is '+1234567890'
        if (phoneNumber === '+1234567890') {
            return { stage: 'login', needsVerification: false };
        }
        return { stage: 'verify', needsVerification: true, authState: { phone: phoneNumber } };
    }

    async signUpOrLogInWithOAuth(provider: 'google' | 'apple'): Promise<AuthState> {
        // Mock: OAuth always succeeds
        return { stage: 'login', needsVerification: false, authState: { provider } };
    }

    async verifyNewAccount(verificationCode: string, authState?: any): Promise<VerificationResult> {
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

    async registerPasskey(authState: any): Promise<VerificationResult> {
        // Mock: passkey registration always succeeds
        this.mockUserId = 'mock-user-id';
        this.mockEmail = authState?.email || 'user@example.com';
        this.mockPhone = authState?.phone || null;
        this.mockSessionToken = 'mock-session-token';

        return {
            success: true,
            userId: this.mockUserId,
            email: this.mockEmail,
            phone: this.mockPhone,
            sessionToken: this.mockSessionToken,
        };
    }

    async loginWithPasskey(): Promise<VerificationResult> {
        // Mock: passkey login always succeeds
        this.mockUserId = 'mock-user-id';
        this.mockEmail = 'existing@example.com';
        this.mockSessionToken = 'mock-session-token';

        return {
            success: true,
            userId: this.mockUserId,
            email: this.mockEmail,
            phone: this.mockPhone,
            sessionToken: this.mockSessionToken,
        };
    }

    async isSessionActive(): Promise<boolean> {
        return this.mockSessionToken !== null;
    }

    async getUserId(): Promise<string | null> {
        return this.mockUserId;
    }

    async getEmail(): Promise<string | null> {
        return this.mockEmail;
    }

    async getPhone(): Promise<string | null> {
        return this.mockPhone;
    }

    async getSessionToken(): Promise<string | null> {
        return this.mockSessionToken;
    }

    async logout(): Promise<void> {
        this.mockUserId = null;
        this.mockEmail = null;
        this.mockPhone = null;
        this.mockSessionToken = null;
        this.mockAuthState = null;
    }

    // Test helpers
    setMockUser(userId: string, email: string, sessionToken: string, phone?: string): void {
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
