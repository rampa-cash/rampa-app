/**
 * Transaction Service
 *
 * Handles all transaction-related operations including sending money,
 * receiving money, transaction history, and status updates
 */

import { apiClient } from '../lib/apiClient';
import { Transaction } from '../types/Transaction';
import { biometricAuth } from '../utils/biometricAuth';
import { logger } from '../utils/errorHandler';
import { SecurityUtils } from '../utils/securityUtils';

export interface CreateTransactionRequest {
    recipientAddress: string;
    amount: number;
    currency: 'SOL' | 'USDC' | 'EURC';
    notes?: string;
}

export interface TransactionResponse {
    success: boolean;
    transaction?: Transaction;
    error?: string;
}

export interface TransactionHistoryResponse {
    transactions: Transaction[];
    total: number;
    page: number;
    limit: number;
}

export class TransactionService {
    /**
     * Create a new transaction (send money)
     */
    async createTransaction(
        request: CreateTransactionRequest
    ): Promise<TransactionResponse> {
        try {
            // Validate input
            if (!SecurityUtils.isValidAmount(request.amount)) {
                throw new Error('Invalid transaction amount');
            }

            if (!SecurityUtils.isValidCurrency(request.currency)) {
                throw new Error('Invalid currency');
            }

            if (!SecurityUtils.isValidSolanaAddress(request.recipientAddress)) {
                throw new Error('Invalid recipient address');
            }

            logger.info('Creating transaction', {
                amount: request.amount,
                currency: request.currency,
                recipientAddress: SecurityUtils.maskSensitiveData(
                    request.recipientAddress
                ),
            });

            // Authenticate with biometrics for sensitive operations
            const authResult =
                await biometricAuth.authenticateForSensitiveOperation(
                    `send ${request.amount} ${request.currency}`
                );

            if (!authResult.success) {
                throw new Error(
                    'Biometric authentication required for transactions'
                );
            }

            // Generate transaction ID
            const transactionId = SecurityUtils.generateTransactionId();

            // Create transaction data
            const transactionData = {
                id: transactionId,
                recipientAddress: request.recipientAddress,
                amount: request.amount,
                currency: request.currency,
                notes: request.notes || '',
                status: 'pending' as const,
                createdAt: new Date().toISOString(),
            };

            // Call backend API
            const response = await apiClient.request<Transaction>(
                '/transactions',
                {
                    method: 'POST',
                    body: JSON.stringify(transactionData),
                }
            );

            logger.info('Transaction created successfully', { transactionId });

            return {
                success: true,
                transaction: response.data,
            };
        } catch (error) {
            logger.error('Failed to create transaction', { error });
            return {
                success: false,
                error:
                    error instanceof Error
                        ? error.message
                        : 'Transaction failed',
            };
        }
    }

    /**
     * Get transaction history
     */
    async getTransactionHistory(params?: {
        page?: number;
        limit?: number;
        status?: string;
        currency?: string;
    }): Promise<TransactionHistoryResponse> {
        try {
            const queryParams = new URLSearchParams();

            if (params?.page)
                queryParams.append('page', params.page.toString());
            if (params?.limit)
                queryParams.append('limit', params.limit.toString());
            if (params?.status) queryParams.append('status', params.status);
            if (params?.currency)
                queryParams.append('currency', params.currency);

            const endpoint = `/transactions${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;

            const response =
                await apiClient.request<TransactionHistoryResponse>(endpoint, {
                    method: 'GET',
                });

            logger.info('Transaction history retrieved', {
                count: response.data.transactions.length,
                page: response.data.page,
            });

            return response.data;
        } catch (error) {
            logger.error('Failed to get transaction history', { error });
            throw new Error('Failed to retrieve transaction history');
        }
    }

    /**
     * Get transaction by ID
     */
    async getTransactionById(
        transactionId: string
    ): Promise<Transaction | null> {
        try {
            const response = await apiClient.request<Transaction>(
                `/transactions/${transactionId}`,
                {
                    method: 'GET',
                }
            );

            logger.info('Transaction retrieved', { transactionId });
            return response.data;
        } catch (error) {
            logger.error('Failed to get transaction', { transactionId, error });
            return null;
        }
    }

    /**
     * Cancel a pending transaction
     */
    async cancelTransaction(
        transactionId: string
    ): Promise<TransactionResponse> {
        try {
            logger.info('Cancelling transaction', { transactionId });

            // Authenticate with biometrics
            const authResult =
                await biometricAuth.authenticateForSensitiveOperation(
                    'cancel transaction'
                );

            if (!authResult.success) {
                throw new Error('Biometric authentication required');
            }

            const response = await apiClient.request<Transaction>(
                `/transactions/${transactionId}/cancel`,
                {
                    method: 'POST',
                }
            );

            logger.info('Transaction cancelled successfully', {
                transactionId,
            });

            return {
                success: true,
                transaction: response.data,
            };
        } catch (error) {
            logger.error('Failed to cancel transaction', {
                transactionId,
                error,
            });
            return {
                success: false,
                error:
                    error instanceof Error
                        ? error.message
                        : 'Failed to cancel transaction',
            };
        }
    }

    /**
     * Get transaction status
     */
    async getTransactionStatus(transactionId: string): Promise<{
        status: string;
        blockchainTxHash?: string;
        completedAt?: string;
    }> {
        try {
            const response = await apiClient.request<{
                status: string;
                blockchainTxHash?: string;
                completedAt?: string;
            }>(`/transactions/${transactionId}/status`, {
                method: 'GET',
            });

            return response.data;
        } catch (error) {
            logger.error('Failed to get transaction status', {
                transactionId,
                error,
            });
            throw new Error('Failed to get transaction status');
        }
    }

    /**
     * Get wallet balance
     */
    async getWalletBalance(): Promise<{
        balances: Array<{
            currency: string;
            amount: number;
            lastUpdated: string;
        }>;
        totalValue: number;
    }> {
        try {
            const response = await apiClient.request<{
                balances: Array<{
                    currency: string;
                    amount: number;
                    lastUpdated: string;
                }>;
                totalValue: number;
            }>('/wallet/balance', {
                method: 'GET',
            });

            logger.info('Wallet balance retrieved', {
                totalValue: response.data.totalValue,
                currencies: response.data.balances.length,
            });

            return response.data;
        } catch (error) {
            logger.error('Failed to get wallet balance', { error });
            throw new Error('Failed to retrieve wallet balance');
        }
    }

    /**
     * Get transaction fees
     */
    async getTransactionFees(
        amount: number,
        currency: string
    ): Promise<{
        networkFee: number;
        serviceFee: number;
        totalFee: number;
        estimatedTime: string;
    }> {
        try {
            const response = await apiClient.request<{
                networkFee: number;
                serviceFee: number;
                totalFee: number;
                estimatedTime: string;
            }>('/transactions/fees', {
                method: 'POST',
                body: JSON.stringify({ amount, currency }),
            });

            return response.data;
        } catch (error) {
            logger.error('Failed to get transaction fees', { error });
            throw new Error('Failed to calculate transaction fees');
        }
    }

    /**
     * Validate recipient address
     */
    async validateRecipientAddress(address: string): Promise<{
        isValid: boolean;
        isRegistered: boolean;
        userName?: string;
    }> {
        try {
            const response = await apiClient.request<{
                isValid: boolean;
                isRegistered: boolean;
                userName?: string;
            }>('/transactions/validate-recipient', {
                method: 'POST',
                body: JSON.stringify({ address }),
            });

            return response.data;
        } catch (error) {
            logger.error('Failed to validate recipient address', { error });
            return {
                isValid: false,
                isRegistered: false,
            };
        }
    }

    /**
     * Get transaction limits
     */
    async getTransactionLimits(): Promise<{
        dailyLimit: number;
        monthlyLimit: number;
        singleTransactionLimit: number;
        remainingDaily: number;
        remainingMonthly: number;
    }> {
        try {
            const response = await apiClient.request<{
                dailyLimit: number;
                monthlyLimit: number;
                singleTransactionLimit: number;
                remainingDaily: number;
                remainingMonthly: number;
            }>('/transactions/limits', {
                method: 'GET',
            });

            return response.data;
        } catch (error) {
            logger.error('Failed to get transaction limits', { error });
            throw new Error('Failed to retrieve transaction limits');
        }
    }
}

// Export singleton instance
export const transactionService = new TransactionService();
