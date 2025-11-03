import {
    EducationalContent,
    LearningProgress,
} from '../../types/EducationalContent';
import { BaseApiClient } from '../baseApiClient';

/**
 * Learning API Client
 *
 * Handles all educational content and learning-related API endpoints
 */
export interface UpdateProgressRequest {
    contentId: string;
    progress: number;
    score?: number;
    timeSpent: number;
}

export class LearningApiClient extends BaseApiClient {
    /**
     * Get educational content with filters
     */
    async getEducationalContent(params?: {
        category?: string;
        difficulty?: string;
        limit?: number;
        offset?: number;
    }) {
        const queryParams: Record<string, string | number | undefined> = {};
        
        if (params?.category) queryParams.category = params.category;
        if (params?.difficulty) queryParams.difficulty = params.difficulty;
        if (params?.limit) queryParams.limit = params.limit;
        if (params?.offset) queryParams.offset = params.offset;

        const query = this.buildQueryString(queryParams);
        const endpoint = query
            ? `/learning/modules?${query}`
            : '/learning/modules';

        return this.request<EducationalContent[]>(endpoint);
    }

    /**
     * Get educational content by ID
     */
    async getEducationalContentById(id: string) {
        return this.request<EducationalContent>(`/learning/modules/${id}`);
    }

    /**
     * Get user's learning progress
     */
    async getLearningProgress() {
        return this.request<LearningProgress[]>('/learning/progress');
    }

    /**
     * Update learning progress
     */
    async updateLearningProgress(data: UpdateProgressRequest) {
        return this.request<LearningProgress>('/learning/progress/update', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    }

    /**
     * Start a learning module
     */
    async startLearningModule(moduleId: string) {
        return this.request<LearningProgress>('/learning/progress/start', {
            method: 'POST',
            body: JSON.stringify({ moduleId }),
        });
    }

    /**
     * Complete a learning module
     */
    async completeLearningModule(moduleId: string) {
        return this.request<LearningProgress>('/learning/progress/complete', {
            method: 'POST',
            body: JSON.stringify({ moduleId }),
        });
    }

    /**
     * Submit quiz results
     */
    async submitQuizResults(quizResult: {
        moduleId: string;
        score: number;
        totalQuestions: number;
        timeSpent: number;
        answers: Array<{
            questionId: string;
            selectedAnswer: string;
            isCorrect: boolean;
        }>;
    }) {
        return this.request<LearningProgress>('/learning/quiz/submit', {
            method: 'POST',
            body: JSON.stringify(quizResult),
        });
    }

    /**
     * Get learning statistics
     */
    async getLearningStats() {
        return this.request<{
            totalModules: number;
            completedModules: number;
            totalPoints: number;
            currentStreak: number;
            averageScore: number;
        }>('/learning/stats');
    }

    /**
     * Get recommended learning path
     */
    async getRecommendedLearningPath() {
        return this.request<EducationalContent[]>('/learning/recommendations');
    }

    /**
     * Search educational content
     */
    async searchEducationalContent(
        query: string,
        filters?: {
            category?: string;
            difficulty?: string;
            type?: string;
        }
    ) {
        const queryParams: Record<string, string | number | undefined> = { q: query };
        
        if (filters?.category) queryParams.category = filters.category;
        if (filters?.difficulty) queryParams.difficulty = filters.difficulty;
        if (filters?.type) queryParams.type = filters.type;

        const query = this.buildQueryString(queryParams);
        return this.request<EducationalContent[]>(
            `/learning/modules/search?${query}`
        );
    }

    /**
     * Get learning achievements
     */
    async getLearningAchievements() {
        return this.request<
            Array<{
                id: string;
                title: string;
                description: string;
                icon: string;
                points: number;
                unlockedAt?: string;
                progress?: number;
            }>
        >('/learning/achievements');
    }

    /**
     * Toggle favorite status for content
     */
    async toggleFavorite(contentId: string) {
        return this.request<{ isFavorite: boolean }>(
            `/learning/modules/${contentId}/favorite`,
            {
                method: 'POST',
            }
        );
    }
}

export const learningApiClient = new LearningApiClient();

