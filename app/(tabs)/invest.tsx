import { MaterialIcons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import React, { useState } from 'react';
import {
    Alert,
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { investmentService } from '../../src/services/InvestmentService';
import { InvestmentOption } from '../../src/types/Investment';

export default function InvestScreen() {
    const [selectedFilter, setSelectedFilter] = useState<
        'all' | 'low' | 'medium' | 'high'
    >('all');
    const [showInvestmentModal, setShowInvestmentModal] = useState(false);
    const [selectedOption, setSelectedOption] =
        useState<InvestmentOption | null>(null);
    const [investmentAmount, setInvestmentAmount] = useState('');

    // Fetch investment options
    const { data: investmentOptions, isLoading: optionsLoading } = useQuery({
        queryKey: ['investment-options', selectedFilter],
        queryFn: () =>
            investmentService.getInvestmentOptions({
                riskLevel:
                    selectedFilter === 'all' ? undefined : selectedFilter,
                limit: 20,
            }),
    });

    // Fetch user investments
    const { data: userInvestments, isLoading: investmentsLoading } = useQuery({
        queryKey: ['user-investments'],
        queryFn: () => investmentService.getUserInvestments(),
    });

    // Fetch investment stats
    const { data: investmentStats } = useQuery({
        queryKey: ['investment-stats'],
        queryFn: () => investmentService.getInvestmentStats(),
    });

    const handleInvest = async () => {
        if (!selectedOption || !investmentAmount) {
            Alert.alert(
                'Error',
                'Please select an investment option and enter an amount'
            );
            return;
        }

        const amount = parseFloat(investmentAmount);
        if (isNaN(amount) || amount <= 0) {
            Alert.alert('Error', 'Please enter a valid amount');
            return;
        }

        if (amount < selectedOption.minimumAmount) {
            Alert.alert(
                'Error',
                `Minimum investment amount is $${selectedOption.minimumAmount}`
            );
            return;
        }

        try {
            const result = await investmentService.createInvestment({
                investmentOptionId: selectedOption.id,
                amount,
                currency: 'USD',
            });

            if (result.success) {
                Alert.alert('Success', 'Investment created successfully!');
                setShowInvestmentModal(false);
                setSelectedOption(null);
                setInvestmentAmount('');
            } else {
                Alert.alert(
                    'Error',
                    result.error || 'Failed to create investment'
                );
            }
        } catch (error) {
            Alert.alert('Error', 'Failed to create investment');
        }
    };

    const getRiskColor = (riskLevel: string) => {
        switch (riskLevel) {
            case 'low':
                return '#4CAF50';
            case 'medium':
                return '#FF9800';
            case 'high':
                return '#F44336';
            default:
                return '#666';
        }
    };

    const getTypeIcon = (type: string) => {
        switch (type) {
            case 'stocks':
                return 'trending-up';
            case 'bonds':
                return 'account-balance';
            case 'etf':
                return 'pie-chart';
            case 'crypto':
                return 'currency-bitcoin';
            case 'real_estate':
                return 'home';
            case 'commodities':
                return 'inventory';
            default:
                return 'trending-up';
        }
    };

    if (optionsLoading || investmentsLoading) {
        return (
            <View style={styles.container}>
                <Text style={styles.loadingText}>
                    Loading investment options...
                </Text>
            </View>
        );
    }

    return (
        <ScrollView style={styles.container}>
            <Text style={styles.title}>Invest & Grow</Text>
            <Text style={styles.subtitle}>
                Build your wealth with smart investment options
            </Text>

            {/* Investment Stats */}
            {investmentStats?.success && investmentStats.stats && (
                <View style={styles.statsCard}>
                    <Text style={styles.statsTitle}>Portfolio Overview</Text>
                    <View style={styles.statsGrid}>
                        <View style={styles.statItem}>
                            <Text style={styles.statValue}>
                                $
                                {investmentStats.stats.totalValue.toLocaleString()}
                            </Text>
                            <Text style={styles.statLabel}>Total Value</Text>
                        </View>
                        <View style={styles.statItem}>
                            <Text
                                style={[
                                    styles.statValue,
                                    {
                                        color:
                                            investmentStats.stats.totalReturn >=
                                            0
                                                ? '#4CAF50'
                                                : '#F44336',
                                    },
                                ]}
                            >
                                {investmentStats.stats.totalReturnPercentage.toFixed(
                                    2
                                )}
                                %
                            </Text>
                            <Text style={styles.statLabel}>Total Return</Text>
                        </View>
                        <View style={styles.statItem}>
                            <Text style={styles.statValue}>
                                {investmentStats.stats.activeInvestments}
                            </Text>
                            <Text style={styles.statLabel}>Active</Text>
                        </View>
                    </View>
                </View>
            )}

            {/* Risk Filter */}
            <View style={styles.filterSection}>
                <Text style={styles.sectionTitle}>Risk Level</Text>
                <View style={styles.filterButtons}>
                    {(['all', 'low', 'medium', 'high'] as const).map(risk => (
                        <TouchableOpacity
                            key={risk}
                            style={[
                                styles.filterButton,
                                selectedFilter === risk &&
                                    styles.filterButtonActive,
                            ]}
                            onPress={() => setSelectedFilter(risk)}
                        >
                            <Text
                                style={[
                                    styles.filterButtonText,
                                    selectedFilter === risk &&
                                        styles.filterButtonTextActive,
                                ]}
                            >
                                {risk.charAt(0).toUpperCase() + risk.slice(1)}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </View>

            {/* Investment Options */}
            <View style={styles.optionsSection}>
                <Text style={styles.sectionTitle}>Investment Options</Text>
                {investmentOptions?.length ? (
                    investmentOptions.map(option => (
                        <TouchableOpacity
                            key={option.id}
                            style={styles.optionCard}
                            onPress={() => {
                                setSelectedOption(option);
                                setShowInvestmentModal(true);
                            }}
                        >
                            <View style={styles.optionHeader}>
                                <View style={styles.optionTitleRow}>
                                    <MaterialIcons
                                        name={getTypeIcon(option.type) as any}
                                        size={24}
                                        color="#007AFF"
                                    />
                                    <Text style={styles.optionName}>
                                        {option.name}
                                    </Text>
                                </View>
                                <View
                                    style={[
                                        styles.riskBadge,
                                        {
                                            backgroundColor: getRiskColor(
                                                option.riskLevel
                                            ),
                                        },
                                    ]}
                                >
                                    <Text style={styles.riskText}>
                                        {option.riskLevel.toUpperCase()}
                                    </Text>
                                </View>
                            </View>
                            <Text style={styles.optionDescription}>
                                {option.description}
                            </Text>
                            <View style={styles.optionDetails}>
                                <View style={styles.optionDetail}>
                                    <MaterialIcons
                                        name="trending-up"
                                        size={16}
                                        color="#4CAF50"
                                    />
                                    <Text style={styles.optionDetailText}>
                                        {option.expectedReturn}% expected return
                                    </Text>
                                </View>
                                <View style={styles.optionDetail}>
                                    <MaterialIcons
                                        name="attach-money"
                                        size={16}
                                        color="#666"
                                    />
                                    <Text style={styles.optionDetailText}>
                                        Min: ${option.minimumAmount}
                                    </Text>
                                </View>
                                <View style={styles.optionDetail}>
                                    <MaterialIcons
                                        name="schedule"
                                        size={16}
                                        color="#666"
                                    />
                                    <Text style={styles.optionDetailText}>
                                        {option.liquidity} liquidity
                                    </Text>
                                </View>
                            </View>
                        </TouchableOpacity>
                    ))
                ) : (
                    <Text style={styles.emptyText}>
                        No investment options available
                    </Text>
                )}
            </View>

            {/* User Investments */}
            {userInvestments && userInvestments.length > 0 && (
                <View style={styles.investmentsSection}>
                    <Text style={styles.sectionTitle}>Your Investments</Text>
                    {userInvestments.map(investment => (
                        <View key={investment.id} style={styles.investmentCard}>
                            <View style={styles.investmentHeader}>
                                <Text style={styles.investmentName}>
                                    {investment.investmentOption.name}
                                </Text>
                                <Text
                                    style={[
                                        styles.investmentReturn,
                                        {
                                            color:
                                                investment.totalReturn >= 0
                                                    ? '#4CAF50'
                                                    : '#F44336',
                                        },
                                    ]}
                                >
                                    {investment.totalReturnPercentage.toFixed(
                                        2
                                    )}
                                    %
                                </Text>
                            </View>
                            <View style={styles.investmentDetails}>
                                <Text style={styles.investmentAmount}>
                                    Invested: $
                                    {investment.amount.toLocaleString()}
                                </Text>
                                <Text style={styles.investmentValue}>
                                    Current: $
                                    {investment.currentValue.toLocaleString()}
                                </Text>
                            </View>
                        </View>
                    ))}
                </View>
            )}

            {/* Investment Modal */}
            <Modal
                visible={showInvestmentModal}
                animationType="slide"
                presentationStyle="pageSheet"
            >
                <View style={styles.modalContainer}>
                    <View style={styles.modalHeader}>
                        <TouchableOpacity
                            onPress={() => setShowInvestmentModal(false)}
                            style={styles.closeButton}
                        >
                            <MaterialIcons
                                name="close"
                                size={24}
                                color="#333"
                            />
                        </TouchableOpacity>
                        <Text style={styles.modalTitle}>Invest</Text>
                        <View style={styles.placeholder} />
                    </View>

                    {selectedOption && (
                        <View style={styles.modalContent}>
                            <View style={styles.selectedOptionCard}>
                                <Text style={styles.selectedOptionName}>
                                    {selectedOption.name}
                                </Text>
                                <Text style={styles.selectedOptionDescription}>
                                    {selectedOption.description}
                                </Text>
                                <View style={styles.selectedOptionDetails}>
                                    <Text style={styles.selectedOptionDetail}>
                                        Expected Return:{' '}
                                        {selectedOption.expectedReturn}%
                                    </Text>
                                    <Text style={styles.selectedOptionDetail}>
                                        Risk Level:{' '}
                                        {selectedOption.riskLevel.toUpperCase()}
                                    </Text>
                                    <Text style={styles.selectedOptionDetail}>
                                        Minimum: ${selectedOption.minimumAmount}
                                    </Text>
                                </View>
                            </View>

                            <View style={styles.amountSection}>
                                <Text style={styles.amountLabel}>
                                    Investment Amount (USD)
                                </Text>
                                <TextInput
                                    style={styles.amountInput}
                                    placeholder="Enter amount"
                                    value={investmentAmount}
                                    onChangeText={setInvestmentAmount}
                                    keyboardType="numeric"
                                    placeholderTextColor="#999"
                                />
                            </View>

                            <TouchableOpacity
                                style={styles.investButton}
                                onPress={handleInvest}
                            >
                                <Text style={styles.investButtonText}>
                                    Invest Now
                                </Text>
                            </TouchableOpacity>
                        </View>
                    )}
                </View>
            </Modal>
        </ScrollView>
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
        marginBottom: 8,
        color: '#333',
    },
    subtitle: {
        fontSize: 16,
        color: '#666',
        marginBottom: 24,
    },
    loadingText: {
        textAlign: 'center',
        fontSize: 16,
        color: '#666',
        marginTop: 50,
    },
    statsCard: {
        backgroundColor: '#fff',
        padding: 20,
        borderRadius: 12,
        marginBottom: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    statsTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 16,
        color: '#333',
    },
    statsGrid: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    statItem: {
        alignItems: 'center',
    },
    statValue: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#007AFF',
    },
    statLabel: {
        fontSize: 12,
        color: '#666',
        marginTop: 4,
    },
    filterSection: {
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 16,
        color: '#333',
    },
    filterButtons: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    filterButton: {
        flex: 1,
        paddingVertical: 12,
        paddingHorizontal: 16,
        marginHorizontal: 4,
        borderRadius: 8,
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#e0e0e0',
        alignItems: 'center',
    },
    filterButtonActive: {
        backgroundColor: '#007AFF',
        borderColor: '#007AFF',
    },
    filterButtonText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#666',
    },
    filterButtonTextActive: {
        color: '#fff',
    },
    optionsSection: {
        marginBottom: 24,
    },
    optionCard: {
        backgroundColor: '#fff',
        padding: 16,
        borderRadius: 12,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    optionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    optionTitleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    optionName: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
        marginLeft: 8,
    },
    riskBadge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
    },
    riskText: {
        fontSize: 12,
        fontWeight: '600',
        color: '#fff',
    },
    optionDescription: {
        fontSize: 14,
        color: '#666',
        marginBottom: 12,
    },
    optionDetails: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    optionDetail: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    optionDetailText: {
        fontSize: 12,
        color: '#666',
        marginLeft: 4,
    },
    emptyText: {
        textAlign: 'center',
        color: '#666',
        padding: 20,
    },
    investmentsSection: {
        marginBottom: 24,
    },
    investmentCard: {
        backgroundColor: '#fff',
        padding: 16,
        borderRadius: 12,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    investmentHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    investmentName: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
    },
    investmentReturn: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    investmentDetails: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    investmentAmount: {
        fontSize: 14,
        color: '#666',
    },
    investmentValue: {
        fontSize: 14,
        color: '#333',
        fontWeight: '600',
    },
    modalContainer: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    modalHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 16,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#e0e0e0',
    },
    closeButton: {
        padding: 8,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
    },
    placeholder: {
        width: 40,
    },
    modalContent: {
        flex: 1,
        padding: 20,
    },
    selectedOptionCard: {
        backgroundColor: '#fff',
        padding: 20,
        borderRadius: 12,
        marginBottom: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    selectedOptionName: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 8,
    },
    selectedOptionDescription: {
        fontSize: 16,
        color: '#666',
        marginBottom: 16,
    },
    selectedOptionDetails: {
        gap: 8,
    },
    selectedOptionDetail: {
        fontSize: 14,
        color: '#333',
    },
    amountSection: {
        marginBottom: 24,
    },
    amountLabel: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
        marginBottom: 12,
    },
    amountInput: {
        borderWidth: 1,
        borderColor: '#e0e0e0',
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 16,
        fontSize: 16,
        backgroundColor: '#fff',
    },
    investButton: {
        backgroundColor: '#007AFF',
        borderRadius: 12,
        paddingVertical: 16,
        alignItems: 'center',
    },
    investButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
});
