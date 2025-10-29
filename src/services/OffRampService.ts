import { apiClient } from '../lib/apiClient';
import {
    BankAccount,
    OffRampEstimate,
    OffRampInitiateRequest,
    OffRampTransaction,
} from '../types/OffRampTransaction';
import { biometricAuth } from '../utils/biometricAuth';
import { logger } from '../utils/errorHandler';

export interface OffRampResponse {
    success: boolean;
    transaction?: OffRampTransaction;
    error?: string;
}

export class OffRampService {
    /**
     * Initiate off-ramp transaction (crypto to fiat)
     */
    async initiateOffRamp(
        request: OffRampInitiateRequest
    ): Promise<OffRampResponse> {
        try {
            logger.info('Initiating off-ramp transaction', { request });

            // Authenticate with biometrics for sensitive operations
            const authResult =
                await biometricAuth.authenticateForSensitiveOperation(
                    `Withdraw ${request.tokenAmount} ${request.tokenType} to bank account`
                );

            if (!authResult.success) {
                return {
                    success: false,
                    error: 'Biometric authentication required for off-ramp transactions',
                };
            }

            const response = await apiClient.request<OffRampTransaction>(
                '/offramp/initiate',
                {
                    method: 'POST',
                    body: JSON.stringify(request),
                }
            );

            return {
                success: true,
                transaction: response.data,
            };
        } catch (error) {
            logger.error('Failed to initiate off-ramp transaction', {
                error,
                request,
            });
            return {
                success: false,
                error:
                    error instanceof Error
                        ? error.message
                        : 'Failed to initiate off-ramp transaction',
            };
        }
    }

    /**
     * Get off-ramp estimate before initiating transaction
     */
    async getOffRampEstimate(
        tokenAmount: number,
        tokenType: 'SOL' | 'USDC' | 'EURC',
        currency: string
    ): Promise<OffRampEstimate | null> {
        try {
            logger.info('Getting off-ramp estimate', {
                tokenAmount,
                tokenType,
                currency,
            });

            const response = await apiClient.request<OffRampEstimate>(
                '/offramp/estimate',
                {
                    method: 'POST',
                    body: JSON.stringify({ tokenAmount, tokenType, currency }),
                }
            );

            return response.data;
        } catch (error) {
            logger.error('Failed to get off-ramp estimate', {
                error,
                tokenAmount,
                tokenType,
                currency,
            });
            return null;
        }
    }

    /**
     * Get off-ramp transaction status
     */
    async getOffRampStatus(
        transactionId: string
    ): Promise<OffRampTransaction | null> {
        try {
            logger.info('Getting off-ramp transaction status', {
                transactionId,
            });

            const response = await apiClient.request<OffRampTransaction>(
                `/offramp/${transactionId}`
            );

            return response.data;
        } catch (error) {
            logger.error('Failed to get off-ramp transaction status', {
                error,
                transactionId,
            });
            return null;
        }
    }

    /**
     * Cancel off-ramp transaction
     */
    async cancelOffRamp(
        transactionId: string
    ): Promise<{ success: boolean; error?: string }> {
        try {
            logger.info('Cancelling off-ramp transaction', { transactionId });

            await apiClient.request(`/offramp/${transactionId}/cancel`, {
                method: 'POST',
            });

            return { success: true };
        } catch (error) {
            logger.error('Failed to cancel off-ramp transaction', {
                error,
                transactionId,
            });
            return {
                success: false,
                error:
                    error instanceof Error
                        ? error.message
                        : 'Failed to cancel off-ramp transaction',
            };
        }
    }

    /**
     * Get user's off-ramp transaction history
     */
    async getOffRampHistory(params?: {
        limit?: number;
        offset?: number;
        status?: string;
    }): Promise<OffRampTransaction[]> {
        try {
            logger.info('Getting off-ramp transaction history', { params });

            const queryParams = new URLSearchParams();
            if (params?.limit)
                queryParams.append('limit', params.limit.toString());
            if (params?.offset)
                queryParams.append('offset', params.offset.toString());
            if (params?.status) queryParams.append('status', params.status);

            const query = queryParams.toString();
            const endpoint = query
                ? `/offramp/history?${query}`
                : '/offramp/history';

            const response =
                await apiClient.request<OffRampTransaction[]>(endpoint);
            return response.data;
        } catch (error) {
            logger.error('Failed to get off-ramp transaction history', {
                error,
            });
            throw new Error('Failed to get off-ramp transaction history');
        }
    }

    /**
     * Add bank account for off-ramp withdrawals
     */
    async addBankAccount(
        bankDetails: BankAccount
    ): Promise<{
        success: boolean;
        bankAccount?: BankAccount;
        error?: string;
    }> {
        try {
            logger.info('Adding bank account', { bankDetails });

            const response = await apiClient.request<BankAccount>(
                '/offramp/bank-accounts',
                {
                    method: 'POST',
                    body: JSON.stringify(bankDetails),
                }
            );

            return {
                success: true,
                bankAccount: response.data,
            };
        } catch (error) {
            logger.error('Failed to add bank account', { error, bankDetails });
            return {
                success: false,
                error:
                    error instanceof Error
                        ? error.message
                        : 'Failed to add bank account',
            };
        }
    }

    /**
     * Get user's bank accounts
     */
    async getBankAccounts(): Promise<BankAccount[]> {
        try {
            logger.info('Getting user bank accounts');

            const response = await apiClient.request<BankAccount[]>(
                '/offramp/bank-accounts'
            );
            return response.data;
        } catch (error) {
            logger.error('Failed to get bank accounts', { error });
            throw new Error('Failed to get bank accounts');
        }
    }

    /**
     * Delete bank account
     */
    async deleteBankAccount(
        accountId: string
    ): Promise<{ success: boolean; error?: string }> {
        try {
            logger.info('Deleting bank account', { accountId });

            await apiClient.request(`/offramp/bank-accounts/${accountId}`, {
                method: 'DELETE',
            });

            return { success: true };
        } catch (error) {
            logger.error('Failed to delete bank account', { error, accountId });
            return {
                success: false,
                error:
                    error instanceof Error
                        ? error.message
                        : 'Failed to delete bank account',
            };
        }
    }

    /**
     * Get exchange rate for off-ramp conversion
     */
    async getExchangeRate(
        tokenType: 'SOL' | 'USDC' | 'EURC',
        currency: string
    ): Promise<number> {
        try {
            logger.info('Getting off-ramp exchange rate', {
                tokenType,
                currency,
            });

            const response = await apiClient.request<{ rate: number }>(
                `/offramp/exchange-rate?tokenType=${tokenType}&currency=${currency}`
            );

            return response.data.rate;
        } catch (error) {
            logger.error('Failed to get off-ramp exchange rate', {
                error,
                tokenType,
                currency,
            });
            return 0;
        }
    }
}

export const offRampService = new OffRampService();
