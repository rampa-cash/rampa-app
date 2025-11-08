/**
 * Authentication Hook
 *
 * Provides authentication state management and session handling
 * Integrates with Para SDK and backend session validation
 */

import { useCallback, useEffect, useState } from 'react';
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
                    logger.info('Existing user, proceeding with passkey login', { email });

                    // Login with passkey
                    const passkeyResult = await authService.loginWithPasskey();

                    if (!passkeyResult.success) {
                        throw new Error('Passkey login failed');
                    }

                    // Validate session with backend
                    const { user, sessionToken } =
                        await authService.validateSessionWithBackend();

                    // Store authentication state
                    storeLogin(user, sessionToken);

                    logger.info('User authenticated successfully', {
                        userId: user.id,
                    });
                }
            } catch (error) {
                const errorMessage =
                    error instanceof Error ? error.message : 'Email login failed';
                logger.error('Email login failed', { error: errorMessage, email });
                setError(errorMessage);
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

                const result = await authService.signUpOrLogInWithPhone(phoneNumber);

                if (result.stage === 'verify') {
                    logger.info('Account verification required', { phoneNumber });
                    throw new Error('Account verification required');
                } else if (result.stage === 'login') {
                    logger.info('Existing user, proceeding with passkey login', { phoneNumber });

                    // Login with passkey
                    const passkeyResult = await authService.loginWithPasskey();

                    if (!passkeyResult.success) {
                        throw new Error('Passkey login failed');
                    }

                    // Validate session with backend
                    const { user, sessionToken } =
                        await authService.validateSessionWithBackend();

                    // Store authentication state
                    storeLogin(user, sessionToken);

                    logger.info('User authenticated successfully', {
                        userId: user.id,
                    });
                }
            } catch (error) {
                const errorMessage =
                    error instanceof Error ? error.message : 'Phone login failed';
                logger.error('Phone login failed', { error: errorMessage, phoneNumber });
                setError(errorMessage);
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

                const result = await authService.signUpOrLogInWithOAuth(provider);

                // Complete OAuth flow (register or login with passkey)
                logger.info(`Completing ${provider} OAuth flow`, { stage: result.stage });
                const passkeyResult = await authService.completeOAuth(result.authState);

                if (!passkeyResult.success) {
                    throw new Error('OAuth completion failed');
                }

                // Validate session with backend
                const { user, sessionToken } =
                    await authService.validateSessionWithBackend();

                // Store authentication state
                storeLogin(user, sessionToken);

                logger.info('User authenticated successfully', {
                    userId: user.id,
                });
            } catch (error) {
                const errorMessage =
                    error instanceof Error ? error.message : `${provider} login failed`;
                logger.error(`${provider} login failed`, { error: errorMessage });
                setError(errorMessage);
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

                if (result.success) {
                    logger.info('Account verification successful');

                    // Validate session with backend
                    const { user, sessionToken } =
                        await authService.validateSessionWithBackend();

                    // Store authentication state
                    storeLogin(user, sessionToken);

                    logger.info('User account verified and authenticated', {
                        userId: user.id,
                    });
                } else {
                    throw new Error('Verification failed');
                }
            } catch (error) {
                const errorMessage =
                    error instanceof Error
                        ? error.message
                        : 'Verification failed';
                logger.error('Account verification failed', {
                    error: errorMessage,
                });
                setError(errorMessage);
                throw error;
            } finally {
                setIsLoading(false);
            }
        },
        [authService, storeLogin]
    );

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
     */
    const refreshSession = useCallback(async (): Promise<void> => {
        if (!isAuthenticated) {
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            logger.info('Refreshing session');

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
            storeLogout();
        } finally {
            setIsLoading(false);
        }
    }, [isAuthenticated, authService, storeLogin, storeLogout]);

    /**
     * Auto-refresh session on app focus
     */
    useEffect(() => {
        if (isAuthenticated && sessionToken) {
            // Set up periodic session refresh (every 30 minutes)
            const refreshInterval = setInterval(
                () => {
                    refreshSession();
                },
                30 * 60 * 1000
            );

            return () => clearInterval(refreshInterval);
        }
    }, [isAuthenticated, sessionToken, refreshSession]);

    /**
     * Validate session on mount
     */
    useEffect(() => {
        if (isAuthenticated && sessionToken) {
            refreshSession();
        }
    }, []); // Only run on mount

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
    const { loginWithEmail, loginWithPhone, loginWithOAuth, verifyAccount, logout, refreshSession, clearError } =
        useAuth();

    return {
        loginWithEmail,
        loginWithPhone,
        loginWithOAuth,
        verifyAccount,
        logout,
        refreshSession,
        clearError,
    };
}
