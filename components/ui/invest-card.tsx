import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { AppText } from './text';
import { TextVariant } from './text-variants';
import { Theme } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

type Mode = keyof typeof Theme;

export type InvestCardProps = {
    symbol: string; // e.g. APFLx
    name?: string; // optional descriptive name
    address?: string; // short address/chain
    price: string; // formatted, e.g. €371.0
    change?: string; // e.g. +4.64 / -1.32%
    changePositive?: boolean;
    left?: React.ReactNode; // token icon
    right?: React.ReactNode; // e.g. context menu
    style?: ViewStyle | ViewStyle[];
};

export function InvestCard({
    symbol,
    name,
    address,
    price,
    change,
    changePositive,
    left,
    right,
    style,
}: InvestCardProps) {
    const mode: Mode = useColorScheme() === 'dark' ? 'dark' : 'light';
    const t = Theme[mode];
    const bg = mode === 'dark' ? t.background.onBase2 : t.background.onBase;
    const border = mode === 'dark' ? t.outline.outline2 : t.outline.outline1;

    return (
        <View style={[styles.card, { backgroundColor: bg, borderColor: border }, style as any]}>
            {left ? <View style={styles.side}>{left}</View> : null}
            <View style={[styles.body, { flex: 1 }]}>
                <AppText variant={TextVariant.BodyMedium} style={{ color: t.text.normal }}>
                    {symbol}
                </AppText>
                {address ? (
                    <AppText variant={TextVariant.Caption} style={{ color: t.text.lessEmphasis }}>
                        {address}
                    </AppText>
                ) : null}
            </View>

            <View style={styles.trailing}>
                <AppText variant={TextVariant.BodyMedium} style={{ color: t.text.normal }}>
                    {price}
                </AppText>
                {change ? (
                    <AppText
                        variant={TextVariant.Caption}
                        style={{ color: changePositive ? t.text.success : t.text.error }}
                    >
                        {change}
                    </AppText>
                ) : null}
            </View>
            {right ? <View style={styles.side}>{right}</View> : null}
        </View>
    );
}

const styles = StyleSheet.create({
    card: {
        minHeight: 60,
        borderRadius: 14,
        borderWidth: 1,
        paddingHorizontal: 12,
        alignItems: 'center',
        flexDirection: 'row',
    },
    side: {
        marginRight: 10,
    },
    body: {
        justifyContent: 'center',
        paddingVertical: 8,
    },
    trailing: {
        alignItems: 'flex-end',
        justifyContent: 'center',
        gap: 2,
    },
});

export default InvestCard;

