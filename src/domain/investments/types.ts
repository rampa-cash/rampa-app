export interface InvestmentOption {
    id: string;
    name: string;
    description: string;
    type: 'stocks' | 'bonds' | 'etf' | 'crypto' | 'real_estate' | 'commodities';
    riskLevel: 'low' | 'medium' | 'high';
    expectedReturn: number; // Annual percentage
    minimumAmount: number;
    maximumAmount?: number;
    fees: {
        managementFee: number; // Annual percentage
        transactionFee?: number; // Per transaction
        withdrawalFee?: number; // Per withdrawal
    };
    liquidity: 'high' | 'medium' | 'low';
    lockPeriod?: number; // Days
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}

export interface UserInvestment {
    id: string;
    userId: string;
    investmentOptionId: string;
    investmentOption: InvestmentOption;
    amount: number;
    currency: 'USD' | 'EUR' | 'GBP';
    status: 'active' | 'pending' | 'withdrawn' | 'matured';
    currentValue: number;
    totalReturn: number;
    totalReturnPercentage: number;
    investedAt: Date;
    maturityDate?: Date;
    withdrawnAt?: Date;
    createdAt: Date;
    updatedAt: Date;
}

export interface InvestmentPerformance {
    investmentId: string;
    period: '1d' | '1w' | '1m' | '3m' | '6m' | '1y' | 'all';
    value: number;
    return: number;
    returnPercentage: number;
    timestamp: Date;
}

export interface InvestmentStats {
    totalInvested: number;
    totalValue: number;
    totalReturn: number;
    totalReturnPercentage: number;
    activeInvestments: number;
    averageReturn: number;
    bestPerformer: {
        investmentId: string;
        name: string;
        returnPercentage: number;
    };
    worstPerformer: {
        investmentId: string;
        name: string;
        returnPercentage: number;
    };
}

export interface CreateInvestmentRequest {
    investmentOptionId: string;
    amount: number;
    currency: 'USD' | 'EUR' | 'GBP';
}

export interface WithdrawInvestmentRequest {
    amount?: number; // If not provided, withdraw all
    reason?: string;
}
