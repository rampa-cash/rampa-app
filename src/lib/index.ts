/**
 * API Clients Barrel Export
 *
 * Central export point for all domain-specific API clients.
 * This allows importing multiple clients from a single location.
 */

// Base client
export { BaseApiClient, type ApiResponse } from './baseApiClient';

// Domain-specific clients
export { AuthApiClient, authApiClient } from './auth/authApiClient';
export { ContactApiClient, contactApiClient } from './contacts/contactApiClient';
export {
    InvestmentApiClient, investmentApiClient
} from './investments/investmentApiClient';
export {
    LearningApiClient, learningApiClient, type UpdateProgressRequest
} from './learning/learningApiClient';
export { OffRampApiClient, offRampApiClient } from './offRamp/offRampApiClient';
export { OnRampApiClient, onRampApiClient } from './onRamp/onRampApiClient';
export {
    TransactionApiClient, transactionApiClient, type CreateTransactionRequest,
    type TransactionHistoryResponse
} from './transactions/transactionApiClient';

