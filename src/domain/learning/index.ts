/**
 * Learning Domain
 *
 * Barrel export for all learning-related functionality
 */

// Types
export type { EducationalContent, LearningProgress } from './types';

// Service
export { learningService } from './LearningService';
export type {
    LearningModuleResponse,
    LearningProgressResponse,
    LearningStatsResponse,
    QuizResult,
} from './LearningService';

// API Client
export { learningApiClient, LearningApiClient } from './apiClient';
export type { UpdateProgressRequest } from './apiClient';
