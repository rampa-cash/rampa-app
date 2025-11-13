import { MaterialIcons } from '@expo/vector-icons';
import AppButton from '@/components/ui/buttons/button';
import { ButtonVariant } from '@/components/ui/buttons/button-variants';
import { IconButton } from '@/components/ui/buttons/IconButton';
import { IconName } from '@/components/ui/icons/icon-names';
import { ListCard } from '@/components/ui/list-card';
import ScreenContainer from '@/components/ui/screen-container';
import { AppText } from '@/components/ui/text';
import { TextVariant } from '@/components/ui/text-variants';
import { useTheme } from '@/hooks/theme';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, Modal, Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ModalScaffold } from '@/components/modals/ModalScaffold';

type ReceiveCurrency = 'USD' | 'EUR' | 'SOL';

const CURRENCY_OPTIONS: Array<{
  id: ReceiveCurrency;
  label: string;
  description: string;
}> = [
  { id: 'USD', label: 'USD', description: 'US Dollar' },
  { id: 'EUR', label: 'EUR', description: 'Euro' },
  { id: 'SOL', label: 'SOL', description: 'Solana' },
];

const MOCK_WALLET_ADDRESS = '78393993....ckdd';

export default function ReceiveMoneyScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const t = useTheme();

  const [selectedCurrency, setSelectedCurrency] = useState<ReceiveCurrency>('USD');
  const [currencyModalVisible, setCurrencyModalVisible] = useState(false);
  const selectedCurrencyMeta = CURRENCY_OPTIONS.find(c => c.id === selectedCurrency);

  const handleSelectCurrency = (id: ReceiveCurrency) => {
    setSelectedCurrency(id);
    setCurrencyModalVisible(false);
  };

  const handleShare = () => {
    Alert.alert('Share wallet', 'Sharing options will be available soon.');
  };

  const handleCopy = () => {
    Alert.alert('Copied', 'Wallet address copied to clipboard.');
  };

  return (
    <>
      <ScreenContainer
        padded
        scroll
        contentContainerStyle={[styles.container, { paddingBottom: insets.bottom + 32 }]}
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
          <AppText variant={TextVariant.H1} style={styles.title}>
            Receive money
          </AppText>
          <AppText variant={TextVariant.Secondary} color="lessEmphasis">
            Share your wallet address to receive money instantly
          </AppText>
        </View>

        <View>
          <AppText variant={TextVariant.SecondaryMedium} color="lessEmphasis" style={styles.sectionLabel}>
            Currency
          </AppText>
          <Pressable
            onPress={() => setCurrencyModalVisible(true)}
            style={[
              styles.currencyPicker,
              {
                backgroundColor: t.background.onBase,
                borderColor: t.outline.outline1,
              },
            ]}
          >
            <View style={styles.currencyPickerContent}>
              <View style={[styles.currencyBadge, { backgroundColor: t.background.onBase2 }]}>
                <AppText variant={TextVariant.BodyMedium}>{selectedCurrency}</AppText>
              </View>
              <AppText variant={TextVariant.Body}>{selectedCurrencyMeta?.description}</AppText>
          </View>
            <MaterialIcons name="keyboard-arrow-down" size={20} color={t.icon.lessEmphasis} />
          </Pressable>
        </View>

        <View style={[styles.qrCard, { backgroundColor: t.background.onBase }]}>
          <View style={[styles.qrMock, { backgroundColor: t.background.onBase2 }]}>
            <MaterialIcons name="qr-code-2" size={140} color={t.icon.normal} />
          </View>
          <AppText variant={TextVariant.Secondary} color="lessEmphasis" align="center">
            Show this code so others can send {selectedCurrency}
          </AppText>
        </View>

        <View style={[styles.walletCard, { backgroundColor: t.background.onBase }]}>
          <AppText variant={TextVariant.SecondaryMedium} color="lessEmphasis">
            Your wallet address
          </AppText>
          <View style={[styles.walletValue, { backgroundColor: t.background.onBase2 }]}>
            <AppText variant={TextVariant.Body} style={styles.walletText}>
              {MOCK_WALLET_ADDRESS}
            </AppText>
            <AppButton
              title="Copy"
              variant={ButtonVariant.PrimaryContrast}
              style={styles.copyButton}
              onPress={handleCopy}
            />
          </View>
        </View>

        <View style={styles.actions}>
          <AppButton title="Share" onPress={handleShare} />
          <AppButton
            title="Done"
            variant={ButtonVariant.PrimaryContrast}
            onPress={() => router.back()}
          />
        </View>
      </ScreenContainer>

      <Modal
        visible={currencyModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setCurrencyModalVisible(false)}
      >
        <View style={styles.modalBackdrop}>
          <Pressable style={StyleSheet.absoluteFill} onPress={() => setCurrencyModalVisible(false)} />
          <View style={styles.modalSheet}>
            <ModalScaffold>
              <AppText variant={TextVariant.BodyMedium}>Choose a currency</AppText>
              <View style={{ gap: 8 }}>
                {CURRENCY_OPTIONS.map(option => (
                  <ListCard
                    key={option.id}
                    title={`${option.label} - ${option.description}`}
                    showChevron={false}
                    onPress={() => handleSelectCurrency(option.id)}
                    style={
                      option.id === selectedCurrency
                        ? [
                            {
                              borderColor: t.primary.signalViolet,
                            },
                          ]
                        : undefined
                    }
                    right={
                      option.id === selectedCurrency ? (
                        <MaterialIcons name="check" size={20} color={t.primary.signalViolet} />
                      ) : undefined
                    }
                  />
                ))}
              </View>
            </ModalScaffold>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    gap: 24,
  },
  nav: {
    alignItems: 'flex-start',
  },
  header: {
    gap: 12,
  },
  title: {
    lineHeight: 32,
  },
  sectionLabel: {
    marginBottom: 8,
  },
  currencyPicker: {
    borderWidth: 1,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  currencyPickerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  currencyBadge: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 14,
  },
  qrCard: {
    padding: 24,
    borderRadius: 24,
    alignItems: 'center',
    gap: 16,
  },
  qrMock: {
    padding: 24,
    borderRadius: 24,
  },
  walletCard: {
    padding: 20,
    borderRadius: 20,
    gap: 12,
  },
  walletValue: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 16,
    gap: 12,
  },
  walletText: {
    flex: 1,
    fontFamily: 'monospace',
  },
  copyButton: {
    minHeight: 36,
    paddingHorizontal: 20,
    borderRadius: 12,
  },
  actions: {
    gap: 12,
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
});
