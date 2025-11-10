/**
 * Brand color system
 *
 * This file defines a structured theme derived from the provided
 * brand palette. It keeps backward compatibility with the existing
 * `Colors` object used by hooks/components, while exposing richer
 * tokens for text, backgrounds, icons, outlines and gradients.
 */

import { Platform } from 'react-native';

// Base brand palette (from spec)
export const Palette = {
    primary: {
        signalViolet: '#784AE5',
        flowAqua: '#22D0EA',
        trustwell: '#3300F5',
    },
    secondary: {
        openBlue: '#3950DD',
        transitBlue: '#2B48C9',
    },
    neutral: {
        onyxBase: '#0C0C0C',
        graphiteGrey: '#5A5A5A',
        daylight: '#F1F1F1',
        white: '#FFFFFF',
        black: '#000000',
    },
    gradients: {
        primary: ['#784AE5', '#22D0EA'] as const,
        secondary: ['#3950DD', '#2B48C9'] as const,
        // Optional tertiary from spec visual (blue range)
        tertiary: ['#2B48C9', '#5AA5EA'] as const,
    },
} as const;

export type Gradient = readonly [string, string];

// Extended design tokens by theme
export const Theme = {
    light: {
        primary: Palette.primary,
        secondary: Palette.secondary,
        neutral: Palette.neutral,
        gradients: Palette.gradients,

        text: {
            normal: '#11181C',
            onPrimaryBackground: Palette.neutral.white,
            normal2: '#757F8A',
            lessEmphasis: '#9BA1A6',
            info: Palette.primary.signalViolet,
            error: '#EF4444',
            success: '#10B981',
            warning: '#F59E0B',
            daylight: Palette.neutral.daylight,
        },

        background: {
            base: Palette.neutral.white,
            variant: '#F5F6F8',
            light: '#E4E7EB',
            primary: Palette.primary.signalViolet,
            onBase: Palette.neutral.white,
            onBase2: '#F7F8FA',
            dim: '#E1E5EA',
            inactive: '#ECEFF2',
            secondary: '#F4F6FF',
            error: '#FDECEC',
            success: '#ECFDF5',
            warning: '#FFF7E6',
        },

        icon: {
            variant: Palette.neutral.black,
            normal: '#687076',
            lessEmphasis: '#9BA1A6',
            info: Palette.primary.signalViolet,
            error: '#EF4444',
            success: '#10B981',
            warning: '#F59E0B',
        },

        outline: {
            outline1: '#E6E8EC',
            outline2: '#C9CFD6',
            backgroundOutline: '#F0F2F5',
            black: Palette.neutral.black,
            error: '#F87171',
            success: '#34D399',
            warning: '#FBBF24',
        },
    },

    dark: {
        primary: Palette.primary,
        secondary: Palette.secondary,
        neutral: Palette.neutral,
        gradients: Palette.gradients,

        text: {
            normal: '#ECEDEE',
            onPrimaryBackground: Palette.neutral.white,
            normal2: '#7B8793',
            lessEmphasis: '#9BA1A6',
            info: Palette.primary.signalViolet,
            error: '#F87171',
            success: '#34D399',
            warning: '#FBBF24',
            daylight: Palette.neutral.daylight,
        },

        background: {
            base: Palette.neutral.onyxBase, // main canvas
            variant: '#151718',            // elevated surfaces
            light: '#242629',              // lighter surface
            primary: Palette.primary.signalViolet,
            onBase: Palette.neutral.onyxBase,
            onBase2: '#1B1D20',
            dim: Palette.neutral.graphiteGrey,
            inactive: '#262A30',
            secondary: '#0E0F12',
            error: '#2B0C0C',
            success: '#0C1F17',
            warning: '#F9EBC6', // per spec
        },

        icon: {
            variant: Palette.neutral.white,
            normal: '#9BA1A6',
            lessEmphasis: '#6F767D',
            info: Palette.primary.signalViolet,
            error: '#F87171',
            success: '#34D399',
            warning: '#FBBF24',
        },

        outline: {
            outline1: '#2C2F33',
            outline2: '#383C41',
            backgroundOutline: '#1A1D20',
            black: Palette.neutral.black,
            error: '#7F1D1D',
            success: '#065F46',
            warning: '#92400E',
        },
    },
} as const;

// Backward-compatible Colors object used around the app
const tintColorLight = Palette.primary.signalViolet;
const tintColorDark = Palette.primary.signalViolet;

export const Colors = {
    light: {
        text: Theme.light.text.normal,
        background: Theme.light.background.base,
        tint: tintColorLight,
        icon: Theme.light.icon.normal,
        tabIconDefault: Theme.light.icon.normal,
        tabIconSelected: tintColorLight,
    },
    dark: {
        text: Theme.dark.text.normal,
        background: Theme.dark.background.base,
        tint: tintColorDark,
        icon: Theme.dark.icon.normal,
        tabIconDefault: Theme.dark.icon.normal,
        tabIconSelected: tintColorDark,
    },
};

export const Fonts = Platform.select({
    ios: {
        /** iOS `UIFontDescriptorSystemDesignDefault` */
        sans: 'system-ui',
        /** iOS `UIFontDescriptorSystemDesignSerif` */
        serif: 'ui-serif',
        /** iOS `UIFontDescriptorSystemDesignRounded` */
        rounded: 'ui-rounded',
        /** iOS `UIFontDescriptorSystemDesignMonospaced` */
        mono: 'ui-monospace',
    },
    default: {
        sans: 'normal',
        serif: 'serif',
        rounded: 'normal',
        mono: 'monospace',
    },
    web: {
        sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
        serif: "Georgia, 'Times New Roman', serif",
        rounded:
            "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
        mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
    },
});
