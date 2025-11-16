import { useTheme } from '@/hooks/theme';
import {
    DarkTheme,
    DefaultTheme,
    ThemeProvider as NavThemeProvider,
} from '@react-navigation/native';
import { QueryClientProvider } from '@tanstack/react-query';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import 'react-native-reanimated';
import SplashScreen from '../components/ui/splash-screen';
import { SignupProvider } from '../hooks/SignupProvider';
import { ThemeProvider } from '../hooks/ThemeProvider';
import { WalletProvider } from '../hooks/WalletProvider';
import { queryClient } from '../src/lib/queryClient';
import { ProviderFactory } from '../src/shared/infrastructure';

export const unstable_settings = {
    anchor: '(tabs)',
};

function AppLayout() {
    const [booting, setBooting] = useState(true);

    useEffect(() => {
        const initProviders = async () => {
            try {
                await ProviderFactory.initializeProviders();
            } catch (error) {
                console.error('Failed to initialize providers:', error);
            } finally {
                setBooting(false);
            }
        };

        initProviders();
    }, []);

    const { theme } = useTheme();

    if (booting) {
        return (
            <NavThemeProvider
                value={theme === 'dark' ? DarkTheme : DefaultTheme}
            >
                <SplashScreen />
                <StatusBar style={theme === 'dark' ? 'light' : 'dark'} />
            </NavThemeProvider>
        );
    }

    return (
        <NavThemeProvider value={theme === 'dark' ? DarkTheme : DefaultTheme}>
            <Stack>
                <Stack.Screen name="(auth)" options={{ headerShown: false }} />
                <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
                <Stack.Screen
                    name="(modals)"
                    options={{ presentation: 'modal', headerShown: false }}
                />
                <Stack.Screen name="onboarding" options={{ headerShown: false }} />
                <Stack.Screen name="(transactions)" options={{ headerShown: false }} />
            </Stack>
            <StatusBar style={theme === 'dark' ? 'light' : 'dark'} />
        </NavThemeProvider>
    );
}

function RootLayout() {
    return (
        <ThemeProvider>
            <SignupProvider>
                <WalletProvider>
                    <QueryClientProvider client={queryClient}>
                        <AppLayout />
                    </QueryClientProvider>
                </WalletProvider>
            </SignupProvider>
        </ThemeProvider>
    );
}
export default RootLayout;
