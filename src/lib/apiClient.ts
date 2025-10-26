import { Contact } from '../types/Contact';
import {
    EducationalContent,
    LearningProgress,
} from '../types/EducationalContent';
import { Transaction } from '../types/Transaction';
import { User } from '../types/User';

export interface ApiResponse<T> {
    data: T;
    success: boolean;
    message?: string;
}

export interface CreateTransactionRequest {
    recipientId?: string;
    recipientAddress: string;
    amount: number;
    currency: 'SOL' | 'USDC' | 'EURC';
    notes?: string;
}

export interface UpdateProgressRequest {
    contentId: string;
    progress: number;
    score?: number;
    timeSpent: number;
}

class ApiClient {
    private baseURL: string;

    constructor() {
        this.baseURL =
            process.env.EXPO_PUBLIC_API_URL || 'https://api.rampa.app/v1';
    }

    async request<T>(
        endpoint: string,
        options: RequestInit = {}
    ): Promise<ApiResponse<T>> {
        // TODO: Get session token from auth store
        const sessionToken = 'mock-token'; // This should come from auth store

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

    // User endpoints
    async getCurrentUser(): Promise<ApiResponse<User>> {
        return this.request<User>('/user/me');
    }

    async updateUser(data: Partial<User>): Promise<ApiResponse<User>> {
        return this.request<User>('/user/me', {
            method: 'PUT',
            body: JSON.stringify(data),
        });
    }

    // Transaction endpoints
    async getTransactions(params?: {
        limit?: number;
        offset?: number;
        status?: string;
    }): Promise<ApiResponse<Transaction[]>> {
        const queryParams = new URLSearchParams();
        if (params?.limit) queryParams.append('limit', params.limit.toString());
        if (params?.offset)
            queryParams.append('offset', params.offset.toString());
        if (params?.status) queryParams.append('status', params.status);

        const query = queryParams.toString();
        const endpoint = query ? `/transactions?${query}` : '/transactions';

        return this.request<Transaction[]>(endpoint);
    }

    async createTransaction(
        data: CreateTransactionRequest
    ): Promise<ApiResponse<Transaction>> {
        return this.request<Transaction>('/transactions', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    }

    async getTransaction(id: string): Promise<ApiResponse<Transaction>> {
        return this.request<Transaction>(`/transactions/${id}`);
    }

    // Contact endpoints
    async getContacts(): Promise<ApiResponse<Contact[]>> {
        return this.request<Contact[]>('/contacts');
    }

    async createContact(
        data: Omit<Contact, 'id' | 'userId' | 'createdAt' | 'updatedAt'>
    ): Promise<ApiResponse<Contact>> {
        return this.request<Contact>('/contacts', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    }

    async updateContact(
        id: string,
        data: Partial<Contact>
    ): Promise<ApiResponse<Contact>> {
        return this.request<Contact>(`/contacts/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data),
        });
    }

    async deleteContact(id: string): Promise<ApiResponse<void>> {
        return this.request<void>(`/contacts/${id}`, {
            method: 'DELETE',
        });
    }

    // Educational content endpoints
    async getEducationalContent(params?: {
        category?: string;
        difficulty?: string;
        limit?: number;
    }): Promise<ApiResponse<EducationalContent[]>> {
        const queryParams = new URLSearchParams();
        if (params?.category) queryParams.append('category', params.category);
        if (params?.difficulty)
            queryParams.append('difficulty', params.difficulty);
        if (params?.limit) queryParams.append('limit', params.limit.toString());

        const query = queryParams.toString();
        const endpoint = query
            ? `/learning/modules?${query}`
            : '/learning/modules';

        return this.request<EducationalContent[]>(endpoint);
    }

    async getLearningProgress(): Promise<ApiResponse<LearningProgress[]>> {
        return this.request<LearningProgress[]>('/learning/progress');
    }

    async updateLearningProgress(
        data: UpdateProgressRequest
    ): Promise<ApiResponse<LearningProgress>> {
        return this.request<LearningProgress>('/learning/progress/update', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    }

    // Investment endpoints
    async getInvestmentOptions(params?: {
        type?: string;
        riskLevel?: string;
        limit?: number;
        offset?: number;
    }): Promise<ApiResponse<any[]>> {
        const queryParams = new URLSearchParams();
        if (params?.type) queryParams.append('type', params.type);
        if (params?.riskLevel)
            queryParams.append('riskLevel', params.riskLevel);
        if (params?.limit) queryParams.append('limit', params.limit.toString());
        if (params?.offset)
            queryParams.append('offset', params.offset.toString());

        const query = queryParams.toString();
        const endpoint = query
            ? `/investments/options?${query}`
            : '/investments/options';

        return this.request<any[]>(endpoint);
    }

    async getInvestmentOptionById(id: string): Promise<ApiResponse<any>> {
        return this.request<any>(`/investments/options/${id}`);
    }

    async getUserInvestments(): Promise<ApiResponse<any[]>> {
        return this.request<any[]>('/investments/user');
    }

    async createInvestment(data: any): Promise<ApiResponse<any>> {
        return this.request<any>('/investments/user/create', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    }

    async getUserInvestmentById(id: string): Promise<ApiResponse<any>> {
        return this.request<any>(`/investments/user/${id}`);
    }

    async withdrawFromInvestment(
        id: string,
        data: any
    ): Promise<ApiResponse<any>> {
        return this.request<any>(`/investments/user/${id}/withdraw`, {
            method: 'POST',
            body: JSON.stringify(data),
        });
    }

    async getInvestmentStats(): Promise<ApiResponse<any>> {
        return this.request<any>('/investments/stats');
    }

    async getInvestmentPerformance(params?: {
        investmentId?: string;
        period?: string;
    }): Promise<ApiResponse<any[]>> {
        const queryParams = new URLSearchParams();
        if (params?.investmentId)
            queryParams.append('investmentId', params.investmentId);
        if (params?.period) queryParams.append('period', params.period);

        const query = queryParams.toString();
        const endpoint = query
            ? `/investments/performance?${query}`
            : '/investments/performance';

        return this.request<any[]>(endpoint);
    }
}

export const apiClient = new ApiClient();
