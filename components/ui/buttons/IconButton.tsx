import { Theme } from '@/constants/theme';
import { useTheme, useThemeMode } from '@/hooks/theme';
import React from 'react';
import {
    Pressable,
    StyleSheet,
    Text,
    TextStyle,
    View,
    ViewStyle,
} from 'react-native';
import Icon from '../icons/Icon';
import { IconName } from '../icons/icon-names';

export type ButtonProps = {
    title?: string;
    iconName?: IconName;
    onPress?: () => void;
    disabled?: boolean;
    color?: keyof typeof Theme.light.text; // Optional text color override
    iconColor?: keyof typeof Theme.light.icon; // Optional text color override
    backgroundColor?: string; // Optional background override
    style?: ViewStyle | ViewStyle[];
    textPosition?: 'left' | 'right' | 'top' | 'bottom' | 'outside';
    textStyle?: TextStyle | TextStyle[];
    iconSize?: number;
    shape?: 'circle' | 'rounded';
    bordered?: boolean;
};

function resolveVariantColors(
    t: typeof Theme.light,
    isDark: boolean,
    disabled?: boolean,
    colorOverride?: keyof typeof Theme.light.text,
    colorIconOverride?: keyof typeof Theme.light.icon,
    bgOverride?: string
) {
    if (disabled) {
        const bg = isDark ? '#2B2E33' : '#E9E6FF';
        const fg = isDark ? t.text.lessEmphasis : '#AFA7FF';
        return {
            background: bgOverride ?? bg,
            foreground: colorOverride ? t.text[colorOverride] : fg,
        };
    }

    return {
        background: bgOverride ?? (isDark ? t.background.dim : '#FAF9F6'),
        color: colorIconOverride ? t.icon[colorIconOverride] : t.icon.variant,
        foreground: colorOverride ? t.text[colorOverride] : t.text.normal,
    };
}

export function IconButton({
    title,
    onPress,
    disabled,
    color,
    iconName,
    backgroundColor,
    iconColor: iconColorOverride,
    style,
    textPosition,
    textStyle,
    iconSize = 24,
    shape = 'rounded',
    bordered,
}: ButtonProps) {
    const t = useTheme();
    const { isDark, mode } = useThemeMode();
    const {
        background,
        foreground,
        color: iconColor,
    } = resolveVariantColors(
        t,
        isDark,
        disabled,
        color,
        iconColorOverride,
        backgroundColor
    );

    const circleSize = iconSize * 2.5;
    const shapeStyle: ViewStyle =
        shape === 'circle'
            ? {
                  minWidth: circleSize,
                  minHeight: circleSize,
                  borderRadius: circleSize,
                  paddingVertical: 10, // Override base styles
                  paddingHorizontal: 10, // Override base styles
              }
            : {};

    const text = (
        <Text
            style={[
                styles.text,
                {
                    color: foreground,
                    marginTop: textPosition === 'outside' ? 14 : 0,
                },
                textStyle as any,
            ]}
        >
            {title}
        </Text>
    );

    return (
        <View style={[styles.container, { borderWidth: bordered ? 1 : 0 }]}>
            <Pressable
                onPress={onPress}
                disabled={disabled}
                style={({ pressed }) => [
                    styles.base,
                    shapeStyle,
                    {
                        borderColor: '#E0E0E0',
                        backgroundColor: background,
                        opacity: disabled ? 0.7 : pressed ? 0.9 : 1,
                    },
                    style as any,
                ]}
            >
                {textPosition === 'left' && title && text}
                {iconName && (
                    <Icon name={iconName} size={iconSize} color={iconColor} />
                )}
                {textPosition === 'right' && title && text}
            </Pressable>
            {textPosition === 'outside' && title && text}
        </View>
    );
}

const styles = StyleSheet.create({
    base: {
        minHeight: 44,
        paddingVertical: 12,
        paddingHorizontal: 27,
        borderRadius: 24,
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        flexDirection: 'row',
    },

    text: {
        fontSize: 16,
        fontWeight: '400',
    },
    container: {
        alignItems: 'center',
        width: 'auto',
    },
});

export default IconButton;
