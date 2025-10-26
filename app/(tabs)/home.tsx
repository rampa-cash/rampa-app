import { MaterialIcons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import React from 'react';
import {
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { apiClient } from '../../src/lib/apiClient';
import { useAuthStore } from '../../src/store/authStore';

export default function HomeScreen() {
    const router = useRouter();
    const { user } = useAuthStore();

    // Fetch transactions
    const { data: transactions, isLoading: transactionsLoading } = useQuery({
        queryKey: ['transactions'],
        queryFn: () => apiClient.getTransactions({ limit: 5 }),
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
        <ScrollView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.greeting}>
                    Hello, {user?.firstName || 'User'}!
                </Text>
                <TouchableOpacity
                    onPress={handleUserDetails}
                    style={styles.profileButton}
                >
                    <MaterialIcons
                        name="account-circle"
                        size={32}
                        color="#007AFF"
                    />
                </TouchableOpacity>
            </View>

            <View style={styles.balanceCard}>
                <Text style={styles.balanceLabel}>Total Balance</Text>
                <Text style={styles.balanceAmount}>$0.00</Text>
                <Text style={styles.balanceSubtext}>
                    SOL: 0.00 | USDC: 0.00 | EURC: 0.00
                </Text>
            </View>

            <View style={styles.actionsContainer}>
                <TouchableOpacity
                    style={styles.actionButton}
                    onPress={handleAddMoney}
                >
                    <MaterialIcons name="add" size={24} color="#007AFF" />
                    <Text style={styles.actionText}>Add Money</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.actionButton}
                    onPress={handleReceiveMoney}
                >
                    <MaterialIcons name="qr-code" size={24} color="#007AFF" />
                    <Text style={styles.actionText}>Receive</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.actionButton}
                    onPress={handleCashOut}
                >
                    <MaterialIcons
                        name="account-balance"
                        size={24}
                        color="#007AFF"
                    />
                    <Text style={styles.actionText}>Cash Out</Text>
                </TouchableOpacity>
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
                    <Text style={styles.emptyText}>No transactions yet</Text>
                )}
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 20,
        backgroundColor: '#fff',
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
        marginBottom: 20,
    },
    actionButton: {
        alignItems: 'center',
        backgroundColor: '#fff',
        padding: 16,
        borderRadius: 12,
        minWidth: 80,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
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
        fontWeight: 'bold',
        marginBottom: 16,
        color: '#333',
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
