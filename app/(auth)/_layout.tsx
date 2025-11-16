import { Stack } from 'expo-router';

export default function AuthLayout() {
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
