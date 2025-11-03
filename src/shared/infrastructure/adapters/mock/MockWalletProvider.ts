/**
 * Mock Wallet Provider (Adapter)
 *
 * Mock implementation for testing purposes.
 * Does not require actual Para SDK or blockchain access.
 */

import { Wallet } from '../../../../domain/transactions/wallet';
import { WalletProvider } from '../../ports/WalletProvider';

export class MockWalletProvider implements WalletProvider {
    private mockWalletId: string | null = null;
    private mockAddress: string | null = null;
    private mockPublicKey: string | null = null;
    private mockSessionToken: string | null = null;
    private isInitialized = false;

    async initialize(): Promise<void> {
        this.isInitialized = true;
    }

    async createWallet(): Promise<Wallet> {
        this.mockWalletId = 'mock-wallet-id';
        this.mockAddress = 'mock-wallet-address-' + Date.now();
        this.mockPublicKey = 'mock-public-key-' + Date.now();

        return {
            id: this.mockWalletId,
            userId: 'mock-user-id',
            providerWalletId: this.mockWalletId,
            provider: 'para',
            address: this.mockAddress,
            balances: [],
            isActive: true,
            createdAt: new Date(),
            updatedAt: new Date(),
        };
    }

    async getWalletAddress(): Promise<string> {
        if (!this.mockAddress) {
            throw new Error('Wallet not initialized');
        }
        return this.mockAddress;
    }

    async getWalletPublicKey(): Promise<string> {
        if (!this.mockPublicKey) {
            throw new Error('Wallet not initialized');
        }
        return this.mockPublicKey;
    }

    async importSession(sessionToken: string): Promise<void> {
        this.mockSessionToken = sessionToken;
    }

    async getSessionToken(): Promise<string | null> {
        return this.mockSessionToken;
    }

    async getWalletId(): Promise<string | null> {
        return this.mockWalletId;
    }

    // Test helpers
    setMockWallet(walletId: string, address: string, publicKey: string): void {
        this.mockWalletId = walletId;
        this.mockAddress = address;
        this.mockPublicKey = publicKey;
    }

    reset(): void {
        this.mockWalletId = null;
        this.mockAddress = null;
        this.mockPublicKey = null;
        this.mockSessionToken = null;
        this.isInitialized = false;
    }
}
