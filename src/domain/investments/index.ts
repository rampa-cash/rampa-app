/**
 * Investments Domain
 *
 * Barrel export for all investment-related functionality
 */

// Types
export type {
    CreateInvestmentRequest,
    InvestmentOption,
    InvestmentPerformance,
    InvestmentStats,
    UserInvestment,
    WithdrawInvestmentRequest,
} from './types';

// Service
export { investmentService } from './InvestmentService';
export type {
    InvestmentOptionsResponse,
    InvestmentResponse,
    InvestmentStatsResponse,
} from './InvestmentService';

// API Client
export { investmentApiClient, InvestmentApiClient } from './apiClient';
