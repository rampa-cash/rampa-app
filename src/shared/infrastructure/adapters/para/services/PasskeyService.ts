/**
 * Passkey Service
 *
 * Handles passkey operations (registration and login)
 * - Register passkey for new users
 * - Login with passkey for existing users
 * - Automatically imports session after successful operations
 */

import { ParaMobile } from '@getpara/react-native-wallet';
import { VerificationResult } from '../../../ports/AuthProvider';
import { SessionService } from './SessionService';

export class PasskeyService {
    constructor(
        private paraClient: ParaMobile,
        private sessionService: SessionService
    ) {}

    /**
     * Register passkey for new user
     * After registration, automatically imports session to backend
     */
    async registerPasskey(authState: any): Promise<VerificationResult> {
        try {
            // Para SDK: para.registerPasskey(authState)
            // authState comes from verifyNewAccount response
            await this.paraClient.registerPasskey(authState);

            // After passkey registration, import session to backend
            // This will get the backend session token and user info
            await this.sessionService.importSessionToBackend();

            return {
                success: true,
            };
        } catch (error) {
            console.error(
                '[PasskeyService] Failed to register passkey:',
                error
            );
            return {
                success: false,
            };
        }
    }

    /**
     * Login existing user with passkey
     * After login, automatically imports session to backend
     */
    async loginWithPasskey(): Promise<VerificationResult> {
        try {
            // Para SDK: para.loginWithPasskey()
            // No authState needed - uses existing session context
            await this.paraClient.loginWithPasskey();

            // After passkey login, import session to backend
            // This will get the backend session token and user info
            await this.sessionService.importSessionToBackend();

            return {
                success: true,
            };
        } catch (error) {
            console.error(
                '[PasskeyService] Failed to login with passkey:',
                error
            );
            return {
                success: false,
            };
        }
    }
}
