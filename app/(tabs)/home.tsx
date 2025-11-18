import { AccountCompletionModal, type CompletionStep } from '@/components/modals/AccountCompletionModal';
import { ContactSearchModal, type ContactItem } from '@/components/modals/ContactSearchModal';
import { Amount } from '@/components/ui/amount';
import { AmountSize, AmountTone } from '@/components/ui/amount-variants';
import { AppButton } from '@/components/ui/buttons/button';
import { IconButton } from '@/components/ui/buttons/IconButton';
import Icon from '@/components/ui/icons/Icon';
import { IconName } from '@/components/ui/icons/icon-names';
import { ScreenContainer } from '@/components/ui/screen-container';
import { AppText } from '@/components/ui/text';
import { TextVariant } from '@/components/ui/text-variants';
import { Palette } from '@/constants/theme';
import { useSignup } from '@/hooks/SignupProvider';
import { useTheme, useThemeMode } from '@/hooks/theme';
import { useWallet, type WalletCurrency } from '@/hooks/WalletProvider';
import { MaterialIcons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import { Modal, Pressable, StyleSheet, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { TransactionList } from '@/components/transactions/TransactionList';
import { contactService } from '../../src/domain/contacts';
import { getMockTransactions } from '../../src/domain/transactions/mock';

type BalanceCardProps = {
    balances: { type: WalletCurrency; value: number }[];
    onAddFunds: () => void;
    onReceiveMoney: () => void;
    onCashOut: () => void;
};

function BalanceCard({
    balances,
    onAddFunds,
    onReceiveMoney,
    onCashOut,
}: BalanceCardProps) {
    const t = useTheme();
    const { isDark } = useThemeMode();
    const styles = useMemo(() => createBalanceCardStyles(t, isDark), [t, isDark]);

    const usdBalance = useMemo(
        () => balances.find(b => b.type === 'USDC')?.value ?? 0,
        [balances]
    );
    const eurBalance = useMemo(
        () => balances.find(b => b.type === 'EURC')?.value,
        [balances]
    );
    const euroEquivalent = useMemo(
        () =>
            typeof eurBalance === 'number'
                ? eurBalance
                : Number((usdBalance * 0.93).toFixed(2)),
        [eurBalance, usdBalance]
    );


    return (
        <View style={styles.wrapper}>
            <LinearGradient
                colors={['#23D3D5', '#9512F9']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.gradient}
            >
                <View style={styles.inner}>
                    <View style={styles.header}>
                        <AppText
                            variant={TextVariant.SecondaryMedium}
                            color="normal2"
                            style={styles.balanceLabel}
                        >
                            Balance
                        </AppText>
                        <Pressable style={styles.infoButton} hitSlop={8}>
                            <IconButton
                                iconName={IconName.Property1Help}
                                iconSize={14}
                                style={{ padding: 0 }}
                                bordered
                                shape='circle'
                            />
                        </Pressable>
                    </View>

                    <View style={styles.amountBlock}>
                        <Amount
                            value={usdBalance}
                            currency="USD"
                            size={AmountSize.Lg}
                            tone={AmountTone.Default}
                            showCents={false}
                        />
                        <View style={styles.equivalentRow}>
                            <Amount
                                value={euroEquivalent}
                                currency="EUR"
                                size={AmountSize.Md}
                                tone={AmountTone.Accent}
                                showCents={false}
                                textStyle={{ fontWeight: '600' }}
                            />
                            <Icon
                                name={IconName.Property1ArrowDown}
                                size={14}
                                color={Palette.primary.flowAqua}
                            />
                        </View>
                    </View>

                    <View style={styles.actionsRow}>
                        <IconButton
                            iconName={IconName.Property1Plus}
                            title="Add Funds"
                            textPosition="outside"
                            textVariant={TextVariant.Secondary}
                            iconSize={16}
                            bordered


                            onPress={onAddFunds}
                        />
                        <IconButton
                            iconName={IconName.Property1ArrowDown}
                            title="Receive Money"
                            textPosition="outside"
                            textVariant={TextVariant.Secondary}
                            iconSize={16}
                            onPress={onReceiveMoney}
                            bordered


                        />
                        <IconButton
                            iconName={IconName.Property1ArrowSend}
                            title="Cash Out"
                            textPosition="outside"
                            textVariant={TextVariant.Secondary}
                            iconSize={16}
                            bordered
                            onPress={onCashOut}


                        />
                    </View>
                </View>
            </LinearGradient>
        </View>
    );
}

export default function HomeScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const { setCurrency } = useWallet();
    const t = useTheme();
    const { isDark } = useThemeMode();
    const styles = useMemo(() => createStyles(t, isDark), [t, isDark]);
    const [searchVisible, setSearchVisible] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const { firstName, lastName } = useSignup();
    const params = useLocalSearchParams();
    const shouldPromptSetup = useMemo(() => !(firstName && lastName), [
        firstName,
        lastName,
    ]);
    const [setupModalVisible, setSetupModalVisible] = useState(false);
    const profileCompleted = useMemo(() => Boolean(firstName && lastName), [firstName, lastName]);
    const identityCompleted = useMemo(
        () => params?.identityCompleted === 'true',
        [params]
    );

    const completionSteps = useMemo<CompletionStep[]>(() => {
        const goToProfile = () => {
            setSetupModalVisible(false);
            router.push('/(auth)/legal-name' as any);
        };

        return [
            {
                id: 'create',
                title: 'Create your account',
                status: 'done',
            },
            {
                id: 'profile',
                title: 'Complete your profile',
                status: profileCompleted ? 'done' : 'current',
                onPress: profileCompleted ? undefined : goToProfile,
                actionLabel: profileCompleted ? undefined : 'Continue',
            },
            {
                id: 'verify',
                title: 'Verify your identity',
                status: identityCompleted ? 'done' : profileCompleted ? 'current' : 'pending',
                onPress: identityCompleted ? undefined : undefined,
                actionLabel: identityCompleted ? undefined : profileCompleted ? 'Continue' : undefined,
                actionDisabled: true, // No action yet for identity verification
            },
        ];
    }, [profileCompleted, identityCompleted, router]);

    const balances = useMemo<{ type: WalletCurrency; value: number }[]>(
        () => [
            { type: 'USDC', value: 120 },
            { type: 'EURC', value: 100 },
            { type: 'SOL', value: 0 },
        ],
        []
    );

    useEffect(() => {
        setCurrency('USDC');
    }, [setCurrency]);

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

    return (
        <ScreenContainer padded style={styles.container} gradient={isDark ? ['#29183D', '#000'] : undefined}>
            <View style={[styles.header, { paddingTop: insets.top }]}>
                <TouchableOpacity
                    onPress={handleUserDetails}
                    style={styles.profileButton}
                >
                    <MaterialIcons
                        name="account-circle"
                        size={42}
                        color={t.primary.signalViolet}
                    />
                </TouchableOpacity>
                <IconButton
                    iconName={IconName.Property1Search}
                    shape="circle"
                    iconSize={16}
                    onPress={() => setSearchVisible(true)}
                />
            </View>

            <BalanceCard
                balances={balances as any}
                onAddFunds={handleAddMoney}
                onReceiveMoney={handleReceiveMoney}
                onCashOut={handleCashOut}
            />

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
                        color='lessEmphasis'
                        textStyle={[
                            styles.loadingText,
                            { fontSize: 12, padding: 2 },
                        ]}
                        style={{ padding: 0 }}
                        onPress={() => router.push('/transaction-list' as any)}
                    />
                </View>
                <TransactionList
                    data={(transactions?.data ?? []).slice(0, 5)}
                    loading={transactionsLoading}
                />
            </View>

            {shouldPromptSetup ? (
                <View style={[styles.setupReminder, { bottom: insets.bottom + 90 }]}>
                    <AppButton
                        title="Complete your setup"
                        onPress={() => setSetupModalVisible(true)}
                    />
                </View>
            ) : null}

            <Modal
                transparent
                visible={setupModalVisible}
                animationType="slide"
                onRequestClose={() => setSetupModalVisible(false)}
            >
                <View style={[styles.bottomModalBackdrop, { paddingBottom: insets.bottom }]}>
                    <Pressable style={StyleSheet.absoluteFill} onPress={() => setSetupModalVisible(false)} />
                    <View style={[styles.bottomSheet, { backgroundColor: t.background.onBase }]}>
                        <View style={[styles.bottomSheetHandle, { backgroundColor: t.outline.outline2 }]} />
                        <AccountCompletionModal steps={completionSteps} />
                    </View>
                </View>
            </Modal>

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

const createStyles = (t: ReturnType<typeof useTheme>, isDark: boolean) =>
    StyleSheet.create({
        container: {
            flex: 1,
            position: 'relative',
            backgroundColor: t.background.base,
        },
        header: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            alignContent: 'center',
            padding: 20,
        },
        profileButton: {
            padding: 4,
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
            fontWeight: '600',
            color: t.text.normal,
        },
        loadingText: {
            textAlign: 'center',
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
        bottomModalBackdrop: {
            flex: 1,
            justifyContent: 'flex-end',
            backgroundColor: 'rgba(0,0,0,0.4)',
            padding: 12,
        },
        bottomSheet: {
            borderTopLeftRadius: 18,
            borderTopRightRadius: 18,
            padding: 16,
            gap: 12,
        },
        bottomSheetHandle: {
            alignSelf: 'center',
            width: 46,
            height: 4,
            borderRadius: 2,
            marginBottom: 6,
        },
    });

const createBalanceCardStyles = (t: ReturnType<typeof useTheme>, isDark: boolean) =>
    StyleSheet.create({
        wrapper: {
            marginHorizontal: 4,
            marginBottom: 20,
        },
        gradient: {
            borderRadius: 18,
            padding: 1,
        },
        inner: {
            borderRadius: 16,
            padding: 20,
            backgroundColor: isDark ? '#311A4E' : t.background.onBase,
            borderWidth: 1,
            borderColor: isDark ? 'rgba(255,255,255,0.08)' : t.outline.outline1,
        },
        header: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            alignContent: 'center',
        },
        balanceLabel: {
            letterSpacing: 1,
            textTransform: 'uppercase',

        },
        infoButton: {
            width: 26,
            height: 26,
            borderRadius: 13,
            alignItems: 'center',
            justifyContent: 'center',
            borderWidth: 1,
            borderColor: isDark ? 'rgba(255,255,255,0.16)' : t.outline.outline1,
            backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : t.background.onBase2,
        },
        amountBlock: {
            marginTop: 10,
            gap: 6,
        },
        equivalentRow: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: 6,
        },
        actionsRow: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            gap: 12,
            marginTop: 18,
        },
        actionButton: {
            flex: 1,
            paddingHorizontal: 14,
            minHeight: 52,
            borderWidth: 1,
            borderColor: isDark ? t.outline.outline1 : t.outline.outline2,
        },
    });
