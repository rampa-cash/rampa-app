import React, { useMemo, useState } from 'react';
import { Alert, Pressable, StyleSheet, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { IconButton } from '@/components/ui/buttons/IconButton';
import { IconName } from '@/components/ui/icons/icon-names';
import { ScreenContainer } from '@/components/ui/screen-container';
import { AppText } from '@/components/ui/text';
import { TextVariant } from '@/components/ui/text-variants';
import AppButton from '@/components/ui/buttons/button';
import { ButtonVariant } from '@/components/ui/buttons/button-variants';
import { contactService } from '@/src/domain/contacts';
import { CurrencySelector, type CurrencyCode } from '@/components/ui/CurrencySelector';
import { AmountInput } from '@/components/ui/amount-input';

export default function SendAmountScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { contactId } = useLocalSearchParams<{ contactId?: string }>();
  const [currency, setCurrency] = useState<CurrencyCode>('EUR');
  const [amount, setAmount] = useState('');

  const { data: contact } = useQuery({
    queryKey: ['contact', contactId],
    enabled: Boolean(contactId),
    queryFn: () => contactService.getContactById(String(contactId)),
  });

  const masked = useMemo(() => {
    const ref = contact?.blockchainAddress || contact?.phone || contact?.email || '';
    if (!ref) return '';
    if (ref.length <= 10) return ref;
    return `${ref.slice(0, 5)}...${ref.slice(-4)}`;
  }, [contact]);

  const symbol = useMemo(() => (currency === 'EUR' ? '€' : currency === 'USD' ? '$' : 'SOL'), [currency]);

  const handleSend = () => {
    if (!amount.trim() || Number.isNaN(Number.parseFloat(amount))) {
      Alert.alert('Invalid amount', 'Please enter a valid amount.');
      return;
    }
    router.push({
      pathname: '/(modals)/send-success',
      params: {
        amount,
        currency,
        contactName: contact?.name ?? 'Recipient',
        contactRef: masked,
      },
    } as never);
  };

  return (
    <ScreenContainer padded scroll contentContainerStyle={[styles.container, { paddingBottom: insets.bottom + 24 }] }>
      <View style={[styles.nav, { paddingTop: insets.top }]}>
        <IconButton iconName={IconName.Property1ArrowLeft} shape="circle" iconSize={14} bordered onPress={() => router.back()} />
      </View>

      <View style={styles.header}>
        <AppText variant={TextVariant.H1}>Enter the amount to send</AppText>
      </View>

      <CurrencySelector value={currency} onChange={setCurrency} />

      <AmountInput
        label="Amount to send"
        value={amount}
        onChange={setAmount}
        currencySymbol={symbol}
        quickOptions={[50, 100, 500]}
        helperText={`Available Balance ${symbol}374.10`}
        containerStyle={{ marginTop: 8 }}
      />
      <View style={styles.quickRow}>
        <Pressable style={styles.quickChip} onPress={() => setAmount('374.10')}>
          <AppText variant={TextVariant.Secondary}>Use Max</AppText>
        </Pressable>
      </View>

      <View style={styles.recipientRow}>
        <AppText variant={TextVariant.SecondaryMedium} color={'lessEmphasis' as any}>To:</AppText>
        <View style={{ flex: 1 }}>
          <AppText variant={TextVariant.BodyMedium}>{contact?.name ?? 'Selected contact'}</AppText>
          {masked ? (
            <AppText variant={TextVariant.Caption} color={'lessEmphasis' as any}>{masked}</AppText>
          ) : null}
        </View>
      </View>

      <View style={{ marginTop: 24 }}>
        <AppButton title="Send" variant={ButtonVariant.Primary} onPress={handleSend} />
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, gap: 20 },
  nav: { alignItems: 'flex-start' },
  header: { gap: 12 },
  recipientRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
  },
  quickRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
  },
  quickChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 18,
    backgroundColor: '#F1F1F1',
  },
});
