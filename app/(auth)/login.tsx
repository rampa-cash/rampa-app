import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    Alert,
    KeyboardAvoidingView,
    Platform,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { useAuth } from '../../src/domain/auth';

export default function LoginScreen() {
    const [email, setEmail] = useState('');
    const [verificationCode, setVerificationCode] = useState('');
    const [isVerificationMode, setIsVerificationMode] = useState(false);
    const { login, verifyAccount, isLoading, error, clearError } = useAuth();
    const router = useRouter();

    const handleLogin = async () => {
        if (!email.trim()) {
            Alert.alert('Error', 'Please enter your email address');
            return;
        }

        try {
            clearError();
            await login(email);
            // If we get here, login was successful
            router.replace('/(tabs)/home' as any);
        } catch (error) {
            if (
                error instanceof Error &&
                error.message === 'Account verification required'
            ) {
                setIsVerificationMode(true);
            } else {
                Alert.alert(
                    'Login Failed',
                    error instanceof Error ? error.message : 'An error occurred'
                );
            }
        }
    };

    const handleVerification = async () => {
        if (!verificationCode.trim()) {
            Alert.alert('Error', 'Please enter the verification code');
            return;
        }

        try {
            clearError();
            await verifyAccount(verificationCode);
            // If we get here, verification was successful
            router.replace('/(tabs)/home' as any);
        } catch (error) {
            Alert.alert(
                'Verification Failed',
                error instanceof Error ? error.message : 'An error occurred'
            );
        }
    };

    const handleBackToLogin = () => {
        setIsVerificationMode(false);
        setVerificationCode('');
        clearError();
    };

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            <View style={styles.content}>
                <Text style={styles.title}>Welcome to Rampa</Text>
                <Text style={styles.subtitle}>
                    {isVerificationMode
                        ? 'Enter the verification code sent to your email'
                        : 'Your secure remittance platform'}
                </Text>

                {!isVerificationMode ? (
                    <View style={styles.form}>
                        <TextInput
                            style={styles.input}
                            placeholder="Enter your email"
                            value={email}
                            onChangeText={setEmail}
                            keyboardType="email-address"
                            autoCapitalize="none"
                            autoCorrect={false}
                            editable={!isLoading}
                        />

                        {error && <Text style={styles.errorText}>{error}</Text>}

                        <TouchableOpacity
                            style={[
                                styles.button,
                                isLoading && styles.buttonDisabled,
                            ]}
                            onPress={handleLogin}
                            disabled={isLoading}
                        >
                            <Text style={styles.buttonText}>
                                {isLoading ? 'Signing in...' : 'Continue'}
                            </Text>
                        </TouchableOpacity>
                    </View>
                ) : (
                    <View style={styles.form}>
                        <TextInput
                            style={styles.input}
                            placeholder="Enter verification code"
                            value={verificationCode}
                            onChangeText={setVerificationCode}
                            keyboardType="number-pad"
                            editable={!isLoading}
                        />

                        {error && <Text style={styles.errorText}>{error}</Text>}

                        <TouchableOpacity
                            style={[
                                styles.button,
                                isLoading && styles.buttonDisabled,
                            ]}
                            onPress={handleVerification}
                            disabled={isLoading}
                        >
                            <Text style={styles.buttonText}>
                                {isLoading ? 'Verifying...' : 'Verify Account'}
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.backButton}
                            onPress={handleBackToLogin}
                            disabled={isLoading}
                        >
                            <Text style={styles.backButtonText}>
                                Back to Login
                            </Text>
                        </TouchableOpacity>
                    </View>
                )}

                <View style={styles.footer}>
                    <Text style={styles.footerText}>
                        By continuing, you agree to our Terms of Service and
                        Privacy Policy
                    </Text>
                </View>
            </View>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#ffffff',
    },
    content: {
        flex: 1,
        paddingHorizontal: 24,
        paddingTop: 60,
        paddingBottom: 40,
        justifyContent: 'center',
    },
    title: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#1a1a1a',
        textAlign: 'center',
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 16,
        color: '#666666',
        textAlign: 'center',
        marginBottom: 40,
        lineHeight: 24,
    },
    form: {
        width: '100%',
    },
    input: {
        borderWidth: 1,
        borderColor: '#e0e0e0',
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 16,
        fontSize: 16,
        backgroundColor: '#ffffff',
        marginBottom: 16,
    },
    button: {
        backgroundColor: '#007AFF',
        borderRadius: 12,
        paddingVertical: 16,
        alignItems: 'center',
        marginBottom: 16,
    },
    buttonDisabled: {
        backgroundColor: '#cccccc',
    },
    buttonText: {
        color: '#ffffff',
        fontSize: 16,
        fontWeight: '600',
    },
    backButton: {
        alignItems: 'center',
        paddingVertical: 12,
    },
    backButtonText: {
        color: '#007AFF',
        fontSize: 16,
        fontWeight: '500',
    },
    errorText: {
        color: '#ff3b30',
        fontSize: 14,
        textAlign: 'center',
        marginBottom: 16,
    },
    footer: {
        marginTop: 40,
        paddingHorizontal: 20,
    },
    footerText: {
        fontSize: 12,
        color: '#999999',
        textAlign: 'center',
        lineHeight: 18,
    },
});
