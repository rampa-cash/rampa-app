export interface OffRampTransaction {
    id: string;
    userId: string;
    walletId: string;
    tokenType: 'SOL' | 'USDC' | 'EURC';
    tokenAmount: number;
    fiatAmount: number;
    currency: string;
    status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
    provider: string;
    providerTransactionId?: string;
    exchangeRate?: number;
    fees?: {
        processingFee: number;
        networkFee: number;
        totalFee: number;
    };
    bankDetails?: {
        accountNumber: string;
        bankName: string;
        accountName: string;
        swiftCode?: string;
        iban?: string;
    };
    createdAt: Date;
    completedAt?: Date;
    updatedAt: Date;
    error?: string;
}

export interface OffRampInitiateRequest {
    tokenType: 'SOL' | 'USDC' | 'EURC';
    tokenAmount: number;
    currency: string;
    bankDetails: {
        accountNumber: string;
        bankName: string;
        accountName: string;
        swiftCode?: string;
        iban?: string;
    };
}

export interface OffRampEstimate {
    tokenAmount: number;
    tokenType: 'SOL' | 'USDC' | 'EURC';
    fiatAmount: number;
    fiatCurrency: string;
    exchangeRate: number;
    fees: {
        processingFee: number;
        networkFee: number;
        totalFee: number;
    };
    estimatedReceive: number;
}

export interface BankAccount {
    id: string;
    userId: string;
    accountNumber: string;
    bankName: string;
    accountName: string;
    swiftCode?: string;
    iban?: string;
    currency: string;
    country: string;
    isVerified: boolean;
    isDefault: boolean;
    createdAt: Date;
    updatedAt: Date;
}

