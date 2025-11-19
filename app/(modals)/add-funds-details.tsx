import { AddFundsMethodModal } from '@/components/modals/AddFundsMethodModal';
import { AppButton } from '@/components/ui/buttons/button';
import { ButtonVariant } from '@/components/ui/buttons/button-variants';
import { IconButton } from '@/components/ui/buttons/IconButton';
import Icon from '@/components/ui/icons/Icon';
import { IconName } from '@/components/ui/icons/icon-names';
import { AmountInput } from '@/components/ui/amount-input';
import ListCard from '@/components/ui/list-card';
import { ScreenContainer } from '@/components/ui/screen-container';
import { AppText } from '@/components/ui/text';
import { TextVariant } from '@/components/ui/text-variants';
import {
    ADD_FUNDS_METHODS,
    AddFundsMethod,
    AddFundsMethodId,
    getAddFundsMethod,
} from '@/constants/add-funds';
import { useTheme } from '@/hooks/theme';
import { useWallet } from '@/hooks/WalletProvider';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback, useMemo, useState } from 'react';
import { Modal, Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const QUICK_AMOUNTS = [50, 100, 500];

export default function AddFundsDetailsScreen() {
    const router = useRouter();
    const params = useLocalSearchParams<{ methodId?: string }>();
    const insets = useSafeAreaInsets();
    const t = useTheme();
    const { currency, meta } = useWallet();

    const initialMethod = useMemo(
        () => getAddFundsMethod(params?.methodId as string | undefined),
        [params?.methodId]
    );
    const [selectedMethod, setSelectedMethod] =
        useState<AddFundsMethod>(initialMethod);
    const [methodModalVisible, setMethodModalVisible] = useState(false);
    const [amount, setAmount] = useState('');

    const currencySymbol = meta.symbol;

    const handleSelectFromModal = useCallback((methodId: AddFundsMethodId) => {
        const method = getAddFundsMethod(methodId);
        setSelectedMethod(method);
        setMethodModalVisible(false);
    }, []);

    const methodsForModal = useMemo(
        () =>
            ADD_FUNDS_METHODS.map(method => ({
                ...method,
                highlighted: method.id === selectedMethod.id,
                onPress: () => handleSelectFromModal(method.id),
            })),
        [handleSelectFromModal, selectedMethod.id]
    );

    const parsedAmount = Number.parseFloat(amount.replace(',', '.'));
    const isAmountValid = Number.isFinite(parsedAmount) && parsedAmount > 0;

    return (
        <>
            <ScreenContainer
                padded
                scroll
                style={styles.container}
                contentContainerStyle={[
                    styles.content,
                    { paddingBottom: insets.bottom + 24 },
                ]}
            >
                <View style={[styles.nav, { paddingTop: insets.top }]}>
                    <IconButton
                        iconName={IconName.Property1ArrowLeft}
                        shape="circle"
                        iconSize={14}
                        bordered
                        onPress={() => router.back()}
                    />
                </View>
                <View style={styles.section}>
                    <AppText
                        variant={TextVariant.SecondaryMedium}
                        color="normal"
                        style={styles.sectionLabel}
                    >
                        Select a method
                    </AppText>

                    <ListCard
                        style={[
                            styles.methodCard,
                            {
                                borderColor: t.outline.outline1,
                            },
                        ]}
                        title='Method'

                        description={selectedMethod.title}
                        left={<Icon name={selectedMethod.icon}
                            size={18}
                            bgColor={
                                t.isDark
                                    ? t.background.dim
                                    : t.background.base
                            }
                            style={{
                                padding: 14,
                                borderRadius: 28,
                            }}
                            color={
                                t.isDark ? t.icon.variant : t.icon.normal
                            } />}
                        right={<AppButton
                            title="Change"
                            color={'normal2'}
                            variant={ButtonVariant.Tertiary}
                            onPress={() => setMethodModalVisible(true)}
                        />}
                    />

                </View>

                <View style={styles.section}>
                    <AmountInput
                        label="Amount to add"
                        value={amount}
                        onChange={setAmount}
                        currencySymbol={currencySymbol}
                        quickOptions={QUICK_AMOUNTS}
                    />
                </View>

                <View style={styles.flexSpacer} />

                <AppButton
                    title="Add Fund"
                    disabled={!isAmountValid}
                    onPress={() => { }}
                />
            </ScreenContainer>

            <Modal
                visible={methodModalVisible}
                transparent
                animationType="fade"
                onRequestClose={() => setMethodModalVisible(false)}
            >
                <View style={styles.modalBackdrop}>
                    <Pressable
                        style={StyleSheet.absoluteFill}
                        onPress={() => setMethodModalVisible(false)}
                    />
                    <View style={styles.modalSheet}>
                        <AddFundsMethodModal
                            methods={methodsForModal}
                            onDone={() => setMethodModalVisible(false)}
                        />
                    </View>
                </View>
            </Modal>
        </>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    content: {
        flexGrow: 1,
        gap: 24,
    },
    nav: {
        alignItems: 'flex-start',
    },
    section: {
        gap: 12,
    },
    sectionLabel: {
        textTransform: 'uppercase',
        letterSpacing: 0.4,
    },
    methodCard: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        borderRadius: 16,
        borderWidth: 1,
    },
    flexSpacer: {
        flex: 1,
    },
    modalBackdrop: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.4)',
        justifyContent: 'flex-end',
        padding: 16,
    },
    modalSheet: {
        borderRadius: 24,
        overflow: 'hidden',

    },
});
