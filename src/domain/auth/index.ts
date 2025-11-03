/**
 * Auth Domain
 *
 * Barrel export for all authentication-related functionality
 */

// Types
export type { NotificationSettings, PrivacySettings, User, UserPreferences } from './types';

// Store
export { useAuthStore } from './authStore';

// Service
export { AuthService } from './AuthService';
export type { AuthResult, VerificationResult } from './AuthService';

// Hooks
export { useAuth, useAuthActions, useAuthStatus } from './useAuth';
export type { AuthActions, AuthState } from './useAuth';

// API Client
export { authApiClient, AuthApiClient } from './apiClient';

