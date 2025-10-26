export interface OnRampTransaction {
    id: string;
    userId: string;
    walletId: string;
    amount: number; // Fiat amount
    currency: string; // Fiat currency code (e.g., 'USD', 'EUR')
    tokenType: 'SOL' | 'USDC' | 'EURC';
    tokenAmount: number;
    status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
    provider: string;
    providerTransactionId?: string;
    exchangeRate?: number;
    fees?: {
        processingFee: number;
        networkFee: number;
        totalFee: number;
    };
    createdAt: Date;
    completedAt?: Date;
    updatedAt: Date;
    error?: string;
}

export interface OnRampInitiateRequest {
    amount: number;
    currency: string;
    tokenType: 'SOL' | 'USDC' | 'EURC';
}

export interface OnRampEstimate {
    fiatAmount: number;
    fiatCurrency: string;
    tokenAmount: number;
    tokenType: 'SOL' | 'USDC' | 'EURC';
    exchangeRate: number;
    fees: {
        processingFee: number;
        networkFee: number;
        totalFee: number;
    };
    estimatedReceive: number;
}

