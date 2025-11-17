/**
 * Para Authentication Provider (Adapter)
 *
 * Implements AuthProvider interface using Para SDK
 * Based on Para SDK documentation: https://docs.getpara.com/v2/react-native/setup/expo
 * OAuth implementation based on: https://docs.getpara.com/v2/react-native/guides/social-login
 */

import { ParaMobile } from '@getpara/react-native-wallet';
import * as WebBrowser from 'expo-web-browser';
import { authApiClient } from '../../../../domain/auth/apiClient';
import {
    AuthProvider,
    AuthState,
    SessionImportResult,
    VerificationResult,
} from '../../ports/AuthProvider';
import { para } from './paraClient';

// App scheme for OAuth redirects (must match app.json scheme)
const APP_SCHEME = 'rampaapp';
const APP_SCHEME_REDIRECT_URL = `${APP_SCHEME}://para`;
// Also support direct app scheme redirect (Para might use this for phone OTP)
const APP_SCHEME_DIRECT = `${APP_SCHEME}://`;

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
                auth: { email },
            });
            
            console.log('[ParaAuthProvider] signUpOrLogIn with email response received', {
                stage: authState?.stage,
                hasAuthState: !!authState,
                email,
            });
            
            if (authState?.stage === 'verify') {
                // Check if there's a loginUrl (for BASIC_LOGIN method)
                const loginUrl = (authState as any)?.loginUrl;
                const nextStage = (authState as any)?.nextStage;
                
                console.log('[ParaAuthProvider] Verification required for email', {
                    email,
                    stage: authState.stage,
                    hasLoginUrl: !!loginUrl,
                    nextStage,
                });

                // If loginUrl exists, open browser for one-click login/signup
                if (loginUrl) {
                    console.log('[ParaAuthProvider] loginUrl detected for email - opening browser for one-click authentication', {
                        loginUrl: loginUrl.substring(0, 100) + '...',
                        nextStage,
                        email,
                    });
                    
                    try {
                        const authUrl = new URL(loginUrl);
                        authUrl.searchParams.set('nativeCallbackUrl', APP_SCHEME_REDIRECT_URL);
                        
                        const result = await WebBrowser.openAuthSessionAsync(
                            authUrl.toString(),
                            APP_SCHEME_REDIRECT_URL,
                            { preferEphemeralSession: false }
                        );
                        
                        if (result.type !== 'success') {
                            throw new Error('Browser authentication cancelled');
                        }
                        
                        const isOneClickLogin = nextStage === 'login';
                        
                        if (isOneClickLogin) {
                            console.log('[ParaAuthProvider] One-click login flow for email - waiting for login to complete');
                            await this.waitForLogin();
                            await this.touchSession();
                            
                            const sessionImport = await this.importSessionToBackend();
                            console.log('[ParaAuthProvider] One-click email login completed successfully', {
                                userId: sessionImport.user.id,
                            });
                            
                            return {
                                stage: 'login',
                                needsVerification: false,
                                authState: null,
                                user: sessionImport.user as any,
                                sessionToken: sessionImport.sessionToken,
                            } as any;
                        } else {
                            // One-click signup - wait for signup to complete
                            console.log('[ParaAuthProvider] One-click signup flow for email - waiting for signup to complete');
                            await this.waitForSignup();
                            
                            // Check if signup method is BASIC_LOGIN (password-based)
                            // If so, wait for wallet creation to complete
                            const signupAuthMethods = (authState as any)?.signupAuthMethods || [];
                            if (signupAuthMethods.includes('BASIC_LOGIN')) {
                                console.log('[ParaAuthProvider] Password-based signup detected - waiting for wallet creation');
                                await this.waitForWalletCreation();
                            }
                            
                            await this.touchSession();
                            
                            const sessionImport = await this.importSessionToBackend();
                            console.log('[ParaAuthProvider] One-click email signup completed successfully', {
                                userId: sessionImport.user.id,
                            });
                            
                            return {
                                stage: 'login',
                                needsVerification: false,
                                authState: null,
                                user: sessionImport.user as any,
                                sessionToken: sessionImport.sessionToken,
                            } as any;
                        }
                    } catch (error: any) {
                        const errorMessage = error?.message || 'Unknown error';
                        console.error('[ParaAuthProvider] Browser authentication flow failed for email', {
                            error: errorMessage,
                            fullError: error,
                        });
                        throw new Error(`Browser authentication failed: ${errorMessage}`);
                    }
                }

                // No loginUrl - standard app-based verification
                return { 
                    stage: 'verify', 
                    needsVerification: true,
                    authState,
                };
            } else if (authState?.stage === 'login') {
                // Existing user - check for portal URLs in priority order
                const passkeyUrl = (authState as any)?.passkeyUrl ?? (authState as any)?.passkeyKnownDeviceUrl;
                const passwordUrl = (authState as any)?.passwordUrl;
                const pinUrl = (authState as any)?.pinUrl;
                
                console.log('[ParaAuthProvider] Existing email user - checking portal URLs', {
                    email,
                    stage: authState.stage,
                    hasPasskeyUrl: !!passkeyUrl,
                    hasPasswordUrl: !!passwordUrl,
                    hasPinUrl: !!pinUrl,
                });
                
                // Check portal URLs in priority order (same logic as phone)
                if (passkeyUrl) {
                    console.log('[ParaAuthProvider] Opening passkey portal URL for email user');
                    try {
                        const authUrl = new URL(passkeyUrl);
                        authUrl.searchParams.set('nativeCallbackUrl', APP_SCHEME_REDIRECT_URL);
                        
                        const result = await WebBrowser.openAuthSessionAsync(
                            authUrl.toString(),
                            APP_SCHEME_REDIRECT_URL,
                            { preferEphemeralSession: false }
                        );
                        
                        if (result.type !== 'success') {
                            throw new Error('Passkey login cancelled');
                        }
                        
                        await this.waitForLogin();
                        await this.touchSession();
                        
                        const sessionImport = await this.importSessionToBackend();
                        return {
                            stage: 'login',
                            needsVerification: false,
                            authState: null,
                            user: sessionImport.user as any,
                            sessionToken: sessionImport.sessionToken,
                        } as any;
                    } catch (error: any) {
                        throw new Error(`Passkey login failed: ${error?.message || 'Unknown error'}`);
                    }
                } else if (passwordUrl) {
                    console.log('[ParaAuthProvider] Opening password portal URL for email user');
                    try {
                        const authUrl = new URL(passwordUrl);
                        authUrl.searchParams.set('nativeCallbackUrl', APP_SCHEME_REDIRECT_URL);
                        
                        const result = await WebBrowser.openAuthSessionAsync(
                            authUrl.toString(),
                            APP_SCHEME_REDIRECT_URL,
                            { preferEphemeralSession: false }
                        );
                        
                        if (result.type !== 'success') {
                            throw new Error('Password login cancelled');
                        }
                        
                        await this.waitForLogin();
                        await this.touchSession();
                        
                        const sessionImport = await this.importSessionToBackend();
                        return {
                            stage: 'login',
                            needsVerification: false,
                            authState: null,
                            user: sessionImport.user as any,
                            sessionToken: sessionImport.sessionToken,
                        } as any;
                    } catch (error: any) {
                        throw new Error(`Password login failed: ${error?.message || 'Unknown error'}`);
                    }
                } else if (pinUrl) {
                    console.log('[ParaAuthProvider] Opening PIN portal URL for email user');
                    try {
                        const authUrl = new URL(pinUrl);
                        authUrl.searchParams.set('nativeCallbackUrl', APP_SCHEME_REDIRECT_URL);
                        
                        const result = await WebBrowser.openAuthSessionAsync(
                            authUrl.toString(),
                            APP_SCHEME_REDIRECT_URL,
                            { preferEphemeralSession: false }
                        );
                        
                        if (result.type !== 'success') {
                            throw new Error('PIN login cancelled');
                        }
                        
                        await this.waitForLogin();
                        await this.touchSession();
                        
                        const sessionImport = await this.importSessionToBackend();
                        return {
                            stage: 'login',
                            needsVerification: false,
                            authState: null,
                            user: sessionImport.user as any,
                            sessionToken: sessionImport.sessionToken,
                        } as any;
                    } catch (error: any) {
                        throw new Error(`PIN login failed: ${error?.message || 'Unknown error'}`);
                    }
                }
                
                // No portal URLs - use native passkey login
                return { 
                    stage: 'login', 
                    needsVerification: false,
                    authState,
                };
            }
            
            throw new Error('Unexpected auth state from Para SDK');
        } catch (error: any) {
            // Extract error information from Para SDK error
            let errorMessage = 'Unknown error';
            if (error instanceof Error) {
                errorMessage = error.message;
            } else if (error?.message) {
                errorMessage = error.message;
            }
            
            // Include status code and error code if available
            const statusCode = error?.status || error?.statusCode;
            const errorCode = error?.code;
            
            if (statusCode) {
                errorMessage = `${errorMessage} (Status: ${statusCode})`;
            }
            if (errorCode) {
                errorMessage = `${errorMessage} (Code: ${errorCode})`;
            }
            
            // Create error with preserved context (don't log here - useAuth will log)
            const authError = new Error(`Email authentication failed: ${errorMessage}`);
            (authError as any).originalError = error;
            (authError as any).statusCode = statusCode;
            (authError as any).errorCode = errorCode;
            
            throw authError;
        }
    }

    async signUpOrLogInWithPhone(phoneNumber: string): Promise<AuthState> {
        try {
            // Para SDK requires phone numbers in E.164 format: +{number}
            // Ensure phone number starts with + and contains only digits after
            const formattedPhone = phoneNumber.startsWith('+')
                ? phoneNumber
                : `+${phoneNumber.replace(/[^\d]/g, '')}`;

            // Validate E.164 format: must start with + and contain only digits after
            if (!/^\+[1-9]\d{1,14}$/.test(formattedPhone)) {
                const formatError = new Error(
                    `Invalid phone number format. Expected E.164 format (e.g., +1234567890), got: ${formattedPhone}`
                );
                console.error('[ParaAuthProvider] Phone number format validation failed', {
                    original: phoneNumber,
                    formatted: formattedPhone,
                    error: formatError.message,
                });
                throw formatError;
            }

            console.log('[ParaAuthProvider] Calling signUpOrLogIn with phone', {
                originalPhone: phoneNumber,
                formattedPhone,
                phoneLength: formattedPhone.length,
            });

            // Type assertion needed because Para SDK expects template literal type `+${number}`
            const authState = await this.paraClient.signUpOrLogIn({ 
                auth: { phone: formattedPhone as `+${number}` },
            } as any);

            console.log('[ParaAuthProvider] signUpOrLogIn response received', {
                stage: authState?.stage,
                hasAuthState: !!authState,
                authStateKeys: authState ? Object.keys(authState) : [],
                fullAuthState: JSON.stringify(authState, null, 2),
            });

            // Log the stage explicitly for debugging
            console.log('[ParaAuthProvider] AuthState stage:', authState?.stage);
            console.log('[ParaAuthProvider] Full authState object:', JSON.stringify(authState, null, 2));
            
            if (authState?.stage === 'verify') {
                // Check if there's a loginUrl (for BASIC_LOGIN method)
                // This indicates Para wants us to open a web page for OTP verification
                const loginUrl = (authState as any)?.loginUrl;
                const nextStage = (authState as any)?.nextStage;
                const loginAuthMethods = (authState as any)?.loginAuthMethods || [];
                
                console.log('[ParaAuthProvider] Verification required', {
                    phone: formattedPhone,
                    stage: authState.stage,
                    hasLoginUrl: !!loginUrl,
                    nextStage,
                    loginUrl: loginUrl ? loginUrl.substring(0, 100) + '...' : null,
                    loginAuthMethods,
                });

                // If loginUrl exists, open browser for one-click login/signup
                // This is the correct flow according to Para example
                if (loginUrl) {
                    console.log('[ParaAuthProvider] loginUrl detected - opening browser for one-click authentication', {
                        loginUrl: loginUrl.substring(0, 100) + '...',
                        nextStage,
                        phone: formattedPhone,
                        note: 'Opening browser for OTP verification - will complete login/signup automatically',
                    });
                    
                    try {
                        // Add nativeCallbackUrl to the loginUrl for proper redirect handling
                        const authUrl = new URL(loginUrl);
                        authUrl.searchParams.set('nativeCallbackUrl', APP_SCHEME_REDIRECT_URL);
                        
                        // Open browser for authentication
                        const result = await WebBrowser.openAuthSessionAsync(
                            authUrl.toString(),
                            APP_SCHEME_REDIRECT_URL,
                            { preferEphemeralSession: false }
                        );
                        
                        if (result.type !== 'success') {
                            throw new Error('Browser authentication cancelled');
                        }
                        
                        // Check nextStage to determine flow
                        const isOneClickLogin = nextStage === 'login';
                        
                        if (isOneClickLogin) {
                            // One-click login - wait for login to complete
                            console.log('[ParaAuthProvider] One-click login flow - waiting for login to complete');
                            await this.waitForLogin();
                            await this.touchSession();
                            
                            // Import session and return login stage with user and sessionToken
                            const sessionImport = await this.importSessionToBackend();
                            console.log('[ParaAuthProvider] One-click login completed successfully', {
                                userId: sessionImport.user.id,
                            });
                            
                            return {
                                stage: 'login',
                                needsVerification: false,
                                authState: null,
                                // Add user and sessionToken for direct login
                                user: sessionImport.user as any,
                                sessionToken: sessionImport.sessionToken,
                            } as any;
                        } else {
                            // One-click signup - wait for signup to complete
                            console.log('[ParaAuthProvider] One-click signup flow - waiting for signup to complete');
                            await this.waitForSignup();
                            
                            // Check if signup method is BASIC_LOGIN (password-based)
                            // If so, wait for wallet creation to complete
                            const signupAuthMethods = (authState as any)?.signupAuthMethods || [];
                            if (signupAuthMethods.includes('BASIC_LOGIN')) {
                                console.log('[ParaAuthProvider] Password-based signup detected - waiting for wallet creation');
                                await this.waitForWalletCreation();
                            }
                            
                            await this.touchSession();
                            
                            // Import session and return login stage (user is now logged in)
                            const sessionImport = await this.importSessionToBackend();
                            console.log('[ParaAuthProvider] One-click signup completed successfully', {
                                userId: sessionImport.user.id,
                            });
                            
                            return {
                                stage: 'login',
                                needsVerification: false,
                                authState: null,
                                user: sessionImport.user as any,
                                sessionToken: sessionImport.sessionToken,
                            } as any;
                        }
                    } catch (error: any) {
                        const errorMessage = error?.message || 'Unknown error';
                        console.error('[ParaAuthProvider] Browser authentication flow failed', {
                            error: errorMessage,
                            fullError: error,
                        });
                        
                        // Re-throw with context
                        throw new Error(`Browser authentication failed: ${errorMessage}`);
                    }
                }

                // No loginUrl - standard app-based verification
                console.log('[ParaAuthProvider] Using standard app-based flow - SMS should be sent automatically', {
                    phone: formattedPhone,
                    stage: authState.stage,
                    note: 'SMS should be sent automatically by Para when stage === verify',
                });
                
                return { 
                    stage: 'verify', 
                    needsVerification: true,
                    authState,
                };
            } else if (authState?.stage === 'login') {
                // Existing user - check for portal URLs in priority order
                // Portal URLs indicate web-based authentication (passkey, password, or PIN)
                const passkeyUrl = (authState as any)?.passkeyUrl ?? (authState as any)?.passkeyKnownDeviceUrl;
                const passwordUrl = (authState as any)?.passwordUrl;
                const pinUrl = (authState as any)?.pinUrl;
                
                console.log('[ParaAuthProvider] Existing user - checking portal URLs', {
                    phone: formattedPhone,
                    stage: authState.stage,
                    hasPasskeyUrl: !!passkeyUrl,
                    hasPasswordUrl: !!passwordUrl,
                    hasPinUrl: !!pinUrl,
                });
                
                // Check portal URLs in priority order
                if (passkeyUrl) {
                    // Web-based passkey login
                    console.log('[ParaAuthProvider] Opening passkey portal URL for web-based passkey login');
                    try {
                        const authUrl = new URL(passkeyUrl);
                        authUrl.searchParams.set('nativeCallbackUrl', APP_SCHEME_REDIRECT_URL);
                        
                        const result = await WebBrowser.openAuthSessionAsync(
                            authUrl.toString(),
                            APP_SCHEME_REDIRECT_URL,
                            { preferEphemeralSession: false }
                        );
                        
                        if (result.type !== 'success') {
                            throw new Error('Passkey login cancelled');
                        }
                        
                        await this.waitForLogin();
                        await this.touchSession();
                        
                        // Import session and return
                        const sessionImport = await this.importSessionToBackend();
                        console.log('[ParaAuthProvider] Web-based passkey login completed successfully', {
                            userId: sessionImport.user.id,
                        });
                        
                        return {
                            stage: 'login',
                            needsVerification: false,
                            authState: null,
                            user: sessionImport.user as any,
                            sessionToken: sessionImport.sessionToken,
                        } as any;
                    } catch (error: any) {
                        console.error('[ParaAuthProvider] Web-based passkey login failed', {
                            error: error?.message,
                        });
                        throw new Error(`Passkey login failed: ${error?.message || 'Unknown error'}`);
                    }
                } else if (passwordUrl) {
                    // Password-based login
                    console.log('[ParaAuthProvider] Opening password portal URL for password login');
                    try {
                        const authUrl = new URL(passwordUrl);
                        authUrl.searchParams.set('nativeCallbackUrl', APP_SCHEME_REDIRECT_URL);
                        
                        const result = await WebBrowser.openAuthSessionAsync(
                            authUrl.toString(),
                            APP_SCHEME_REDIRECT_URL,
                            { preferEphemeralSession: false }
                        );
                        
                        if (result.type !== 'success') {
                            throw new Error('Password login cancelled');
                        }
                        
                        await this.waitForLogin();
                        await this.touchSession();
                        
                        const sessionImport = await this.importSessionToBackend();
                        console.log('[ParaAuthProvider] Password login completed successfully', {
                            userId: sessionImport.user.id,
                        });
                        
                        return {
                            stage: 'login',
                            needsVerification: false,
                            authState: null,
                            user: sessionImport.user as any,
                            sessionToken: sessionImport.sessionToken,
                        } as any;
                    } catch (error: any) {
                        console.error('[ParaAuthProvider] Password login failed', {
                            error: error?.message,
                        });
                        throw new Error(`Password login failed: ${error?.message || 'Unknown error'}`);
                    }
                } else if (pinUrl) {
                    // PIN-based login
                    console.log('[ParaAuthProvider] Opening PIN portal URL for PIN login');
                    try {
                        const authUrl = new URL(pinUrl);
                        authUrl.searchParams.set('nativeCallbackUrl', APP_SCHEME_REDIRECT_URL);
                        
                        const result = await WebBrowser.openAuthSessionAsync(
                            authUrl.toString(),
                            APP_SCHEME_REDIRECT_URL,
                            { preferEphemeralSession: false }
                        );
                        
                        if (result.type !== 'success') {
                            throw new Error('PIN login cancelled');
                        }
                        
                        await this.waitForLogin();
                        await this.touchSession();
                        
                        const sessionImport = await this.importSessionToBackend();
                        console.log('[ParaAuthProvider] PIN login completed successfully', {
                            userId: sessionImport.user.id,
                        });
                        
                        return {
                            stage: 'login',
                            needsVerification: false,
                            authState: null,
                            user: sessionImport.user as any,
                            sessionToken: sessionImport.sessionToken,
                        } as any;
                    } catch (error: any) {
                        console.error('[ParaAuthProvider] PIN login failed', {
                            error: error?.message,
                        });
                        throw new Error(`PIN login failed: ${error?.message || 'Unknown error'}`);
                    }
                }
                
                // No portal URLs - use native passkey login
                console.log('[ParaAuthProvider] No portal URLs - using native passkey login', {
                    phone: formattedPhone,
                });
                return { 
                    stage: 'login', 
                    needsVerification: false,
                    authState,
                };
            }

            const unexpectedError = new Error(
                `Unexpected auth state from Para SDK: ${(authState as any)?.stage || 'undefined'}`
            );
            console.error('[ParaAuthProvider] Unexpected auth state', {
                authState,
                stage: (authState as any)?.stage,
            });
            throw unexpectedError;
        } catch (error: any) {
            // Extract error information from Para SDK error
            let errorMessage = 'Unknown error';
            if (error instanceof Error) {
                errorMessage = error.message;
            } else if (error?.message) {
                errorMessage = error.message;
            }
            
            // Include status code and error code if available
            const statusCode = error?.status || error?.statusCode;
            const errorCode = error?.code;
            
            // Check for SMS-specific error indicators
            const errorString = JSON.stringify(error).toLowerCase();
            const isSmsError = 
                errorString.includes('sms') ||
                errorString.includes('verification code') ||
                errorString.includes('phone') ||
                statusCode === 400 || // Bad request might indicate phone format issue
                statusCode === 422; // Unprocessable entity might indicate phone validation issue
            
            if (statusCode) {
                errorMessage = `${errorMessage} (Status: ${statusCode})`;
            }
            if (errorCode) {
                errorMessage = `${errorMessage} (Code: ${errorCode})`;
            }
            
            // Log detailed error information
            console.error('[ParaAuthProvider] Phone authentication error', {
                originalPhone: phoneNumber,
                errorMessage,
                statusCode,
                errorCode,
                isSmsError,
                fullError: error,
                errorStack: error?.stack,
            });
            
            // Create error with preserved context (don't log here - useAuth will log)
            const authError = new Error(`Phone authentication failed: ${errorMessage}`);
            (authError as any).originalError = error;
            (authError as any).statusCode = statusCode;
            (authError as any).errorCode = errorCode;
            (authError as any).isSmsError = isSmsError;
            
            throw authError;
        }
    }

    async signUpOrLogInWithOAuth(
        provider: 'google' | 'apple'
    ): Promise<AuthState> {
        try {
            // Convert provider to Para SDK format (uppercase)
            const oauthMethod = provider.toUpperCase() as 'GOOGLE' | 'APPLE';

            // Step 1: Get OAuth URL from Para SDK
            const oauthUrl = await this.paraClient.getOAuthUrl({
                method: oauthMethod,
                appScheme: APP_SCHEME,
            });

            // Step 2: Open OAuth browser session
            // This will redirect to the OAuth provider (Google/Apple) and back to the app
            const result = await WebBrowser.openAuthSessionAsync(oauthUrl, APP_SCHEME, {
                preferEphemeralSession: false,
            });

            // Check if user cancelled the OAuth flow
            if (result.type === 'cancel') {
                const cancelError = new Error('OAuth authentication was cancelled');
                (cancelError as any).isCancelled = true;
                throw cancelError;
            }

            // Step 3: Verify OAuth with Para SDK
            // This completes the OAuth flow and returns the auth state
            const verifiedAuthState = await this.paraClient.verifyOAuth({
                method: oauthMethod,
            });

            if (!verifiedAuthState) {
                throw new Error('OAuth verification returned no auth state');
            }

            // Handle different auth states
            if (verifiedAuthState.stage === 'done') {
                // User is already fully authenticated - session is active
                // Just return 'login' stage so completeOAuth can import the session
                return { 
                    stage: 'login',
                    needsVerification: false,
                    authState: verifiedAuthState,
                };
            } else if (verifiedAuthState.stage === 'login') {
                // Existing user - check if they use password or passkey
                // Note: passwordUrl is only present for password-based users
                if ((verifiedAuthState as any).passwordUrl) {
                    // User has password-based security - open password URL
                    const passwordUrl = (verifiedAuthState as any).passwordUrl;
                    const authUrl = new URL(passwordUrl);
                    authUrl.searchParams.set('nativeCallbackUrl', APP_SCHEME_REDIRECT_URL);
                    
                    const result = await WebBrowser.openAuthSessionAsync(
                        authUrl.toString(),
                        APP_SCHEME_REDIRECT_URL,
                        {
                            preferEphemeralSession: false,
                        }
                    );
                    
                    if (result.type !== 'success') {
                        throw new Error('Password login cancelled');
                    }
                    
                    // Wait for login to complete and restore session
                    await this.waitForLogin();
                    await this.touchSession();
                }
                // If no passwordUrl, user has passkey-based security (handled in completeOAuth)

                return { 
                    stage: 'login', 
                    needsVerification: false,
                    authState: verifiedAuthState,
                };
            } else if (verifiedAuthState.stage === 'signup') {
                // New user - will need to register passkey (handled in completeOAuth)
                return {
                    stage: 'verify', // Map 'signup' to 'verify' for consistency
                    needsVerification: false,
                    authState: verifiedAuthState,
                };
            }

            throw new Error(`Unexpected auth state from Para SDK: ${(verifiedAuthState as any).stage}`);
        } catch (error: any) {
            // Handle cancellation separately
            if (error?.isCancelled) {
                throw error; // Re-throw cancellation errors as-is
            }

            // Extract error information from Para SDK error
            let errorMessage = 'Unknown error';
            if (error instanceof Error) {
                errorMessage = error.message;
            } else if (error?.message) {
                errorMessage = error.message;
            }
            
            // Include status code and error code if available
            const statusCode = error?.status || error?.statusCode;
            const errorCode = error?.code;
            
            // Build detailed error message for logging
            let detailedMessage = errorMessage;
            if (statusCode) {
                detailedMessage = `${detailedMessage} (Status: ${statusCode})`;
            }
            if (errorCode) {
                detailedMessage = `${detailedMessage} (Code: ${errorCode})`;
            }
            
            // Create error with detailed message
            const authError = new Error(
                `${provider} authentication failed: ${detailedMessage}`
            );
            // Preserve original error details for useAuth to handle
            (authError as any).originalError = error;
            (authError as any).statusCode = statusCode;
            (authError as any).errorCode = errorCode;
            
            // Don't log here - let useAuth handle logging with proper context
            // This prevents duplicate logs
            throw authError;
        }
    }

    async verifyNewAccount(
        verificationCode: string,
        authState?: any
    ): Promise<VerificationResult> {
        try {
            console.log('[ParaAuthProvider] Verifying new account with code', {
                codeLength: verificationCode.length,
                hasAuthState: !!authState,
            });

            // Para SDK: para.verifyNewAccount({ verificationCode })
            const verifiedAuthState = await this.paraClient.verifyNewAccount({ 
                verificationCode,
            });

            console.log('[ParaAuthProvider] Account verification successful', {
                hasVerifiedAuthState: !!verifiedAuthState,
                stage: verifiedAuthState?.stage,
            });
            
            return {
                success: true,
                authState: verifiedAuthState, // This will be used for passkey registration
            };
        } catch (error: any) {
            const errorMessage = error?.message || 'Unknown error';
            console.error('[ParaAuthProvider] Failed to verify new account', {
                error: errorMessage,
                fullError: error,
            });

            // Check if error is "Account already exists" - this means account is already verified
            // According to Para docs: https://docs.getpara.com/v2/react-native/setup/expo#login-existing-user-with-phone
            // For existing users, we should check if session is active and import it directly
            if (
                errorMessage.includes('Account already exists') ||
                errorMessage.includes('already exists') ||
                errorMessage.includes('already verified')
            ) {
                console.log('[ParaAuthProvider] Account already exists - checking if session is active');
                
                // Check if session is already active (user might have verified via web/browser)
                try {
                    const isActive = await this.isSessionActive();
                    console.log('[ParaAuthProvider] Session active status:', isActive);
                    
                    if (isActive) {
                        // Session is active - import it directly without needing passkey
                        console.log('[ParaAuthProvider] Session is active - importing session to backend');
                        const sessionImport = await this.importSessionToBackend();
                        
                        // Return result with user and sessionToken (matching AuthService.VerificationResult)
                        return {
                            success: true,
                            authState: null, // No authState needed since session is already active
                            // Add user and sessionToken for AuthService compatibility
                            user: sessionImport.user as any,
                            sessionToken: sessionImport.sessionToken,
                        } as any;
                    } else {
                        // Session not active - try loginWithPasskey as fallback
                        console.log('[ParaAuthProvider] Session not active - attempting loginWithPasskey');
                        try {
                            const passkeyResult = await this.loginWithPasskey();
                            if (passkeyResult.success) {
                                console.log('[ParaAuthProvider] Login with passkey successful after "account already exists" error');
                                
                                // Import session to get user and sessionToken
                                const sessionImport = await this.importSessionToBackend();
                                
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
                            const passkeyErrorMessage = passkeyError?.message || 'Unknown error';
                            console.error('[ParaAuthProvider] loginWithPasskey failed', {
                                error: passkeyErrorMessage,
                            });
                            
                            // Check if it's the app identifier registration issue
                            if (
                                passkeyErrorMessage.includes('not associated with domain') ||
                                passkeyErrorMessage.includes('Application with identifier')
                            ) {
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
                    }
                } catch (sessionError: any) {
                    console.error('[ParaAuthProvider] Error checking session or logging in', {
                        error: sessionError?.message,
                        note: 'This might be a configuration issue (app identifier not registered with Para)',
                    });
                    // Re-throw to be handled upstream
                    throw sessionError;
                }
            }

            // Re-throw the error so it can be handled upstream
            throw error;
        }
    }

    async resendVerificationCode(): Promise<void> {
        try {
            console.log('[ParaAuthProvider] Resending verification code', {
                type: 'SIGNUP',
            });
            
            // Para SDK: para.resendVerificationCode({ type?: 'SIGNUP' | 'LINK_ACCOUNT' | 'LOGIN' })
            // For new account verification, we use 'SIGNUP'
            await this.paraClient.resendVerificationCode({ type: 'SIGNUP' });
            
            console.log('[ParaAuthProvider] Verification code resend completed successfully');
        } catch (error: any) {
            console.error('[ParaAuthProvider] Failed to resend verification code', {
                error,
                errorMessage: error?.message,
                errorStack: error?.stack,
                statusCode: error?.status || error?.statusCode,
                errorCode: error?.code,
            });
            
            // Extract error information from Para SDK error
            let errorMessage = 'Failed to resend verification code';
            if (error instanceof Error) {
                errorMessage = error.message;
            } else if (error?.message) {
                errorMessage = error.message;
            }
            
            // Include status code and error code if available
            const statusCode = error?.status || error?.statusCode;
            const errorCode = error?.code;
            
            if (statusCode) {
                errorMessage = `${errorMessage} (Status: ${statusCode})`;
            }
            if (errorCode) {
                errorMessage = `${errorMessage} (Code: ${errorCode})`;
            }
            
            throw new Error(errorMessage);
        }
    }

    async registerPasskey(authState: any): Promise<VerificationResult> {
        try {
            // Para SDK: para.registerPasskey(authState)
            // authState comes from verifyNewAccount response
            await this.paraClient.registerPasskey(authState);
            
            // After passkey registration, import session to backend
            // This will get the backend session token and user info
            await this.importSessionToBackend();
            
            return {
                success: true,
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
            // Para SDK: para.loginWithPasskey()
            // No authState needed - uses existing session context
            await this.paraClient.loginWithPasskey();
            
            // After passkey login, import session to backend
            // This will get the backend session token and user info
            await this.importSessionToBackend();
            
            return {
                success: true,
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
            // Para SDK: para.isSessionActive()
            // Reference: https://docs.getpara.com/v2/react-native/guides/sessions
            return await this.paraClient.isSessionActive();
        } catch (error) {
            console.error('Failed to check session status:', error);
            return false;
        }
    }

    async keepSessionAlive(): Promise<boolean> {
        try {
            // Para SDK: para.keepSessionAlive()
            // Extends an active session without requiring full reauthentication
            // Reference: https://docs.getpara.com/v2/react-native/guides/sessions
            return await this.paraClient.keepSessionAlive();
        } catch (error) {
            console.error('Failed to keep session alive:', error);
            return false;
        }
    }

    exportSession(options?: { excludeSigners?: boolean }): string {
        try {
            // Para SDK: para.exportSession({ excludeSigners?: boolean })
            // Exports session state to send to server
            // Reference: https://docs.getpara.com/v2/react-native/guides/sessions
            return this.paraClient.exportSession(options || {});
        } catch (error) {
            console.error('Failed to export session:', error);
            throw new Error('Failed to export session');
        }
    }

    async importSessionToBackend(): Promise<SessionImportResult> {
        try {
            // 1. Verify session is active before exporting
            const isActive = await this.isSessionActive();
            if (!isActive) {
                throw new Error('Cannot export session: session is not active');
            }

            // 2. Export Para session
            const serializedSession = this.exportSession({
                excludeSigners: true,
            });

            // Validate exported session
            if (!serializedSession || serializedSession.trim().length === 0) {
                throw new Error('Exported session is empty or invalid');
            }

            // 3. Import session to backend via API
            const result = await authApiClient.importSession(serializedSession);

            // 4. Return backend session token, user, and expiration
            return {
                sessionToken: result.sessionToken,
                user: result.user,
                expiresAt: result.expiresAt,
            };
        } catch (error) {
            console.error('Failed to import session to backend:', error);
            
            // Extract more detailed error information
            let errorMessage = 'Unknown error';
            if (error instanceof Error) {
                errorMessage = error.message;
            } else if (error && typeof error === 'object' && 'message' in error) {
                errorMessage = String(error.message);
            }
            
            // Check if it's a 401 error specifically
            const statusCode = (error as any)?.status || (error as any)?.statusCode;
            if (statusCode === 401) {
                errorMessage = `Session import unauthorized (401). The Para session may be invalid or expired. Original: ${errorMessage}`;
            }
            
            throw new Error(
                `Session import failed: ${errorMessage}`
            );
        }
    }

    async touchSession(): Promise<void> {
        try {
            // Para SDK: para.touchSession()
            // Restores/refreshes the session after browser-based authentication flows
            // Should be called after waitForLogin() or waitForSignup()
            await this.paraClient.touchSession();
        } catch (error) {
            console.error('[ParaAuthProvider] Failed to touch session:', error);
            throw error;
        }
    }

    async waitForLogin(): Promise<void> {
        try {
            // Para SDK: para.waitForLogin({})
            // Waits for login to complete after browser-based authentication
            // Used after opening portal URLs (passkeyUrl, passwordUrl, pinUrl) or loginUrl
            await this.paraClient.waitForLogin({});
        } catch (error) {
            console.error('[ParaAuthProvider] Failed to wait for login:', error);
            throw error;
        }
    }

    async waitForSignup(): Promise<void> {
        try {
            // Para SDK: para.waitForSignup({})
            // Waits for signup to complete after browser-based authentication
            // Used after opening loginUrl for new user signup
            await this.paraClient.waitForSignup({});
        } catch (error) {
            console.error('[ParaAuthProvider] Failed to wait for signup:', error);
            throw error;
        }
    }

    async waitForWalletCreation(): Promise<void> {
        try {
            // Para SDK: para.waitForWalletCreation({})
            // Waits for wallet creation to complete after password creation in browser
            // Used after opening passwordUrl for password-based account creation
            await this.paraClient.waitForWalletCreation({});
        } catch (error) {
            console.error('[ParaAuthProvider] Failed to wait for wallet creation:', error);
            throw error;
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
