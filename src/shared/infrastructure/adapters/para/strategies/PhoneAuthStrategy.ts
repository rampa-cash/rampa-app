/**
 * Phone Authentication Strategy
 *
 * Handles phone-based authentication flow
 */

import { AuthState } from '../../../ports/AuthProvider';
import { ParaErrorHandler } from '../services/ErrorHandler';
import { BaseAuthStrategy } from './BaseAuthStrategy';

export class PhoneAuthStrategy extends BaseAuthStrategy {
    getName(): string {
        return 'phone';
    }

    async signUpOrLogIn(phoneNumber: string): Promise<AuthState> {
        try {
            // 1. Format phone number to E.164
            const formattedPhone = this.formatPhoneNumber(phoneNumber);

            console.log(
                '[PhoneAuthStrategy] Calling signUpOrLogIn with phone',
                {
                    originalPhone: phoneNumber,
                    formattedPhone,
                    phoneLength: formattedPhone.length,
                }
            );

            // 2. Call Para SDK
            // Type assertion needed because Para SDK expects template literal type `+${number}`
            const authState = await this.paraClient.signUpOrLogIn({
                auth: { phone: formattedPhone as `+${number}` },
            } as any);

            console.log('[PhoneAuthStrategy] signUpOrLogIn response received', {
                stage: authState?.stage,
                hasAuthState: !!authState,
                authStateKeys: authState ? Object.keys(authState) : [],
                fullAuthState: JSON.stringify(authState, null, 2),
            });

            // Log the stage explicitly for debugging
            console.log(
                '[PhoneAuthStrategy] AuthState stage:',
                authState?.stage
            );
            console.log(
                '[PhoneAuthStrategy] Full authState object:',
                JSON.stringify(authState, null, 2)
            );

            // 3. Handle verify stage (with loginUrl)
            if (authState?.stage === 'verify') {
                const loginUrl = (authState as any)?.loginUrl;
                const nextStage = (authState as any)?.nextStage;
                const signupAuthMethods =
                    (authState as any)?.signupAuthMethods || [];
                const loginAuthMethods =
                    (authState as any)?.loginAuthMethods || [];

                console.log('[PhoneAuthStrategy] Verification required', {
                    phone: formattedPhone,
                    stage: authState.stage,
                    hasLoginUrl: !!loginUrl,
                    nextStage,
                    loginUrl: loginUrl
                        ? loginUrl.substring(0, 100) + '...'
                        : null,
                    loginAuthMethods,
                });

                if (loginUrl) {
                    return this.handleLoginUrlFlow(
                        loginUrl,
                        nextStage,
                        signupAuthMethods,
                        { phone: formattedPhone }
                    );
                }

                // No loginUrl - standard app-based verification
                console.log(
                    '[PhoneAuthStrategy] Using standard app-based flow - SMS should be sent automatically',
                    {
                        phone: formattedPhone,
                        stage: authState.stage,
                        note: 'SMS should be sent automatically by Para when stage === verify',
                    }
                );

                return {
                    stage: 'verify',
                    needsVerification: true,
                    authState,
                };
            }

            // 4. Handle login stage (with portal URLs)
            if (authState?.stage === 'login') {
                const portalResult = await this.handlePortalUrls(authState, {
                    phone: formattedPhone,
                });
                if (portalResult) {
                    return portalResult;
                }

                // No portal URLs - use native passkey login
                console.log(
                    '[PhoneAuthStrategy] No portal URLs - using native passkey login',
                    {
                        phone: formattedPhone,
                    }
                );
                return {
                    stage: 'login',
                    needsVerification: false,
                    authState,
                };
            }

            const unexpectedError = new Error(
                `Unexpected auth state from Para SDK: ${(authState as any)?.stage || 'undefined'}`
            );
            console.error('[PhoneAuthStrategy] Unexpected auth state', {
                authState,
                stage: (authState as any)?.stage,
            });
            throw unexpectedError;
        } catch (error: any) {
            const errorInfo = ParaErrorHandler.extractErrorInfo(error);

            // Check for SMS-specific error indicators
            if (ParaErrorHandler.isSmsError(error)) {
                (errorInfo as any).isSmsError = true;
            }

            throw ParaErrorHandler.createAuthError('Phone', errorInfo);
        }
    }

    /**
     * Format phone number to E.164 format
     */
    private formatPhoneNumber(phoneNumber: string): string {
        // Para SDK requires phone numbers in E.164 format: +{number}
        // Ensure phone number starts with + and contains only digits after
        const formatted = phoneNumber.startsWith('+')
            ? phoneNumber
            : `+${phoneNumber.replace(/[^\d]/g, '')}`;

        // Validate E.164 format: must start with + and contain only digits after
        if (!/^\+[1-9]\d{1,14}$/.test(formatted)) {
            const formatError = new Error(
                `Invalid phone number format. Expected E.164 format (e.g., +1234567890), got: ${formatted}`
            );
            console.error(
                '[PhoneAuthStrategy] Phone number format validation failed',
                {
                    original: phoneNumber,
                    formatted: formatted,
                    error: formatError.message,
                }
            );
            throw formatError;
        }

        return formatted;
    }
}
