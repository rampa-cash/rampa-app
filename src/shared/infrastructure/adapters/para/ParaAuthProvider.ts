/**
 * Para Authentication Provider (Adapter)
 *
 * Implements AuthProvider interface using Para SDK
 * Based on Para SDK documentation: https://docs.getpara.com/v2/react-native/setup/expo
 */

import { ParaMobile } from '@getpara/react-native-wallet';
import { AuthProvider, AuthState, VerificationResult } from '../../ports/AuthProvider';
import { para } from './paraClient';

export class ParaAuthProvider implements AuthProvider {
    constructor(private paraClient: ParaMobile = para) {}

    async initialize(): Promise<void> {
        try {
            await this.paraClient.init();
        } catch (error) {
            console.error('Failed to initialize Para SDK:', error);
            throw new Error('Para SDK initialization failed');
        }
    }

    async signUpOrLogInWithEmail(email: string): Promise<AuthState> {
        try {
            const authState = await this.paraClient.signUpOrLogIn({ 
                auth: { email } 
            });
            
            if (authState?.stage === 'verify') {
                return { 
                    stage: 'verify', 
                    needsVerification: true,
                    authState 
                };
            } else if (authState?.stage === 'login') {
                return { 
                    stage: 'login', 
                    needsVerification: false,
                    authState 
                };
            }
            
            throw new Error('Unexpected auth state from Para SDK');
        } catch (error) {
            console.error('Failed to sign up or log in with email:', error);
            throw new Error(`Email authentication failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    async signUpOrLogInWithPhone(phoneNumber: string): Promise<AuthState> {
        try {
            const authState = await this.paraClient.signUpOrLogIn({ 
                auth: { phone: phoneNumber } 
            });
            
            if (authState?.stage === 'verify') {
                return { 
                    stage: 'verify', 
                    needsVerification: true,
                    authState 
                };
            } else if (authState?.stage === 'login') {
                return { 
                    stage: 'login', 
                    needsVerification: false,
                    authState 
                };
            }
            
            throw new Error('Unexpected auth state from Para SDK');
        } catch (error) {
            console.error('Failed to sign up or log in with phone:', error);
            throw new Error(`Phone authentication failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    async signUpOrLogInWithOAuth(provider: 'google' | 'apple'): Promise<AuthState> {
        try {
            const authState = await this.paraClient.signUpOrLogIn({ 
                auth: { oauth: { provider } } 
            });
            
            // OAuth typically returns 'login' for existing users or 'verify' for new users
            if (authState?.stage === 'verify') {
                return { 
                    stage: 'verify', 
                    needsVerification: false, // OAuth doesn't need OTP verification
                    authState 
                };
            } else if (authState?.stage === 'login') {
                return { 
                    stage: 'login', 
                    needsVerification: false,
                    authState 
                };
            }
            
            throw new Error('Unexpected auth state from Para SDK');
        } catch (error) {
            console.error(`Failed to sign up or log in with ${provider}:`, error);
            throw new Error(`${provider} authentication failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    async verifyNewAccount(verificationCode: string, authState?: any): Promise<VerificationResult> {
        try {
            const verifiedAuthState = await this.paraClient.verifyNewAccount({ 
                verificationCode 
            });
            
            return {
                success: true,
                authState: verifiedAuthState, // This will be used for passkey registration
            };
        } catch (error) {
            console.error('Failed to verify new account:', error);
            return {
                success: false,
            };
        }
    }

    async registerPasskey(authState: any): Promise<VerificationResult> {
        try {
            await this.paraClient.registerPasskey(authState);
            
            // After passkey registration, get user info
            const userId = await this.getUserId();
            const email = await this.getEmail();
            const phone = await this.getPhone();
            const sessionToken = await this.getSessionToken();
            
            return {
                success: true,
                userId: userId || undefined,
                email: email || undefined,
                phone: phone || undefined,
                sessionToken: sessionToken || undefined,
            };
        } catch (error) {
            console.error('Failed to register passkey:', error);
            return {
                success: false,
            };
        }
    }

    async loginWithPasskey(): Promise<VerificationResult> {
        try {
            await this.paraClient.loginWithPasskey();
            
            // After passkey login, get user info
            const userId = await this.getUserId();
            const email = await this.getEmail();
            const phone = await this.getPhone();
            const sessionToken = await this.getSessionToken();
            
            return {
                success: true,
                userId: userId || undefined,
                email: email || undefined,
                phone: phone || undefined,
                sessionToken: sessionToken || undefined,
            };
        } catch (error) {
            console.error('Failed to login with passkey:', error);
            return {
                success: false,
            };
        }
    }

    async isSessionActive(): Promise<boolean> {
        try {
            // Para SDK doesn't have a direct isSessionActive method
            // Check if we can get a session token
            const sessionToken = await this.getSessionToken();
            return sessionToken !== null;
        } catch (error) {
            console.error('Failed to check session status:', error);
            return false;
        }
    }

    async getUserId(): Promise<string | null> {
        try {
            // Para SDK user ID retrieval - check Para SDK docs for exact method
            // This is a placeholder - adjust based on actual Para SDK API
            const user = await this.paraClient.getUser?.();
            return user?.id || null;
        } catch (error) {
            console.error('Failed to get user ID:', error);
            return null;
        }
    }

    async getEmail(): Promise<string | null> {
        try {
            // Para SDK email retrieval - check Para SDK docs for exact method
            // This is a placeholder - adjust based on actual Para SDK API
            const user = await this.paraClient.getUser?.();
            return user?.email || null;
        } catch (error) {
            console.error('Failed to get email:', error);
            return null;
        }
    }

    async getPhone(): Promise<string | null> {
        try {
            // Para SDK phone retrieval - check Para SDK docs for exact method
            // This is a placeholder - adjust based on actual Para SDK API
            const user = await this.paraClient.getUser?.();
            return user?.phone || null;
        } catch (error) {
            console.error('Failed to get phone:', error);
            return null;
        }
    }

    async getSessionToken(): Promise<string | null> {
        try {
            // Para SDK session token retrieval - check Para SDK docs for exact method
            // This is a placeholder - adjust based on actual Para SDK API
            const session = await this.paraClient.getSession?.();
            return session?.token || null;
        } catch (error) {
            console.error('Failed to get session token:', error);
            return null;
        }
    }

    async logout(): Promise<void> {
        try {
            await this.paraClient.logout();
        } catch (error) {
            console.error('Failed to logout:', error);
            throw new Error('Logout failed');
        }
    }
}
