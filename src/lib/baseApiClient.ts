import { useAuthStore } from '../store/authStore';

/**
 * Base API Client
 *
 * Provides shared functionality for all domain-specific API clients.
 * Handles authentication, base URL configuration, and common request logic.
 */
export interface ApiResponse<T> {
    data: T;
    success: boolean;
    message?: string;
}

export class BaseApiClient {
    protected baseURL: string;

    constructor() {
        this.baseURL =
            process.env.EXPO_PUBLIC_API_URL || 'https://api.rampa.app/v1';
    }

    /**
     * Make an HTTP request to the API
     */
    protected async request<T>(
        endpoint: string,
        options: RequestInit = {}
    ): Promise<ApiResponse<T>> {
        const sessionToken = this.getSessionToken();

        const response = await fetch(`${this.baseURL}${endpoint}`, {
            ...options,
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${sessionToken}`,
                ...options.headers,
            },
        });

        if (!response.ok) {
            throw new Error(
                `API Error: ${response.status} ${response.statusText}`
            );
        }

        return response.json();
    }

    /**
     * Get session token from auth store
     */
    private getSessionToken(): string {
        // Get token from Zustand store
        const state = useAuthStore.getState();
        return state.sessionToken || '';
    }

    /**
     * Build query string from parameters
     */
    protected buildQueryString(params: Record<string, string | number | undefined>): string {
        const queryParams = new URLSearchParams();
        
        Object.entries(params).forEach(([key, value]) => {
            if (value !== undefined && value !== null) {
                queryParams.append(key, value.toString());
            }
        });

        return queryParams.toString();
    }
}

