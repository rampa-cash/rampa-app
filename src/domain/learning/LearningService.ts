import { logger } from '../../shared/utils/errorHandler';
import { learningApiClient } from './apiClient';
import {
    EducationalContent,
    LearningProgress,
} from './types';

export interface LearningModuleResponse {
    success: boolean;
    module?: EducationalContent;
    error?: string;
}

export interface LearningProgressResponse {
    success: boolean;
    progress?: LearningProgress;
    error?: string;
}

export interface LearningStatsResponse {
    success: boolean;
    stats?: {
        totalModules: number;
        completedModules: number;
        totalPoints: number;
        currentStreak: number;
        averageScore: number;
    };
    error?: string;
}

export interface QuizResult {
    moduleId: string; // Changed from contentId to moduleId
    score: number;
    totalQuestions: number;
    timeSpent: number;
    answers: Array<{
        questionId: string;
        selectedAnswer: string;
        isCorrect: boolean;
    }>;
}

export class LearningService {
    /**
     * Get all educational content
     */
    async getEducationalContent(params?: {
        category?: string;
        difficulty?: string;
        limit?: number;
        offset?: number;
    }): Promise<EducationalContent[]> {
        try {
            logger.info('Fetching educational content', { params });

            const response = await learningApiClient.getEducationalContent(params);
            return response.data;
        } catch (error) {
            logger.error('Failed to fetch educational content', { error });
            throw new Error('Failed to fetch educational content');
        }
    }

    /**
     * Get educational content by ID
     */
    async getEducationalContentById(id: string): Promise<EducationalContent> {
        try {
            logger.info('Fetching educational content by ID', { id });

            const response = await learningApiClient.getEducationalContentById(id);
            return response.data;
        } catch (error) {
            logger.error('Failed to fetch educational content by ID', {
                error,
                id,
            });
            throw new Error('Failed to fetch educational content');
        }
    }

    /**
     * Get user's learning progress
     */
    async getLearningProgress(): Promise<LearningProgress[]> {
        try {
            logger.info('Fetching learning progress');

            const response = await learningApiClient.getLearningProgress();
            return response.data;
        } catch (error) {
            logger.error('Failed to fetch learning progress', { error });
            throw new Error('Failed to fetch learning progress');
        }
    }

    /**
     * Update learning progress
     */
    async updateLearningProgress(data: {
        moduleId: string; // Changed from contentId to moduleId
        progress: number;
        score?: number;
        timeSpent: number;
    }): Promise<LearningProgress> {
        try {
            logger.info('Updating learning progress', { data });

            const response = await learningApiClient.updateLearningProgress({
                contentId: data.moduleId,
                progress: data.progress,
                score: data.score,
                timeSpent: data.timeSpent,
            });
            return response.data;
        } catch (error) {
            logger.error('Failed to update learning progress', { error, data });
            throw new Error('Failed to update learning progress');
        }
    }

    /**
     * Start a learning module
     */
    async startLearningModule(
        moduleId: string
    ): Promise<LearningProgressResponse> {
        try {
            logger.info('Starting learning module', { moduleId });

            const response = await learningApiClient.startLearningModule(moduleId);

            return {
                success: true,
                progress: response.data,
            };
        } catch (error) {
            logger.error('Failed to start learning module', {
                error,
                moduleId,
            });
            return {
                success: false,
                error:
                    error instanceof Error
                        ? error.message
                        : 'Failed to start learning module',
            };
        }
    }

    /**
     * Complete a learning module
     */
    async completeLearningModule(
        moduleId: string,
        score?: number
    ): Promise<LearningProgressResponse> {
        try {
            logger.info('Completing learning module', { moduleId, score });

            const response = await learningApiClient.completeLearningModule(moduleId);

            return {
                success: true,
                progress: response.data,
            };
        } catch (error) {
            logger.error('Failed to complete learning module', {
                error,
                moduleId,
            });
            return {
                success: false,
                error:
                    error instanceof Error
                        ? error.message
                        : 'Failed to complete learning module',
            };
        }
    }

    /**
     * Submit quiz results
     */
    async submitQuizResults(
        quizResult: QuizResult
    ): Promise<LearningProgressResponse> {
        try {
            logger.info('Submitting quiz results', {
                moduleId: quizResult.moduleId,
                score: quizResult.score,
            });

            // Note: Quiz submission endpoint not defined in backend API spec
            // This would need to be implemented on the backend
            const response = await learningApiClient.submitQuizResults(quizResult);

            return {
                success: true,
                progress: response.data,
            };
        } catch (error) {
            logger.error('Failed to submit quiz results', {
                error,
                quizResult,
            });
            return {
                success: false,
                error:
                    error instanceof Error
                        ? error.message
                        : 'Failed to submit quiz results',
            };
        }
    }

    /**
     * Get learning statistics
     */
    async getLearningStats(): Promise<LearningStatsResponse> {
        try {
            logger.info('Fetching learning statistics');

            const response = await learningApiClient.getLearningStats();

            return {
                success: true,
                stats: response.data,
            };
        } catch (error) {
            logger.error('Failed to fetch learning statistics', { error });
            return {
                success: false,
                error:
                    error instanceof Error
                        ? error.message
                        : 'Failed to fetch learning statistics',
            };
        }
    }

    /**
     * Get recommended learning path
     */
    async getRecommendedLearningPath(): Promise<EducationalContent[]> {
        try {
            logger.info('Fetching recommended learning path');

            // Note: Recommendations endpoint not defined in backend API spec
            // This would need to be implemented on the backend
            const response = await learningApiClient.getRecommendedLearningPath();
            return response.data;
        } catch (error) {
            logger.error('Failed to fetch recommended learning path', {
                error,
            });
            throw new Error('Failed to fetch recommended learning path');
        }
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
    ): Promise<EducationalContent[]> {
        try {
            logger.info('Searching educational content', { query, filters });

            const response = await learningApiClient.searchEducationalContent(query, filters);
            return response.data;
        } catch (error) {
            logger.error('Failed to search educational content', {
                error,
                query,
            });
            throw new Error('Failed to search educational content');
        }
    }

    /**
     * Get learning achievements
     */
    async getLearningAchievements(): Promise<
        Array<{
            id: string;
            title: string;
            description: string;
            icon: string;
            points: number;
            unlockedAt?: Date;
            progress?: number;
        }>
    > {
        try {
            logger.info('Fetching learning achievements');

            // Note: Achievements endpoint not defined in backend API spec
            // This would need to be implemented on the backend
            const response = await learningApiClient.getLearningAchievements();

            return response.data.map(achievement => ({
                ...achievement,
                unlockedAt: achievement.unlockedAt
                    ? new Date(achievement.unlockedAt)
                    : undefined,
            }));
        } catch (error) {
            logger.error('Failed to fetch learning achievements', { error });
            throw new Error('Failed to fetch learning achievements');
        }
    }

    /**
     * Mark content as favorite
     */
    async toggleFavorite(
        contentId: string
    ): Promise<{ success: boolean; isFavorite: boolean }> {
        try {
            logger.info('Toggling favorite status', { contentId });

            // Note: Favorites endpoint not defined in backend API spec
            // This would need to be implemented on the backend
            const response = await learningApiClient.toggleFavorite(contentId);

            return {
                success: response.success !== false,
                isFavorite: response.data.isFavorite,
            };
        } catch (error) {
            logger.error('Failed to toggle favorite status', {
                error,
                contentId,
            });
            return {
                success: false,
                isFavorite: false,
            };
        }
    }
}

export const learningService = new LearningService();
