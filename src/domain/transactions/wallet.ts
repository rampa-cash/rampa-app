export type WalletProviderType = 'para' | 'web3auth' | 'phantom' | 'solflare';

export interface Wallet {
    id: string;
    userId: string;
    providerWalletId: string; // Changed from paraWalletId to be provider-agnostic
    provider: WalletProviderType;
    address: string;
    balances: WalletBalance[];
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}

export interface WalletBalance {
    currency: 'SOL' | 'USDC' | 'EURC';
    amount: number;
    lastUpdated: Date;
}
