/**
 * Email Authentication Strategy
 *
 * Handles email-based authentication flow
 */

import { AuthState } from '../../../ports/AuthProvider';
import { ParaErrorHandler } from '../services/ErrorHandler';
import { BaseAuthStrategy } from './BaseAuthStrategy';

export class EmailAuthStrategy extends BaseAuthStrategy {
    getName(): string {
        return 'email';
    }

    async signUpOrLogIn(email: string): Promise<AuthState> {
        try {
            // 1. Call Para SDK
            const authState = await this.paraClient.signUpOrLogIn({
                auth: { email },
            });

            console.log(
                '[EmailAuthStrategy] signUpOrLogIn with email response received',
                {
                    stage: authState?.stage,
                    hasAuthState: !!authState,
                    email,
                }
            );

            // 2. Handle verify stage (with loginUrl)
            if (authState?.stage === 'verify') {
                const loginUrl = (authState as any)?.loginUrl;
                const nextStage = (authState as any)?.nextStage;
                const signupAuthMethods =
                    (authState as any)?.signupAuthMethods || [];

                console.log(
                    '[EmailAuthStrategy] Verification required for email',
                    {
                        email,
                        stage: authState.stage,
                        hasLoginUrl: !!loginUrl,
                        nextStage,
                    }
                );

                if (loginUrl) {
                    return this.handleLoginUrlFlow(
                        loginUrl,
                        nextStage,
                        signupAuthMethods,
                        { email }
                    );
                }

                // No loginUrl - standard app-based verification
                return {
                    stage: 'verify',
                    needsVerification: true,
                    authState,
                };
            }

            // 3. Handle login stage (with portal URLs)
            if (authState?.stage === 'login') {
                const portalResult = await this.handlePortalUrls(authState, {
                    email,
                });
                if (portalResult) {
                    return portalResult;
                }

                // No portal URLs - use native passkey login
                return {
                    stage: 'login',
                    needsVerification: false,
                    authState,
                };
            }

            // Handle unexpected auth state
            const stage = (authState as any)?.stage ?? 'undefined';
            throw new Error(`Unexpected auth state from Para SDK: ${stage}`);
        } catch (error: any) {
            const errorInfo = ParaErrorHandler.extractErrorInfo(error);
            throw ParaErrorHandler.createAuthError('Email', errorInfo);
        }
    }
}
