/**
 * Provider Factory
 *
 * Creates and returns the appropriate provider instances based on configuration.
 * Uses environment variables to determine which provider to use.
 */

import { MockAuthProvider } from '../adapters/mock/MockAuthProvider';
import { MockWalletProvider } from '../adapters/mock/MockWalletProvider';
import { ParaAuthProvider } from '../adapters/para/ParaAuthProvider';
import { ParaWalletProvider } from '../adapters/para/ParaWalletProvider';
import { AuthProvider } from '../ports/AuthProvider';
import { WalletProvider } from '../ports/WalletProvider';

export type AuthProviderType = 'para' | 'mock';
export type WalletProviderType = 'para' | 'mock';

/**
 * Get auth provider type from environment or default to 'para'
 */
const getAuthProviderType = (): AuthProviderType => {
    const provider = process.env.EXPO_PUBLIC_AUTH_PROVIDER?.toLowerCase();
    if (provider === 'mock') {
        return 'mock';
    }
    return 'para'; // Default to Para
};

/**
 * Get wallet provider type from environment or default to 'para'
 */
const getWalletProviderType = (): WalletProviderType => {
    const provider = process.env.EXPO_PUBLIC_WALLET_PROVIDER?.toLowerCase();
    if (provider === 'mock') {
        return 'mock';
    }
    return 'para'; // Default to Para
};

/**
 * Provider Factory
 *
 * Creates provider instances based on configuration.
 * Supports both environment-based and explicit provider selection.
 */
export class ProviderFactory {
    /**
     * Create authentication provider
     *
     * @param providerType - Optional provider type override (for testing)
     * @returns AuthProvider instance
     */
    static createAuthProvider(providerType?: AuthProviderType): AuthProvider {
        const type = providerType || getAuthProviderType();

        switch (type) {
            case 'para':
                return new ParaAuthProvider();
            case 'mock':
                return new MockAuthProvider();
            default:
                throw new Error(`Unknown auth provider type: ${type}`);
        }
    }

    /**
     * Create wallet provider
     *
     * @param providerType - Optional provider type override (for testing)
     * @returns WalletProvider instance
     */
    static createWalletProvider(
        providerType?: WalletProviderType
    ): WalletProvider {
        const type = providerType || getWalletProviderType();

        switch (type) {
            case 'para':
                return new ParaWalletProvider();
            case 'mock':
                return new MockWalletProvider();
            default:
                throw new Error(`Unknown wallet provider type: ${type}`);
        }
    }

    /**
     * Initialize all providers
     *
     * Call this during app startup to initialize the selected providers
     */
    static async initializeProviders(): Promise<void> {
        const authProvider = ProviderFactory.createAuthProvider();
        const walletProvider = ProviderFactory.createWalletProvider();

        await Promise.all([
            authProvider.initialize(),
            walletProvider.initialize(),
        ]);
    }
}
