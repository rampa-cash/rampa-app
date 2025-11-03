export interface Wallet {
    id: string;
    userId: string;
    paraWalletId: string;
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
