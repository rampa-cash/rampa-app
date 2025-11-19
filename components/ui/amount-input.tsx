import React, { useMemo } from 'react';
import { Pressable, StyleSheet, View, ViewStyle } from 'react-native';

import { Palette } from '@/constants/theme';
import { useTheme } from '@/hooks/theme';
import { AppInput } from './input';
import { InputVariant } from './input-variants';
import { AppText } from './text';
import { TextVariant } from './text-variants';

export type AmountInputProps = {
    value: string;
    onChange: (value: string) => void;
    label?: string;
    placeholder?: string;
    currencySymbol?: string;
    quickOptions?: number[];
    onQuickSelect?: (value: number) => void;
    helperText?: string;
    containerStyle?: ViewStyle | ViewStyle[];
};

const sanitize = (value: string) => {
    const normalized = value.replace(',', '.');
    const [head, ...rest] = normalized.replace(/[^0-9.]/g, '').split('.');
    const tail = rest.join('');
    return tail ? `${head}.${tail}` : head;
};

export function AmountInput({
    value,
    onChange,
    label,
    placeholder = '0.00',
    currencySymbol = '$',
    quickOptions = [],
    onQuickSelect,
    helperText,
    containerStyle,
}: AmountInputProps) {
    const t = useTheme();

    const parsed = useMemo(() => Number.parseFloat(value.replace(',', '.')), [value]);

    const handleChange = (text: string) => {
        onChange(sanitize(text));
    };

    const handleQuick = (v: number) => {
        onQuickSelect?.(v);
        onChange(v.toFixed(2));
    };

    return (
        <View style={[containerStyle as any]}>
            {label ? (
                <AppText
                    variant={TextVariant.SecondaryMedium}
                    color="normal"
                    style={{ marginBottom: 8 }}
                >
                    {label}
                </AppText>
            ) : null}

            <AppInput
                value={value}
                onChangeText={handleChange}
                placeholder={placeholder}
                keyboardType="decimal-pad"
                variant={InputVariant.Filled}
                inputStyle={{ height: 62, fontSize: 28, fontWeight: '600' }}
                left={
                    <AppText
                        variant={TextVariant.NumH3}
                        style={{ color: t.text.normal, fontSize: 24, marginRight: 2 }}
                    >
                        {currencySymbol}
                    </AppText>
                }
            />

            {quickOptions.length ? (
                <View style={[styles.quickRow]}>
                    {quickOptions.map(option => {
                        const isActive = parsed === option;
                        return (
                            <Pressable
                                key={option}
                                onPress={() => handleQuick(option)}
                                style={[
                                    styles.quickChip,
                                    {
                                        borderColor: isActive ? t.primary.signalViolet : t.outline.outline2,
                                        backgroundColor: isActive ? t.background.secondary : 'transparent',
                                    },
                                ]}
                            >
                                <AppText
                                    variant={TextVariant.BodyMedium}
                                    style={{
                                        color: isActive ? t.primary.signalViolet : t.text.normal,
                                    }}
                                >
                                    {currencySymbol}
                                    {option}
                                </AppText>
                            </Pressable>
                        );
                    })}
                </View>
            ) : null}

            {helperText ? (
                <AppText
                    variant={TextVariant.Caption}
                    color="lessEmphasis"
                    style={{ marginTop: 6 }}
                >
                    {helperText}
                </AppText>
            ) : null}
        </View>
    );
}

const styles = StyleSheet.create({
    quickRow: {
        flexDirection: 'row',
        gap: 12,
        marginTop: 12,
    },
    quickChip: {
        paddingVertical: 10,
        paddingHorizontal: 16,
        borderRadius: 999,
        borderWidth: 1,
    },
});

export default AmountInput;
