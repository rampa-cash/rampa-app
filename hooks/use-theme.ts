import { Theme } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export type ThemeMode = keyof typeof Theme; // 'light' | 'dark'
export type ThemeObject = typeof Theme.light | typeof Theme.dark;

/**
 * useTheme
 * Devuelve el objeto de tema activo (tokens) para usar directamente en componentes.
 */
export function useTheme(): ThemeObject {
  const mode: ThemeMode = useColorScheme() === 'dark' ? 'dark' : 'light';
  return Theme[mode];
}

/**
 * useThemeMode
 * Si necesitas conocer el modo actual además del tema.
 */
export function useThemeMode(): { mode: ThemeMode; isDark: boolean } {
  const mode: ThemeMode = useColorScheme() === 'dark' ? 'dark' : 'light';
  return { mode, isDark: mode === 'dark' };
}

export default useTheme;

