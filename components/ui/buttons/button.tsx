import { Palette, Theme } from '@/constants/theme';
import { useTheme, useThemeMode } from '@/hooks/theme';
import React from 'react';
import { Pressable, StyleSheet, Text, TextStyle, ViewStyle } from 'react-native';
import { ButtonVariant } from './button-variants';

type Mode = keyof typeof Theme; // 'light' | 'dark'

export type ButtonProps = {
    title: string;
    variant?: ButtonVariant;
    onPress?: () => void;
    disabled?: boolean;
    color?: keyof typeof Theme.light.text; // Optional text color override
    backgroundColor?: string; // Optional background override
    style?: ViewStyle | ViewStyle[];
    textStyle?: TextStyle | TextStyle[];
};

function resolveVariantColors(
    t: typeof Theme.light,
    isDark: boolean,
    variant: ButtonVariant,
    disabled?: boolean,
    colorOverride?: keyof typeof Theme.light.text,
    bgOverride?: string
) {
    if (disabled) {
        const bg = isDark ? '#2B2E33' : '#E9E6FF';
        const fg = isDark ? t.text.lessEmphasis : '#AFA7FF';
        return { background: bgOverride ?? bg, foreground: colorOverride ? t.text[colorOverride] : fg };
    }

    switch (variant) {
        case ButtonVariant.Primary:
            return {
                background: bgOverride ?? Palette.primary.signalViolet,
                foreground: colorOverride ? t.text[colorOverride] : t.text.onPrimaryBackground,
            };
        case ButtonVariant.PrimaryContrast:
            // In dark mode use white pill with black text; in light use black pill with white text
            return {
                background:
                    bgOverride ?? (isDark ? t.neutral.white : t.neutral.black),
                foreground: colorOverride
                    ? t.text[colorOverride]
                    : isDark
                        ? t.neutral.black
                        : t.neutral.white,
            };
        case ButtonVariant.Secondary:
            return {
                background:
                    bgOverride ?? (isDark ? t.background.light : '#000000'),
                foreground: colorOverride ? t.text[colorOverride] : t.text.normal,
            };
        case ButtonVariant.Tertiary:
        default:
            return {
                background: bgOverride ?? 'transparent',
                foreground: colorOverride ? t.text[colorOverride] : Palette.primary.signalViolet,
            };
    }
}

export function AppButton({
    title,
    onPress,
    variant = ButtonVariant.Primary,
    disabled,
    color,
    backgroundColor,
    style,
    textStyle,
}: ButtonProps) {
    const t = useTheme();
    const { isDark, mode } = useThemeMode();
    const { background, foreground } = resolveVariantColors(
        t,
        isDark,
        variant,
        disabled,
        color,
        backgroundColor
    );

    return (
        <Pressable
            onPress={onPress}
            disabled={disabled}
            style={({ pressed }) => [
                styles.base,
                { backgroundColor: background, opacity: disabled ? 0.7 : pressed ? 0.9 : 1 },
                variant === ButtonVariant.Tertiary && styles.tertiary,
                style as any,
            ]}
        >
            <Text style={[styles.text, { color: foreground }, textStyle as any]}>{title}</Text>
        </Pressable>
    );
}

const styles = StyleSheet.create({
    base: {
        minHeight: 44,
        paddingHorizontal: 20,
        paddingVertical: 12,
        borderRadius: 24,
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
    },
    tertiary: {
        paddingVertical: 6,
        paddingHorizontal: 8,
        minHeight: 0,
    },
    text: {
        fontSize: 16,
        fontWeight: '500',
    },
});

export default AppButton;

