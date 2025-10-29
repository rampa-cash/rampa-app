/**
 * Secure Storage Utilities
 *
 * Provides encrypted storage for sensitive data using Expo SecureStore
 * All sensitive data is encrypted and stored securely on device
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';

export class SecureStorage {
    /**
     * Store sensitive data securely (encrypted)
     */
    static async setSecureItem(key: string, value: string): Promise<void> {
        try {
            await SecureStore.setItemAsync(key, value);
        } catch (error) {
            console.error('Failed to store secure item:', error);
            throw new Error('Failed to store secure data');
        }
    }

    /**
     * Retrieve sensitive data securely (decrypted)
     */
    static async getSecureItem(key: string): Promise<string | null> {
        try {
            return await SecureStore.getItemAsync(key);
        } catch (error) {
            console.error('Failed to retrieve secure item:', error);
            return null;
        }
    }

    /**
     * Remove sensitive data
     */
    static async removeSecureItem(key: string): Promise<void> {
        try {
            await SecureStore.deleteItemAsync(key);
        } catch (error) {
            console.error('Failed to remove secure item:', error);
            throw new Error('Failed to remove secure data');
        }
    }

    /**
     * Store non-sensitive data in AsyncStorage
     */
    static async setItem(key: string, value: string): Promise<void> {
        try {
            await AsyncStorage.setItem(key, value);
        } catch (error) {
            console.error('Failed to store item:', error);
            throw new Error('Failed to store data');
        }
    }

    /**
     * Retrieve non-sensitive data from AsyncStorage
     */
    static async getItem(key: string): Promise<string | null> {
        try {
            return await AsyncStorage.getItem(key);
        } catch (error) {
            console.error('Failed to retrieve item:', error);
            return null;
        }
    }

    /**
     * Remove non-sensitive data
     */
    static async removeItem(key: string): Promise<void> {
        try {
            await AsyncStorage.removeItem(key);
        } catch (error) {
            console.error('Failed to remove item:', error);
            throw new Error('Failed to remove data');
        }
    }

    /**
     * Clear all stored data (both secure and non-secure)
     */
    static async clearAll(): Promise<void> {
        try {
            await SecureStore.deleteItemAsync('sessionToken');
            await SecureStore.deleteItemAsync('userCredentials');
            await AsyncStorage.clear();
        } catch (error) {
            console.error('Failed to clear storage:', error);
            throw new Error('Failed to clear storage');
        }
    }
}

// Storage keys for consistent usage
export const STORAGE_KEYS = {
    SESSION_TOKEN: 'sessionToken',
    USER_CREDENTIALS: 'userCredentials',
    USER_PREFERENCES: 'userPreferences',
    APP_SETTINGS: 'appSettings',
    BIOMETRIC_ENABLED: 'biometricEnabled',
} as const;
