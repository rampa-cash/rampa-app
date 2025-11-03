import {
    OnRampEstimate,
    OnRampInitiateRequest,
    OnRampTransaction,
} from '../../types/OnRampTransaction';
import { BaseApiClient } from '../baseApiClient';

/**
 * On-Ramp API Client
 *
 * Handles all on-ramp (fiat to crypto) transaction API endpoints
 */
export class OnRampApiClient extends BaseApiClient {
    /**
     * Initiate on-ramp transaction
     */
    async initiateOnRamp(request: OnRampInitiateRequest) {
        return this.request<OnRampTransaction>('/onramp/initiate', {
            method: 'POST',
            body: JSON.stringify(request),
        });
    }

    /**
     * Get on-ramp estimate before initiating
     */
    async getOnRampEstimate(params: {
        amount: number;
        currency: string;
        tokenType: 'SOL' | 'USDC' | 'EURC';
    }) {
        return this.request<OnRampEstimate>('/onramp/estimate', {
            method: 'POST',
            body: JSON.stringify(params),
        });
    }

    /**
     * Get on-ramp transaction status
     */
    async getOnRampStatus(transactionId: string) {
        return this.request<OnRampTransaction>(`/onramp/${transactionId}`);
    }

    /**
     * Cancel on-ramp transaction
     */
    async cancelOnRamp(transactionId: string) {
        return this.request<void>(`/onramp/${transactionId}/cancel`, {
            method: 'POST',
        });
    }

    /**
     * Get on-ramp transaction history
     */
    async getOnRampHistory(params?: {
        limit?: number;
        offset?: number;
        status?: string;
    }) {
        const queryParams: Record<string, string | number | undefined> = {};
        
        if (params?.limit) queryParams.limit = params.limit;
        if (params?.offset) queryParams.offset = params.offset;
        if (params?.status) queryParams.status = params.status;

        const query = this.buildQueryString(queryParams);
        const endpoint = query ? `/onramp/history?${query}` : '/onramp/history';

        return this.request<OnRampTransaction[]>(endpoint);
    }

    /**
     * Get supported currencies for on-ramp
     */
    async getSupportedCurrencies() {
        return this.request<string[]>('/onramp/currencies');
    }

    /**
     * Get exchange rate for on-ramp conversion
     */
    async getExchangeRate(
        currency: string,
        tokenType: 'SOL' | 'USDC' | 'EURC'
    ) {
        return this.request<{ rate: number }>(
            `/onramp/exchange-rate?currency=${currency}&tokenType=${tokenType}`
        );
    }
}

export const onRampApiClient = new OnRampApiClient();

