import { BalanceCarousel } from '@/components/ui/balance-carousel';
import { IconButton } from '@/components/ui/buttons/IconButton';
import Icon from '@/components/ui/icons/Icon';
import { IconName } from '@/components/ui/icons/icon-names';
import { InvestCard } from '@/components/ui/invest-card';
import { ScreenContainer } from '@/components/ui/screen-container';
import { AppText } from '@/components/ui/text';
import { Palette } from '@/constants/theme';
import { useWallet, type WalletCurrency } from '@/hooks/WalletProvider';
import { MaterialIcons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useMemo } from 'react';
import {
    FlatList,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { transactionApiClient } from '../../src/domain/transactions';

export default function HomeScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const { setCurrency } = useWallet();

    const assetsMock = [
        {
            id: 'btc',
            symbol: 'EURC',
            address: 'Today, 10:35 AM',
            price: '€61.245',
            changePositive: true,
        },
        {
            id: 'eth',
            symbol: 'EURC',
            address: 'Today, 10:35 AM',
            price: '€3.245',
            changePositive: false,
        },
        {
            id: 'btc1',
            symbol: 'EURC',
            address: 'Today, 10:35 AM',
            price: '€61.245',
            changePositive: true,
        },
        {
            id: 'eth1',
            symbol: 'EURC',
            address: 'Today, 10:35 AM',
            price: '€3.245',
            changePositive: false,
        },
    ];

    const balances = useMemo<{ type: WalletCurrency; value: number }[]>(
        () => [
            { type: 'EURC', value: 0 },
            { type: 'USDC', value: 0 },
            { type: 'SOL', value: 0 },
        ],
        []
    );

    useEffect(() => {
        setCurrency(balances[0].type);
    }, [balances, setCurrency]);
    const { data: transactions, isLoading: transactionsLoading } = useQuery({
        queryKey: ['transactions'],
        queryFn: () => transactionApiClient.getTransactions({ limit: 5 }),
    });

    const handleAddMoney = () => {
        router.push('/(modals)/add-funds' as any);
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

    const handleCarouselChange = useCallback(
        (_index: number, item: { type: WalletCurrency }) => {
            setCurrency(item.type);
        },
        [setCurrency]
    );

    return (
        <ScreenContainer padded style={styles.container}>
            <View style={[styles.header, { paddingTop: insets.top }]}>
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
                <IconButton
                    iconName={IconName.Property1Search}
                    shape="circle"
                    iconSize={16}
                />
            </View>

            <View style={{ paddingHorizontal: 20 }}>
                <BalanceCarousel
                    balances={balances as any}
                    onChangeIndex={handleCarouselChange}
                />
            </View>

            <View style={styles.actionsContainer}>
                <IconButton
                    iconName={IconName.Property1Plus}
                    title="Add Founds"
                    textPosition="outside"
                    iconSize={16}
                    onPress={handleAddMoney}
                />
                <IconButton
                    iconName={IconName.Property1ArrowReceive}
                    title="Receive Money"
                    textPosition="outside"
                    iconSize={16}
                    onPress={handleReceiveMoney}
                />
                <IconButton
                    iconName={IconName.Property1ArrowSend}
                    title="Cash Out"
                    textPosition="outside"
                    iconSize={16}
                    onPress={handleCashOut}
                />
            </View>

            <View style={styles.transactionsSection}>
                <View style={styles.titleSection}>
                    <AppText style={styles.sectionTitle}>
                        Recent Transactions
                    </AppText>
                    <IconButton
                        iconName={IconName.Property1ArrowRight}
                        iconSize={12}
                        backgroundColor="transparent"
                        title="SEE MORE"
                        textPosition="left"
                        textStyle={[
                            styles.loadingText,
                            { fontSize: 12, padding: 2 },
                        ]}
                        style={{ padding: 0 }}
                    />
                </View>
                {transactionsLoading ? (
                    <AppText style={styles.loadingText}>
                        Loading transactions...
                    </AppText>
                ) : transactions?.data?.length ? (
                    transactions.data.map(transaction => (
                        <View
                            key={transaction.id}
                            style={styles.transactionItem}
                        >
                            <View style={styles.transactionInfo}>
                                <Text style={styles.transactionAmount}>
                                    {transaction.amount} {transaction.currency}
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
                    <FlatList
                        renderItem={({ item: a }) => (
                            <InvestCard
                                key={a.id}
                                symbol={a.symbol}
                                address={a.address}
                                price={a.price}
                                changePositive={a.changePositive}
                                style={{ marginBottom: 8 }}
                                left={
                                    <Icon
                                        name={IconName.Property1CurrencyDollar}
                                        size={34}
                                        color={Palette.secondary.openBlue}
                                    />
                                }
                                addressPrefix={
                                    <Icon
                                        name={IconName.Property1Variant25}
                                        size={14}
                                    />
                                }
                            />
                        )}
                        data={assetsMock}
                    ></FlatList>
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
        alignContent: 'center',
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
        marginTop: 20,
        borderRadius: 12,
    },
    titleSection: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 400,
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
