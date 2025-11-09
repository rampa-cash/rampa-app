import { useColorScheme } from '@/hooks/use-color-scheme';
import {
    DarkTheme,
    DefaultTheme,
    ThemeProvider,
} from '@react-navigation/native';
import { QueryClientProvider } from '@tanstack/react-query';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from "react";
import 'react-native-reanimated';
import { queryClient } from '../src/lib/queryClient';
import { ProviderFactory } from '../src/shared/infrastructure';

export const unstable_settings = {
    anchor: '(tabs)',
};

export default function RootLayout() {
    const colorScheme = useColorScheme();
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
    return (
        <QueryClientProvider client={queryClient}>
            <ThemeProvider
                value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}
            >
                <Stack>
                    <Stack.Screen
                        name="(auth)"
                        options={{ headerShown: false }}
                    />
                    <Stack.Screen
                        name="(tabs)"
                        options={{ headerShown: false }}
                    />
                    <Stack.Screen
                        name="(modals)"
                        options={{ presentation: 'modal' }}
                    />
                </Stack>
                <StatusBar style="auto" />
            </ThemeProvider>
        </QueryClientProvider>
    );
}
