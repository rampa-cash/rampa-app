import { BaseApiClient } from '../../shared/lib/baseApiClient';
import { User } from './types';

/**
 * Authentication API Client
 *
 * Handles all authentication and user-related API endpoints
 */
export class AuthApiClient extends BaseApiClient {
    /**
     * Get current authenticated user
     */
    async getCurrentUser() {
        return this.request<User>('/user/me');
    }

    /**
     * Update user profile
     */
    async updateUser(data: Partial<User>) {
        return this.request<User>('/user/me', {
            method: 'PUT',
            body: JSON.stringify(data),
        });
    }
}

export const authApiClient = new AuthApiClient();
