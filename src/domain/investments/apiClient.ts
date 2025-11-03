import { BaseApiClient } from '../../shared/lib/baseApiClient';
import {
    CreateInvestmentRequest,
    InvestmentOption,
    InvestmentPerformance,
    InvestmentStats,
    UserInvestment,
    WithdrawInvestmentRequest,
} from './types';

/**
 * Investment API Client
 *
 * Handles all investment-related API endpoints
 */
export class InvestmentApiClient extends BaseApiClient {
    /**
     * Get all investment options
     */
    async getInvestmentOptions(params?: {
        type?: string;
        riskLevel?: string;
        limit?: number;
        offset?: number;
    }) {
        const queryParams: Record<string, string | number | undefined> = {};

        if (params?.type) queryParams.type = params.type;
        if (params?.riskLevel) queryParams.riskLevel = params.riskLevel;
        if (params?.limit) queryParams.limit = params.limit;
        if (params?.offset) queryParams.offset = params.offset;

        const query = this.buildQueryString(queryParams);
        const endpoint = query
            ? `/investments/options?${query}`
            : '/investments/options';

        return this.request<InvestmentOption[]>(endpoint);
    }

    /**
     * Get investment option by ID
     */
    async getInvestmentOptionById(id: string) {
        return this.request<InvestmentOption>(`/investments/options/${id}`);
    }

    /**
     * Get investment options by type
     */
    async getInvestmentOptionsByType(type: string) {
        return this.request<InvestmentOption[]>(
            `/investments/options/type/${type}`
        );
    }

    /**
     * Get investment options by risk level
     */
    async getInvestmentOptionsByRiskLevel(riskLevel: string) {
        return this.request<InvestmentOption[]>(
            `/investments/options/risk/${riskLevel}`
        );
    }

    /**
     * Search investment options
     */
    async searchInvestmentOptions(
        query: string,
        filters?: {
            type?: string;
            riskLevel?: string;
            minAmount?: number;
            maxAmount?: number;
        }
    ) {
        const queryParams: Record<string, string | number | undefined> = {
            q: query,
        };

        if (filters?.type) queryParams.type = filters.type;
        if (filters?.riskLevel) queryParams.riskLevel = filters.riskLevel;
        if (filters?.minAmount) queryParams.minAmount = filters.minAmount;
        if (filters?.maxAmount) queryParams.maxAmount = filters.maxAmount;

        const query = this.buildQueryString(queryParams);
        return this.request<InvestmentOption[]>(
            `/investments/options/search?${query}`
        );
    }

    /**
     * Get user's investments
     */
    async getUserInvestments() {
        return this.request<UserInvestment[]>('/investments/user');
    }

    /**
     * Create new investment
     */
    async createInvestment(data: CreateInvestmentRequest) {
        return this.request<UserInvestment>('/investments/user/create', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    }

    /**
     * Get user investment by ID
     */
    async getUserInvestmentById(id: string) {
        return this.request<UserInvestment>(`/investments/user/${id}`);
    }

    /**
     * Withdraw from investment
     */
    async withdrawFromInvestment(id: string, data: WithdrawInvestmentRequest) {
        return this.request<UserInvestment>(
            `/investments/user/${id}/withdraw`,
            {
                method: 'POST',
                body: JSON.stringify(data),
            }
        );
    }

    /**
     * Get investment statistics
     */
    async getInvestmentStats() {
        return this.request<InvestmentStats>('/investments/stats');
    }

    /**
     * Get investment performance
     */
    async getInvestmentPerformance(params?: {
        investmentId?: string;
        period?: string;
    }) {
        const queryParams: Record<string, string | number | undefined> = {};

        if (params?.investmentId)
            queryParams.investmentId = params.investmentId;
        if (params?.period) queryParams.period = params.period;

        const query = this.buildQueryString(queryParams);
        const endpoint = query
            ? `/investments/performance?${query}`
            : '/investments/performance';

        return this.request<InvestmentPerformance[]>(endpoint);
    }

    /**
     * Get investment recommendations
     */
    async getInvestmentRecommendations() {
        return this.request<InvestmentOption[]>('/investments/recommendations');
    }

    /**
     * Calculate investment returns
     */
    async calculateInvestmentReturns(
        investmentId: string,
        amount: number,
        period: number
    ) {
        return this.request<{
            projectedValue: number;
            projectedReturn: number;
            projectedReturnPercentage: number;
        }>('/investments/calculate', {
            method: 'POST',
            body: JSON.stringify({ investmentId, amount, period }),
        });
    }
}

export const investmentApiClient = new InvestmentApiClient();
