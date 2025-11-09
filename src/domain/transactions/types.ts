export interface Transaction {
    id: string;
    senderId: string;
    recipientId?: string;
    senderWalletId: string;
    recipientAddress: string;
    amount: number;
    currency: 'SOL' | 'USDC' | 'EURC';
    status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';
    blockchainTxHash?: string;
    fees: number;
    exchangeRate?: number;
    notes?: string;
    createdAt: Date;
    updatedAt: Date;
    completedAt?: Date;
}
