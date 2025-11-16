import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { StyleSheet, Switch, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { IconButton } from '@/components/ui/buttons/IconButton';
import Icon from '@/components/ui/icons/Icon';
import { IconName } from '@/components/ui/icons/icon-names';
import { ListCard } from '@/components/ui/list-card';
import { ScreenContainer } from '@/components/ui/screen-container';
import { VirtualCard } from '@/components/ui/virtual-card';
import { Palette } from '@/constants/theme';
import { useTheme, useThemeMode } from '@/hooks/theme';

export default function CardScreen() {
    const insets = useSafeAreaInsets();
    const t = useTheme();
    const { isDark } = useThemeMode();
    const router = useRouter();
    const [locked, setLocked] = useState(false);

    const iconBackground = isDark ? t.background.dim : t.background.onBase;

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

            <VirtualCard
                title="Virtual Card"
                balanceLabel="BALANCE"
                balance="$345.67"
                footer="DEBIT CARD"
                gradient={Palette.gradients.primary}
                style={styles.card}
            />

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
                />
                <IconButton
                    iconName={IconName.Property1EyeOpen}
                    title="Show Details"
                    textPosition="outside"
                    iconSize={16}
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
                    onPress={() => { }}
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
                            onValueChange={setLocked}
                            trackColor={{
                                false: t.outline.outline2,
                                true: Palette.primary.signalViolet,
                            }}
                            thumbColor={t.neutral.white}
                        />
                    }
                    showChevron={false}
                    onPress={() => { }}
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
                    onPress={() => { }}
                />
            </View>
        </ScreenContainer>
    );
}

const styles = StyleSheet.create({
    content: {
        gap: 20,
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
});
