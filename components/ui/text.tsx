import React from 'react';
import { StyleSheet, Text, type TextProps, type TextStyle } from 'react-native';

import { Theme } from '@/constants/theme';
import { useTheme } from '@/hooks/theme';
import { TextVariant } from './text-variants';

type ThemeMode = keyof typeof Theme; // 'light' | 'dark'
type TextColorName = keyof typeof Theme.light.text;

export type AppTextProps = TextProps & {
    variant?: TextVariant;
    color?: TextColorName; // defaults to theme text.normal
    align?: 'left' | 'center' | 'right';
};

const lh = (size: number, ratio: number) => Math.round(size * ratio);

const variantStyles: Record<TextVariant, TextStyle> = {
    // Headers
    [TextVariant.H1]: { fontSize: 32, lineHeight: lh(32, 1.0), fontWeight: '500' },
    [TextVariant.H2]: { fontSize: 24, lineHeight: lh(24, 1.0), fontWeight: '400' },

    // Body
    [TextVariant.BodyMedium]: {
        fontSize: 16,
        lineHeight: lh(16, 1.14),
        fontWeight: '500',
    },
    [TextVariant.Body]: { fontSize: 16, lineHeight: lh(16, 1.14), fontWeight: '400' },

    // Secondary / Helper
    [TextVariant.SecondaryMedium]: {
        fontSize: 14,
        lineHeight: lh(14, 1.4),
        fontWeight: '500',
    },
    [TextVariant.Secondary]: {
        fontSize: 14,
        lineHeight: lh(14, 1.4),
        fontWeight: '400',
    },
    [TextVariant.Caption]: { fontSize: 12, lineHeight: lh(12, 1.4), fontWeight: '400' },

    // Numeric display
    [TextVariant.NumH1]: { fontSize: 52, lineHeight: lh(52, 1.0), fontWeight: '500' },
    [TextVariant.NumBody]: { fontSize: 16, lineHeight: lh(16, 1.4), fontWeight: '400' },
    [TextVariant.NumSecondary]: { fontSize: 14, lineHeight: lh(14, 1.4), fontWeight: '400' },
    [TextVariant.NumH2]: { fontSize: 28, lineHeight: lh(28, 1.4), fontWeight: '400' },
    [TextVariant.NumH3]: { fontSize: 24, lineHeight: lh(24, 1.0), fontWeight: '400' },
};

function resolveColor(t: typeof Theme.light, color?: TextColorName) {
    const name: TextColorName = color ?? 'normal';
    return t.text[name];
}

export function AppText({
    variant = TextVariant.Body,
    color,
    align,
    style,
    ...rest
}: AppTextProps) {
    const t = useTheme( );
    const textColor = resolveColor(t, color);
    const baseStyle = variantStyles[variant];

    return (
        <Text
            style={[
                styles.base,
                baseStyle,
                { color: textColor },
                align ? { textAlign: align } : null,
                style,
            ]}
            {...rest}
        />
    );
}

const styles = StyleSheet.create({
    base: {
        // Keep defaults close to platform typography
    },
});

export default AppText;

