import { useContext } from 'react';
import { ThemeContext, ThemeContextValue, ThemeMode } from './ThemeProvider';
// Hook principal: devuelve tokens + estado del tema + helpers
export function useTheme(): ThemeContextValue {
    const ctx = useContext(ThemeContext);

    if (!ctx) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return ctx;
}
export function useThemeMode(): { mode: ThemeMode; isDark: boolean } {
    const { theme, isDark } = useTheme();
    return { mode: theme, isDark };
}
