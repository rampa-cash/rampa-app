import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { Theme, Palette } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { AppText } from './text';
import { TextVariant } from './text-variants';

type Mode = keyof typeof Theme;

export type VirtualCardVariant = 'balance' | 'number';

export type VirtualCardProps = {
    variant?: VirtualCardVariant;
    title?: string; // e.g. Virtual Card
    balanceLabel?: string; // e.g. BALANCE
    balance?: string; // e.g. €345.67
    footer?: string; // e.g. +0.00% or DEBIT CARD
    name?: string; // Cardholder name
    numberMasked?: string; // 1234 5678 9012 3456
    expiry?: string;
    cvv?: string;
    gradient?: readonly [string, string];
    style?: ViewStyle | ViewStyle[];
};

export function VirtualCard({
    variant = 'balance',
    title = 'Virtual Card',
    balanceLabel = 'BALANCE',
    balance,
    footer,
    name,
    numberMasked,
    expiry,
    cvv,
    gradient,
    style,
}: VirtualCardProps) {
    const mode: Mode = useColorScheme() === 'dark' ? 'dark' : 'light';
    const t = Theme[mode];
    const colors = gradient ?? Palette.gradients.primary;

    // Try to use expo-linear-gradient if available, otherwise fallback to solid bg
    let LinearGradientImpl: any = null;
    try {
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        LinearGradientImpl = require('expo-linear-gradient').LinearGradient;
    } catch {}

    const CardBackground: React.ComponentType<any> = LinearGradientImpl ?? View;
    const backgroundProps = LinearGradientImpl
        ? { colors: [colors[0], colors[1]], start: { x: 0, y: 0 }, end: { x: 1, y: 1 } }
        : { style: [{ backgroundColor: colors[0] }] };

    return (
        <View style={[styles.container, style as any]}>
            <CardBackground {...backgroundProps} style={styles.card}>
                <AppText variant={TextVariant.Secondary} style={{ color: t.neutral.white }}>
                    {title}
                </AppText>

                {variant === 'balance' ? (
                    <View style={{ flex: 1, justifyContent: 'center' }}>
                        <AppText variant={TextVariant.Caption} style={{ color: t.neutral.white }}>
                            {balanceLabel}
                        </AppText>
                        <AppText variant={TextVariant.NumH1} style={{ color: t.neutral.white }}>
                            {balance}
                        </AppText>
                    </View>
                ) : (
                    <View style={{ flex: 1, justifyContent: 'flex-end' }}>
                        <AppText variant={TextVariant.BodyMedium} style={{ color: t.neutral.white }}>
                            {name}
                        </AppText>
                        <AppText variant={TextVariant.Body} style={{ color: t.neutral.white }}>
                            {numberMasked}
                        </AppText>
                        <View style={{ flexDirection: 'row', gap: 16 }}>
                            {expiry ? (
                                <AppText variant={TextVariant.Caption} style={{ color: t.neutral.white }}>
                                    {expiry}
                                </AppText>
                            ) : null}
                            {cvv ? (
                                <AppText variant={TextVariant.Caption} style={{ color: t.neutral.white }}>
                                    {cvv}
                                </AppText>
                            ) : null}
                        </View>
                    </View>
                )}

                {footer ? (
                    <AppText variant={TextVariant.Secondary} style={{ color: t.neutral.white }}>
                        {footer}
                    </AppText>
                ) : null}
            </CardBackground>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        width: '100%',
    },
    card: {
        borderRadius: 16,
        padding: 16,
        height: 180,
        overflow: 'hidden',
    },
});

export default VirtualCard;
