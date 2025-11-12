import BalanceCarousel from '@/components/ui/balance-carousel';
import IconButton from '@/components/ui/buttons/IconButton';
import Icon from '@/components/ui/icons/Icon';
import { IconName } from '@/components/ui/icons/icon-names';
import InvestCard from '@/components/ui/invest-card';
import ScreenContainer from '@/components/ui/screen-container';
import { Palette } from '@/constants/theme';
import { useThemeMode } from '@/hooks/theme';
import { MaterialIcons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useAuth } from '../../src/domain/auth';
import { transactionApiClient } from '../../src/domain/transactions';

export default function HomeScreen() {
    const router = useRouter();
    const { user } = useAuth();
    const { isDark } = useThemeMode();
    const assetsMock = [
        { id: 'btc', symbol: 'USDC', address: 'Today, 10:35 AM', price: '€61.245', changePositive: true },
        { id: 'eth', symbol: 'EURC', address: 'Today, 10:35 AM', price: '€3.245', changePositive: false },
    ];
    const { data: transactions, isLoading: transactionsLoading } = useQuery({
        queryKey: ['transactions'],
        queryFn: () => transactionApiClient.getTransactions({ limit: 5 }),
    });

    const handleAddMoney = () => {
        router.push('/(modals)/add-money' as any);
    };

    const handleReceiveMoney = () => {
        router.push('/(modals)/receive-money' as any);
    };

    const handleCashOut = () => {
        router.push('/(modals)/cash-out' as any);
    };

    const handleUserDetails = () => {
        router.push('/(modals)/user-details' as any);
    };

    return (
        <ScreenContainer scroll padded style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity
                    onPress={handleUserDetails}
                    style={styles.profileButton}
                >
                    <MaterialIcons
                        name="account-circle"
                        size={42}
                        color="#007AFF"
                    />
                </TouchableOpacity>
            </View>

            <View style={{ paddingHorizontal: 20, }}>
                <BalanceCarousel
                    balances={[
                        { type: 'EUR', value: 0 },
                        { type: 'USD', value: 0 },
                        { type: 'SOL', value: 0 },
                    ]}
                />
            </View>

            <View style={styles.actionsContainer}>
                <IconButton iconName={IconName.Property1Plus} title='Add Founds' textPosition='outside' iconSize={16} />
                <IconButton iconName={IconName.Property1ArrowReceive} title='Receive Money' textPosition='outside' iconSize={16} />
                <IconButton iconName={IconName.Property1ArrowSend} title='Cash Out' textPosition='outside' iconSize={16} />


            </View>

            <View style={styles.transactionsSection}>
                <Text style={styles.sectionTitle}>Recent Transactions</Text>
                {transactionsLoading ? (
                    <Text style={styles.loadingText}>
                        Loading transactions...
                    </Text>
                ) : transactions?.data?.length ? (
                    transactions.data.map(transaction => (
                        <View
                            key={transaction.id}
                            style={styles.transactionItem}
                        >
                            <View style={styles.transactionInfo}>
                                <Text style={styles.transactionAmount}>
                                    {transaction.amount}{' '}
                                    {transaction.currency}
                                </Text>
                                <Text style={styles.transactionStatus}>
                                    {transaction.status}
                                </Text>
                            </View>
                            <Text style={styles.transactionDate}>
                                {new Date(
                                    transaction.createdAt
                                ).toLocaleDateString()}
                            </Text>
                        </View>
                    ))
                ) : (

                    <View style={{ gap: 12 }}>
                        {assetsMock.map(a => (
                            <InvestCard
                                key={a.id}
                                symbol={a.symbol}
                                address={a.address}
                                price={a.price}
                                changePositive={a.changePositive}
                                left={<Icon name={IconName.Property1CurrencyDollar} size={34} color={Palette.secondary.openBlue} />}
                            />
                        ))}
                    </View>

                )}
            </View>
        </ScreenContainer>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 20,
    },
    greeting: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#333',
    },
    profileButton: {
        padding: 4,
    },
    balanceCard: {
        backgroundColor: '#007AFF',
        margin: 20,
        padding: 24,
        borderRadius: 12,
        alignItems: 'center',
    },
    balanceLabel: {
        color: '#fff',
        fontSize: 16,
        marginBottom: 8,
    },
    balanceAmount: {
        color: '#fff',
        fontSize: 32,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    balanceSubtext: {
        color: '#fff',
        fontSize: 14,
        opacity: 0.8,
    },
    actionsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        paddingHorizontal: 20,
        marginVertical: 20,
    },

    actionText: {
        marginTop: 8,
        fontSize: 12,
        color: '#333',
        textAlign: 'center',
    },
    transactionsSection: {
        backgroundColor: '#fff',
        margin: 20,
        padding: 20,
        borderRadius: 12,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 400,
        marginBottom: 16,
    },
    transactionItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    transactionInfo: {
        flex: 1,
    },
    transactionAmount: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
    },
    transactionStatus: {
        fontSize: 14,
        color: '#666',
        marginTop: 2,
    },
    transactionDate: {
        fontSize: 12,
        color: '#999',
    },
    loadingText: {
        textAlign: 'center',
        color: '#666',
        padding: 20,
    },
    emptyText: {
        textAlign: 'center',
        color: '#666',
        padding: 20,
    },
});
