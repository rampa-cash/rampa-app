/**
 * Para Wallet Provider (Adapter)
 *
 * Implements WalletProvider interface using Para SDK
 */

import { ParaMobile } from '@getpara/react-native-wallet';
import { Wallet } from '../../../../domain/transactions/wallet';
import { WalletProvider } from '../../ports/WalletProvider';
import { para } from './paraClient';

export class ParaWalletProvider implements WalletProvider {
    constructor(private paraClient: ParaMobile = para) {}

    async initialize(): Promise<void> {
        try {
            await this.paraClient.init();
        } catch (error) {
            console.error('Failed to initialize Para SDK:', error);
            throw new Error('Para SDK initialization failed');
        }
    }

    async createWallet(): Promise<Wallet> {
        try {
            // TODO: Implement with actual Para SDK API
            // Para SDK creates MPC wallet automatically on init
            // Get wallet address and public key after initialization
            // Example:
            // const address = await this.getWalletAddress();
            // const walletId = await this.getWalletId();

            // Temporary: throw error until Para SDK integration is complete
            throw new Error(
                'Para SDK integration pending: createWallet needs implementation'
            );
        } catch (error) {
            console.error('Failed to create wallet:', error);
            throw new Error('Failed to create wallet');
        }
    }

    async getWalletAddress(): Promise<string> {
        try {
            // TODO: Implement with actual Para SDK API
            // Check Para SDK documentation for the correct method to get wallet address
            // Example: return this.paraClient.getWalletAddress() || '';

            // Temporary: throw error until Para SDK integration is complete
            throw new Error(
                'Para SDK integration pending: getWalletAddress needs implementation'
            );
        } catch (error) {
            console.error('Failed to get wallet address:', error);
            throw new Error('Failed to get wallet address');
        }
    }

    async getWalletPublicKey(): Promise<string> {
        try {
            // TODO: Implement with actual Para SDK API
            // Check Para SDK documentation for the correct method to get wallet public key
            // Example: return this.paraClient.getPublicKey() || '';

            // Temporary: throw error until Para SDK integration is complete
            throw new Error(
                'Para SDK integration pending: getWalletPublicKey needs implementation'
            );
        } catch (error) {
            console.error('Failed to get wallet public key:', error);
            throw new Error('Failed to get wallet public key');
        }
    }

    async importSession(sessionToken: string): Promise<void> {
        try {
            // TODO: Implement with actual Para SDK API
            // Check Para SDK documentation for the correct method to import session
            // Example: await this.paraClient.importSession(sessionToken);

            // Temporary: throw error until Para SDK integration is complete
            throw new Error(
                'Para SDK integration pending: importSession needs implementation'
            );
        } catch (error) {
            console.error('Failed to import session:', error);
            throw new Error('Failed to import session');
        }
    }

    async getSessionToken(): Promise<string | null> {
        try {
            // TODO: Implement with actual Para SDK API
            // Check Para SDK documentation for the correct method to get session token
            // Example: return this.paraClient.getSessionToken() || null;

            // Temporary: return null until Para SDK integration is complete
            console.warn(
                'Para SDK integration pending: getSessionToken needs implementation'
            );
            return null;
        } catch (error) {
            console.error('Failed to get session token:', error);
            return null;
        }
    }

    async getWalletId(): Promise<string | null> {
        try {
            // TODO: Implement with actual Para SDK API
            // Check Para SDK documentation for the correct method to get wallet ID
            // This might be the same as userId or a separate identifier
            // Example: return this.paraClient.getWalletId() || null;

            // Temporary: return null until Para SDK integration is complete
            console.warn(
                'Para SDK integration pending: getWalletId needs implementation'
            );
            return null;
        } catch (error) {
            console.error('Failed to get wallet ID:', error);
            return null;
        }
    }
}
