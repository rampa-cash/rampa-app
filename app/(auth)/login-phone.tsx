import AppButton from '@/components/ui/buttons/button';
import { AppInput } from '@/components/ui/input';
import ScreenContainer from '@/components/ui/screen-container';
import { AppText } from '@/components/ui/text';
import { TextVariant } from '@/components/ui/text-variants';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';

export default function LoginPhoneScreen() {
  const [phone, setPhone] = useState('');
  const router = useRouter();

  return (
    <ScreenContainer scroll padded>
      <View style={styles.content}>
        <AppText variant={TextVariant.H1}>Enter your phone</AppText>
        <AppText variant={TextVariant.Secondary} style={{ marginBottom: 16 }}>
          We’ll text you a code to continue
        </AppText>

        <AppInput placeholder="+1 555 555 5555" value={phone} onChangeText={setPhone} keyboardType="phone-pad" />

        <AppButton title="Continue"  onPress={() => router.push('/(auth)/login' as any)} />
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: 12,
  },
});

