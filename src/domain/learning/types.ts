export interface EducationalContent {
    id: string;
    title: string;
    description: string;
    category: string;
    difficulty: 'beginner' | 'intermediate' | 'advanced';
    duration: number; // Duration in minutes
    rewardAmount: number; // BONK reward amount
    isCompleted: boolean;
    progress: number; // 0-100
    createdAt: string; // ISO date string
}

export interface LearningProgress {
    id: string;
    userId: string;
    moduleId: string; // Changed from contentId to moduleId to match backend
    status: 'not_started' | 'in_progress' | 'completed';
    progress: number;
    score?: number;
    timeSpent: number;
    pointsEarned: number;
    startedAt?: Date;
    completedAt?: Date;
}
