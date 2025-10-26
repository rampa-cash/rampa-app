import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    Alert,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

export default function CashOutScreen() {
    const router = useRouter();
    const [amount, setAmount] = useState('');
    const [selectedMethod, setSelectedMethod] = useState<
        'bank' | 'card' | 'paypal'
    >('bank');
    const [bankDetails, setBankDetails] = useState({
        accountNumber: '',
        routingNumber: '',
        accountName: '',
    });

    const withdrawalMethods = [
        {
            id: 'bank',
            name: 'Bank Transfer',
            icon: 'account-balance',
            fee: 'Free',
        },
        { id: 'card', name: 'Debit Card', icon: 'credit-card', fee: '$2.99' },
        { id: 'paypal', name: 'PayPal', icon: 'payment', fee: '3.5%' },
    ];

    const handleCashOut = () => {
        if (!amount.trim()) {
            Alert.alert('Error', 'Please enter an amount');
            return;
        }

        const numAmount = parseFloat(amount);
        if (isNaN(numAmount) || numAmount <= 0) {
            Alert.alert('Error', 'Please enter a valid amount');
            return;
        }

        if (selectedMethod === 'bank' && !bankDetails.accountNumber) {
            Alert.alert('Error', 'Please enter bank account details');
            return;
        }

        Alert.alert(
            'Confirm Withdrawal',
            `Withdraw $${amount} to your ${withdrawalMethods.find(m => m.id === selectedMethod)?.name}?`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Withdraw',
                    onPress: () => {
                        console.log('Withdrawing:', {
                            amount,
                            method: selectedMethod,
                            bankDetails,
                        });
                        router.back();
                    },
                },
            ]
        );
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity
                    onPress={() => router.back()}
                    style={styles.closeButton}
                >
                    <MaterialIcons name="close" size={24} color="#333" />
                </TouchableOpacity>
                <Text style={styles.title}>Cash Out</Text>
                <View style={styles.placeholder} />
            </View>

            <View style={styles.content}>
                <View style={styles.amountSection}>
                    <Text style={styles.label}>Amount</Text>
                    <View style={styles.amountInputContainer}>
                        <Text style={styles.currencySymbol}>$</Text>
                        <TextInput
                            style={styles.amountInput}
                            placeholder="0.00"
                            value={amount}
                            onChangeText={setAmount}
                            keyboardType="numeric"
                            placeholderTextColor="#999"
                        />
                    </View>
                </View>

                <View style={styles.methodSection}>
                    <Text style={styles.label}>Withdrawal Method</Text>
                    {withdrawalMethods.map(method => (
                        <TouchableOpacity
                            key={method.id}
                            style={[
                                styles.methodCard,
                                selectedMethod === method.id &&
                                    styles.methodCardSelected,
                            ]}
                            onPress={() => setSelectedMethod(method.id as any)}
                        >
                            <MaterialIcons
                                name={method.icon as any}
                                size={24}
                                color={
                                    selectedMethod === method.id
                                        ? '#007AFF'
                                        : '#666'
                                }
                            />
                            <View style={styles.methodInfo}>
                                <Text
                                    style={[
                                        styles.methodName,
                                        selectedMethod === method.id &&
                                            styles.methodNameSelected,
                                    ]}
                                >
                                    {method.name}
                                </Text>
                                <Text style={styles.methodFee}>
                                    Fee: {method.fee}
                                </Text>
                            </View>
                            {selectedMethod === method.id && (
                                <MaterialIcons
                                    name="check-circle"
                                    size={20}
                                    color="#007AFF"
                                />
                            )}
                        </TouchableOpacity>
                    ))}
                </View>

                {selectedMethod === 'bank' && (
                    <View style={styles.bankDetailsSection}>
                        <Text style={styles.label}>Bank Account Details</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Account Number"
                            value={bankDetails.accountNumber}
                            onChangeText={text =>
                                setBankDetails(prev => ({
                                    ...prev,
                                    accountNumber: text,
                                }))
                            }
                            keyboardType="numeric"
                        />
                        <TextInput
                            style={styles.input}
                            placeholder="Routing Number"
                            value={bankDetails.routingNumber}
                            onChangeText={text =>
                                setBankDetails(prev => ({
                                    ...prev,
                                    routingNumber: text,
                                }))
                            }
                            keyboardType="numeric"
                        />
                        <TextInput
                            style={styles.input}
                            placeholder="Account Holder Name"
                            value={bankDetails.accountName}
                            onChangeText={text =>
                                setBankDetails(prev => ({
                                    ...prev,
                                    accountName: text,
                                }))
                            }
                        />
                    </View>
                )}

                <View style={styles.summarySection}>
                    <Text style={styles.label}>Withdrawal Summary</Text>
                    <View style={styles.summaryRow}>
                        <Text style={styles.summaryLabel}>Amount</Text>
                        <Text style={styles.summaryValue}>
                            ${amount || '0.00'}
                        </Text>
                    </View>
                    <View style={styles.summaryRow}>
                        <Text style={styles.summaryLabel}>Fee</Text>
                        <Text style={styles.summaryValue}>
                            {
                                withdrawalMethods.find(
                                    m => m.id === selectedMethod
                                )?.fee
                            }
                        </Text>
                    </View>
                    <View style={[styles.summaryRow, styles.summaryTotal]}>
                        <Text style={styles.summaryLabel}>Total</Text>
                        <Text style={styles.summaryValue}>
                            ${amount || '0.00'}
                        </Text>
                    </View>
                </View>

                <TouchableOpacity
                    style={styles.cashOutButton}
                    onPress={handleCashOut}
                >
                    <Text style={styles.cashOutButtonText}>Cash Out</Text>
                </TouchableOpacity>

                <View style={styles.infoSection}>
                    <Text style={styles.infoTitle}>Processing Time</Text>
                    <Text style={styles.infoText}>
                        • Bank Transfer: 1-3 business days{'\n'}• Debit Card:
                        Instant to 24 hours{'\n'}• PayPal: Instant to 1 hour
                    </Text>
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 20,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    closeButton: {
        padding: 4,
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
    },
    placeholder: {
        width: 32,
    },
    content: {
        flex: 1,
        padding: 20,
    },
    amountSection: {
        backgroundColor: '#fff',
        padding: 20,
        borderRadius: 12,
        marginBottom: 20,
    },
    label: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
        marginBottom: 12,
    },
    amountInputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        paddingHorizontal: 16,
    },
    currencySymbol: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#333',
        marginRight: 8,
    },
    amountInput: {
        flex: 1,
        fontSize: 24,
        fontWeight: 'bold',
        color: '#333',
        paddingVertical: 16,
    },
    methodSection: {
        marginBottom: 20,
    },
    methodCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        padding: 16,
        borderRadius: 8,
        marginBottom: 8,
        borderWidth: 1,
        borderColor: '#ddd',
    },
    methodCardSelected: {
        borderColor: '#007AFF',
        backgroundColor: '#f0f8ff',
    },
    methodInfo: {
        flex: 1,
        marginLeft: 12,
    },
    methodName: {
        fontSize: 16,
        color: '#333',
        fontWeight: '500',
    },
    methodNameSelected: {
        color: '#007AFF',
        fontWeight: '600',
    },
    methodFee: {
        fontSize: 14,
        color: '#666',
        marginTop: 2,
    },
    bankDetailsSection: {
        backgroundColor: '#fff',
        padding: 20,
        borderRadius: 12,
        marginBottom: 20,
    },
    input: {
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        padding: 16,
        fontSize: 16,
        backgroundColor: '#f9f9f9',
        marginBottom: 12,
    },
    summarySection: {
        backgroundColor: '#fff',
        padding: 20,
        borderRadius: 12,
        marginBottom: 20,
    },
    summaryRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 8,
    },
    summaryTotal: {
        borderTopWidth: 1,
        borderTopColor: '#eee',
        marginTop: 8,
        paddingTop: 16,
    },
    summaryLabel: {
        fontSize: 16,
        color: '#333',
    },
    summaryValue: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
    },
    cashOutButton: {
        backgroundColor: '#007AFF',
        padding: 16,
        borderRadius: 8,
        alignItems: 'center',
        marginBottom: 20,
    },
    cashOutButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    infoSection: {
        backgroundColor: '#fff',
        padding: 20,
        borderRadius: 12,
    },
    infoTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
        marginBottom: 8,
    },
    infoText: {
        fontSize: 14,
        color: '#666',
        lineHeight: 20,
    },
});
