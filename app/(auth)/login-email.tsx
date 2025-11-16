import { ConfirmContactModal } from '@/components/login/ConfirmContactModal';
import { Header } from '@/components/login/Header';
import AppButton from '@/components/ui/buttons/button';
import { AppInput } from '@/components/ui/input';
import ScreenContainer from '@/components/ui/screen-container';
import { AppText } from '@/components/ui/text';
import { TextVariant } from '@/components/ui/text-variants';
import { useSignup } from '@/hooks/SignupProvider';
import { useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function LoginEmailScreen() {
  const [email, setEmail] = useState('');
  const [confirmVisible, setConfirmVisible] = useState(false);
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { setContact } = useSignup();

  const trimmedEmail = useMemo(() => email.trim(), [email]);
  const isValidEmail = useMemo(
    () => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail),
    [trimmedEmail]
  );

  const handleConfirm = () => {
    if (!isValidEmail) return;
    setConfirmVisible(false);
    setContact('email', trimmedEmail);
    router.push({
      pathname: '/(auth)/verify-code',
      params: { method: 'email', contact: trimmedEmail },
    } as any);
  };

  return (
    <ScreenContainer padded style={{ flex: 1 }}>
      <Header />
      <View style={styles.container}>
        <View style={styles.content}>
          <AppText variant={TextVariant.H1}>
            What&apos;s your email {'\n'}address?
          </AppText>
          <AppText variant={TextVariant.Secondary} style={{ marginBottom: 16 }}>
            We&apos;ll send a confirmation code
          </AppText>
          <AppInput
            placeholder="you@example.com"
            value={email}
            onChangeText={setEmail}
            label="Email address"
            autoCapitalize="none"
            keyboardType="email-address"
            autoComplete="email"
            textContentType="emailAddress"
          />
        </View>
        <AppButton
          title="Get confirmation code"
          onPress={() => setConfirmVisible(true)}
          disabled={!isValidEmail}
          style={{ marginBottom: insets.bottom }}
        />

        <ConfirmContactModal
          visible={confirmVisible}
          contact={trimmedEmail}
          message="Is this email correct? We&apos;ll send you a confirmation code there"
          onCancel={() => setConfirmVisible(false)}
          onConfirm={handleConfirm}
        />
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: 12,
    flex: 1,
  },
  container: {
    flexDirection: 'column',
    justifyContent: 'space-between',
    flex: 1,
    height: '100%',
  },
});
