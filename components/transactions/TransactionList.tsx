import Icon from '@/components/ui/icons/Icon';
import { IconName } from '@/components/ui/icons/icon-names';
import { AppText } from '@/components/ui/text';
import { TextVariant } from '@/components/ui/text-variants';
import { useTheme, useThemeMode } from '@/hooks/theme';
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
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfYesterday = new Date(startOfToday);
    startOfYesterday.setDate(startOfYesterday.getDate() - 1);

    const time = d.toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
    });

    if (d >= startOfToday) {
        return `TODAY, ${time}`;
    }
    if (d >= startOfYesterday) {
        return `YESTERDAY, ${time}`;
    }

    const dayLabel = d.toLocaleDateString(undefined, {
        month: 'long',
        day: 'numeric',
    });

    return `${dayLabel.toUpperCase()}, ${time}`;
}

export function TransactionList({
    data = [],
    loading,
    emptyText = 'No transactions yet.',
    contentContainerStyle,
}: TransactionListProps) {
    const t = useTheme();
    const { isDark } = useThemeMode();
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
            contentContainerStyle={[
                { paddingHorizontal: 16, paddingBottom: 20 },
                contentContainerStyle as any,
            ]}
            renderItem={({ item }) => {
                const amountText = formatAmount(item.amount, item.currency);
                const isPositive = item.amount >= 0;
                const cardBg = isDark ? t.background.onBase2 : t.background.onBase;
                const cardBorder = isDark ? t.outline.outline2 : t.outline.outline1;

                return (
                    <View
                        key={item.id}
                        style={[
                            styles.row,
                            {
                                backgroundColor: cardBg,
                                borderColor: cardBorder,
                            },
                        ]}
                    >
                        <View
                            style={[
                                styles.leftIcon,
                                {
                                    backgroundColor: isDark ? t.background.onBase : '#F7F8FA',
                                    borderColor: cardBorder,
                                },
                            ]}
                        >
                            <Icon
                                name={IconName.Property1Plus}
                                size={14}
                                color={t.text.normal}
                            />
                        </View>

                        <View style={{ flex: 1, gap: 4 }}>
                            <AppText
                                variant={TextVariant.BodyMedium}
                                style={{ color: t.text.normal, fontWeight: '700' }}
                            >
                                {(item.notes || 'Transfer').toUpperCase()}
                            </AppText>
                            <View style={styles.subRow}>
                                <Icon
                                    name={IconName.Property1Variant25}
                                    size={14}
                                    color={t.text.lessEmphasis}
                                />
                                <AppText
                                    variant={TextVariant.Secondary}
                                    style={{ color: t.text.lessEmphasis }}
                                >
                                    {formatWhen(item.createdAt)}
                                </AppText>
                            </View>
                        </View>

                        <AppText
                            variant={TextVariant.BodyMedium}
                            style={{
                                color: isPositive ? t.text.success : t.text.error,
                                fontWeight: '700',
                            }}
                        >
                            {amountText}
                        </AppText>
                    </View>
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
    row: {
        minHeight: 62,
        borderRadius: 12,
        borderWidth: 1,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        marginBottom: 12,
        gap: 12,
    },
    leftIcon: {
        width: 44,
        height: 44,
        borderRadius: 12,
        borderWidth: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    subRow: {
        flexDirection: 'row',
        gap: 6,
        alignItems: 'center',
    },
});

export default TransactionList;
