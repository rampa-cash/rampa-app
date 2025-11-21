import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Modal, Pressable, StyleSheet, Switch, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { IconButton } from '@/components/ui/buttons/IconButton';
import { AppButton } from '@/components/ui/buttons/button';
import { ButtonVariant } from '@/components/ui/buttons/button-variants';
import Icon from '@/components/ui/icons/Icon';
import { IconName } from '@/components/ui/icons/icon-names';
import { ListCard } from '@/components/ui/list-card';
import { ScreenContainer } from '@/components/ui/screen-container';
import { AppText } from '@/components/ui/text';
import { TextVariant } from '@/components/ui/text-variants';
import { VirtualCard } from '@/components/ui/virtual-card';
import { Palette } from '@/constants/theme';
import { useTheme, useThemeMode } from '@/hooks/theme';

export default function CardScreen() {
    const insets = useSafeAreaInsets();
    const t = useTheme();
    const { isDark } = useThemeMode();
    const router = useRouter();
    const [locked, setLocked] = useState(false);
    const [showLockModal, setShowLockModal] = useState(false);
    const [showDetails, setShowDetails] = useState(false);

    const iconBackground = isDark ? t.background.dim : t.background.onBase;

    const handleLockChange = (next: boolean) => {
        if (next) {
            setShowLockModal(true);
            return;
        }
        setLocked(false);
    };

    return (
        <ScreenContainer
            padded
            scroll
            contentContainerStyle={[
                styles.content,
                { paddingBottom: insets.bottom + 24, paddingTop: insets.top },
            ]}
        >
            <View style={styles.header}>
                <View
                    style={[
                        styles.avatar,
                        {
                            backgroundColor: iconBackground,
                            borderColor: isDark
                                ? t.outline.outline2
                                : t.outline.outline1,
                        },
                    ]}
                >
                    <MaterialIcons
                        name="account-circle"
                        size={28}
                        color={t.primary.flowAqua}
                    />
                </View>
            </View>
            <View style={styles.container}>
                <VirtualCard
                    variant={showDetails ? 'number' : 'balance'}
                    title={showDetails ? '' : 'Virtual Card'}
                    balanceLabel="BALANCE"
                    balance="$345.67"
                    footer="DEBIT CARD"
                    name="Maria Martinez"
                    numberMasked="1234    5678    9012    3456"
                    expiry="12/25"
                    cvv="123"
                    gradient={Palette.gradients.primary}
                    style={styles.card}
                />
            </View>

            <View style={styles.actions}>
                <IconButton
                    iconName={IconName.Property1Plus}
                    title="Add Fund"
                    textPosition="outside"
                    iconSize={16}
                    onPress={() => router.push('/(modals)/fund-card' as never)}
                />
                <IconButton
                    iconName={IconName.Property1ArrowUp}
                    title="Withdraw"
                    textPosition="outside"
                    iconSize={16}
                    onPress={() =>
                        router.push(
                            '/(modals)/fund-card?mode=withdraw' as never
                        )
                    }
                />
                <IconButton
                    iconName={IconName.Property1EyeOpen}
                    title="Show Details"
                    textPosition="outside"
                    iconSize={16}
                    backgroundColor={
                        showDetails ? Palette.primary.flowAqua : undefined
                    }
                    color={showDetails ? 'onPrimaryBackground' : undefined}
                    iconColor={showDetails ? '#ffffff' : undefined}
                    onPress={() => setShowDetails(prev => !prev)}
                />
            </View>

            <View style={styles.section}>
                <ListCard
                    title="View card transactions"
                    left={
                        <Icon
                            name={IconName.Property1History}
                            size={18}
                            bgColor={iconBackground}
                            containerStyle={styles.iconBackground}
                            color={isDark ? t.icon.variant : undefined}
                        />
                    }
                    onPress={() =>
                        router.push('/(transactions)/transaction-list' as never)
                    }
                />

                <ListCard
                    title="Lock card"
                    left={
                        <Icon
                            name={IconName.Property1Padlock}
                            size={18}
                            bgColor={iconBackground}
                            containerStyle={styles.iconBackground}
                            color={isDark ? t.icon.variant : undefined}
                        />
                    }
                    right={
                        <Switch
                            value={locked}
                            onValueChange={handleLockChange}
                            trackColor={{
                                false: t.outline.outline2,
                                true: Palette.primary.signalViolet,
                            }}
                            thumbColor={t.neutral.white}
                        />
                    }
                    showChevron={false}
                    onPress={() => handleLockChange(!locked)}
                />

                <ListCard
                    title="View billing address"
                    left={
                        <Icon
                            name={IconName.Property1Location}
                            size={18}
                            bgColor={iconBackground}
                            containerStyle={styles.iconBackground}
                            color={isDark ? t.icon.variant : undefined}
                        />
                    }
                    onPress={() => {}}
                />
            </View>

            <Modal
                transparent
                animationType="fade"
                visible={showLockModal}
                onRequestClose={() => setShowLockModal(false)}
            >
                <Pressable
                    style={styles.modalBackdrop}
                    onPress={() => setShowLockModal(false)}
                >
                    <Pressable
                        style={[
                            styles.modalCard,
                            {
                                backgroundColor: t.background.onBase,
                                borderColor: t.outline.outline1,
                            },
                        ]}
                        onPress={e => e.stopPropagation()}
                    >
                        <View
                            style={[
                                styles.modalPill,
                                {
                                    backgroundColor: t.background.onBase2,
                                    borderColor: t.outline.outline1,
                                },
                            ]}
                        >
                            <Icon
                                name={IconName.Property1Padlock}
                                size={20}
                                color={t.text.normal}
                            />
                        </View>

                        <View style={styles.modalBody}>
                            <View
                                style={[
                                    styles.modalIconInner,
                                    {
                                        backgroundColor: isDark
                                            ? t.background.onBase2
                                            : t.background.secondary,
                                    },
                                ]}
                            >
                                <Icon
                                    name={IconName.Property1Padlock}
                                    size={20}
                                    color={t.text.normal}
                                />
                            </View>
                            <View style={{ gap: 10 }}>
                                <AppText
                                    variant={TextVariant.BodyMedium}
                                    style={{
                                        textAlign: 'center',
                                        fontSize: 18,
                                        fontWeight: '700',
                                    }}
                                >
                                    What occurs when I lock my card?
                                </AppText>
                                <AppText
                                    variant={TextVariant.Secondary}
                                    style={{
                                        textAlign: 'center',
                                        color: t.text.lessEmphasis,
                                    }}
                                >
                                    You can temporarily block withdrawals, card
                                    payments, and online purchases. This feature
                                    lets you control your card and safeguard
                                    against unauthorized transactions. Unlock it
                                    whenever you need.
                                </AppText>
                            </View>
                            <AppButton
                                title="Lock my card"
                                onPress={() => {
                                    setLocked(true);
                                    setShowLockModal(false);
                                }}
                                style={{ width: '100%' }}
                            />
                            <AppButton
                                title="Cancel card lock"
                                variant={ButtonVariant.Tertiary}
                                onPress={() => {
                                    setShowLockModal(false);
                                    setLocked(false);
                                }}
                                style={{ width: '100%', marginTop: -6 }}
                                textStyle={{ color: t.text.normal }}
                            />
                        </View>
                    </Pressable>
                </Pressable>
            </Modal>
        </ScreenContainer>
    );
}

const styles = StyleSheet.create({
    content: {
        gap: 20,
    },
    container: {
        alignItems: 'center',
    },
    header: {
        alignItems: 'flex-start',
    },
    avatar: {
        width: 42,
        height: 42,
        borderRadius: 21,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
    },
    card: {
        marginTop: 8,
    },
    actions: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        paddingHorizontal: 4,
    },
    section: {
        gap: 12,
        marginTop: 4,
    },
    iconBackground: {
        padding: 12,
        borderRadius: 20,
    },
    modalBackdrop: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.45)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 16,
    },
    modalCard: {
        width: '90%',
        maxWidth: 480,
        borderRadius: 22,
        paddingTop: 28,
        borderWidth: 1,
        alignItems: 'center',
    },
    modalBody: {
        width: '100%',
        borderRadius: 18,
        paddingTop: 20,
        paddingHorizontal: 22,
        paddingBottom: 18,
        gap: 14,
        alignItems: 'center',
    },
    modalIconInner: {
        width: 52,
        height: 52,
        borderRadius: 26,
        alignItems: 'center',
        justifyContent: 'center',
    },
    modalPill: {
        marginTop: -44,
        width: 60,
        height: 60,
        borderRadius: 30,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
    },
});
