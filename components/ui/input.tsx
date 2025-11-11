import React, { useMemo, useState } from 'react';
import {
    View,
    TextInput,
    StyleSheet,
    TextInputProps,
    ViewStyle,
    TextStyle,
    Pressable,
} from 'react-native';

import { Theme, Palette } from '@/constants/theme';
import { useTheme, useThemeMode } from '@/hooks/use-theme';
import { InputVariant } from './input-variants';
import { AppText } from './text';
import { TextVariant } from './text-variants';

type Mode = keyof typeof Theme; // 'light' | 'dark'

export type AppInputProps = Omit<TextInputProps, 'style' | 'placeholderTextColor'> & {
    label?: string;
    helperText?: string;
    error?: boolean | string;
    variant?: InputVariant;
    left?: React.ReactNode;
    right?: React.ReactNode;
    containerStyle?: ViewStyle | ViewStyle[];
    inputStyle?: TextStyle | TextStyle[];
    disabled?: boolean;
    secureToggle?: boolean; // show/hide password control
};

function resolveColors(
    t: typeof Theme.light,
    isDark: boolean,
    variant: InputVariant,
    focused: boolean,
    hasError: boolean,
    disabled?: boolean
) {

    const baseText = disabled ? t.text.lessEmphasis : t.text.normal;
    const placeholder = t.text.lessEmphasis;

    // Background selection per variant/state
    const bg = (() => {
        if (disabled) return t.background.inactive;
        switch (variant) {
            case InputVariant.Filled:
                return t.background.onBase2;
            case InputVariant.Outline:
                return 'transparent';
            case InputVariant.Underline:
                return 'transparent';
            default:
                return t.background.onBase2;
        }
    })();

    // Border / divider color
    const borderColor = (() => {
        if (disabled) return t.outline.outline1;
        if (hasError) return t.outline.error;
        if (focused) return Palette.primary.signalViolet;
        return t.outline.outline2;
    })();

    // Label color
    const labelColor = hasError
        ? t.text.error
        : focused
        ? Palette.primary.signalViolet
        : t.text.lessEmphasis;

    // Helper color
    const helperColor = hasError ? t.text.error : t.text.lessEmphasis;

    return { bg, text: baseText, placeholder, borderColor, labelColor, helperColor } as const;
}

export function AppInput({
    label,
    helperText,
    error,
    variant = InputVariant.Filled,
    left,
    right,
    containerStyle,
    inputStyle,
    disabled,
    secureTextEntry,
    secureToggle,
    onFocus,
    onBlur,
    editable,
    ...rest
}: AppInputProps) {
    const t = useTheme();
    const { isDark } = useThemeMode();
    const [focused, setFocused] = useState(false);
    const [reveal, setReveal] = useState(false);

    const hasError = Boolean(error);
    const scheme = useMemo(
        () => resolveColors(t, isDark, variant, focused, hasError, disabled || editable === false),
        [t, isDark, variant, focused, hasError, disabled, editable]
    );

    const showToggle = Boolean(secureToggle && secureTextEntry);

    const effectiveSecure = showToggle ? !reveal : Boolean(secureTextEntry);

    const handleFocus: TextInputProps['onFocus'] = (e) => {
        setFocused(true);
        onFocus?.(e);
    };

    const handleBlur: TextInputProps['onBlur'] = (e) => {
        setFocused(false);
        onBlur?.(e);
    };

    return (
        <View style={containerStyle as any}>
            {label ? (
                <AppText
                    variant={TextVariant.SecondaryMedium}
                    style={{ marginBottom: 6, color: scheme.labelColor }}
                >
                    {label}
                </AppText>
            ) : null}

            <View
                style={[
                    styles.field,
                    variant === InputVariant.Filled && styles.filled,
                    variant === InputVariant.Outline && styles.outline,
                    variant === InputVariant.Underline && styles.underline,
                    {
                        backgroundColor: scheme.bg,
                        borderColor: scheme.borderColor,
                        opacity: disabled || editable === false ? 0.7 : 1,
                    },
                ]}
            >
                {left ? <View style={styles.side}>{left}</View> : null}

                <TextInput
                    style={[
                        styles.input,
                        { color: scheme.text },
                        inputStyle as any,
                    ]}
                    placeholderTextColor={scheme.placeholder}
                    editable={disabled ? false : editable}
                    onFocus={handleFocus}
                    onBlur={handleBlur}
                    secureTextEntry={effectiveSecure}
                    {...rest}
                />

                {showToggle ? (
                    <Pressable
                        accessibilityRole="button"
                        onPress={() => setReveal((s) => !s)}
                        style={styles.side}
                    >
                        <AppText variant={TextVariant.Secondary} color="lessEmphasis">
                            {reveal ? 'Ocultar' : 'Mostrar'}
                        </AppText>
                    </Pressable>
                ) : right ? (
                    <View style={styles.side}>{right}</View>
                ) : null}
            </View>

            {(helperText || typeof error === 'string') ? (
                <AppText
                    variant={TextVariant.Caption}
                    style={{ marginTop: 6, color: scheme.helperColor }}
                >
                    {typeof error === 'string' ? error : helperText}
                </AppText>
            ) : null}
        </View>
    );
}

const styles = StyleSheet.create({
    field: {
        minHeight: 48,
        borderRadius: 12,
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        paddingHorizontal: 12,
    },
    filled: {
        // Background handled by colors resolver
    },
    outline: {
        // Transparent background with visible border
    },
    underline: {
        borderTopWidth: 0,
        borderLeftWidth: 0,
        borderRightWidth: 0,
        borderRadius: 0,
        paddingHorizontal: 0,
    },
    input: {
        flex: 1,
        paddingVertical: 10,
        fontSize: 16,
    },
    side: {
        marginHorizontal: 6,
        minHeight: 24,
        justifyContent: 'center',
        alignItems: 'center',
    },
});

export default AppInput;
