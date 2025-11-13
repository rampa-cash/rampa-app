import { Header } from '@/components/login/Header';
import AppButton from '@/components/ui/buttons/button';
import { AppInput } from '@/components/ui/input';
import ScreenContainer from '@/components/ui/screen-container';
import { AppText } from '@/components/ui/text';
import { TextVariant } from '@/components/ui/text-variants';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function LoginEmailScreen() {
  const [email, setEmail] = useState('');
  const router = useRouter();
  const insets = useSafeAreaInsets();

  return (
    <ScreenContainer padded style={{ flex: 1 }}>
      <Header />
      <View style={styles.container}>
        <View style={styles.content}>
          <AppText variant={TextVariant.H1}>What&apos;s your email {'\n'}address?</AppText>
          <AppText variant={TextVariant.Secondary} style={{ marginBottom: 16 }}>
            We’ll send a confirmation code
          </AppText>
          <AppInput placeholder="you@example.com" value={email} onChangeText={setEmail} label='Email address' />
        </View>
        <AppButton title="Continue" onPress={() => router.push('/(auth)/login' as any)} style={{ marginBottom: insets.bottom }} />


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
    flexDirection: "column",
    justifyContent: "space-between",
    flex: 1,
    height: "100%"
  },

});

