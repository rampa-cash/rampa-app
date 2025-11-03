/**
 * Wallet Provider Port (Interface)
 *
 * Defines the contract for wallet providers.
 * Any wallet provider (Para, Phantom, Solflare, etc.) must implement this interface.
 */

import { Wallet } from '../../../domain/transactions/wallet';

export interface WalletProvider {
    /**
     * Create a new wallet
     */
    createWallet(): Promise<Wallet>;

    /**
     * Get wallet address
     */
    getWalletAddress(): Promise<string>;

    /**
     * Get wallet public key
     */
    getWalletPublicKey(): Promise<string>;

    /**
     * Import session from token
     */
    importSession(sessionToken: string): Promise<void>;

    /**
     * Get current session token
     */
    getSessionToken(): Promise<string | null>;

    /**
     * Get wallet ID (provider-specific identifier)
     */
    getWalletId(): Promise<string | null>;

    /**
     * Initialize the wallet provider
     */
    initialize(): Promise<void>;
}
