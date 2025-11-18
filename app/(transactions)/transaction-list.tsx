import { TransactionList } from '@/components/transactions/TransactionList';
import { IconButton } from '@/components/ui/buttons/IconButton';
import { IconName } from '@/components/ui/icons/icon-names';
import { ScreenContainer } from '@/components/ui/screen-container';
import { AppText } from '@/components/ui/text';
import { getMockTransactions } from '@/src/domain/transactions/mock';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import React from 'react';
import { StyleSheet, View } from 'react-native';

export default function RecentTransactionsScreen() {
    const router = useRouter();
    const { data, isLoading } = useQuery({
        queryKey: ['transactions', 'mock', 'all'],
        queryFn: () => getMockTransactions(),
    });

    return (
        <ScreenContainer style={styles.container}>
            <View style={styles.header}>
                <IconButton
                    iconName={IconName.Property1ArrowLeft}
                    shape="circle"
                    iconSize={16}
                    bordered
                    onPress={() => router.back()}
                />
                <AppText style={styles.title}>Recent Transactions</AppText>
                <View style={{ width: 40 }} />
            </View>

            <TransactionList data={data?.data ?? []} loading={isLoading} />
        </ScreenContainer>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 12,
        paddingVertical: 14,
        marginBottom: 6,
    },
    title: {
        fontSize: 18,
        fontWeight: '600',
    },
});
