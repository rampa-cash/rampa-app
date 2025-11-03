import { Transaction } from '../../types/Transaction';
import { BaseApiClient } from '../baseApiClient';

/**
 * Transaction API Client
 *
 * Handles all transaction-related API endpoints
 */
export interface CreateTransactionRequest {
    recipientId?: string;
    recipientAddress: string;
    amount: number;
    currency: 'SOL' | 'USDC' | 'EURC';
    notes?: string;
}

export interface TransactionHistoryResponse {
    transactions: Transaction[];
    total: number;
    page: number;
    limit: number;
}

export class TransactionApiClient extends BaseApiClient {
    /**
     * Get list of transactions
     */
    async getTransactions(params?: {
        limit?: number;
        offset?: number;
        status?: string;
    }) {
        const queryParams: Record<string, string | number | undefined> = {};
        
        if (params?.limit) queryParams.limit = params.limit;
        if (params?.offset) queryParams.offset = params.offset;
        if (params?.status) queryParams.status = params.status;

        const query = this.buildQueryString(queryParams);
        const endpoint = query ? `/transactions?${query}` : '/transactions';

        return this.request<Transaction[]>(endpoint);
    }

    /**
     * Create a new transaction
     */
    async createTransaction(data: CreateTransactionRequest) {
        return this.request<Transaction>('/transactions', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    }

    /**
     * Get transaction by ID
     */
    async getTransaction(id: string) {
        return this.request<Transaction>(`/transactions/${id}`);
    }

    /**
     * Get transaction history with pagination
     */
    async getTransactionHistory(params?: {
        page?: number;
        limit?: number;
        status?: string;
        currency?: string;
    }) {
        const queryParams: Record<string, string | number | undefined> = {};
        
        if (params?.page) queryParams.page = params.page;
        if (params?.limit) queryParams.limit = params.limit;
        if (params?.status) queryParams.status = params.status;
        if (params?.currency) queryParams.currency = params.currency;

        const query = this.buildQueryString(queryParams);
        const endpoint = query ? `/transactions?${query}` : '/transactions';

        return this.request<TransactionHistoryResponse>(endpoint);
    }

    /**
     * Get transaction status
     */
    async getTransactionStatus(transactionId: string) {
        return this.request<{
            status: string;
            blockchainTxHash?: string;
            completedAt?: string;
        }>(`/transactions/${transactionId}/status`);
    }

    /**
     * Cancel a pending transaction
     */
    async cancelTransaction(transactionId: string) {
        return this.request<Transaction>(`/transactions/${transactionId}/cancel`, {
            method: 'POST',
        });
    }

    /**
     * Get wallet balance
     */
    async getWalletBalance() {
        return this.request<{
            balances: Array<{
                currency: string;
                amount: number;
                lastUpdated: string;
            }>;
            totalValue: number;
        }>('/wallet/balance');
    }

    /**
     * Get transaction fees estimate
     */
    async getTransactionFees(amount: number, currency: string) {
        return this.request<{
            networkFee: number;
            serviceFee: number;
            totalFee: number;
            estimatedTime: string;
        }>('/transactions/fees', {
            method: 'POST',
            body: JSON.stringify({ amount, currency }),
        });
    }

    /**
     * Validate recipient address
     */
    async validateRecipientAddress(address: string) {
        return this.request<{
            isValid: boolean;
            isRegistered: boolean;
            userName?: string;
        }>('/transactions/validate-recipient', {
            method: 'POST',
            body: JSON.stringify({ address }),
        });
    }

    /**
     * Get transaction limits
     */
    async getTransactionLimits() {
        return this.request<{
            dailyLimit: number;
            monthlyLimit: number;
            singleTransactionLimit: number;
            remainingDaily: number;
            remainingMonthly: number;
        }>('/transactions/limits');
    }
}

export const transactionApiClient = new TransactionApiClient();

