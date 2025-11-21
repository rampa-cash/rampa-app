import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';

import { Amount } from '@/components/ui/amount';
import { AmountSize, AmountTone } from '@/components/ui/amount-variants';
import AppButton from '@/components/ui/buttons/button';
import { ButtonVariant } from '@/components/ui/buttons/button-variants';
import { ScreenContainer } from '@/components/ui/screen-container';
import { AppText } from '@/components/ui/text';
import { TextVariant } from '@/components/ui/text-variants';
import { Palette } from '@/constants/theme';

export default function FundCardSuccessScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const {
        amount = '0',
        currency = 'EUR',
        mode = 'fund',
    } = useLocalSearchParams<{
        amount?: string;
        currency?: 'USD' | 'EUR' | 'SOL';
        mode?: 'fund' | 'withdraw';
    }>();

    const numericAmount = Number.parseFloat(String(amount));
    const effectiveAmount = Number.isFinite(numericAmount) ? numericAmount : 0;
    const symbolOverride = currency === 'SOL' ? 'SOL' : undefined;
    const curr = currency === 'USD' ? 'USD' : 'EUR';
    const isWithdraw = mode === 'withdraw';

    return (
        <ScreenContainer
            padded
            scroll
            contentContainerStyle={[
                styles.container,
                { paddingBottom: insets.bottom + 24, paddingTop: insets.top },
            ]}
        >
            <View style={styles.center}>
                <View style={styles.checkCircle}>
                    <MaterialIcons name="check" size={30} color="#fff" />
                </View>

                <AppText variant={TextVariant.Body} style={{ marginTop: 12 }}>
                    {isWithdraw ? 'Withdrawal requested' : 'Card funded'}
                </AppText>

                <View style={{ marginTop: 6 }}>
                    <Amount
                        value={isWithdraw ? -effectiveAmount : effectiveAmount}
                        currency={curr}
                        symbolOverride={symbolOverride}
                        showCents
                        size={AmountSize.Lg}
                        tone={AmountTone.Accent}
                    />
                </View>

                <AppText
                    variant={TextVariant.Secondary}
                    color={'lessEmphasis' as any}
                    align="center"
                    style={{ marginTop: 8 }}
                >
                    {isWithdraw
                        ? 'Your withdrawal request was submitted'
                        : 'Card was successfully funded'}
                </AppText>

                <Pressable onPress={() => {}}>
                    <AppText
                        variant={TextVariant.Body}
                        style={{ marginTop: 12 }}
                    >
                        View transaction
                    </AppText>
                </Pressable>
            </View>

            <View style={{ marginTop: 32 }}>
                <AppButton
                    title="Close"
                    variant={ButtonVariant.PrimaryContrast}
                    onPress={() => router.replace('/(tabs)/card' as any)}
                    backgroundColor={Palette.neutral.black}
                />
            </View>
        </ScreenContainer>
    );
}

const styles = StyleSheet.create({
    container: { flexGrow: 1, justifyContent: 'space-between' },
    center: { alignItems: 'center', marginTop: 32 },
    checkCircle: {
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: '#22C55E',
        alignItems: 'center',
        justifyContent: 'center',
    },
});
