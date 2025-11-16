import { Theme } from '@/constants/theme';
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useEffect, useMemo, useState } from 'react';
import { useColorScheme as useDeviceColorScheme } from 'react-native';

export type ThemeMode = keyof typeof Theme; // 'light' | 'dark'

export type ThemeContextValue = typeof Theme.light & {
    theme: ThemeMode; // modo actual
    isDark: boolean; // helper
    toggleTheme: () => void; // alternar entre light/dark
    setTheme: (mode: ThemeMode) => void; // fijar explícitamente
};

export const ThemeContext = createContext<ThemeContextValue | undefined>(
    undefined
);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
    const device = useDeviceColorScheme() ?? 'light';
    const [theme, setTheme] = useState<ThemeMode>(
        device === 'dark' ? 'dark' : 'light'
    );

    useEffect(() => {
        const load = async () => {
            try {
                const saved = (await AsyncStorage.getItem(
                    'theme'
                )) as ThemeMode | null;
                if (saved === 'light' || saved === 'dark') setTheme(saved);
            } catch (e) {
                console.warn('Theme: failed to load saved theme', e);
            }
        };
        load();
    }, []);

    const persist = async (next: ThemeMode) => {
        try {
            await AsyncStorage.setItem('theme', next);
        } catch (e) {
            console.warn('Theme: failed to save theme', e);
        }
    };

    const toggleTheme = () => {
        setTheme(prev => {
            const next = prev === 'light' ? 'dark' : 'light';
            void persist(next);
            return next;
        });
    };

    const setThemeSafe = (mode: ThemeMode) => {
        setTheme(mode);
        void persist(mode);
    };

    const value: ThemeContextValue = useMemo(() => {
        const tokens = Theme[theme] as any;
        return {
            ...tokens,
            theme,
            isDark: theme === 'dark',
            toggleTheme,
            setTheme: setThemeSafe,
        };
    }, [theme]);
    console.log({ theme });

    return (
        <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
    );
}

// Compat: algunos componentes usan sólo el modo/isDark
