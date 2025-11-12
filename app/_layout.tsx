import { useTheme } from '@/hooks/theme';
import {
    DarkTheme,
    DefaultTheme,
    ThemeProvider as NavThemeProvider,
} from '@react-navigation/native';
import { QueryClientProvider } from '@tanstack/react-query';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import 'react-native-reanimated';
import { ThemeProvider } from '../hooks/ThemeProvider';
import { queryClient } from '../src/lib/queryClient';
import { ProviderFactory } from '../src/shared/infrastructure';

export const unstable_settings = {
    anchor: '(tabs)',
};

function AppLayout() {

    useEffect(() => {
        const initProviders = async () => {
            try {
                await ProviderFactory.initializeProviders();
            } catch (error) {
                console.error('Failed to initialize providers:', error);
            }
        };

        initProviders();
    }, []);

    const { theme } = useTheme();

    return (
        <NavThemeProvider value={theme === 'dark' ? DarkTheme : DefaultTheme}>
            <Stack>
                <Stack.Screen name="(auth)" options={{ headerShown: false }} />
                <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
                <Stack.Screen
                    name="(modals)"
                    options={{ presentation: 'modal' }}
                />
            </Stack>
            <StatusBar style={theme === 'dark' ? 'light' : 'dark'} />
        </NavThemeProvider>
    );
}

 function RootLayout() {
    return (
        <ThemeProvider>
            <QueryClientProvider client={queryClient}>
                <AppLayout />
            </QueryClientProvider>
        </ThemeProvider>
    );
}
export default RootLayout