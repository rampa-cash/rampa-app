/**
 * On-Ramp Domain
 *
 * Barrel export for all on-ramp (fiat to crypto) functionality
 */

// Types
export type {
    OnRampEstimate, OnRampInitiateRequest, OnRampTransaction
} from './types';

// Service
export { onRampService } from './OnRampService';
export type { OnRampResponse } from './OnRampService';

// API Client
export { onRampApiClient, OnRampApiClient } from './apiClient';

