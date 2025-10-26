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
import { biometricAuth } from '../../src/utils/biometricAuth';
import { SecurityUtils } from '../../src/utils/securityUtils';

export default function AddMoneyScreen() {
    const router = useRouter();
    const [amount, setAmount] = useState('');
    const [selectedMethod, setSelectedMethod] = useState<
        'card' | 'bank' | 'crypto'
    >('card');

    const paymentMethods = [
        { id: 'card', name: 'Credit/Debit Card', icon: 'credit-card' },
        { id: 'bank', name: 'Bank Transfer', icon: 'account-balance' },
        { id: 'crypto', name: 'Crypto Wallet', icon: 'currency-bitcoin' },
    ];

    const handleAddMoney = async () => {
        if (!amount.trim()) {
            Alert.alert('Error', 'Please enter an amount');
            return;
        }

        const numAmount = parseFloat(amount);
        if (isNaN(numAmount) || numAmount <= 0) {
            Alert.alert('Error', 'Please enter a valid amount');
            return;
        }

        if (!SecurityUtils.isValidAmount(numAmount)) {
            Alert.alert('Error', 'Amount exceeds maximum limit');
            return;
        }

        try {
            // Authenticate with biometrics for sensitive operations
            const authResult =
                await biometricAuth.authenticateForSensitiveOperation(
                    `add ${amount} USD to wallet`
                );

            if (!authResult.success) {
                Alert.alert(
                    'Authentication Required',
                    'Biometric authentication is required for adding money'
                );
                return;
            }

            Alert.alert(
                'Confirm Payment',
                `Add $${amount} using ${paymentMethods.find(m => m.id === selectedMethod)?.name}?`,
                [
                    { text: 'Cancel', style: 'cancel' },
                    {
                        text: 'Add Money',
                        onPress: async () => {
                            // Simulate API call
                            await new Promise(resolve =>
                                setTimeout(resolve, 2000)
                            );
                            Alert.alert('Success', 'Money added successfully!');
                            router.back();
                        },
                    },
                ]
            );
        } catch (error) {
            Alert.alert('Error', 'Failed to add money to wallet');
        }
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
                <Text style={styles.title}>Add Money</Text>
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
                    <Text style={styles.label}>Payment Method</Text>
                    {paymentMethods.map(method => (
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
                            <Text
                                style={[
                                    styles.methodName,
                                    selectedMethod === method.id &&
                                        styles.methodNameSelected,
                                ]}
                            >
                                {method.name}
                            </Text>
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

                <View style={styles.feeInfo}>
                    <Text style={styles.feeLabel}>Processing Fee</Text>
                    <Text style={styles.feeAmount}>$0.00</Text>
                </View>

                <TouchableOpacity
                    style={styles.addButton}
                    onPress={handleAddMoney}
                >
                    <Text style={styles.addButtonText}>Add Money</Text>
                </TouchableOpacity>
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
    methodName: {
        flex: 1,
        fontSize: 16,
        color: '#333',
        marginLeft: 12,
    },
    methodNameSelected: {
        color: '#007AFF',
        fontWeight: '600',
    },
    feeInfo: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#fff',
        padding: 16,
        borderRadius: 8,
        marginBottom: 24,
    },
    feeLabel: {
        fontSize: 16,
        color: '#666',
    },
    feeAmount: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
    },
    addButton: {
        backgroundColor: '#007AFF',
        padding: 16,
        borderRadius: 8,
        alignItems: 'center',
    },
    addButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
});
