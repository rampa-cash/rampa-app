/**
 * Transactions Domain
 *
 * Barrel export for all transaction-related functionality
 */

// Types
export type { Transaction } from './types';
export type { Wallet, WalletBalance } from './wallet';

// Service
export { transactionService } from './TransactionService';
export type {
    CreateTransactionRequest, TransactionHistoryResponse, TransactionResponse
} from './TransactionService';

// API Client
export { transactionApiClient, TransactionApiClient } from './apiClient';
export type {
    CreateTransactionRequest as ApiCreateTransactionRequest,
    TransactionHistoryResponse as ApiTransactionHistoryResponse
} from './apiClient';

