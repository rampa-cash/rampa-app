export interface EducationalContent {
    id: string;
    title: string;
    description: string;
    content: string;
    type: 'article' | 'video' | 'quiz' | 'interactive';
    category:
        | 'basic_finance'
        | 'crypto_fundamentals'
        | 'investment_strategies'
        | 'portfolio_management';
    difficulty: 'beginner' | 'intermediate' | 'advanced';
    estimatedTime: number;
    points: number;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}

export interface LearningProgress {
    id: string;
    userId: string;
    contentId: string;
    status: 'not_started' | 'in_progress' | 'completed';
    progress: number;
    score?: number;
    timeSpent: number;
    pointsEarned: number;
    startedAt?: Date;
    completedAt?: Date;
}
