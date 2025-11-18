import { Redirect } from 'expo-router';
import { useEffect, useState } from 'react';
import { useAuthStore } from '../src/domain/auth/authStore';
import { useAuth } from '../src/domain/auth/useAuth';

/**
 * Root index route
 *
 * Validates session on app launch and redirects based on authentication state:
 * - If authenticated: validates session, then redirects to home tab
 * - If not authenticated: redirects to login
 */
export default function Index() {
    const isAuthenticated = useAuthStore(state => state.isAuthenticated);
    const { refreshSession } = useAuth();
    const [isValidating, setIsValidating] = useState(isAuthenticated);

    useEffect(() => {
        // Validate session on app launch if user appears to be authenticated
        if (isAuthenticated) {
            const validateSession = async () => {
                try {
                    await refreshSession();
                } catch (error) {
                    // Session validation failed - user will be logged out by refreshSession
                    console.error(
                        'Session validation failed on app launch:',
                        error
                    );
                } finally {
                    setIsValidating(false);
                }
            };

            validateSession();
        } else {
            setIsValidating(false);
        }
    }, []); // Only run on mount

    // Show nothing while validating session
    if (isValidating) {
        return null; // Or a loading spinner
    }

    // Redirect based on authentication state
    if (isAuthenticated) {
        return <Redirect href="/(tabs)/home" />;
    }

    return <Redirect href="/(auth)/login" />;
}
