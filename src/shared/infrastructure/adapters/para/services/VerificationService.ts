/**
 * Verification Service
 *
 * Handles account verification and error recovery logic
 * - Core verification logic
 * - "Account already exists" error recovery
 * - Passkey fallback handling
 */

import { ParaMobile } from '@getpara/react-native-wallet';
import { VerificationResult } from '../../../ports/AuthProvider';
import { PasskeyService } from './PasskeyService';
import { SessionService } from './SessionService';

export class VerificationService {
    constructor(
        private paraClient: ParaMobile,
        private sessionService: SessionService,
        private passkeyService: PasskeyService
    ) {}

    /**
     * Verify new account with verification code
     * Handles normal verification and "Account already exists" error recovery
     */
    async verifyNewAccount(
        verificationCode: string,
        authState?: any
    ): Promise<VerificationResult> {
        try {
            console.log(
                '[VerificationService] Verifying new account with code',
                {
                    codeLength: verificationCode.length,
                    hasAuthState: !!authState,
                }
            );

            // Para SDK: para.verifyNewAccount({ verificationCode })
            const verifiedAuthState = await this.paraClient.verifyNewAccount({
                verificationCode,
            });

            console.log(
                '[VerificationService] Account verification successful',
                {
                    hasVerifiedAuthState: !!verifiedAuthState,
                    stage: verifiedAuthState?.stage,
                }
            );

            return {
                success: true,
                authState: verifiedAuthState, // This will be used for passkey registration
            };
        } catch (error: any) {
            const errorMessage = error?.message || 'Unknown error';
            console.error(
                '[VerificationService] Failed to verify new account',
                {
                    error: errorMessage,
                    fullError: error,
                }
            );

            // Check if error is "Account already exists" - this means account is already verified
            // According to Para docs: https://docs.getpara.com/v2/react-native/setup/expo#login-existing-user-with-phone
            // For existing users, we should check if session is active and import it directly
            if (this.isAccountAlreadyExistsError(errorMessage)) {
                return this.handleAccountAlreadyExistsError();
            }

            // Re-throw the error so it can be handled upstream
            throw error;
        }
    }

    /**
     * Check if error message indicates "Account already exists"
     */
    private isAccountAlreadyExistsError(errorMessage: string): boolean {
        return (
            errorMessage.includes('Account already exists') ||
            errorMessage.includes('already exists') ||
            errorMessage.includes('already verified')
        );
    }

    /**
     * Handle "Account already exists" error recovery
     * Tries to recover by checking session status and using passkey fallback
     */
    private async handleAccountAlreadyExistsError(): Promise<VerificationResult> {
        console.log(
            '[VerificationService] Account already exists - checking if session is active'
        );

        try {
            const isActive = await this.sessionService.isSessionActive();
            console.log(
                '[VerificationService] Session active status:',
                isActive
            );

            if (isActive) {
                // Session is active - import it directly without needing passkey
                return this.handleActiveSessionRecovery();
            } else {
                // Session not active - try passkey login as fallback
                return this.handlePasskeyFallback();
            }
        } catch (sessionError: any) {
            console.error(
                '[VerificationService] Error checking session or logging in',
                {
                    error: sessionError?.message,
                    note: 'This might be a configuration issue (app identifier not registered with Para)',
                }
            );
            // Re-throw to be handled upstream
            throw sessionError;
        }
    }

    /**
     * Handle recovery when session is already active
     */
    private async handleActiveSessionRecovery(): Promise<VerificationResult> {
        console.log(
            '[VerificationService] Session is active - importing session to backend'
        );
        const sessionImport =
            await this.sessionService.importSessionToBackend();

        // Return result with user and sessionToken (matching AuthService.VerificationResult)
        return {
            success: true,
            authState: null, // No authState needed since session is already active
            // Add user and sessionToken for AuthService compatibility
            user: sessionImport.user as any,
            sessionToken: sessionImport.sessionToken,
        } as any;
    }

    /**
     * Handle recovery when session is not active - try passkey login fallback
     */
    private async handlePasskeyFallback(): Promise<VerificationResult> {
        console.log(
            '[VerificationService] Session not active - attempting passkey login fallback'
        );

        try {
            const passkeyResult = await this.passkeyService.loginWithPasskey();
            if (passkeyResult.success) {
                console.log(
                    '[VerificationService] Passkey login successful after "account already exists" error'
                );

                // Import session to get user and sessionToken
                const sessionImport =
                    await this.sessionService.importSessionToBackend();

                // Return result with user and sessionToken (matching AuthService.VerificationResult)
                return {
                    success: true,
                    authState: passkeyResult.authState,
                    // Add user and sessionToken for AuthService compatibility
                    user: sessionImport.user as any,
                    sessionToken: sessionImport.sessionToken,
                } as any;
            }
        } catch (passkeyError: any) {
            return this.handlePasskeyError(passkeyError);
        }

        // If we get here, passkey login didn't succeed
        throw new Error('Account already exists but could not recover session');
    }

    /**
     * Handle passkey errors, especially configuration errors
     */
    private handlePasskeyError(passkeyError: any): never {
        const passkeyErrorMessage = passkeyError?.message || 'Unknown error';
        console.error('[VerificationService] Passkey login failed', {
            error: passkeyErrorMessage,
        });

        // Check if it's the app identifier registration issue
        if (this.isConfigurationError(passkeyErrorMessage)) {
            // Create a more helpful error message
            const configError = new Error(
                'App identifier not registered with Para. Please register your app identifier (TeamID.BundleIdentifier) in the Para Developer Portal under Native Passkey Configuration.'
            );
            (configError as any).isConfigurationError = true;
            (configError as any).originalError = passkeyError;
            throw configError;
        }

        // Re-throw other passkey errors
        throw passkeyError;
    }

    /**
     * Check if error is a configuration error (app identifier not registered)
     */
    private isConfigurationError(errorMessage: string): boolean {
        return (
            errorMessage.includes('not associated with domain') ||
            errorMessage.includes('Application with identifier')
        );
    }
}
