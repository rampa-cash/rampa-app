import { MaterialIcons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
    Alert,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { transactionService } from '../../src/domain/transactions';
import { SecurityUtils } from '../../src/shared/utils/securityUtils';

export default function SendScreen() {
    const [recipient, setRecipient] = useState('');
    const [amount, setAmount] = useState('');
    const [currency, setCurrency] = useState<'SOL' | 'USDC' | 'EURC'>('USDC');

    const handleSend = async () => {
        if (!recipient.trim() || !amount.trim()) {
            Alert.alert('Error', 'Please fill in all fields');
            return;
        }

        const numAmount = parseFloat(amount);
        if (isNaN(numAmount) || numAmount <= 0) {
            Alert.alert('Error', 'Please enter a valid amount');
            return;
        }

        if (!SecurityUtils.isValidSolanaAddress(recipient)) {
            Alert.alert('Error', 'Please enter a valid Solana address');
            return;
        }

        Alert.alert(
            'Confirm Transaction',
            `Send ${amount} ${currency} to ${recipient}?`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Send',
                    onPress: async () => {
                        try {
                            const result =
                                await transactionService.createTransaction({
                                    recipientAddress: recipient.trim(),
                                    amount: numAmount,
                                    currency,
                                });

                            if (result.success) {
                                Alert.alert(
                                    'Success',
                                    'Transaction created successfully!'
                                );
                                setRecipient('');
                                setAmount('');
                            } else {
                                Alert.alert(
                                    'Error',
                                    result.error || 'Transaction failed'
                                );
                            }
                        } catch (error) {
                            Alert.alert('Error', 'Failed to send transaction');
                        }
                    },
                },
            ]
        );
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Send Money</Text>

            <View style={styles.form}>
                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Recipient</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Enter email, phone, or address"
                        value={recipient}
                        onChangeText={setRecipient}
                        autoCapitalize="none"
                    />
                </View>

                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Amount</Text>
                    <View style={styles.amountRow}>
                        <TextInput
                            style={[styles.input, styles.amountInput]}
                            placeholder="0.00"
                            value={amount}
                            onChangeText={setAmount}
                            keyboardType="numeric"
                        />
                        <View style={styles.currencySelector}>
                            <TouchableOpacity
                                style={[
                                    styles.currencyButton,
                                    currency === 'SOL' &&
                                        styles.currencyButtonActive,
                                ]}
                                onPress={() => setCurrency('SOL')}
                            >
                                <Text
                                    style={[
                                        styles.currencyText,
                                        currency === 'SOL' &&
                                            styles.currencyTextActive,
                                    ]}
                                >
                                    SOL
                                </Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[
                                    styles.currencyButton,
                                    currency === 'USDC' &&
                                        styles.currencyButtonActive,
                                ]}
                                onPress={() => setCurrency('USDC')}
                            >
                                <Text
                                    style={[
                                        styles.currencyText,
                                        currency === 'USDC' &&
                                            styles.currencyTextActive,
                                    ]}
                                >
                                    USDC
                                </Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[
                                    styles.currencyButton,
                                    currency === 'EURC' &&
                                        styles.currencyButtonActive,
                                ]}
                                onPress={() => setCurrency('EURC')}
                            >
                                <Text
                                    style={[
                                        styles.currencyText,
                                        currency === 'EURC' &&
                                            styles.currencyTextActive,
                                    ]}
                                >
                                    EURC
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>

                <TouchableOpacity
                    style={styles.sendButton}
                    onPress={handleSend}
                >
                    <MaterialIcons name="send" size={20} color="#fff" />
                    <Text style={styles.sendButtonText}>Send Money</Text>
                </TouchableOpacity>
            </View>

            <View style={styles.quickActions}>
                <Text style={styles.quickActionsTitle}>Quick Actions</Text>
                <View style={styles.quickActionsRow}>
                    <TouchableOpacity style={styles.quickActionButton}>
                        <MaterialIcons
                            name="contacts"
                            size={24}
                            color="#007AFF"
                        />
                        <Text style={styles.quickActionText}>Contacts</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.quickActionButton}>
                        <MaterialIcons
                            name="qr-code-scanner"
                            size={24}
                            color="#007AFF"
                        />
                        <Text style={styles.quickActionText}>Scan QR</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.quickActionButton}>
                        <MaterialIcons
                            name="history"
                            size={24}
                            color="#007AFF"
                        />
                        <Text style={styles.quickActionText}>History</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
        padding: 20,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        marginBottom: 24,
        color: '#333',
    },
    form: {
        backgroundColor: '#fff',
        padding: 20,
        borderRadius: 12,
        marginBottom: 24,
    },
    inputGroup: {
        marginBottom: 20,
    },
    label: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 8,
        color: '#333',
    },
    input: {
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        padding: 16,
        fontSize: 16,
        backgroundColor: '#f9f9f9',
    },
    amountRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    amountInput: {
        flex: 1,
        marginRight: 12,
    },
    currencySelector: {
        flexDirection: 'row',
        backgroundColor: '#f0f0f0',
        borderRadius: 8,
        padding: 4,
    },
    currencyButton: {
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 6,
    },
    currencyButtonActive: {
        backgroundColor: '#007AFF',
    },
    currencyText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#666',
    },
    currencyTextActive: {
        color: '#fff',
    },
    sendButton: {
        backgroundColor: '#007AFF',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
        borderRadius: 8,
        marginTop: 8,
    },
    sendButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
        marginLeft: 8,
    },
    quickActions: {
        backgroundColor: '#fff',
        padding: 20,
        borderRadius: 12,
    },
    quickActionsTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 16,
        color: '#333',
    },
    quickActionsRow: {
        flexDirection: 'row',
        justifyContent: 'space-around',
    },
    quickActionButton: {
        alignItems: 'center',
        padding: 12,
    },
    quickActionText: {
        marginTop: 8,
        fontSize: 12,
        color: '#007AFF',
        textAlign: 'center',
    },
});
