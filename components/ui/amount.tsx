import React, { useMemo } from 'react';
import { StyleSheet, TextStyle, View, ViewStyle } from 'react-native';

import { CurrencySymbol, SupportedCurrency } from '@/constants/currency';
import { Palette } from '@/constants/theme';
import { useTheme } from '@/hooks/theme';
import { AmountSize, AmountTone } from './amount-variants';
import Icon from './icons/Icon';
import { IconName } from './icons/icon-names';
import { AppText } from './text';
import { TextVariant } from './text-variants';

export type AmountProps = {
    value: number;
    currency: SupportedCurrency;
    locale?: string;
    showCents?: boolean;
    useIcon?: boolean; // otherwise, use currency character
    symbolOverride?: string; // e.g., '?' for SOL
    iconNameOverride?: IconName; // custom icon if needed
    size?: AmountSize;
    tone?: AmountTone;
    align?: 'left' | 'center' | 'right';
    containerStyle?: ViewStyle | ViewStyle[];
    textStyle?: TextStyle | TextStyle[];
};

function resolveVariant(size: AmountSize): TextVariant {
    switch (size) {
        case AmountSize.Sm:
            return TextVariant.NumBody;
        case AmountSize.Lg:
            return TextVariant.NumH1;
        case AmountSize.Md:
        default:
            return TextVariant.NumH3;
    }
}

export function Amount({
    value,
    currency,
    locale,
    showCents = true,
    useIcon = false,
    symbolOverride,
    iconNameOverride,
    size = AmountSize.Lg,
    tone = AmountTone.Default,
    align,
    containerStyle,
    textStyle,
}: AmountProps) {
    const t = useTheme();

    const color = useMemo(() => {
        switch (tone) {
            case AmountTone.Muted:
                return t.text.lessEmphasis;
            case AmountTone.Accent:
                return Palette.primary.flowAqua;
            case AmountTone.Default:
            default:
                return t.text.normal;
        }
    }, [tone, t]);

    // Format parts so we can style currency symbol separately
    const useCurrencyFormat = !symbolOverride; // if overriding symbol (e.g., SOL), use plain decimal format
    const formatter = useMemo(
        () =>
            new Intl.NumberFormat(
                locale,
                useCurrencyFormat
                    ? {
                        style: 'currency',
                        currency,
                        minimumFractionDigits: showCents ? 2 : 0,
                        maximumFractionDigits: showCents ? 2 : 0,
                    }
                    : {
                        style: 'decimal',
                        minimumFractionDigits: showCents ? 2 : 0,
                        maximumFractionDigits: showCents ? 2 : 0,
                    }
            ),
        [currency, locale, showCents, useCurrencyFormat]
    );

    // Manual parsing since formatToParts() is not available in React Native
    const formatted = formatter.format(value);
    const currencyPart = symbolOverride ?? CurrencySymbol[currency];
    
    const { integer, decimal } = useMemo(() => {
        // Remove currency symbol (handles both prefix "$123" and suffix "123€")
        const numberStr = useCurrencyFormat
            ? formatted.replace(new RegExp(CurrencySymbol[currency].replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), '').trim()
            : formatted;
        
        // Find the last decimal separator (the one before the fractional digits)
        const lastDot = numberStr.lastIndexOf('.');
        const lastComma = numberStr.lastIndexOf(',');
        const decimalIndex = lastDot > lastComma ? lastDot : lastComma;
        
        if (decimalIndex !== -1) {
            return {
                integer: numberStr.substring(0, decimalIndex).trim(),
                decimal: showCents ? numberStr.substring(decimalIndex) : '',
            };
        }
        
        return {
            integer: numberStr.trim() || '0',
            decimal: showCents ? '.00' : '',
        };
    }, [formatted, useCurrencyFormat, currency, showCents]);

    const variant = resolveVariant(size);

    return (
        <View style={[styles.row, containerStyle as any]}>
            {useIcon ? (
                <Icon
                    name={
                        iconNameOverride ??
                        (currency === 'USD'
                            ? IconName.Property1CurrencyDollar
                            : IconName.Property1Euro)
                    }
                    size={
                        variant === TextVariant.NumH2
                            ? 24
                            : variant === TextVariant.NumH3
                                ? 20
                                : 16
                    }
                    color={color}
                    containerStyle={{ marginRight: 6 }}
                />
            ) : (
                <AppText
                    variant={variant}
                    style={[{ color, marginRight: 4 }, textStyle as any]}
                >
                    {currencyPart}
                </AppText>
            )}

            <AppText
                variant={variant}
                style={[
                    { color },
                    textStyle as any,
                    align ? { textAlign: align } : null,
                ]}
            >
                {integer}
                {decimal}
            </AppText>
        </View>
    );
}

const styles = StyleSheet.create({
    row: {
        flexDirection: 'row',
        alignItems: 'flex-end',
    },
});

export default Amount;

