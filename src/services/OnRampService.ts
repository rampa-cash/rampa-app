import { onRampApiClient } from '../lib';
import {
    OnRampEstimate,
    OnRampInitiateRequest,
    OnRampTransaction,
} from '../types/OnRampTransaction';
import { biometricAuth } from '../utils/biometricAuth';
import { logger } from '../utils/errorHandler';

export interface OnRampResponse {
    success: boolean;
    transaction?: OnRampTransaction;
    error?: string;
}

export class OnRampService {
    /**
     * Initiate on-ramp transaction (fiat to crypto)
     */
    async initiateOnRamp(
        request: OnRampInitiateRequest
    ): Promise<OnRampResponse> {
        try {
            logger.info('Initiating on-ramp transaction', { request });

            // Authenticate with biometrics for sensitive operations
            const authResult =
                await biometricAuth.authenticateForSensitiveOperation(
                    `Convert ${request.amount} ${request.currency} to ${request.tokenType}`
                );

            if (!authResult.success) {
                return {
                    success: false,
                    error: 'Biometric authentication required for on-ramp transactions',
                };
            }

            const response = await onRampApiClient.initiateOnRamp(request);

            return {
                success: true,
                transaction: response.data,
            };
        } catch (error) {
            logger.error('Failed to initiate on-ramp transaction', {
                error,
                request,
            });
            return {
                success: false,
                error:
                    error instanceof Error
                        ? error.message
                        : 'Failed to initiate on-ramp transaction',
            };
        }
    }

    /**
     * Get on-ramp estimate before initiating transaction
     */
    async getOnRampEstimate(
        amount: number,
        currency: string,
        tokenType: 'SOL' | 'USDC' | 'EURC'
    ): Promise<OnRampEstimate | null> {
        try {
            logger.info('Getting on-ramp estimate', {
                amount,
                currency,
                tokenType,
            });

            const response = await onRampApiClient.getOnRampEstimate({
                amount,
                currency,
                tokenType,
            });

            return response.data;
        } catch (error) {
            logger.error('Failed to get on-ramp estimate', {
                error,
                amount,
                currency,
                tokenType,
            });
            return null;
        }
    }

    /**
     * Get on-ramp transaction status
     */
    async getOnRampStatus(
        transactionId: string
    ): Promise<OnRampTransaction | null> {
        try {
            logger.info('Getting on-ramp transaction status', {
                transactionId,
            });

            const response = await onRampApiClient.getOnRampStatus(transactionId);

            return response.data;
        } catch (error) {
            logger.error('Failed to get on-ramp transaction status', {
                error,
                transactionId,
            });
            return null;
        }
    }

    /**
     * Cancel on-ramp transaction
     */
    async cancelOnRamp(
        transactionId: string
    ): Promise<{ success: boolean; error?: string }> {
        try {
            logger.info('Cancelling on-ramp transaction', { transactionId });

            await onRampApiClient.cancelOnRamp(transactionId);

            return { success: true };
        } catch (error) {
            logger.error('Failed to cancel on-ramp transaction', {
                error,
                transactionId,
            });
            return {
                success: false,
                error:
                    error instanceof Error
                        ? error.message
                        : 'Failed to cancel on-ramp transaction',
            };
        }
    }

    /**
     * Get user's on-ramp transaction history
     */
    async getOnRampHistory(params?: {
        limit?: number;
        offset?: number;
        status?: string;
    }): Promise<OnRampTransaction[]> {
        try {
            logger.info('Getting on-ramp transaction history', { params });

            const response = await onRampApiClient.getOnRampHistory(params);
            return response.data;
        } catch (error) {
            logger.error('Failed to get on-ramp transaction history', {
                error,
            });
            throw new Error('Failed to get on-ramp transaction history');
        }
    }

    /**
     * Get supported currencies for on-ramp
     */
    async getSupportedCurrencies(): Promise<string[]> {
        try {
            logger.info('Getting supported on-ramp currencies');

            const response =
                await onRampApiClient.getSupportedCurrencies();
            return response.data;
        } catch (error) {
            logger.error('Failed to get supported on-ramp currencies', {
                error,
            });
            return ['USD', 'EUR', 'GBP']; // Fallback
        }
    }

    /**
     * Get exchange rate for on-ramp conversion
     */
    async getExchangeRate(
        currency: string,
        tokenType: 'SOL' | 'USDC' | 'EURC'
    ): Promise<number> {
        try {
            logger.info('Getting on-ramp exchange rate', {
                currency,
                tokenType,
            });

            const response = await onRampApiClient.getExchangeRate(currency, tokenType);

            return response.data.rate;
        } catch (error) {
            logger.error('Failed to get on-ramp exchange rate', {
                error,
                currency,
                tokenType,
            });
            return 0;
        }
    }
}

export const onRampService = new OnRampService();
