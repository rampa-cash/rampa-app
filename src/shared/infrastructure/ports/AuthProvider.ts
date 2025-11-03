/**
 * Authentication Provider Port (Interface)
 *
 * Defines the contract for authentication providers.
 * Any authentication provider (Para, Web3Auth, Custom, etc.) must implement this interface.
 */

export interface VerificationResult {
    success: boolean;
    userId?: string;
    email?: string;
    sessionToken?: string;
}

export interface AuthProvider {
    /**
     * Check if a user exists with the given email
     */
    checkUserExists(email: string): Promise<boolean>;

    /**
     * Verify email with verification code
     */
    verifyEmail(verificationCode: string): Promise<VerificationResult>;

    /**
     * Check if current session is active
     */
    isSessionActive(): Promise<boolean>;

    /**
     * Get current user ID
     */
    getUserId(): Promise<string | null>;

    /**
     * Get current user email
     */
    getEmail(): Promise<string | null>;

    /**
     * Get current session token
     */
    getSessionToken(): Promise<string | null>;

    /**
     * Logout current user
     */
    logout(): Promise<void>;

    /**
     * Initialize the provider
     */
    initialize(): Promise<void>;
}
