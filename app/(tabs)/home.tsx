import { BalanceCarousel } from '@/components/ui/balance-carousel';
import { AppButton } from '@/components/ui/buttons/button';
import { IconButton } from '@/components/ui/buttons/IconButton';
import { IconName } from '@/components/ui/icons/icon-names';
import { ScreenContainer } from '@/components/ui/screen-container';
import { AppText } from '@/components/ui/text';
import { useWallet, type WalletCurrency } from '@/hooks/WalletProvider';
import { useSignup } from '@/hooks/SignupProvider';
import { MaterialIcons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import React, { useCallback, useMemo, useState } from 'react';
import { Modal, Pressable, StyleSheet, TouchableOpacity, View } from 'react-native';

import {
    useSafeAreaInsets
} from 'react-native-safe-area-context';
// Use mock transactions instead of API
import { ContactSearchModal, type ContactItem } from '@/components/modals/ContactSearchModal';
import { TransactionList } from '@/components/transactions/TransactionList';
import { contactService } from '../../src/domain/contacts';
import { getMockTransactions } from '../../src/domain/transactions/mock';

export default function HomeScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const { setCurrency } = useWallet();
    const [searchVisible, setSearchVisible] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const { firstName, lastName } = useSignup();
    const shouldPromptSetup = useMemo(() => !(firstName && lastName), [
        firstName,
        lastName,
    ]);
  


    const balances = useMemo<{ type: WalletCurrency; value: number }[]>(
        () => [
            { type: 'EURC', value: 0 },
            { type: 'USDC', value: 0 },
            { type: 'SOL', value: 0 },
        ],
        []
    );

    const { data: transactions, isLoading: transactionsLoading } = useQuery({
        queryKey: ['transactions', 'mock', { limit: 5 }],
        queryFn: () => getMockTransactions({ limit: 5 }),
    });

    const { data: contacts = [] } = useQuery({
        queryKey: ['contacts'],
        queryFn: () => contactService.getContacts(),
    });

    const items: ContactItem[] = useMemo(() => {
        const list = contacts.map(c => ({
            id: c.id,
            name: c.name,
            phone: c.phone || c.email || c.blockchainAddress || '',
        }));
        if (!searchQuery.trim()) return list;
        const q = searchQuery.toLowerCase();
        return list.filter(
            i => i.name.toLowerCase().includes(q) || i.phone.toLowerCase().includes(q)
        );
    }, [contacts, searchQuery]);

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
                    onPress={() => setSearchVisible(true)}
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
                    bordered
                    textStyle={{}}
                />
                <IconButton
                    iconName={IconName.Property1ArrowReceive}
                    title="Receive Money"
                    textPosition="outside"
                    iconSize={16}
                    onPress={handleReceiveMoney}
                    bordered
                />
                <IconButton
                    iconName={IconName.Property1ArrowSend}
                    title="Cash Out"
                    textPosition="outside"
                    iconSize={16}
                    bordered
                    onPress={handleCashOut}
                />
            </View>

            <View style={[styles.transactionsSection, { flex: 1 }]}>
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
                        onPress={() => router.push('/transactions' as any)}
                    />
                </View>
                <TransactionList
                    data={(transactions?.data ?? []).slice(0, 5)}
                    loading={transactionsLoading}
                />
            </View>

            {true ? (
                <View style={[styles.setupReminder, { bottom: insets.bottom + 90 }]}>
                    <AppButton
                        title="Complete your setup"
                        onPress={() => router.push('/(auth)/legal-name' as any)}
                    />
                </View>
            ) : null}

            <Modal
                transparent
                visible={searchVisible}
                animationType="fade"
                onRequestClose={() => setSearchVisible(false)}
            >
                <View style={styles.modalBackdrop}>
                    <Pressable style={StyleSheet.absoluteFill} onPress={() => setSearchVisible(false)} />
                    <View style={styles.modalCenter}>
                        <ContactSearchModal
                            title="Search for contact to send"
                            query={searchQuery}
                            onChangeQuery={setSearchQuery}
                            onCancel={() => setSearchVisible(false)}
                            contacts={items}
                            onSelect={(id) => {
                                setSearchVisible(false);
                                router.push({ pathname: '/(modals)/send-amount', params: { contactId: id } } as never);
                            }}
                        />
                    </View>
                </View>
            </Modal>
        </ScreenContainer>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        position: 'relative',
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
        fontWeight: 500,
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
    modalBackdrop: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.4)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 16,
    },
    modalCenter: {
        width: '92%',
        maxWidth: 460,
    },
    setupReminder: {
        position: 'absolute',
        left: 16,
        right: 16,
        zIndex: 5,
    },
});
