import Icon from '@/components/ui/icons/Icon';
import { IconName } from '@/components/ui/icons/icon-names';
import { InvestCard } from '@/components/ui/invest-card';
import { AppText } from '@/components/ui/text';
import { TextVariant } from '@/components/ui/text-variants';
import { Palette } from '@/constants/theme';
import type { Transaction } from '@/src/domain/transactions';
import React, { useMemo } from 'react';
import { FlatList, StyleSheet, View, ViewStyle } from 'react-native';

export type TransactionListProps = {
    data?: Transaction[];
    loading?: boolean;
    emptyText?: string;
    contentContainerStyle?: ViewStyle | ViewStyle[];
};

function formatAmount(amount: number, currency: Transaction['currency']) {
    const sign = amount >= 0 ? '+' : '-';
    const abs = Math.abs(amount).toLocaleString(undefined, {
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
    });
    return `${sign}$${abs}`; // Keep simple dollar style as in mock
}

function formatWhen(date: Date | string) {
    const d = new Date(date);
    const now = new Date();
    const isToday =
        d.getDate() === now.getDate() &&
        d.getMonth() === now.getMonth() &&
        d.getFullYear() === now.getFullYear();
    const time = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    return `${isToday ? 'TODAY' : d.toLocaleDateString()}, ${time}`;
}

export function TransactionList({
    data = [],
    loading,
    emptyText = 'No transactions found',
    contentContainerStyle,
}: TransactionListProps) {
    const items = useMemo(() => data ?? [], [data]);

    if (loading) {
        return (
            <View style={styles.center}>
                <AppText variant={TextVariant.BodyMedium} style={styles.muted}>
                    Loading transactions...
                </AppText>
            </View>
        );
    }

    if (!items.length) {
        return (
            <View style={styles.center}>
                <AppText variant={TextVariant.BodyMedium} style={styles.muted}>
                    {emptyText}
                </AppText>
            </View>
        );
    }

    return (
        <FlatList
            data={items}
            keyExtractor={(t) => t.id}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={[{ paddingHorizontal: 20 }, contentContainerStyle as any]}
            renderItem={({ item }) => {
                const amountText = formatAmount(item.amount, item.currency);
                const isPositive = item.amount >= 0;
                return (
                    <InvestCard
                        key={item.id}
                        symbol={item.notes || 'Transfer'}
                        address={formatWhen(item.createdAt)}
                        price={amountText}
                        changePositive={isPositive}
                        style={{ marginBottom: 10 }}
                        left={
                            <Icon
                                name={IconName.Property1CurrencyDollar}
                                size={34}
                                color={Palette.secondary.openBlue}
                            />
                        }
                        
                        addressPrefix={<Icon name={IconName.Property1Variant25} size={14} />}
                    />
                );
            }}
        />
    );
}

const styles = StyleSheet.create({
    center: {
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
    },
    muted: {
        color: '#666',
    },
});

export default TransactionList;

