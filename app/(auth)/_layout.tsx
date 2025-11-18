import { useAuthStore } from '@/src/domain/auth/authStore';
import { Stack, useRouter } from 'expo-router';
import { useEffect } from 'react';

export default function AuthLayout() {
    const router = useRouter();
    const isAuthenticated = useAuthStore(state => state.isAuthenticated);

    // Automatically navigate to home when user becomes authenticated
    useEffect(() => {
        if (isAuthenticated) {
            router.replace('/(tabs)/home' as any);
        }
    }, [isAuthenticated, router]);

    return (
        <Stack>
            <Stack.Screen
                name="login"
                options={{
                    title: 'Login',
                    headerShown: false,
                }}
            />
            <Stack.Screen
                name="login-email"
                options={{
                    title: 'Login email',
                    headerShown: false,
                }}
            />
            <Stack.Screen
                name="login-phone"
                options={{
                    title: 'Login phone',
                    headerShown: false,
                }}
            />
            <Stack.Screen
                name="legal-name"
                options={{
                    title: 'Legal name',
                    headerShown: false,
                }}
            />
            <Stack.Screen
                name="verify-email"
                options={{
                    title: 'Verify Email',
                    headerShown: false,
                }}
            />
            <Stack.Screen
                name="verify-phone"
                options={{
                    title: 'Verify Phone',
                    headerShown: false,
                }}
            />
        </Stack>
    );
}
