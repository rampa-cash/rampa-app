import { useTheme, useThemeMode } from '@/hooks/theme';
import React from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';
import { AppText } from './text';
import { TextVariant } from './text-variants';

export type InvestCardProps = {
    symbol: string;
    name?: string;
    address?: string;
    addressPrefix?: React.ReactNode;
    price: string;
    change?: string;
    changePositive?: boolean;
    changePrice?: boolean;
    left?: React.ReactNode;
    right?: React.ReactNode;
    style?: ViewStyle | ViewStyle[];
};

export function InvestCard({
    symbol,
    name,
    address,
    price,
    change,
    changePositive,
    changePrice,
    left,
    right,
    style,
    addressPrefix,
}: InvestCardProps) {
    const t = useTheme();
    const { isDark } = useThemeMode();
    const bg = isDark ? t.background.onBase2 : t.background.secondary;
    const border = isDark ? t.outline.outline2 : t.outline.outline1;

    return (
        <View
            style={[
                styles.card,
                { backgroundColor: bg, borderColor: border },
                style as any,
            ]}
        >
            {left ? <View style={styles.side}>{left}</View> : null}
            <View style={[styles.body, { flex: 1 }]}>
                <AppText
                    variant={TextVariant.BodyMedium}
                    style={{ color: t.text.normal }}
                >
                    {symbol}
                </AppText>
                {address ? (
                    <View style={styles.addressContainer}>
                        {addressPrefix}
                        <AppText
                            variant={TextVariant.Caption}
                            style={{ color: t.text.lessEmphasis }}
                        >
                            {address}
                        </AppText>
                    </View>
                ) : null}
            </View>

            <View style={styles.trailing}>
                <AppText
                    variant={TextVariant.NumBody}
                    style={{
                        color: changePositive ? t.text.success : t.text.error,
                    }}
                >
                    {price}
                </AppText>
                {change ? (
                    <AppText
                        variant={TextVariant.Caption}
                        style={{
                            color: changePositive
                                ? t.text.success
                                : t.text.error,
                        }}
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
    addressContainer: {
        alignItems: 'center',
        flexDirection: 'row',
    },
    side: {
        marginRight: 2,
    },
    body: {
        justifyContent: 'center',
        paddingVertical: 8,
    },
    trailing: {
        alignItems: 'flex-end',
        justifyContent: 'center',
        gap: 2,
        marginRight: 8,
    },
});

export default InvestCard;
