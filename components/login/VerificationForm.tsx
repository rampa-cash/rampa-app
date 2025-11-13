import React from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';

export type VerificationFormProps = {
  code: string;
  onChangeCode: (v: string) => void;
  onVerify: () => void;
  onBackToLogin: () => void;
  isLoading?: boolean;
  error?: string | null;
};

export function VerificationForm({ code, onChangeCode, onVerify, onBackToLogin, isLoading, error }: VerificationFormProps) {
  return (
    <View style={styles.form}>
      <TextInput
        style={styles.input}
        placeholder="Enter verification code"
        value={code}
        onChangeText={onChangeCode}
        keyboardType="number-pad"
        editable={!isLoading}
      />

      {Boolean(error) && <Text style={styles.errorText}>{error}</Text>}

      <TouchableOpacity style={[styles.button, isLoading && styles.buttonDisabled]} onPress={onVerify} disabled={isLoading}>
        <Text style={styles.buttonText}>{isLoading ? 'Verifying...' : 'Verify Account'}</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.backButton} onPress={onBackToLogin} disabled={isLoading}>
        <Text style={styles.backButtonText}>Back to Login</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
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
});

export default VerificationForm;

