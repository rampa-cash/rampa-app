import React, { useMemo, useState } from 'react';
import { Modal, Pressable, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { CountrySearchModal, type CountryItem } from '@/components/modals/CountrySearchModal';
import { UsdAmountInput } from '@/components/ui/usd-amount-input';
import AppButton from '@/components/ui/buttons/button';
import { ButtonVariant } from '@/components/ui/buttons/button-variants';
import { IconButton } from '@/components/ui/buttons/IconButton';
import Icon from '@/components/ui/icons/Icon';
import { IconName } from '@/components/ui/icons/icon-names';
import { ScreenContainer } from '@/components/ui/screen-container';
import { AppText } from '@/components/ui/text';
import { TextVariant } from '@/components/ui/text-variants';
import { COUNTRIES } from '@/constants/countries';
import { Palette } from '@/constants/theme';
import { useTheme } from '@/hooks/theme';

type BankOption = { id: string; name: string; icon: IconName };

const QUICK_AMOUNTS = [50, 100, 500];
const formatAmount = (v: number) => v.toFixed(2);
const BANKS: BankOption[] = [
  { id: 'boa', name: 'Bank of America', icon: IconName.Property1Bank },
  { id: 'chase', name: 'Chase', icon: IconName.Property1Card },
  { id: 'revolut', name: 'Revolut', icon: IconName.Property1Wallet },
  { id: 'wise', name: 'Wise', icon: IconName.Property1ATMCard },
];

export default function CashOutScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const t = useTheme();

  const [amount, setAmount] = useState('');
  const [country, setCountry] = useState<CountryItem>(COUNTRIES[0]);
  const [bank, setBank] = useState<BankOption>(BANKS[0]);
  const [countryModalVisible, setCountryModalVisible] = useState(false);
  const [bankModalVisible, setBankModalVisible] = useState(false);
  const [countryQuery, setCountryQuery] = useState('');

  const availableBalance = 374.1;

  const isAmountValid = useMemo(() => {
    const parsed = Number.parseFloat(amount.replace(',', '.'));
    return Number.isFinite(parsed) && parsed > 0;
  }, [amount]);

  const filteredCountries = useMemo(() => {
    const normalized = countryQuery.trim().toLowerCase();
    if (!normalized) return COUNTRIES;
    return COUNTRIES.filter(c => {
      const target = `${c.name} ${c.dial} ${c.code}`.toLowerCase();
      return target.includes(normalized);
    });
  }, [countryQuery]);

  const handleUseMax = () => {
    setAmount(availableBalance.toFixed(2));
  };

  const handleSelectCountry = (code: string) => {
    const match = COUNTRIES.find(c => c.code === code);
    if (match) setCountry(match);
    setCountryModalVisible(false);
    setCountryQuery('');
  };

  const handleSelectBank = (id: string) => {
    const match = BANKS.find(b => b.id === id);
    if (match) setBank(match);
    setBankModalVisible(false);
  };

  return (
    <>
      <ScreenContainer
        padded
        scroll
        contentContainerStyle={[styles.container, { paddingBottom: insets.bottom + 24 }]}
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

        <View style={styles.header}>
          <AppText variant={TextVariant.H1}>Cash out</AppText>
          <AppText variant={TextVariant.Secondary} color="lessEmphasis">
            Withdraw your balance to a bank account
          </AppText>
        </View>

        <UsdAmountInput
          value={amount}
          onChange={setAmount}
          placeholder="0.00"
          helperText={`Available Balance $${availableBalance.toFixed(2)}`}
        />
        <View style={styles.quickRow}>
          {QUICK_AMOUNTS.map(option => {
            const isActive = Number.parseFloat(amount) === option;
            return (
              <Pressable
                key={option}
                style={[
                  styles.quickChip,
                  {
                    backgroundColor: isActive ? t.background.secondary : t.background.onBase2,
                    borderColor: isActive ? t.primary.signalViolet : t.outline.outline1,
                  },
                ]}
                onPress={() => setAmount(formatAmount(option))}
              >
                <AppText variant={TextVariant.Secondary}>${option}</AppText>
              </Pressable>
            );
          })}
          <Pressable style={[styles.quickChip, { backgroundColor: t.background.onBase2 }]} onPress={handleUseMax}>
            <AppText variant={TextVariant.Secondary}>Use Max</AppText>
          </Pressable>
        </View>

        <View style={styles.selectSection}>
          <AppText variant={TextVariant.SecondaryMedium} color="lessEmphasis">
            Select your payout country
          </AppText>
          <Pressable
            onPress={() => setCountryModalVisible(true)}
            style={[
              styles.pill,
              { backgroundColor: t.background.onBase2, borderColor: t.outline.outline1 },
            ]}
          >
            <View style={styles.pillContent}>
              <Icon name={IconName.Property1Location} size={18} color={t.icon.normal} />
              <AppText variant={TextVariant.BodyMedium} style={{ flex: 1 }}>
                {country.name}
              </AppText>
            </View>
            <MaterialIcons name="keyboard-arrow-down" size={20} color={t.icon.lessEmphasis} />
          </Pressable>
        </View>

        <View style={styles.selectSection}>
          <AppText variant={TextVariant.SecondaryMedium} color="lessEmphasis">
            Bank
          </AppText>
          <Pressable
            onPress={() => setBankModalVisible(true)}
            style={[
              styles.pill,
              { backgroundColor: t.background.onBase2, borderColor: t.outline.outline1 },
            ]}
          >
            <View style={styles.pillContent}>
              <Icon name={bank.icon} size={18} color={t.icon.normal} />
              <AppText variant={TextVariant.BodyMedium} style={{ flex: 1 }}>
                {bank.name}
              </AppText>
            </View>
            <MaterialIcons name="keyboard-arrow-down" size={20} color={t.icon.lessEmphasis} />
          </Pressable>
        </View>

        <View style={[styles.feeCard, { backgroundColor: t.background.onBase2 }]}>
          <AppText variant={TextVariant.Secondary} color="lessEmphasis">
            Fees:
          </AppText>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <AppText variant={TextVariant.Secondary} style={{ color: Palette.primary.flowAqua }}>
              0.05%
            </AppText>
            <AppText variant={TextVariant.Secondary}>$0.00</AppText>
          </View>
        </View>

        <View style={{ flex: 1 }} />

        <AppButton title="Cash out" variant={ButtonVariant.Primary} disabled={!isAmountValid} />
      </ScreenContainer>

      <Modal
        visible={countryModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setCountryModalVisible(false)}
      >
        <View style={styles.modalBackdrop}>
          <Pressable style={StyleSheet.absoluteFill} onPress={() => setCountryModalVisible(false)} />
          <View style={styles.modalSheet}>
            <CountrySearchModal
              query={countryQuery}
              onChangeQuery={setCountryQuery}
              onCancel={() => setCountryModalVisible(false)}
              countries={filteredCountries}
              onSelect={handleSelectCountry}
              selectedCode={country.code}
              showDial={false}
            />
          </View>
        </View>
      </Modal>

      <Modal
        visible={bankModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setBankModalVisible(false)}
      >
        <View style={styles.modalBackdrop}>
          <Pressable style={StyleSheet.absoluteFill} onPress={() => setBankModalVisible(false)} />
          <View style={styles.modalSheet}>
            <View style={{ padding: 16, gap: 12, backgroundColor: t.background.onBase }}>
              <AppText variant={TextVariant.BodyMedium}>Choose a bank</AppText>
              {BANKS.map(option => (
                <Pressable
                  key={option.id}
                  onPress={() => handleSelectBank(option.id)}
                  style={[
                    styles.bankRow,
                    {
                      borderColor:
                        option.id === bank.id ? t.primary.signalViolet : t.outline.outline1,
                      backgroundColor:
                        option.id === bank.id ? t.background.secondary : t.background.onBase,
                    },
                  ]}
                >
                  <Icon name={option.icon} size={18} color={t.icon.normal} />
                  <AppText variant={TextVariant.Body}>{option.name}</AppText>
                  <View style={{ flex: 1 }} />
                  {option.id === bank.id ? (
                    <MaterialIcons name="check" size={18} color={t.primary.signalViolet} />
                  ) : null}
                </Pressable>
              ))}
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    gap: 20,
  },
  nav: {
    alignItems: 'flex-start',
  },
  header: {
    gap: 10,
  },
  quickRow: {
    flexDirection: 'row',
    gap: 10,
  },
  quickChip: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 18,
    borderWidth: 1,
  },
  selectSection: {
    gap: 8,
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 14,
  },
  pillContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  feeCard: {
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
    padding: 16,
  },
  modalSheet: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    overflow: 'hidden',
  },
  bankRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
});
