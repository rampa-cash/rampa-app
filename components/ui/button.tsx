import React from 'react';
import { Pressable, Text, ViewStyle, TextStyle, StyleSheet } from 'react-native';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Theme, Palette } from '@/constants/theme';
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
    mode: Mode,
    variant: ButtonVariant,
    disabled?: boolean,
    colorOverride?: keyof typeof Theme.light.text,
    bgOverride?: string
) {
    const t = Theme[mode];

    if (disabled) {
        const bg = mode === 'dark' ? '#2B2E33' : '#E9E6FF';
        const fg = mode === 'dark' ? t.text.lessEmphasis : '#AFA7FF';
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
                    bgOverride ?? (mode === 'dark' ? t.neutral.white : t.neutral.black),
                foreground: colorOverride
                    ? t.text[colorOverride]
                    : mode === 'dark'
                    ? t.neutral.black
                    : t.neutral.white,
            };
        case ButtonVariant.Secondary:
            return {
                background:
                    bgOverride ?? (mode === 'dark' ? t.background.light : '#000000'),
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
    const mode: Mode = useColorScheme() === 'dark' ? 'dark' : 'light';
    const { background, foreground } = resolveVariantColors(
        mode,
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

