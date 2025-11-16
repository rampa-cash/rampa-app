import { BaseApiClient } from '../../shared/lib/baseApiClient';
import { User } from './types';

/**
 * Authentication API Client
 *
 * Handles all authentication and user-related API endpoints
 */
export class AuthApiClient extends BaseApiClient {
    /**
     * Import Para session to backend
     * POST /auth/session/import
     *
     * @param serializedSession - Serialized session string from Para SDK (exported via para.exportSession())
     * @returns Backend session token, user info, and expiration
     */
    async importSession(serializedSession: string): Promise<{
        success: boolean;
        sessionToken: string;
        user: {
            id: string;
            email: string;
            phone?: string;
            authProvider?: string;
            verificationStatus?: string;
            isVerified?: boolean;
        };
        expiresAt: string;
    }> {
        // This endpoint doesn't require authentication (it's the initial auth)
        const response = await fetch(`${this.baseURL}/auth/session/import`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ serializedSession }),
        });

        if (!response.ok) {
            // Try to get error details from response body
            let errorDetails = '';
            try {
                const errorData = await response.json();
                errorDetails = errorData.message || errorData.error || JSON.stringify(errorData);
            } catch {
                // If response is not JSON, use status text
                errorDetails = response.statusText;
            }

            const error = new Error(
                `Session import failed: ${response.status} ${errorDetails ? `- ${errorDetails}` : response.statusText}`
            );
            (error as any).status = response.status;
            (error as any).statusCode = response.status;
            throw error;
        }

        const data = await response.json();
        return data;
    }

    /**
     * Get current authenticated user
     * GET /user
     */
    async getCurrentUser() {
        return this.request<User>('/user');
    }

    /**
     * Update user profile
     * PUT /user
     */
    async updateUser(data: Partial<User>) {
        return this.request<User>('/user', {
            method: 'PUT',
            body: JSON.stringify(data),
        });
    }
}

export const authApiClient = new AuthApiClient();
