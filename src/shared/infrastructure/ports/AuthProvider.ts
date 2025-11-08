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
    phone?: string;
    sessionToken?: string;
    authState?: any; // Provider-specific auth state (e.g., for passkey registration)
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
    verifyNewAccount(verificationCode: string, authState?: any): Promise<VerificationResult>;

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
     * Get current user ID
     */
    getUserId(): Promise<string | null>;

    /**
     * Get current user email
     */
    getEmail(): Promise<string | null>;

    /**
     * Get current user phone number
     */
    getPhone(): Promise<string | null>;

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
