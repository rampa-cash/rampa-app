import { Redirect } from 'expo-router';
import { useAuthStore } from '../src/domain/auth/authStore';

/**
 * Root index route
 *
 * Redirects to the appropriate screen based on authentication state:
 * - If authenticated: redirect to home tab
 * - If not authenticated: redirect to login
 */
export default function Index() {
    const isAuthenticated = useAuthStore(state => state.isAuthenticated);

    // Redirect based on authentication state
    if (isAuthenticated) {
        return <Redirect href="/(tabs)/home" />;
    }

    return <Redirect href="/(auth)/login" />;
}
