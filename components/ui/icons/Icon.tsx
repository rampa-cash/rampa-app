import React from 'react';
import {
    StyleProp,
    StyleSheet,
    Text,
    TextStyle,
    View,
    ViewStyle,
} from 'react-native';
import { createIconSetFromIcoMoon } from 'react-native-vector-icons';

import { Theme } from '@/constants/theme';
import { useTheme } from '@/hooks/theme';
import { IconName } from './icon-names';

// Load IcoMoon config and font (expo bundler requires require for assets)

const icoMoonConfig = require('@/assets/selection.json');

const icoMoonFont = require('@/assets/fonts/icomoon.ttf');

export const IcoMoon = createIconSetFromIcoMoon(
    icoMoonConfig,
    'icomoon',
    icoMoonFont
);

type Mode = keyof typeof Theme;
type IconColorToken = keyof typeof Theme.light.icon;

export type IconProps = {
    name: IconName;
    size?: number;
    color?: string; // direct override
    tone?: IconColorToken; // theme token override (e.g., 'info', 'error')
    style?: StyleProp<TextStyle>;
    accessibilityLabel?: string;
    label?: string;
    labelColor?: string;
    bordered?: boolean;
    borderColor?: string;
    bgColor?: string;
    shape?: 'circle' | 'square';
    containerStyle?: StyleProp<ViewStyle>;
};

export default function Icon({
    name,
    size = 24,
    color,
    tone,
    style,
    accessibilityLabel,
    label,
    labelColor,
    bordered,
    borderColor,
    bgColor,
    shape = 'square',
    containerStyle,
}: IconProps) {
    const t = useTheme();
    const themed = tone ? t.icon[tone] : t.icon.lessEmphasis;
    const tint = color ?? themed;
 
    const finalLabelColor = labelColor ?? tint;
    const baseSize = label ? size * 2.5 : size * 2;
    const wrapperStyle: StyleProp<ViewStyle> = [
        styles.container,
        bgColor ? { backgroundColor: bgColor } : {},
        bordered ? { borderWidth: 1, borderColor: borderColor ?? tint } : {},
        shape === 'circle'
            ? { borderRadius: baseSize / 2, width: baseSize, height: baseSize }
            : { borderRadius: 8 },
        { padding: size * 0.2 },
        containerStyle,
    ];

    return (
        <View style={wrapperStyle}>
            <IcoMoon
                name={name as unknown as string}
                size={size}
                color={tint}
                style={style}
                accessibilityLabel={accessibilityLabel}
                accessibilityRole="image"
            />
            {label && (
                <Text style={[styles.label, { color: finalLabelColor }]}>
                    {label}
                </Text>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    label: {
        fontSize: 12,
        marginTop: 4,
    },
});
