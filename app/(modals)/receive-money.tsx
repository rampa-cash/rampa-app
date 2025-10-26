import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function ReceiveMoneyScreen() {
    const router = useRouter();
    const [selectedCurrency, setSelectedCurrency] = useState<
        'SOL' | 'USDC' | 'EURC'
    >('USDC');

    const currencies = [
        { id: 'SOL', name: 'Solana', symbol: 'SOL' },
        { id: 'USDC', name: 'USD Coin', symbol: 'USDC' },
        { id: 'EURC', name: 'Euro Coin', symbol: 'EURC' },
    ];

    const handleShareAddress = () => {
        Alert.alert(
            'Share Address',
            'Your wallet address has been copied to clipboard',
            [{ text: 'OK' }]
        );
    };

    const handleGenerateQR = () => {
        Alert.alert('QR Code', 'QR code generated for easy sharing', [
            { text: 'OK' },
        ]);
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
                <Text style={styles.title}>Receive Money</Text>
                <View style={styles.placeholder} />
            </View>

            <View style={styles.content}>
                <View style={styles.currencySelector}>
                    <Text style={styles.label}>Select Currency</Text>
                    <View style={styles.currencyButtons}>
                        {currencies.map(currency => (
                            <TouchableOpacity
                                key={currency.id}
                                style={[
                                    styles.currencyButton,
                                    selectedCurrency === currency.id &&
                                        styles.currencyButtonSelected,
                                ]}
                                onPress={() =>
                                    setSelectedCurrency(currency.id as any)
                                }
                            >
                                <Text
                                    style={[
                                        styles.currencyText,
                                        selectedCurrency === currency.id &&
                                            styles.currencyTextSelected,
                                    ]}
                                >
                                    {currency.symbol}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                <View style={styles.qrSection}>
                    <View style={styles.qrCode}>
                        <MaterialIcons name="qr-code" size={120} color="#333" />
                    </View>
                    <Text style={styles.qrLabel}>
                        Scan QR code to send {selectedCurrency}
                    </Text>
                </View>

                <View style={styles.addressSection}>
                    <Text style={styles.label}>Wallet Address</Text>
                    <View style={styles.addressContainer}>
                        <Text style={styles.addressText}>
                            9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM
                        </Text>
                        <TouchableOpacity
                            onPress={handleShareAddress}
                            style={styles.copyButton}
                        >
                            <MaterialIcons
                                name="content-copy"
                                size={20}
                                color="#007AFF"
                            />
                        </TouchableOpacity>
                    </View>
                </View>

                <View style={styles.actionsContainer}>
                    <TouchableOpacity
                        style={styles.actionButton}
                        onPress={handleShareAddress}
                    >
                        <MaterialIcons name="share" size={20} color="#007AFF" />
                        <Text style={styles.actionText}>Share Address</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.actionButton}
                        onPress={handleGenerateQR}
                    >
                        <MaterialIcons
                            name="qr-code-2"
                            size={20}
                            color="#007AFF"
                        />
                        <Text style={styles.actionText}>Generate QR</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.infoSection}>
                    <Text style={styles.infoTitle}>How to receive money:</Text>
                    <Text style={styles.infoText}>
                        1. Share your wallet address or QR code with the sender
                        {'\n'}
                        2. The sender can send {selectedCurrency} to this
                        address{'\n'}
                        3. Funds will appear in your wallet once confirmed
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
    currencySelector: {
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
    currencyButtons: {
        flexDirection: 'row',
        backgroundColor: '#f0f0f0',
        borderRadius: 8,
        padding: 4,
    },
    currencyButton: {
        flex: 1,
        paddingVertical: 12,
        alignItems: 'center',
        borderRadius: 6,
    },
    currencyButtonSelected: {
        backgroundColor: '#007AFF',
    },
    currencyText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#666',
    },
    currencyTextSelected: {
        color: '#fff',
    },
    qrSection: {
        backgroundColor: '#fff',
        padding: 20,
        borderRadius: 12,
        alignItems: 'center',
        marginBottom: 20,
    },
    qrCode: {
        backgroundColor: '#f9f9f9',
        padding: 20,
        borderRadius: 12,
        marginBottom: 16,
    },
    qrLabel: {
        fontSize: 14,
        color: '#666',
        textAlign: 'center',
    },
    addressSection: {
        backgroundColor: '#fff',
        padding: 20,
        borderRadius: 12,
        marginBottom: 20,
    },
    addressContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f9f9f9',
        padding: 12,
        borderRadius: 8,
        marginTop: 8,
    },
    addressText: {
        flex: 1,
        fontSize: 14,
        color: '#333',
        fontFamily: 'monospace',
    },
    copyButton: {
        padding: 4,
        marginLeft: 8,
    },
    actionsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginBottom: 20,
    },
    actionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        paddingHorizontal: 20,
        paddingVertical: 12,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#007AFF',
    },
    actionText: {
        color: '#007AFF',
        fontSize: 14,
        fontWeight: '600',
        marginLeft: 8,
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
