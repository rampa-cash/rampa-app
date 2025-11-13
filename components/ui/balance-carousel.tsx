import React, { useMemo, useState } from 'react';
import { Pressable, StyleSheet, View, ViewStyle } from 'react-native';

import { Palette } from '@/constants/theme';
import { useTheme, useThemeMode } from '@/hooks/theme';
import type { WalletCurrency } from '@/hooks/WalletProvider';
import { Amount } from './amount';
import { AmountSize, AmountTone } from './amount-variants';
import Icon from './icons/Icon';
import { IconName } from './icons/icon-names';
import { AppText } from './text';
import { TextVariant } from './text-variants';

type AssetType = WalletCurrency;

export type BalanceItem = {
    type: AssetType;
    value: number;
};

export type BalanceCarouselProps = {
    balances: BalanceItem[]; // expect 3 items: EUR, USD, SOL
    initialIndex?: number;
    onChangeIndex?: (index: number, item: BalanceItem) => void;
    style?: ViewStyle | ViewStyle[];
};

const LABEL: Record<AssetType, string> = {
    EURC: 'Euro',
    USDC: 'Dollar',
    SOL: 'Solana',
};

const ACCOUNT_LABEL: Record<AssetType, string> = {
    EURC: 'EURC ACCOUNT',
    USDC: 'USDC ACCOUNT',
    SOL: 'SOL ACCOUNT',
};

const AMOUNT_CURRENCY: Record<AssetType, 'USD' | 'EUR'> = {
    EURC: 'EUR',
    USDC: 'USD',
    SOL: 'USD',
};

export function BalanceCarousel({
    balances,
    initialIndex = 0,
    onChangeIndex,
    style,
}: BalanceCarouselProps) {
    const t = useTheme();
    const { isDark } = useThemeMode();
    const [index, setIndex] = useState(
        Math.max(0, Math.min(initialIndex, balances.length - 1))
    );

    const current = balances[index];

    const headerIcon = useMemo(() => {
        switch (current.type) {
            case 'USDC':
                return IconName.Property1CurrencyDollar;
            case 'EURC':
                return IconName.Property1Euro;
            case 'SOL':
            default:
                return undefined; // we'll show symbol instead
        }
    }, [current.type]);

    const go = (dir: -1 | 1) => {
        const next = (index + dir + balances.length) % balances.length;
        setIndex(next);
        onChangeIndex?.(next, balances[next]);
    };

    return (
        <View style={[styles.card, {}, style as any]}>
            <View
                style={{
                    justifyContent: 'center',
                    gap: 8,
                    display: 'flex',
                    flexDirection: 'row',
                    alignContent: 'center',
                    alignItems: 'center',
                }}
            >
                <View
                    style={{
                        width: 40,
                        height: 40,
                        borderRadius: 20,
                        backgroundColor: isDark
                            ? t.background.light
                            : t.background.variant,
                        alignItems: 'center',
                        justifyContent: 'center',
                    }}
                >
                    {headerIcon ? (
                        <Icon
                            name={headerIcon}
                            size={20}
                            color={isDark ? t.icon.variant : t.icon.variant}
                        />
                    ) : (
                        <AppText
                            variant={TextVariant.BodyMedium}
                            style={{ color: t.text.normal }}
                        >
                            SOL
                        </AppText>
                    )}
                </View>
                <AppText variant={TextVariant.Body}>
                    {LABEL[current.type]}
                </AppText>
            </View>

            {/* Arrows */}
            <Pressable
                onPress={() => go(-1)}
                style={styles.arrowLeft}
                accessibilityRole="button"
                accessibilityLabel="Previous balance"
            >
                <Icon
                    name={IconName.Property1ArrowLeft}
                    size={22}
                    color={t.icon.variant}
                />
            </Pressable>
            <Pressable
                onPress={() => go(1)}
                style={styles.arrowRight}
                accessibilityRole="button"
                accessibilityLabel="Next balance"
            >
                <Icon
                    name={IconName.Property1ArrowRight}
                    size={22}
                    color={t.icon.variant}
                />
            </Pressable>

            {/* Account label */}
            <View style={{ marginTop: 6, alignItems: 'center' }}>
                <AppText
                    variant={TextVariant.SecondaryMedium}
                    style={{ color: t.text.normal }}
                >
                    {ACCOUNT_LABEL[current.type]}
                </AppText>
            </View>

            {/* Amount */}
            <View style={{ marginTop: 8, alignItems: 'center' }}>
                <Amount
                    value={current.value}
                    currency={AMOUNT_CURRENCY[current.type]}
                    symbolOverride={current.type === 'SOL' ? 'SOL' : undefined}
                    showCents
                    size={AmountSize.Lg}
                    tone={AmountTone.Accent}
                    useIcon={false}
                />
            </View>

            {/* Dots */}
            <View style={styles.dots}>
                {balances.map((_, i) => (
                    <View
                        key={i}
                        style={{
                            width: 8,
                            height: 8,
                            borderRadius: 4,
                            marginHorizontal: 4,
                            backgroundColor:
                                i === index
                                    ? Palette.primary.flowAqua
                                    : t.outline.outline2,
                        }}
                    />
                ))}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    card: {
        borderRadius: 6,
        padding: 16,
        width: '100%',
        alignSelf: 'center',
        marginVertical: 12,
        gap: 12,
    },
    arrowLeft: {
        position: 'absolute',
        left: 8,
        top: '50%',
        marginTop: -11,
    },
    arrowRight: {
        position: 'absolute',
        right: 8,
        top: '50%',
        marginTop: -11,
    },
    dots: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: 10,
    },
});

export default BalanceCarousel;
