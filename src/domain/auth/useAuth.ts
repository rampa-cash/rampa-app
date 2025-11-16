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
                    throw new Error('Account verification required');
                } else if (result.stage === 'login') {
                    logger.info(
                        'Existing user, proceeding with passkey login',
                        { email }
                    );

                    // Login with passkey (this now includes session import)
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
                } else if (errorMessage.includes('verification required')) {
                    // This is expected - don't show as error, navigation handles it
                    userFriendlyMessage = errorMessage;
                }

                logger.error('Email login failed', {
                    error: errorMessage,
                    email,
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
                    logger.info('Account verification required', {
                        phoneNumber,
                    });
                    throw new Error('Account verification required');
                } else if (result.stage === 'login') {
                    logger.info(
                        'Existing user, proceeding with passkey login',
                        { phoneNumber }
                    );

                    // Login with passkey (this now includes session import)
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
                } else if (errorMessage.includes('verification required')) {
                    // This is expected - don't show as error, navigation handles it
                    userFriendlyMessage = errorMessage;
                }

                logger.error('Phone login failed', {
                    error: errorMessage,
                    phoneNumber,
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
                }

                logger.error(`${provider} login failed`, {
                    error: errorMessage,
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
                    errorMessage.includes('invalid') ||
                    errorMessage.includes('incorrect')
                ) {
                    userFriendlyMessage =
                        'Invalid verification code. Please try again.';
                } else if (errorMessage.includes('expired')) {
                    userFriendlyMessage =
                        'Verification code has expired. Please request a new one.';
                }

                logger.error('Account verification failed', {
                    error: errorMessage,
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
            await authService.resendVerificationCode();
            logger.info('Verification code resent successfully');
        } catch (error) {
            const errorMessage =
                error instanceof Error
                    ? error.message
                    : 'Failed to resend verification code';
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
