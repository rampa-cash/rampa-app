/**
 * Mock Authentication Provider (Adapter)
 *
 * Mock implementation for testing purposes.
 * Does not require actual Para SDK or external services.
 */

import { AuthProvider, VerificationResult } from '../../ports/AuthProvider';

export class MockAuthProvider implements AuthProvider {
    private mockUserId: string | null = null;
    private mockEmail: string | null = null;
    private mockSessionToken: string | null = null;
    private isInitialized = false;

    async initialize(): Promise<void> {
        this.isInitialized = true;
    }

    async checkUserExists(email: string): Promise<boolean> {
        // Mock: assume user doesn't exist for new emails
        return email === 'existing@example.com';
    }

    async verifyEmail(verificationCode: string): Promise<VerificationResult> {
        // Mock: accept any code for testing
        if (verificationCode === '000000') {
            return {
                success: false,
            };
        }

        this.mockUserId = 'mock-user-id';
        this.mockEmail = 'user@example.com';
        this.mockSessionToken = 'mock-session-token';

        return {
            success: true,
            userId: this.mockUserId,
            email: this.mockEmail,
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

    async getSessionToken(): Promise<string | null> {
        return this.mockSessionToken;
    }

    async logout(): Promise<void> {
        this.mockUserId = null;
        this.mockEmail = null;
        this.mockSessionToken = null;
    }

    // Test helpers
    setMockUser(userId: string, email: string, sessionToken: string): void {
        this.mockUserId = userId;
        this.mockEmail = email;
        this.mockSessionToken = sessionToken;
    }

    reset(): void {
        this.mockUserId = null;
        this.mockEmail = null;
        this.mockSessionToken = null;
        this.isInitialized = false;
    }
}
