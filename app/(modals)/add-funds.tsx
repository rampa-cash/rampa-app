import { IconButton } from '@/components/ui/buttons/IconButton';
import Icon from '@/components/ui/icons/Icon';
import { IconName } from '@/components/ui/icons/icon-names';
import { ListCard } from '@/components/ui/list-card';
import { ScreenContainer } from '@/components/ui/screen-container';
import { AppText } from '@/components/ui/text';
import { TextVariant } from '@/components/ui/text-variants';
import { ADD_FUNDS_METHODS, AddFundsMethodId } from '@/constants/add-funds';
import { useTheme, useThemeMode } from '@/hooks/theme';
import { useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function AddFundsScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const t = useTheme();
    const { isDark } = useThemeMode();
    const initialMethod = useMemo(() => ADD_FUNDS_METHODS[0]?.id ?? 'bank', []);
    const [selectedMethod, setSelectedMethod] = useState<string>(initialMethod);

    const handleSelectMethod = (methodId: AddFundsMethodId) => {
        setSelectedMethod(methodId);
        router.push({
            pathname: '/(modals)/add-funds-details',
            params: { methodId },
        } as never);
    };

    return (
        <ScreenContainer
            padded
            scroll
            style={styles.container}
            contentContainerStyle={[
                styles.scrollContent,
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

            <View style={styles.hero}>
                <AppText variant={TextVariant.H1}>Add funds</AppText>
                <AppText variant={TextVariant.BodyMedium} color="normal2">
                    Top up your wallet instantly using card, bank, or
                    stablecoins.
                </AppText>
            </View>

            <View style={styles.section}>
                <AppText
                    variant={TextVariant.SecondaryMedium}
                    color="lessEmphasis"
                    style={styles.sectionLabel}
                >
                    Select a method
                </AppText>

                <View style={styles.methods}>
                    {ADD_FUNDS_METHODS.map(method => {
                        return (
                            <ListCard
                                key={method.id}
                                title={method.title}
                                description={method.subtitle}
                                onPress={() => handleSelectMethod(method.id)}
                                showChevron={false}
                                left={
                                    <Icon
                                        name={method.icon}
                                        size={18}
                                        bgColor={
                                            isDark
                                                ? t.background.dim
                                                : t.background.base
                                        }
                                        containerStyle={styles.iconInner}
                                        color={
                                            isDark
                                                ? t.icon.variant
                                                : t.icon.normal
                                        }
                                    />
                                }
                                right={
                                    <Icon name={IconName.Property1ArrowRight} />
                                }
                                style={[styles.methodCard]}
                            />
                        );
                    })}
                </View>
            </View>

            <View style={styles.note}>
                <View
                    style={[
                        styles.noteDot,
                        { backgroundColor: t.text.lessEmphasis },
                    ]}
                />
                <AppText
                    variant={TextVariant.Caption}
                    color="lessEmphasis"
                    style={styles.noteText}
                >
                    Funds go to wallet 6qHNzW...mzxt. Processing time varies by
                    method.
                </AppText>
            </View>
        </ScreenContainer>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    scrollContent: {
        flexGrow: 1,
    },
    nav: {
        alignItems: 'flex-start',
        marginBottom: 24,
    },
    hero: {
        gap: 12,
        marginBottom: 24,
    },
    section: {
        gap: 12,
    },
    sectionLabel: {
        textTransform: 'uppercase',
        letterSpacing: 0.4,
    },
    methods: {
        gap: 12,
    },
    methodCard: {
        borderRadius: 16,
        padding: 12,
    },
    methodIcon: {
        width: 42,
        height: 42,
        borderRadius: 21,
        alignItems: 'center',
        justifyContent: 'center',
    },
    iconInner: {
        padding: 14,
        borderRadius: 28,
    },
    radio: {
        width: 20,
        height: 20,
        borderRadius: 10,
        borderWidth: 1.5,
        alignItems: 'center',
        justifyContent: 'center',
    },
    radioDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
    },
    note: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginTop: 32,
    },
    noteDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
    },
    noteText: {
        flex: 1,
    },
});
