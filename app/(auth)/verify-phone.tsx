import { Header } from '@/components/login/Header';
import { VerificationForm } from '@/components/login/VerificationForm';
import ScreenContainer from '@/components/ui/screen-container';
import { AppText } from '@/components/ui/text';
import { TextVariant } from '@/components/ui/text-variants';
import { useAuth } from '@/src/domain/auth/useAuth';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function VerifyPhoneScreen() {
    const [code, setCode] = useState('');
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const params = useLocalSearchParams<{ phone?: string }>();
    const {
        verifyAccount,
        resendVerificationCode,
        isLoading,
        error,
        clearError,
    } = useAuth();

    useEffect(() => {
        // Clear any previous errors when component mounts
        clearError();
    }, []);

    const handleVerify = async () => {
        if (!code.trim() || code.length < 4) {
            return;
        }

        clearError();

        try {
            await verifyAccount(code);
            // If successful, user will be automatically redirected to home
            // via the auth state change in app/index.tsx
        } catch (err) {
            // Error is already set in the hook
            console.error('Verification failed:', err);
        }
    };

    const handleResendCode = async () => {
        clearError();
        try {
            await resendVerificationCode();
        } catch (err) {
            console.error('Failed to resend code:', err);
        }
    };

    const handleBackToLogin = () => {
        router.back();
    };

    return (
        <ScreenContainer padded style={{ flex: 1 }}>
            <Header />
            <View style={styles.container}>
                <View style={styles.content}>
                    <AppText variant={TextVariant.H1}>
                        Enter verification {'\n'}code
                    </AppText>
                    <AppText
                        variant={TextVariant.Secondary}
                        style={{ marginBottom: 16 }}
                    >
                        {params.phone
                            ? `We sent a code to ${params.phone}`
                            : 'We sent a verification code to your phone'}
                    </AppText>
                    <VerificationForm
                        code={code}
                        onChangeCode={setCode}
                        onVerify={handleVerify}
                        onBackToLogin={handleBackToLogin}
                        onResendCode={handleResendCode}
                        isLoading={isLoading}
                        error={error}
                    />
                </View>
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
