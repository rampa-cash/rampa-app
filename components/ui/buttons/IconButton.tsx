import { Theme } from '@/constants/theme';
import { useTheme, useThemeMode } from '@/hooks/theme';
import React from 'react';
import { Pressable, StyleSheet, Text, TextStyle, View, ViewStyle } from 'react-native';
import Icon from '../icons/Icon';
import { IconName } from '../icons/icon-names';


export type ButtonProps = {
    title?: string;
    iconName?: IconName
    onPress?: () => void;
    disabled?: boolean;
    color?: keyof typeof Theme.light.text; // Optional text color override
    backgroundColor?: string; // Optional background override
    style?: ViewStyle | ViewStyle[];
    textPosition?: 'left' | 'right' | 'top' | 'bottom' | 'outside';
    textStyle?: TextStyle | TextStyle[];
    iconSize?: number;
};

function resolveVariantColors(
    t: typeof Theme.light,
    isDark: boolean,
    disabled?: boolean,
    colorOverride?: keyof typeof Theme.light.text,
    bgOverride?: string
) {
    if (disabled) {
        const bg = isDark ? '#2B2E33' : '#E9E6FF';
        const fg = isDark ? t.text.lessEmphasis : '#AFA7FF';
        return { background: bgOverride ?? bg, foreground: colorOverride ? t.text[colorOverride] : fg };
    }

    return {
        background: bgOverride ?? isDark ? t.background.dim : '#FAF9F6',
        color: colorOverride ? t.text[colorOverride] : t.icon.variant,
        foreground: colorOverride ? t.text[colorOverride] : t.text.normal
    };
}

export function IconButton({
    title,
    onPress,
    disabled,
    color,
    iconName,
    backgroundColor,
    style,
    textPosition,
    textStyle,
    iconSize = 24
}: ButtonProps) {
    const t = useTheme();
    const { isDark, mode } = useThemeMode();
    const { background, foreground, color: iconColor } = resolveVariantColors(
        t,
        isDark,
        disabled,
        color,
    );
    const text = <Text style={[styles.text, { color: foreground }, textStyle as any]}>{title}</Text>

    return (
        <View style={styles.container}>
            <Pressable
                onPress={onPress}
                disabled={disabled}
                style={({ pressed }) => [
                    {
                        borderColor: '#E0E0E0',
                    },
                    styles.base,
                    { backgroundColor: background, opacity: disabled ? 0.7 : pressed ? 0.9 : 1 },
                    style as any,

                ]}
            >
                {textPosition === 'left' && text}
                <Icon name={iconName!} size={iconSize} color={iconColor} />
                {textPosition === 'right' && text}

            </Pressable>
            {textPosition === 'outside' && text}
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
        marginBottom: 14,
        borderWidth: 1,
    },

    text: {
        fontSize: 16,
        fontWeight: '400',
    },
    container: {
        alignItems: 'center',
        width: 'auto',
    }
});

export default IconButton;

