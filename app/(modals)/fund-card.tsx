import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppButton } from '@/components/ui/buttons/button';
import { IconButton } from '@/components/ui/buttons/IconButton';
import { IconName } from '@/components/ui/icons/icon-names';
import { ScreenContainer } from '@/components/ui/screen-container';
import { UsdAmountInput } from '@/components/ui/usd-amount-input';
import { useWallet } from '@/hooks/WalletProvider';

const AVAILABLE_BALANCE = 374.1;

export default function FundCardScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const { meta } = useWallet();
    const params = useLocalSearchParams<{
        suggested?: string;
        mode?: 'withdraw' | 'fund';
    }>();

    const initialAmount = useMemo(
        () => params?.suggested ?? '50',
        [params?.suggested]
    );
    const [amount, setAmount] = useState(initialAmount);
    const mode = params?.mode === 'withdraw' ? 'withdraw' : 'fund';
    const isWithdraw = mode === 'withdraw';

    const parsedAmount = Number.parseFloat(String(amount).replace(',', '.'));
    const isAmountValid = Number.isFinite(parsedAmount) && parsedAmount > 0;

    const handleSubmit = () => {
        if (!isAmountValid) return;
        router.push({
            pathname: '/(modals)/fund-card-success',
            params: {
                amount: String(parsedAmount),
                currency: meta.isoCurrency ?? 'USD',
                mode,
            },
        } as never);
    };

    return (
        <ScreenContainer
            padded
            scroll
            contentContainerStyle={[
                styles.content,
                { paddingTop: insets.top, paddingBottom: insets.bottom + 24 },
            ]}
        >
            <View style={styles.nav}>
                <IconButton
                    iconName={IconName.Property1ArrowLeft}
                    shape="circle"
                    iconSize={14}
                    bordered
                    onPress={() => router.back()}
                />
            </View>

            <View style={styles.center}>
                <UsdAmountInput
                    value={amount}
                    onChange={setAmount}
                    placeholder="0.00"
                    helperText={`Available Balance $${AVAILABLE_BALANCE.toFixed(2)}`}
                    containerStyle={{ minWidth: 220 }}
                />
            </View>

            <AppButton
                title={isWithdraw ? 'Withdraw' : 'Fund my card'}
                disabled={!isAmountValid}
                onPress={handleSubmit}
                style={styles.footerButton}
            />
        </ScreenContainer>
    );
}

const styles = StyleSheet.create({
    content: {
        flexGrow: 1,
    },
    nav: {
        alignItems: 'flex-start',
    },
    center: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'flex-start',
        paddingTop: 48,
    },
    footerButton: {
        width: '100%',
    },
});
