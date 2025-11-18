/**
 * Authentication Strategy Interface
 *
 * Defines the contract that all authentication strategies must implement
 */

import { AuthState } from '../../../ports/AuthProvider';

export interface AuthStrategy {
    /**
     * Sign up or log in using this authentication method
     * @param identifier - Email, phone number, or OAuth provider
     * @returns AuthState indicating next steps
     */
    signUpOrLogIn(identifier: string | 'google' | 'apple'): Promise<AuthState>;

    /**
     * Get the name of this strategy (for logging/debugging)
     */
    getName(): string;
}
