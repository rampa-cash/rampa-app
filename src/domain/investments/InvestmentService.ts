import { biometricAuth } from '../../shared/utils/biometricAuth';
import { logger } from '../../shared/utils/errorHandler';
import { investmentApiClient } from './apiClient';
import {
    CreateInvestmentRequest,
    InvestmentOption,
    InvestmentPerformance,
    InvestmentStats,
    UserInvestment,
    WithdrawInvestmentRequest,
} from './types';

export interface InvestmentResponse {
    success: boolean;
    investment?: UserInvestment;
    error?: string;
}

export interface InvestmentOptionsResponse {
    success: boolean;
    options?: InvestmentOption[];
    error?: string;
}

export interface InvestmentStatsResponse {
    success: boolean;
    stats?: InvestmentStats;
    error?: string;
}

export class InvestmentService {
    /**
     * Get all available investment options
     */
    async getInvestmentOptions(params?: {
        type?: string;
        riskLevel?: string;
        limit?: number;
        offset?: number;
    }): Promise<InvestmentOption[]> {
        try {
            logger.info('Fetching investment options', { params });

            const response = await investmentApiClient.getInvestmentOptions(params);
            return response.data;
        } catch (error) {
            logger.error('Failed to fetch investment options', { error });
            throw new Error('Failed to fetch investment options');
        }
    }

    /**
     * Get investment option by ID
     */
    async getInvestmentOptionById(id: string): Promise<InvestmentOption> {
        try {
            logger.info('Fetching investment option by ID', { id });

            const response = await investmentApiClient.getInvestmentOptionById(id);
            return response.data;
        } catch (error) {
            logger.error('Failed to fetch investment option by ID', {
                error,
                id,
            });
            throw new Error('Failed to fetch investment option');
        }
    }

    /**
     * Get investment options by type
     */
    async getInvestmentOptionsByType(
        type: string
    ): Promise<InvestmentOption[]> {
        try {
            logger.info('Fetching investment options by type', { type });

            const response = await investmentApiClient.getInvestmentOptionsByType(type);
            return response.data;
        } catch (error) {
            logger.error('Failed to fetch investment options by type', {
                error,
                type,
            });
            throw new Error('Failed to fetch investment options');
        }
    }

    /**
     * Get investment options by risk level
     */
    async getInvestmentOptionsByRiskLevel(
        riskLevel: string
    ): Promise<InvestmentOption[]> {
        try {
            logger.info('Fetching investment options by risk level', {
                riskLevel,
            });

            const response = await investmentApiClient.getInvestmentOptionsByRiskLevel(riskLevel);
            return response.data;
        } catch (error) {
            logger.error('Failed to fetch investment options by risk level', {
                error,
                riskLevel,
            });
            throw new Error('Failed to fetch investment options');
        }
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
    ): Promise<InvestmentOption[]> {
        try {
            logger.info('Searching investment options', { query, filters });

            const response = await investmentApiClient.searchInvestmentOptions(query, filters);
            return response.data;
        } catch (error) {
            logger.error('Failed to search investment options', {
                error,
                query,
            });
            throw new Error('Failed to search investment options');
        }
    }

    /**
     * Get user's investments
     */
    async getUserInvestments(): Promise<UserInvestment[]> {
        try {
            logger.info('Fetching user investments');

            const response = await investmentApiClient.getUserInvestments();
            return response.data;
        } catch (error) {
            logger.error('Failed to fetch user investments', { error });
            throw new Error('Failed to fetch user investments');
        }
    }

    /**
     * Create new investment
     */
    async createInvestment(
        request: CreateInvestmentRequest
    ): Promise<InvestmentResponse> {
        try {
            logger.info('Creating new investment', { request });

            // Authenticate with biometrics for sensitive operations
            const authResult =
                await biometricAuth.authenticateForSensitiveOperation(
                    `invest ${request.amount} ${request.currency}`
                );

            if (!authResult.success) {
                return {
                    success: false,
                    error: 'Biometric authentication required for investments',
                };
            }

            const response = await investmentApiClient.createInvestment(request);

            return {
                success: true,
                investment: response.data,
            };
        } catch (error) {
            logger.error('Failed to create investment', { error, request });
            return {
                success: false,
                error:
                    error instanceof Error
                        ? error.message
                        : 'Failed to create investment',
            };
        }
    }

    /**
     * Get user investment by ID
     */
    async getUserInvestmentById(id: string): Promise<UserInvestment> {
        try {
            logger.info('Fetching user investment by ID', { id });

            const response = await investmentApiClient.getUserInvestmentById(id);
            return response.data;
        } catch (error) {
            logger.error('Failed to fetch user investment by ID', {
                error,
                id,
            });
            throw new Error('Failed to fetch user investment');
        }
    }

    /**
     * Withdraw from investment
     */
    async withdrawFromInvestment(
        id: string,
        request: WithdrawInvestmentRequest
    ): Promise<InvestmentResponse> {
        try {
            logger.info('Withdrawing from investment', { id, request });

            // Authenticate with biometrics for sensitive operations
            const authResult =
                await biometricAuth.authenticateForSensitiveOperation(
                    `withdraw ${request.amount || 'all'} from investment`
                );

            if (!authResult.success) {
                return {
                    success: false,
                    error: 'Biometric authentication required for withdrawals',
                };
            }

            const response = await investmentApiClient.withdrawFromInvestment(id, request);

            return {
                success: true,
                investment: response.data,
            };
        } catch (error) {
            logger.error('Failed to withdraw from investment', {
                error,
                id,
                request,
            });
            return {
                success: false,
                error:
                    error instanceof Error
                        ? error.message
                        : 'Failed to withdraw from investment',
            };
        }
    }

    /**
     * Get investment statistics
     */
    async getInvestmentStats(): Promise<InvestmentStatsResponse> {
        try {
            logger.info('Fetching investment statistics');

            const response = await investmentApiClient.getInvestmentStats();

            return {
                success: true,
                stats: response.data,
            };
        } catch (error) {
            logger.error('Failed to fetch investment statistics', { error });
            return {
                success: false,
                error:
                    error instanceof Error
                        ? error.message
                        : 'Failed to fetch investment statistics',
            };
        }
    }

    /**
     * Get investment performance
     */
    async getInvestmentPerformance(
        investmentId?: string,
        period?: string
    ): Promise<InvestmentPerformance[]> {
        try {
            logger.info('Fetching investment performance', {
                investmentId,
                period,
            });

            const response = await investmentApiClient.getInvestmentPerformance(
                investmentId,
                period
            );
            return response.data;
        } catch (error) {
            logger.error('Failed to fetch investment performance', {
                error,
                investmentId,
                period,
            });
            throw new Error('Failed to fetch investment performance');
        }
    }

    /**
     * Get investment recommendations based on user profile
     */
    async getInvestmentRecommendations(): Promise<InvestmentOption[]> {
        try {
            logger.info('Fetching investment recommendations');

            const response = await investmentApiClient.getInvestmentRecommendations();
            return response.data;
        } catch (error) {
            logger.error('Failed to fetch investment recommendations', {
                error,
            });
            throw new Error('Failed to fetch investment recommendations');
        }
    }

    /**
     * Calculate investment returns
     */
    async calculateInvestmentReturns(
        investmentId: string,
        amount: number,
        period: number
    ): Promise<{
        projectedValue: number;
        projectedReturn: number;
        projectedReturnPercentage: number;
    }> {
        try {
            logger.info('Calculating investment returns', {
                investmentId,
                amount,
                period,
            });

            const response = await investmentApiClient.calculateInvestmentReturns(
                investmentId,
                amount,
                period
            );

            return response.data;
        } catch (error) {
            logger.error('Failed to calculate investment returns', {
                error,
                investmentId,
                amount,
                period,
            });
            throw new Error('Failed to calculate investment returns');
        }
    }
}

export const investmentService = new InvestmentService();
