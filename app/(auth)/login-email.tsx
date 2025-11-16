import { Header } from '@/components/login/Header';
import AppButton from '@/components/ui/buttons/button';
import { AppInput } from '@/components/ui/input';
import ScreenContainer from '@/components/ui/screen-container';
import { AppText } from '@/components/ui/text';
import { TextVariant } from '@/components/ui/text-variants';
import { useAuth } from '@/src/domain/auth/useAuth';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function LoginEmailScreen() {
    const [email, setEmail] = useState('');
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const { loginWithEmail, isLoading, clearError } = useAuth();

    const handleContinue = async () => {
        if (!email.trim()) {
            setError('Please enter your email address');
            return;
        }

        // Basic email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            setError('Please enter a valid email address');
            return;
        }

        clearError();
        setError(null);

        try {
            await loginWithEmail(email);
            // If successful and stage === 'login', user will be automatically redirected to home
            // via the auth state change in app/index.tsx
        } catch (err) {
            const errorMessage =
                err instanceof Error ? err.message : 'Failed to sign in';

            // Check if verification is required
            if (
                errorMessage.includes('verification required') ||
                errorMessage.includes('verification')
            ) {
                // Navigate to verification screen with email parameter
                router.push(
                    `/(auth)/verify-email?email=${encodeURIComponent(email)}` as any
                );
            } else {
                setError(errorMessage);
            }
        }
    };

    return (
        <ScreenContainer padded style={{ flex: 1 }}>
            <Header />
            <View style={styles.container}>
                <View style={styles.content}>
                    <AppText variant={TextVariant.H1}>
                        What&apos;s your email {'\n'}address?
                    </AppText>
                    <AppText
                        variant={TextVariant.Secondary}
                        style={{ marginBottom: 16 }}
                    >
                        We'll send a confirmation code
                    </AppText>
                    <AppInput
                        placeholder="you@example.com"
                        value={email}
                        onChangeText={text => {
                            setEmail(text);
                            if (error) setError(null);
                        }}
                        label="Email address"
                        error={error || undefined}
                        disabled={isLoading}
                        keyboardType="email-address"
                        autoCapitalize="none"
                        autoComplete="email"
                    />
                </View>
                <AppButton
                    title={isLoading ? 'Loading...' : 'Continue'}
                    onPress={handleContinue}
                    disabled={isLoading || !email.trim()}
                    style={{ marginBottom: insets.bottom }}
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
