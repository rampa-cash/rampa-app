import { useAuthStore } from '../../domain/auth/authStore';

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
     * Get the base URL being used by this client
     */
    getBaseURL(): string {
        return this.baseURL;
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
    protected buildQueryString(
        params: Record<string, string | number | undefined>
    ): string {
        const queryParams = new URLSearchParams();

        Object.entries(params).forEach(([key, value]) => {
            if (value !== undefined && value !== null) {
                queryParams.append(key, value.toString());
            }
        });

        return queryParams.toString();
    }

    /**
     * Check backend health status
     * GET /health
     *
     * @returns Health status information
     */
    async checkHealth(): Promise<{
        status: string;
        timestamp: string;
        uptime: number;
        memory: {
            rss: number;
            heapTotal: number;
            heapUsed: number;
            external: number;
            arrayBuffers: number;
        };
        version: string;
    }> {
        const timeout = 10000; // 10 seconds for health check
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeout);

        try {
            const response = await fetch(`${this.baseURL}/health`, {
                method: 'GET',
                signal: controller.signal,
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            clearTimeout(timeoutId);

            if (!response.ok) {
                throw new Error(
                    `Health check failed: ${response.status} ${response.statusText}`
                );
            }

            const data = await response.json();
            return data;
        } catch (error: any) {
            clearTimeout(timeoutId);

            if (error.name === 'AbortError') {
                throw new Error(`Health check timeout after ${timeout}ms`);
            }

            if (
                error.message?.includes('Network request failed') ||
                error.message?.includes('Failed to fetch')
            ) {
                throw new Error(
                    `Health check failed: Unable to reach ${this.baseURL}/health. Please check your internet connection.`
                );
            }

            throw error;
        }
    }
}
