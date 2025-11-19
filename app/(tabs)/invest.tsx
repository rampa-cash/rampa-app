import React, { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { IconButton } from '@/components/ui/buttons/IconButton';
import Icon from '@/components/ui/icons/Icon';
import { IconName } from '@/components/ui/icons/icon-names';
import { ScreenContainer } from '@/components/ui/screen-container';
import { AppText } from '@/components/ui/text';
import { TextVariant } from '@/components/ui/text-variants';
import { useTheme, useThemeMode } from '@/hooks/theme';

type AssetRow = {
    symbol: string;
    address: string;
    price: string;
    change: string;
    changePercent: string;
    positive: boolean;
};

export default function InvestScreen() {
    const insets = useSafeAreaInsets();
    const t = useTheme();
    const { isDark } = useThemeMode();

    const assets = useMemo<AssetRow[]>(
        () => [
            {
                symbol: 'APPLx',
                address: '0X9AB3...F21C',
                price: '\u20ac37.10',
                change: '-4.64',
                changePercent: '-1.92%',
                positive: false,
            },
            {
                symbol: 'ETF',
                address: '0X9AB3...F21C',
                price: '\u20ac37.10',
                change: '-4.64',
                changePercent: '-1.92%',
                positive: false,
            },
            {
                symbol: 'GOOG',
                address: '0X5BD4...G43B',
                price: '\u20ac120.50',
                change: '+2.55',
                changePercent: '+2.15%',
                positive: true,
            },
            {
                symbol: 'AMZN',
                address: '0X6A8B...H12D',
                price: '\u20ac95.30',
                change: '-1.20',
                changePercent: '-1.25%',
                positive: false,
            },
            {
                symbol: 'TSLA',
                address: '0X3BE2...K34C',
                price: '\u20ac220.45',
                change: '+3.80',
                changePercent: '+17.5%',
                positive: true,
            },
            {
                symbol: 'MSFT',
                address: '0X9B92...J21C',
                price: '\u20ac310.15',
                change: '+2.25',
                changePercent: '+0.72%',
                positive: true,
            },
        ],
        []
    );

    return (
        <ScreenContainer
            padded
            scroll
            contentContainerStyle={[
                styles.container,
                { paddingBottom: insets.bottom + 24, paddingTop: insets.top },
            ]}
        >
            <View style={styles.header}>
                <View
                    style={[
                        styles.avatar,
                        {
                            backgroundColor: isDark
                                ? t.background.dim
                                : t.background.onBase,
                            borderColor: isDark
                                ? t.outline.outline2
                                : t.outline.outline1,
                        },
                    ]}
                >
                    <Icon
                        name={IconName.Property1RampaSolid}
                        size={16}
                        color={t.icon.normal}
                    />
                </View>

                <IconButton
                    iconName={IconName.Property1Search}
                    shape="circle"
                    iconSize={14}
                />
            </View>

            <View style={styles.hero}>
                <AppText variant={TextVariant.H1}>Invest</AppText>
                <AppText variant={TextVariant.Secondary} color="lessEmphasis">
                    Invest in tokenized assets with live data from Jupiter.
                    Refresh to stay updated.
                </AppText>
            </View>

            <View style={styles.list}>
                {assets.map(asset => (
                    <View
                        key={asset.symbol}
                        style={[
                            styles.assetCard,
                            {
                                backgroundColor: isDark
                                    ? t.background.onBase
                                    : t.background.onBase2,
                                borderColor: isDark
                                    ? t.outline.outline2
                                    : t.outline.outline1,
                            },
                        ]}
                    >
                        <View style={styles.assetLeft}>
                            <Icon
                                name={IconName.Property1Apple}
                                size={20}
                                bgColor={
                                    isDark
                                        ? t.background.dim
                                        : t.background.onBase
                                }
                                containerStyle={styles.iconWrapper}
                                color={isDark ? t.icon.variant : undefined}
                            />

                            <View style={{ gap: 4 }}>
                                <AppText
                                    variant={TextVariant.BodyMedium}
                                    color="normal"
                                >
                                    {asset.symbol}
                                </AppText>
                                <AppText
                                    variant={TextVariant.Secondary}
                                    color="lessEmphasis"
                                >
                                    {asset.address}
                                </AppText>
                            </View>
                        </View>

                        <View style={styles.assetRight}>
                            <View style={{ alignItems: 'flex-end' }}>
                                <AppText variant={TextVariant.BodyMedium}>
                                    {asset.price}
                                </AppText>
                                <AppText
                                    variant={TextVariant.Secondary}
                                    style={{
                                        color: asset.positive
                                            ? t.text.success
                                            : t.text.error,
                                    }}
                                >
                                    {asset.change} {asset.changePercent}
                                </AppText>
                            </View>

                            <Icon
                                name={IconName.Property1Wallet}
                                size={18}
                                bgColor={
                                    isDark
                                        ? t.background.dim
                                        : t.background.onBase
                                }
                                containerStyle={styles.iconWrapper}
                                color={isDark ? t.icon.variant : undefined}
                            />
                        </View>
                    </View>
                ))}
            </View>
        </ScreenContainer>
    );
}

const styles = StyleSheet.create({
    container: {
        gap: 20,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    avatar: {
        width: 42,
        height: 42,
        borderRadius: 21,
        borderWidth: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    hero: {
        gap: 10,
    },
    list: {
        gap: 12,
    },
    assetCard: {
        borderRadius: 16,
        borderWidth: 1,
        padding: 14,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    assetLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    assetRight: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    iconWrapper: {
        padding: 10,
        borderRadius: 16,
    },
});
