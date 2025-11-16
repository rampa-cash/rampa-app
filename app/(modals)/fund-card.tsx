import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useMemo, useRef, useState } from 'react';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import Amount from '@/components/ui/amount';
import { AmountSize, AmountTone } from '@/components/ui/amount-variants';
import { AppButton } from '@/components/ui/buttons/button';
import { IconButton } from '@/components/ui/buttons/IconButton';
import { IconName } from '@/components/ui/icons/icon-names';
import { ScreenContainer } from '@/components/ui/screen-container';
import { AppText } from '@/components/ui/text';
import { TextVariant } from '@/components/ui/text-variants';
import { Palette } from '@/constants/theme';
import { useTheme } from '@/hooks/theme';
import { useWallet } from '@/hooks/WalletProvider';

const AVAILABLE_BALANCE = 374.1;

export default function FundCardScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const t = useTheme();
    const { meta } = useWallet();
    const params = useLocalSearchParams<{ suggested?: string }>();
    const inputRef = useRef<TextInput>(null);

    const initialAmount = useMemo(() => params?.suggested ?? '50', [params?.suggested]);
    const [amount, setAmount] = useState(initialAmount);

    const parsedAmount = Number.parseFloat(String(amount).replace(',', '.'));
    const isAmountValid = Number.isFinite(parsedAmount) && parsedAmount > 0;

    const handleSubmit = () => {
        if (!isAmountValid) return;
        router.push({
            pathname: '/(modals)/fund-card-success',
            params: {
                amount: String(parsedAmount),
                currency: meta.isoCurrency ?? 'EUR',
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


              
                    <Pressable onPress={() => inputRef.current?.focus()} style={styles.amountBox}>
                      {/* Visual amount using same component/style as Home */}
                      <View style={{ alignItems: 'center' }}>
                        <Amount
                          value={Number.parseFloat(amount || '0')}
                          currency={ 'EUR'}
                           showCents={false}
                          size={AmountSize.Lg}
                          tone={AmountTone.Default}
                        />
                      </View>
                      <AppText
                        variant={TextVariant.Caption}
                        style={{ marginTop: 8, textAlign: 'center', color: Palette.primary.flowAqua }}
                      >
                        Available Balance {  '€'  }374.10
                      </AppText>
                      {/* Invisible input capturing numeric entry */}
                      <TextInput
                        ref={inputRef}
                        value={amount}
                        onChangeText={txt => setAmount(txt.replace(/[^0-9.,]/g, ''))}
                        keyboardType="decimal-pad"
                        placeholder="0"
                        style={styles.hiddenInput}
                      />
                    </Pressable>
            
            </View>

            <AppButton
                title="Fund my card"
                disabled={!isAmountValid}
                onPress={handleSubmit}
            />
        </ScreenContainer>
    );
}

const styles = StyleSheet.create({
    content: {
        flexGrow: 1,
        justifyContent: 'space-between',
    },
    nav: {
        alignItems: 'flex-start',
    },
    center: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
    },
    amountRow: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        gap: 6,
    },
    amountInput: {
        minWidth: 140,
        fontSize: 44,
        fontWeight: '600',
        textAlign: 'left',
        paddingVertical: 4,
        borderBottomWidth: 1,
    },
    balance: {
        marginTop: 4,
    }, hiddenInput: {
        position: 'absolute',
        opacity: 0,
        width: 1,
        height: 1,
    },  amountBox: { marginTop: 8 },

});
