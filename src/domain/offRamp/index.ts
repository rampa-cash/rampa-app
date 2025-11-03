/**
 * Off-Ramp Domain
 *
 * Barrel export for all off-ramp (crypto to fiat) functionality
 */

// Types
export type {
    BankAccount,
    OffRampEstimate,
    OffRampInitiateRequest,
    OffRampTransaction,
} from './types';

// Service
export { offRampService } from './OffRampService';
export type { OffRampResponse } from './OffRampService';

// API Client
export { offRampApiClient, OffRampApiClient } from './apiClient';
