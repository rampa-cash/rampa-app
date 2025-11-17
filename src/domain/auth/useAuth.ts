/**
 * Authentication Hook
 *
 * Provides authentication state management and session handling
 * Integrates with Para SDK and backend session validation
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import { logger } from '../../shared/utils/errorHandler';
import { AuthService } from './AuthService';
import { useAuthStore } from './authStore';
import { User } from './types';

export interface AuthState {
    isAuthenticated: boolean;
    user: User | null;
    isLoading: boolean;
    error: string | null;
}

export interface AuthActions {
    loginWithEmail: (email: string) => Promise<void>;
    loginWithPhone: (phoneNumber: string) => Promise<void>;
    loginWithOAuth: (provider: 'google' | 'apple') => Promise<void>;
    verifyAccount: (verificationCode: string) => Promise<void>;
    resendVerificationCode: () => Promise<void>;
    logout: () => Promise<void>;
    refreshSession: () => Promise<void>;
    clearError: () => void;
}

export function useAuth(): AuthState & AuthActions {
    const {
        isAuthenticated,
        user,
        sessionToken,
        login: storeLogin,
        logout: storeLogout,
    } = useAuthStore();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const authService = new AuthService();

    /**
     * Clear error state
     */
    const clearError = useCallback(() => {
        setError(null);
    }, []);

    /**
     * Login with email
     */
    const loginWithEmail = useCallback(
        async (email: string): Promise<void> => {
            setIsLoading(true);
            setError(null);

            try {
                logger.info('Starting email login process', { email });

                const result = await authService.signUpOrLogInWithEmail(email);

                if (result.stage === 'verify') {
                    logger.info('Account verification required', { email });
                    // Handle verification flow - this would typically show a verification screen
                    // This is not an error - it's the expected flow for new users
                    // Throw a special error that will be caught and handled by navigation
                    const verificationError = new Error('Account verification required');
                    (verificationError as any).isVerificationRequired = true;
                    throw verificationError;
                } else if (result.stage === 'login') {
                    logger.info('Login stage reached for email - proceeding with authentication', {
                        email,
                        stage: result.stage,
                        note: 'Could be existing user, completed OTP via web, or portal URL authentication',
                    });

                    // Check if user and sessionToken already provided (from browser flow)
                    if ((result as any).user && (result as any).sessionToken) {
                        // Direct login from browser flow - no need to call loginWithPasskey
                        logger.info('User authenticated via browser flow', {
                            userId: (result as any).user.id,
                            email,
                        });
                        storeLogin((result as any).user, (result as any).sessionToken);
                        return;
                    }

                    // Standard native passkey login (no browser flow)
                    logger.info('Proceeding with native passkey login for email', { email });
                    const passkeyResult = await authService.loginWithPasskey();

                    if (
                        !passkeyResult.success ||
                        !passkeyResult.user ||
                        !passkeyResult.sessionToken
                    ) {
                        throw new Error('Passkey login failed');
                    }

                    // Store authentication state (user and sessionToken come from session import)
                    storeLogin(passkeyResult.user, passkeyResult.sessionToken);

                    logger.info('User authenticated successfully', {
                        userId: passkeyResult.user.id,
                    });
                }
            } catch (error) {
                const errorMessage =
                    error instanceof Error
                        ? error.message
                        : 'Email login failed';

                // Check if this is a verification required flow (not an actual error)
                const isVerificationRequired = 
                    errorMessage.includes('verification required') ||
                    (error as any)?.isVerificationRequired === true;

                if (isVerificationRequired) {
                    // This is expected flow for new users - log as info, not error
                    logger.info('Account verification required for email login', {
                        email,
                    });
                    // Don't set error state - navigation will handle it
                    setIsLoading(false);
                    throw error; // Re-throw for navigation handling
                }

                // Extract status code and error code from error if available
                const statusCode = (error as any)?.statusCode || 
                    (error as any)?.originalError?.status ||
                    (error as any)?.originalError?.statusCode;
                const errorCode = (error as any)?.errorCode || 
                    (error as any)?.originalError?.code;

                // Provide user-friendly error messages
                let userFriendlyMessage = errorMessage;
                if (
                    errorMessage.includes('network') ||
                    errorMessage.includes('fetch')
                ) {
                    userFriendlyMessage =
                        'Network error. Please check your connection and try again.';
                } else if (errorMessage.includes('timeout')) {
                    userFriendlyMessage =
                        'Request timed out. Please try again.';
                } else if (statusCode === 500 || errorMessage.includes('Status: 500')) {
                    userFriendlyMessage =
                        'Server error. Please try again in a moment.';
                } else if (statusCode === 400 || errorMessage.includes('Status: 400')) {
                    userFriendlyMessage =
                        'Invalid email address. Please check and try again.';
                } else if (statusCode === 401 || errorMessage.includes('Status: 401')) {
                    userFriendlyMessage =
                        'Authentication failed. Please try again.';
                } else if (statusCode === 403 || errorMessage.includes('Status: 403')) {
                    userFriendlyMessage =
                        'Access denied. Please contact support.';
                }

                // Log error with full context (this is the only place we log email errors)
                if (statusCode || errorCode) {
                    const originalError = (error as any)?.originalError;
                    logger.error('Email login failed', {
                        statusCode,
                        errorCode,
                        userMessage: userFriendlyMessage,
                        email,
                        responseURL: originalError?.responseURL,
                        originalMessage: originalError?.message,
                    });
                } else {
                    logger.error('Email login failed', {
                        error: errorMessage,
                        userMessage: userFriendlyMessage,
                        email,
                    });
                }
                setError(userFriendlyMessage);
                throw error;
            } finally {
                setIsLoading(false);
            }
        },
        [authService, storeLogin]
    );

    /**
     * Login with phone number
     */
    const loginWithPhone = useCallback(
        async (phoneNumber: string): Promise<void> => {
            setIsLoading(true);
            setError(null);

            try {
                logger.info('Starting phone login process', { phoneNumber });

                const result =
                    await authService.signUpOrLogInWithPhone(phoneNumber);

                if (result.stage === 'verify') {
                    // Check if loginUrl was opened (BASIC_LOGIN flow)
                    // If loginUrl was opened, the result.stage would be 'login' after OTP verification
                    // So if we get 'verify' here, it means no loginUrl was present (standard SMS flow)
                    logger.info('Account verification required - SMS should be sent automatically by Para', {
                        phoneNumber,
                        stage: result.stage,
                        hasAuthState: !!result.authState,
                    });
                    console.log('[useAuth] Verification stage reached - Para should have sent SMS', {
                        phoneNumber,
                        authState: result.authState,
                    });
                    // This is not an error - it's the expected flow for new users
                    // Throw a special error that will be caught and handled by navigation
                    const verificationError = new Error('Account verification required');
                    (verificationError as any).isVerificationRequired = true;
                    throw verificationError;
                } else if (result.stage === 'login') {
                    // This can happen in multiple scenarios:
                    // 1. Existing user - proceed with passkey login
                    // 2. New user who completed OTP verification via loginUrl (BASIC_LOGIN flow) - already logged in
                    // 3. User authenticated via portal URL (passkeyUrl, passwordUrl, pinUrl) - already logged in
                    logger.info('Login stage reached - proceeding with authentication', {
                        phoneNumber,
                        stage: result.stage,
                        note: 'Could be existing user, completed OTP via web, or portal URL authentication',
                    });

                    // Check if user and sessionToken already provided (from browser flow)
                    // This happens when loginUrl or portal URLs were used
                    const resultWithUser = result as any;
                    console.log('[useAuth] Checking for user and sessionToken in result', {
                        hasUser: !!resultWithUser.user,
                        hasSessionToken: !!resultWithUser.sessionToken,
                        userId: resultWithUser.user?.id,
                        resultKeys: Object.keys(resultWithUser),
                    });
                    
                    if (resultWithUser.user && resultWithUser.sessionToken) {
                        // Direct login from browser flow - no need to call loginWithPasskey
                        logger.info('User authenticated via browser flow', {
                            userId: resultWithUser.user.id,
                            phoneNumber,
                        });
                        storeLogin(resultWithUser.user, resultWithUser.sessionToken);
                        return;
                    }

                    // Standard native passkey login (no browser flow)
                    logger.info('Proceeding with native passkey login', { phoneNumber });
                    const passkeyResult = await authService.loginWithPasskey();

                    if (
                        !passkeyResult.success ||
                        !passkeyResult.user ||
                        !passkeyResult.sessionToken
                    ) {
                        throw new Error('Passkey login failed');
                    }

                    // Store authentication state (user and sessionToken come from session import)
                    storeLogin(passkeyResult.user, passkeyResult.sessionToken);

                    logger.info('User authenticated successfully', {
                        userId: passkeyResult.user.id,
                    });
                }
            } catch (error) {
                const errorMessage =
                    error instanceof Error
                        ? error.message
                        : 'Phone login failed';

                // Check if this is a verification required flow (not an actual error)
                const isVerificationRequired = 
                    errorMessage.includes('verification required') ||
                    (error as any)?.isVerificationRequired === true;

                if (isVerificationRequired) {
                    // This is expected flow for new users - log as info, not error
                    logger.info('Account verification required for phone login', {
                        phoneNumber,
                    });
                    // Don't set error state - navigation will handle it
                    setIsLoading(false);
                    throw error; // Re-throw for navigation handling
                }

                // Extract status code and error code from error if available
                const statusCode = (error as any)?.statusCode || 
                    (error as any)?.originalError?.status ||
                    (error as any)?.originalError?.statusCode;
                const errorCode = (error as any)?.errorCode || 
                    (error as any)?.originalError?.code;

                // Provide user-friendly error messages
                let userFriendlyMessage = errorMessage;
                if (
                    errorMessage.includes('network') ||
                    errorMessage.includes('fetch')
                ) {
                    userFriendlyMessage =
                        'Network error. Please check your connection and try again.';
                } else if (errorMessage.includes('timeout')) {
                    userFriendlyMessage =
                        'Request timed out. Please try again.';
                } else if (statusCode === 500 || errorMessage.includes('Status: 500')) {
                    userFriendlyMessage =
                        'Server error. Please try again in a moment.';
                } else if (statusCode === 400 || errorMessage.includes('Status: 400')) {
                    userFriendlyMessage =
                        'Invalid phone number. Please check and try again.';
                } else if (statusCode === 401 || errorMessage.includes('Status: 401')) {
                    userFriendlyMessage =
                        'Authentication failed. Please try again.';
                } else if (statusCode === 403 || errorMessage.includes('Status: 403')) {
                    userFriendlyMessage =
                        'Access denied. Please contact support.';
                }

                // Log error with full context (this is the only place we log phone errors)
                if (statusCode || errorCode) {
                    const originalError = (error as any)?.originalError;
                    logger.error('Phone login failed', {
                        statusCode,
                        errorCode,
                        userMessage: userFriendlyMessage,
                        phoneNumber,
                        responseURL: originalError?.responseURL,
                        originalMessage: originalError?.message,
                    });
                } else {
                    logger.error('Phone login failed', {
                        error: errorMessage,
                        userMessage: userFriendlyMessage,
                        phoneNumber,
                    });
                }
                setError(userFriendlyMessage);
                throw error;
            } finally {
                setIsLoading(false);
            }
        },
        [authService, storeLogin]
    );

    /**
     * Login with OAuth provider
     */
    const loginWithOAuth = useCallback(
        async (provider: 'google' | 'apple'): Promise<void> => {
            setIsLoading(true);
            setError(null);

            try {
                logger.info(`Starting ${provider} OAuth login process`);

                const result =
                    await authService.signUpOrLogInWithOAuth(provider);

                // Complete OAuth flow (register or login with passkey)
                logger.info(`Completing ${provider} OAuth flow`, {
                    stage: result.stage,
                });
                const passkeyResult = await authService.completeOAuth(
                    result.authState
                );

                if (
                    !passkeyResult.success ||
                    !passkeyResult.user ||
                    !passkeyResult.sessionToken
                ) {
                    throw new Error('OAuth completion failed');
                }

                // Store authentication state (user and sessionToken come from session import)
                storeLogin(passkeyResult.user, passkeyResult.sessionToken);

                logger.info('User authenticated successfully', {
                    userId: passkeyResult.user.id,
                });
            } catch (error) {
                const errorMessage =
                    error instanceof Error
                        ? error.message
                        : `${provider} login failed`;

                // Extract status code from error if available
                const statusCode = (error as any)?.statusCode || 
                    (error as any)?.originalError?.status ||
                    (error as any)?.originalError?.statusCode;

                // Provide user-friendly error messages
                let userFriendlyMessage = errorMessage;
                if (
                    errorMessage.includes('network') ||
                    errorMessage.includes('fetch')
                ) {
                    userFriendlyMessage =
                        'Network error. Please check your connection and try again.';
                } else if (errorMessage.includes('timeout')) {
                    userFriendlyMessage =
                        'Request timed out. Please try again.';
                } else if (
                    errorMessage.includes('cancelled') ||
                    errorMessage.includes('canceled')
                ) {
                    userFriendlyMessage = 'Sign in was cancelled.';
                } else if (statusCode === 500 || errorMessage.includes('Status: 500') || errorMessage.includes('Internal Server Error')) {
                    userFriendlyMessage =
                        'Server error. Please try again in a moment.';
                } else if (statusCode === 400 || errorMessage.includes('Status: 400') || errorMessage.includes('Bad Request')) {
                    userFriendlyMessage =
                        'Invalid request. Please check your information and try again.';
                } else if (statusCode === 401 || errorMessage.includes('Status: 401') || errorMessage.includes('Unauthorized')) {
                    userFriendlyMessage =
                        'Authentication failed. Please try again.';
                } else if (statusCode === 403 || errorMessage.includes('Status: 403') || errorMessage.includes('Forbidden')) {
                    userFriendlyMessage =
                        'Access denied. Please contact support.';
                }

                // Log error with full context (this is the only place we log OAuth errors)
                if (statusCode || (error as any)?.errorCode) {
                    const originalError = (error as any)?.originalError;
                    logger.error(`${provider} OAuth authentication failed`, {
                        statusCode,
                        errorCode: (error as any)?.errorCode,
                        userMessage: userFriendlyMessage,
                        responseURL: originalError?.responseURL,
                        originalMessage: originalError?.message,
                    });
                } else {
                    // Log generic errors too
                    logger.error(`${provider} OAuth authentication failed`, {
                        error: errorMessage,
                        userMessage: userFriendlyMessage,
                    });
                }
                setError(userFriendlyMessage);
                throw error;
            } finally {
                setIsLoading(false);
            }
        },
        [authService, storeLogin]
    );

    /**
     * Verify new account
     */
    const verifyAccount = useCallback(
        async (verificationCode: string): Promise<void> => {
            setIsLoading(true);
            setError(null);

            try {
                logger.info('Verifying account', { code: verificationCode });

                const result =
                    await authService.verifyNewAccount(verificationCode);

                if (result.success && result.user && result.sessionToken) {
                    logger.info('Account verification successful');

                    // Store authentication state (user and sessionToken come from session import)
                    storeLogin(result.user, result.sessionToken);

                    logger.info('User account verified and authenticated', {
                        userId: result.user.id,
                    });
                } else {
                    throw new Error('Verification failed');
                }
            } catch (error) {
                const errorMessage =
                    error instanceof Error
                        ? error.message
                        : 'Verification failed';

                // Check if it's a configuration error (app identifier not registered)
                const isConfigurationError = (error as any)?.isConfigurationError;
                
                // Provide user-friendly error messages
                let userFriendlyMessage = errorMessage;
                if (isConfigurationError) {
                    // Configuration error - show helpful message
                    userFriendlyMessage =
                        'App configuration issue. Please contact support. The app identifier needs to be registered with Para.';
                    logger.error('Account verification failed - configuration issue', {
                        error: errorMessage,
                        note: 'App identifier not registered with Para',
                    });
                } else if (
                    errorMessage.includes('network') ||
                    errorMessage.includes('fetch')
                ) {
                    userFriendlyMessage =
                        'Network error. Please check your connection and try again.';
                } else if (errorMessage.includes('timeout')) {
                    userFriendlyMessage =
                        'Request timed out. Please try again.';
                } else if (
                    errorMessage.includes('invalid') ||
                    errorMessage.includes('incorrect')
                ) {
                    userFriendlyMessage =
                        'Invalid verification code. Please try again.';
                } else if (errorMessage.includes('expired')) {
                    userFriendlyMessage =
                        'Verification code has expired. Please request a new one.';
                } else if (
                    errorMessage.includes('Account already exists') ||
                    errorMessage.includes('already exists')
                ) {
                    // Account exists but can't login - likely configuration issue
                    userFriendlyMessage =
                        'Account already exists but login failed. This may be a configuration issue. Please contact support.';
                }

                logger.error('Account verification failed', {
                    error: errorMessage,
                    isConfigurationError,
                });
                setError(userFriendlyMessage);
                throw error;
            } finally {
                setIsLoading(false);
            }
        },
        [authService, storeLogin]
    );

    /**
     * Resend verification code
     */
    const resendVerificationCode = useCallback(async (): Promise<void> => {
        setIsLoading(true);
        setError(null);

        try {
            logger.info('Resending verification code');
            console.log('[useAuth] Calling resendVerificationCode');
            await authService.resendVerificationCode();
            logger.info('Verification code resent successfully');
            console.log('[useAuth] Verification code resend completed successfully');
        } catch (error) {
            const errorMessage =
                error instanceof Error
                    ? error.message
                    : 'Failed to resend verification code';
            console.error('[useAuth] Failed to resend verification code', {
                error,
                errorMessage,
                fullError: JSON.stringify(error, null, 2),
            });
            logger.error('Failed to resend verification code', {
                error: errorMessage,
            });
            setError(errorMessage);
            throw error;
        } finally {
            setIsLoading(false);
        }
    }, [authService]);

    /**
     * Logout user
     */
    const logout = useCallback(async (): Promise<void> => {
        setIsLoading(true);
        setError(null);

        try {
            logger.info('Starting logout process');

            await authService.logout();
            storeLogout();

            logger.info('User logged out successfully');
        } catch (error) {
            const errorMessage =
                error instanceof Error ? error.message : 'Logout failed';
            logger.error('Logout failed', { error: errorMessage });
            setError(errorMessage);
        } finally {
            setIsLoading(false);
        }
    }, [authService, storeLogout]);

    /**
     * Refresh session
     * Uses keepSessionAlive() to extend active session, then validates with backend
     */
    const refreshSession = useCallback(async (): Promise<void> => {
        if (!isAuthenticated) {
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            logger.info('Refreshing session');

            // First check if session is still active
            const isActive = await authService.isSessionActive();
            if (!isActive) {
                logger.warn('Session is not active, logging out');
                await authService.logout();
                storeLogout();
                return;
            }

            // Try to keep session alive (extends session without full reauthentication)
            const extended = await authService.keepSessionAlive();
            if (!extended) {
                logger.warn('Failed to extend session, logging out');
                await authService.logout();
                storeLogout();
                return;
            }

            // Validate session with backend
            const { user, sessionToken } =
                await authService.validateSessionWithBackend();
            storeLogin(user, sessionToken);

            logger.info('Session refreshed successfully', { userId: user.id });
        } catch (error) {
            const errorMessage =
                error instanceof Error
                    ? error.message
                    : 'Session refresh failed';
            logger.error('Session refresh failed', { error: errorMessage });
            setError(errorMessage);

            // If session refresh fails, logout user
            // Don't throw error here - just log out silently
            try {
                await authService.logout();
            } catch (logoutError) {
                logger.error('Failed to logout after session refresh failure', {
                    error:
                        logoutError instanceof Error
                            ? logoutError.message
                            : 'Unknown error',
                });
            }
            storeLogout();
        } finally {
            setIsLoading(false);
        }
    }, [isAuthenticated, authService, storeLogin, storeLogout]);

    // Track app state for background/foreground handling
    const appState = useRef<AppStateStatus>(AppState.currentState);

    /**
     * Handle app state changes (background/foreground)
     */
    useEffect(() => {
        const subscription = AppState.addEventListener(
            'change',
            nextAppState => {
                if (
                    appState.current.match(/inactive|background/) &&
                    nextAppState === 'active' &&
                    isAuthenticated
                ) {
                    // App has come to the foreground - refresh session
                    logger.info('App came to foreground, refreshing session');
                    refreshSession().catch(error => {
                        logger.error(
                            'Failed to refresh session on foreground',
                            {
                                error:
                                    error instanceof Error
                                        ? error.message
                                        : 'Unknown error',
                            }
                        );
                    });
                }
                appState.current = nextAppState;
            }
        );

        return () => {
            subscription.remove();
        };
    }, [isAuthenticated, refreshSession]);

    /**
     * Auto-refresh session periodically (every 30 minutes)
     */
    useEffect(() => {
        if (isAuthenticated && sessionToken) {
            // Set up periodic session refresh (every 30 minutes as per Para SDK best practices)
            const refreshInterval = setInterval(
                () => {
                    refreshSession().catch(error => {
                        logger.error('Periodic session refresh failed', {
                            error:
                                error instanceof Error
                                    ? error.message
                                    : 'Unknown error',
                        });
                    });
                },
                30 * 60 * 1000 // 30 minutes
            );

            return () => clearInterval(refreshInterval);
        }
    }, [isAuthenticated, sessionToken, refreshSession]);

    return {
        // State
        isAuthenticated,
        user,
        isLoading,
        error,

        // Actions
        loginWithEmail,
        loginWithPhone,
        loginWithOAuth,
        verifyAccount,
        resendVerificationCode,
        logout,
        refreshSession,
        clearError,
    };
}

/**
 * Hook for checking authentication status
 */
export function useAuthStatus(): {
    isAuthenticated: boolean;
    isLoading: boolean;
    user: User | null;
} {
    const { isAuthenticated, user, isLoading } = useAuth();

    return {
        isAuthenticated,
        isLoading,
        user,
    };
}

/**
 * Hook for authentication actions only
 */
export function useAuthActions(): AuthActions {
    const {
        loginWithEmail,
        loginWithPhone,
        loginWithOAuth,
        verifyAccount,
        resendVerificationCode,
        logout,
        refreshSession,
        clearError,
    } = useAuth();

    return {
        loginWithEmail,
        loginWithPhone,
        loginWithOAuth,
        verifyAccount,
        resendVerificationCode,
        logout,
        refreshSession,
        clearError,
    };
}
