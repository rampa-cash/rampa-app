import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    Alert,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { AuthService } from '../../src/services/AuthService';
import { useAuthStore } from '../../src/store/authStore';

export default function LoginScreen() {
    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { login, setLoading } = useAuthStore();
    const router = useRouter();
    const authService = new AuthService();

    const handleLogin = async () => {
        if (!email.trim()) {
            Alert.alert('Error', 'Please enter your email address');
            return;
        }

        setIsLoading(true);
        setLoading(true);

        try {
            const result = await authService.signUpOrLogIn(email);

            if (result.stage === 'login') {
                // User is authenticated, validate session with backend
                const { user, sessionToken } =
                    await authService.validateSessionWithBackend();
                login(user, sessionToken);
                router.replace('/(tabs)/home' as any);
            } else if (result.needsVerification) {
                // Show verification screen
                Alert.alert(
                    'Verification Required',
                    'Please check your email for a verification code',
                    [
                        {
                            text: 'OK',
                            onPress: () => {
                                // TODO: Navigate to verification screen
                                console.log('Navigate to verification screen');
                            },
                        },
                    ]
                );
            }
        } catch (error) {
            Alert.alert('Error', 'Login failed. Please try again.');
            console.error('Login error:', error);
        } finally {
            setIsLoading(false);
            setLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Welcome to Rampa</Text>
            <Text style={styles.subtitle}>Your secure remittance platform</Text>

            <View style={styles.form}>
                <TextInput
                    style={styles.input}
                    placeholder="Enter your email"
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                />

                <TouchableOpacity
                    style={[styles.button, isLoading && styles.buttonDisabled]}
                    onPress={handleLogin}
                    disabled={isLoading}
                >
                    <Text style={styles.buttonText}>
                        {isLoading ? 'Signing in...' : 'Continue'}
                    </Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
        backgroundColor: '#fff',
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        marginBottom: 8,
        color: '#333',
    },
    subtitle: {
        fontSize: 16,
        color: '#666',
        marginBottom: 40,
        textAlign: 'center',
    },
    form: {
        width: '100%',
        maxWidth: 300,
    },
    input: {
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        padding: 16,
        fontSize: 16,
        marginBottom: 20,
        backgroundColor: '#f9f9f9',
    },
    button: {
        backgroundColor: '#007AFF',
        borderRadius: 8,
        padding: 16,
        alignItems: 'center',
    },
    buttonDisabled: {
        backgroundColor: '#ccc',
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
});
