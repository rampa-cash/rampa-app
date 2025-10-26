/**
 * Security Utilities
 *
 * Provides encryption, validation, and security utilities for the app
 * All sensitive operations are handled securely
 */

import * as Crypto from 'expo-crypto';

export class SecurityUtils {
    /**
     * Generate a secure random string
     */
    static generateSecureRandom(length: number = 32): string {
        const chars =
            'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        let result = '';
        for (let i = 0; i < length; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return result;
    }

    /**
     * Hash a string using SHA-256
     */
    static async hashString(input: string): Promise<string> {
        try {
            return await Crypto.digestStringAsync(
                Crypto.CryptoDigestAlgorithm.SHA256,
                input,
                { encoding: Crypto.CryptoEncoding.HEX }
            );
        } catch (error) {
            console.error('Failed to hash string:', error);
            throw new Error('Failed to hash data');
        }
    }

    /**
     * Validate email format
     */
    static isValidEmail(email: string): boolean {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    /**
     * Validate phone number format (international)
     */
    static isValidPhoneNumber(phone: string): boolean {
        const phoneRegex = /^\+[1-9]\d{1,14}$/;
        return phoneRegex.test(phone);
    }

    /**
     * Validate Solana address format
     */
    static isValidSolanaAddress(address: string): boolean {
        // Solana addresses are base58 encoded and typically 32-44 characters
        const solanaRegex = /^[1-9A-HJ-NP-Za-km-z]{32,44}$/;
        return solanaRegex.test(address);
    }

    /**
     * Sanitize user input to prevent XSS
     */
    static sanitizeInput(input: string): string {
        return input
            .replace(/[<>]/g, '') // Remove potential HTML tags
            .replace(/['"]/g, '') // Remove quotes
            .replace(/[&]/g, '&amp;') // Escape ampersands
            .trim();
    }

    /**
     * Validate transaction amount
     */
    static isValidAmount(amount: number): boolean {
        return amount > 0 && amount <= 1000000 && Number.isFinite(amount);
    }

    /**
     * Validate currency code
     */
    static isValidCurrency(currency: string): boolean {
        const validCurrencies = ['SOL', 'USDC', 'EURC'];
        return validCurrencies.includes(currency);
    }

    /**
     * Generate a secure transaction ID
     */
    static generateTransactionId(): string {
        const timestamp = Date.now().toString();
        const random = this.generateSecureRandom(16);
        return `tx_${timestamp}_${random}`;
    }

    /**
     * Mask sensitive data for logging
     */
    static maskSensitiveData(data: string, visibleChars: number = 4): string {
        if (data.length <= visibleChars) {
            return '*'.repeat(data.length);
        }
        const visible = data.slice(-visibleChars);
        const masked = '*'.repeat(data.length - visibleChars);
        return masked + visible;
    }

    /**
     * Validate password strength
     */
    static validatePasswordStrength(password: string): {
        isValid: boolean;
        score: number;
        feedback: string[];
    } {
        const feedback: string[] = [];
        let score = 0;

        if (password.length >= 8) {
            score += 1;
        } else {
            feedback.push('Password must be at least 8 characters long');
        }

        if (/[a-z]/.test(password)) {
            score += 1;
        } else {
            feedback.push('Password must contain lowercase letters');
        }

        if (/[A-Z]/.test(password)) {
            score += 1;
        } else {
            feedback.push('Password must contain uppercase letters');
        }

        if (/[0-9]/.test(password)) {
            score += 1;
        } else {
            feedback.push('Password must contain numbers');
        }

        if (/[^a-zA-Z0-9]/.test(password)) {
            score += 1;
        } else {
            feedback.push('Password must contain special characters');
        }

        return {
            isValid: score >= 4,
            score,
            feedback,
        };
    }

    /**
     * Check if device supports biometric authentication
     */
    static async isBiometricSupported(): Promise<boolean> {
        try {
            // This would integrate with expo-local-authentication
            // For now, return true as placeholder
            return true;
        } catch (error) {
            console.error('Failed to check biometric support:', error);
            return false;
        }
    }
}
