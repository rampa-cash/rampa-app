/**
 * Transaction Service
 *
 * Handles all transaction-related operations including sending money,
 * receiving money, transaction history, and status updates
 */

import { biometricAuth } from '../../shared/utils/biometricAuth';
import { logger } from '../../shared/utils/errorHandler';
import { SecurityUtils } from '../../shared/utils/securityUtils';
import { transactionApiClient } from './apiClient';
import { Transaction } from './types';

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

            // Call backend API
            const response = await transactionApiClient.createTransaction({
                recipientAddress: request.recipientAddress,
                amount: request.amount,
                currency: request.currency,
                notes: request.notes,
            });

            logger.info('Transaction created successfully', {
                transactionId: response.data.id,
            });

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
            const response = await transactionApiClient.getTransactionHistory({
                page: params?.page,
                limit: params?.limit,
                status: params?.status,
                currency: params?.currency,
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
            const response =
                await transactionApiClient.getTransaction(transactionId);

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

            const response =
                await transactionApiClient.cancelTransaction(transactionId);

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
            const response =
                await transactionApiClient.getTransactionStatus(transactionId);

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
            const response = await transactionApiClient.getWalletBalance();

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
            const response = await transactionApiClient.getTransactionFees(
                amount,
                currency
            );

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
            const response =
                await transactionApiClient.validateRecipientAddress(address);

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
            const response = await transactionApiClient.getTransactionLimits();

            return response.data;
        } catch (error) {
            logger.error('Failed to get transaction limits', { error });
            throw new Error('Failed to retrieve transaction limits');
        }
    }
}

// Export singleton instance
export const transactionService = new TransactionService();
