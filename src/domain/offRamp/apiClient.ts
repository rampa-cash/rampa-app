import { BaseApiClient } from '../../shared/lib/baseApiClient';
import {
    BankAccount,
    OffRampEstimate,
    OffRampInitiateRequest,
    OffRampTransaction,
} from './types';

/**
 * Off-Ramp API Client
 *
 * Handles all off-ramp (crypto to fiat) transaction API endpoints
 */
export class OffRampApiClient extends BaseApiClient {
    /**
     * Initiate off-ramp transaction
     */
    async initiateOffRamp(request: OffRampInitiateRequest) {
        return this.request<OffRampTransaction>('/offramp/initiate', {
            method: 'POST',
            body: JSON.stringify(request),
        });
    }

    /**
     * Get off-ramp estimate before initiating
     */
    async getOffRampEstimate(params: {
        tokenAmount: number;
        tokenType: 'SOL' | 'USDC' | 'EURC';
        currency: string;
    }) {
        return this.request<OffRampEstimate>('/offramp/estimate', {
            method: 'POST',
            body: JSON.stringify(params),
        });
    }

    /**
     * Get off-ramp transaction status
     */
    async getOffRampStatus(transactionId: string) {
        return this.request<OffRampTransaction>(`/offramp/${transactionId}`);
    }

    /**
     * Cancel off-ramp transaction
     */
    async cancelOffRamp(transactionId: string) {
        return this.request<void>(`/offramp/${transactionId}/cancel`, {
            method: 'POST',
        });
    }

    /**
     * Get off-ramp transaction history
     */
    async getOffRampHistory(params?: {
        limit?: number;
        offset?: number;
        status?: string;
    }) {
        const queryParams: Record<string, string | number | undefined> = {};
        
        if (params?.limit) queryParams.limit = params.limit;
        if (params?.offset) queryParams.offset = params.offset;
        if (params?.status) queryParams.status = params.status;

        const query = this.buildQueryString(queryParams);
        const endpoint = query
            ? `/offramp/history?${query}`
            : '/offramp/history';

        return this.request<OffRampTransaction[]>(endpoint);
    }

    /**
     * Add bank account for off-ramp withdrawals
     */
    async addBankAccount(bankDetails: Omit<BankAccount, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) {
        return this.request<BankAccount>('/offramp/bank-accounts', {
            method: 'POST',
            body: JSON.stringify(bankDetails),
        });
    }

    /**
     * Get user's bank accounts
     */
    async getBankAccounts() {
        return this.request<BankAccount[]>('/offramp/bank-accounts');
    }

    /**
     * Delete bank account
     */
    async deleteBankAccount(accountId: string) {
        return this.request<void>(`/offramp/bank-accounts/${accountId}`, {
            method: 'DELETE',
        });
    }

    /**
     * Get exchange rate for off-ramp conversion
     */
    async getExchangeRate(
        tokenType: 'SOL' | 'USDC' | 'EURC',
        currency: string
    ) {
        return this.request<{ rate: number }>(
            `/offramp/exchange-rate?tokenType=${tokenType}&currency=${currency}`
        );
    }
}

export const offRampApiClient = new OffRampApiClient();

