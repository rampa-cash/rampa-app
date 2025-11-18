import AppButton from '@/components/ui/buttons/button';
import { ButtonVariant } from '@/components/ui/buttons/button-variants';
import { AppInput } from '@/components/ui/input';
import React from 'react';
import { StyleSheet, View } from 'react-native';

export type VerificationFormProps = {
    code: string;
    onChangeCode: (v: string) => void;
    onVerify: () => void;
    onBackToLogin: () => void;
    onResendCode?: () => void;
    isLoading?: boolean;
    error?: string | null;
};

export function VerificationForm({
    code,
    onChangeCode,
    onVerify,
    onBackToLogin,
    onResendCode,
    isLoading,
    error,
}: VerificationFormProps) {
    return (
        <View style={styles.form}>
            <AppInput
                placeholder="Enter verification code"
                value={code}
                onChangeText={onChangeCode}
                keyboardType="number-pad"
                editable={!isLoading}
                error={error || undefined}
                label="Verification Code"
                autoFocus
                maxLength={6}
            />

            <AppButton
                title={isLoading ? 'Verifying...' : 'Verify Account'}
                onPress={onVerify}
                disabled={isLoading || !code.trim() || code.length < 4}
                style={styles.verifyButton}
            />

            {onResendCode && (
                <AppButton
                    title="Resend Code"
                    onPress={onResendCode}
                    disabled={isLoading}
                    variant={ButtonVariant.Tertiary}
                    style={styles.resendButton}
                />
            )}

            <AppButton
                title="Back to Login"
                onPress={onBackToLogin}
                disabled={isLoading}
                variant={ButtonVariant.Tertiary}
                style={styles.backButton}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    form: {
        width: '100%',
        gap: 16,
    },
    verifyButton: {
        marginTop: 8,
    },
    resendButton: {
        marginTop: 8,
    },
    backButton: {
        marginTop: 8,
    },
});

export default VerificationForm;
