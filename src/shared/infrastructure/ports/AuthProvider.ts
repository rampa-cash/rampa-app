/**
 * Authentication Provider Port (Interface)
 *
 * Defines the contract for authentication providers.
 * Any authentication provider (Para, Web3Auth, Custom, etc.) must implement this interface.
 */

export interface VerificationResult {
    success: boolean;
    authState?: any; // Provider-specific auth state (e.g., for passkey registration)
}

export interface SessionImportResult {
    sessionToken: string;
    user: {
        id: string;
        email: string;
        phone?: string;
        authProvider?: string;
        verificationStatus?: string;
        isVerified?: boolean;
    };
    expiresAt: string;
}

export interface AuthState {
    stage: 'verify' | 'login';
    needsVerification?: boolean;
    authState?: any; // Provider-specific state for passkey registration
}

export interface AuthProvider {
    /**
     * Sign up or log in with email
     * Returns auth state indicating if verification is needed or if user can proceed to passkey login
     */
    signUpOrLogInWithEmail(email: string): Promise<AuthState>;

    /**
     * Sign up or log in with phone number
     * Returns auth state indicating if verification is needed or if user can proceed to passkey login
     */
    signUpOrLogInWithPhone(phoneNumber: string): Promise<AuthState>;

    /**
     * Sign up or log in with OAuth provider (e.g., Google)
     * Returns auth state indicating if passkey registration is needed
     */
    signUpOrLogInWithOAuth(provider: 'google' | 'apple'): Promise<AuthState>;

    /**
     * Verify new account with verification code (for email or phone)
     */
    verifyNewAccount(
        verificationCode: string,
        authState?: any
    ): Promise<VerificationResult>;

    /**
     * Resend verification code (for email or phone)
     */
    resendVerificationCode(): Promise<void>;

    /**
     * Register passkey for new user (after verification)
     */
    registerPasskey(authState: any): Promise<VerificationResult>;

    /**
     * Login existing user with passkey
     */
    loginWithPasskey(): Promise<VerificationResult>;

    /**
     * Check if current session is active
     */
    isSessionActive(): Promise<boolean>;

    /**
     * Extend an active session without requiring full reauthentication
     */
    keepSessionAlive(): Promise<boolean>;

    /**
     * Export session state to send to server
     * @param excludeSigners - If true, excludes signing capabilities for enhanced security
     */
    exportSession(options?: { excludeSigners?: boolean }): string;

    /**
     * Import Para session to backend and get backend session token
     * This should be called after registerPasskey() or loginWithPasskey()
     *
     * Flow:
     * 1. Exports Para session using exportSession()
     * 2. POSTs to /auth/session/import endpoint
     * 3. Returns backend sessionToken, user, and expiresAt
     */
    importSessionToBackend(): Promise<SessionImportResult>;

    /**
     * Logout current user
     */
    logout(): Promise<void>;

    /**
     * Initialize the provider
     */
    initialize(): Promise<void>;
}
