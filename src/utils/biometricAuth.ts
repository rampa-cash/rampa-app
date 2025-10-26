/**
 * Biometric Authentication Utilities
 * 
 * Provides biometric authentication capabilities for secure operations
 * Integrates with device biometric sensors (fingerprint, face ID, etc.)
 */

import * as LocalAuthentication from 'expo-local-authentication';
import { logger } from './errorHandler';
import { SecureStorage, STORAGE_KEYS } from './secureStorage';

export interface BiometricAuthResult {
    success: boolean;
    error?: string;
    biometricType?: 'fingerprint' | 'facial' | 'iris' | 'voice';
}

export class BiometricAuth {
    private static instance: BiometricAuth;

    static getInstance(): BiometricAuth {
        if (!BiometricAuth.instance) {
            BiometricAuth.instance = new BiometricAuth();
        }
        return BiometricAuth.instance;
    }

    private constructor() {
        // Initialize biometric auth
    }

    /**
     * Check if biometric authentication is available on device
     */
    async isAvailable(): Promise<boolean> {
        try {
            const hasHardware = await LocalAuthentication.hasHardwareAsync();
            const isEnrolled = await LocalAuthentication.isEnrolledAsync();
            
            logger.info('Biometric availability check', { hasHardware, isEnrolled });
            return hasHardware && isEnrolled;
        } catch (error) {
            logger.error('Failed to check biometric availability', { error });
            return false;
        }
    }

    /**
     * Get available biometric types
     */
    async getAvailableTypes(): Promise<LocalAuthentication.AuthenticationType[]> {
        try {
            const types = await LocalAuthentication.supportedAuthenticationTypesAsync();
            logger.info('Available biometric types', { types });
            return types;
        } catch (error) {
            logger.error('Failed to get biometric types', { error });
            return [];
        }
    }

    /**
     * Authenticate using biometrics
     */
    async authenticate(reason: string = 'Authenticate to continue'): Promise<BiometricAuthResult> {
        try {
            const isAvailable = await this.isAvailable();
            if (!isAvailable) {
                return {
                    success: false,
                    error: 'Biometric authentication not available',
                };
            }

            const result = await LocalAuthentication.authenticateAsync({
                promptMessage: reason,
                fallbackLabel: 'Use passcode',
                disableDeviceFallback: false,
            });

            if (result.success) {
                logger.info('Biometric authentication successful');
                return {
                    success: true,
                    biometricType: this.getBiometricTypeFromResult(result),
                };
            } else {
                logger.warn('Biometric authentication failed', { error: result.error });
                return {
                    success: false,
                    error: result.error || 'Authentication failed',
                };
            }
        } catch (error) {
            logger.error('Biometric authentication error', { error });
            return {
                success: false,
                error: 'Authentication error occurred',
            };
        }
    }

    /**
     * Authenticate for sensitive operations (transactions, etc.)
     */
    async authenticateForSensitiveOperation(operation: string): Promise<BiometricAuthResult> {
        const reason = `Authenticate to ${operation}`;
        return this.authenticate(reason);
    }

    /**
     * Check if biometric authentication is enabled in app settings
     */
    async isEnabled(): Promise<boolean> {
        try {
            const enabled = await SecureStorage.getSecureItem(STORAGE_KEYS.BIOMETRIC_ENABLED);
            return enabled === 'true';
        } catch (error) {
            logger.error('Failed to check biometric enabled status', { error });
            return false;
        }
    }

    /**
     * Enable biometric authentication in app settings
     */
    async enable(): Promise<boolean> {
        try {
            const isAvailable = await this.isAvailable();
            if (!isAvailable) {
                logger.warn('Cannot enable biometric auth - not available');
                return false;
            }

            // Test authentication before enabling
            const testResult = await this.authenticate('Enable biometric authentication');
            if (!testResult.success) {
                logger.warn('Cannot enable biometric auth - test failed');
                return false;
            }

            await SecureStorage.setSecureItem(STORAGE_KEYS.BIOMETRIC_ENABLED, 'true');
            logger.info('Biometric authentication enabled');
            return true;
        } catch (error) {
            logger.error('Failed to enable biometric authentication', { error });
            return false;
        }
    }

    /**
     * Disable biometric authentication in app settings
     */
    async disable(): Promise<void> {
        try {
            await SecureStorage.removeSecureItem(STORAGE_KEYS.BIOMETRIC_ENABLED);
            logger.info('Biometric authentication disabled');
        } catch (error) {
            logger.error('Failed to disable biometric authentication', { error });
        }
    }

    /**
     * Get biometric type from authentication result
     */
    private getBiometricTypeFromResult(result: LocalAuthentication.LocalAuthenticationResult): 'fingerprint' | 'facial' | 'iris' | 'voice' | undefined {
        // This is a simplified mapping - actual implementation would depend on the specific result
        if (result.warning) {
            // Parse warning to determine biometric type
            if (result.warning.includes('fingerprint')) return 'fingerprint';
            if (result.warning.includes('face')) return 'facial';
            if (result.warning.includes('iris')) return 'iris';
            if (result.warning.includes('voice')) return 'voice';
        }
        return undefined;
    }

    /**
     * Get biometric authentication status
     */
    async getStatus(): Promise<{
        isAvailable: boolean;
        isEnabled: boolean;
        availableTypes: LocalAuthentication.AuthenticationType[];
    }> {
        try {
            const [isAvailable, isEnabled, availableTypes] = await Promise.all([
                this.isAvailable(),
                this.isEnabled(),
                this.getAvailableTypes(),
            ]);

            return {
                isAvailable,
                isEnabled,
                availableTypes,
            };
        } catch (error) {
            logger.error('Failed to get biometric status', { error });
            return {
                isAvailable: false,
                isEnabled: false,
                availableTypes: [],
            };
        }
    }
}

export class TransactionBiometricAuth {
    private static biometricAuth = BiometricAuth.getInstance();

    /**
     * Authenticate before creating a transaction
     */
    static async authenticateForTransaction(amount: number, currency: string): Promise<BiometricAuthResult> {
        const operation = `send ${amount} ${currency}`;
        return this.biometricAuth.authenticateForSensitiveOperation(operation);
    }

    /**
     * Authenticate before adding money to wallet
     */
    static async authenticateForAddMoney(amount: number, currency: string): Promise<BiometricAuthResult> {
        const operation = `add ${amount} ${currency} to wallet`;
        return this.biometricAuth.authenticateForSensitiveOperation(operation);
    }

    /**
     * Authenticate before cashing out
     */
    static async authenticateForCashOut(amount: number, currency: string): Promise<BiometricAuthResult> {
        const operation = `cash out ${amount} ${currency}`;
        return this.biometricAuth.authenticateForSensitiveOperation(operation);
    }

    /**
     * Authenticate before changing security settings
     */
    static async authenticateForSecurityChange(): Promise<BiometricAuthResult> {
        const operation = 'change security settings';
        return this.biometricAuth.authenticateForSensitiveOperation(operation);
    }
}

// Export singleton instance
export const biometricAuth = BiometricAuth.getInstance();
