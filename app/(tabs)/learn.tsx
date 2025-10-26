import { MaterialIcons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import React, { useState } from 'react';
import {
    Alert,
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { apiClient } from '../../src/lib/apiClient';
import { learningService } from '../../src/services/LearningService';
import {
    EducationalContent,
    LearningProgress,
} from '../../src/types/EducationalContent';

export default function LearnScreen() {
    const [selectedCategory, setSelectedCategory] = useState<string | null>(
        null
    );
    const [searchQuery, setSearchQuery] = useState('');
    const [showContentModal, setShowContentModal] = useState(false);
    const [selectedContent, setSelectedContent] =
        useState<EducationalContent | null>(null);

    // Fetch educational content
    const { data: content, isLoading } = useQuery({
        queryKey: ['educational-content', selectedCategory],
        queryFn: () =>
            apiClient.getEducationalContent({
                category: selectedCategory || undefined,
                limit: 20,
            }),
    });

    // Fetch learning progress
    const { data: progress } = useQuery({
        queryKey: ['learning-progress'],
        queryFn: () => apiClient.getLearningProgress(),
    });

    // Fetch learning stats
    const { data: stats } = useQuery({
        queryKey: ['learning-stats'],
        queryFn: () => learningService.getLearningStats(),
    });

    const categories = [
        { id: 'basic_finance', name: 'Basic Finance', icon: 'account-balance' },
        {
            id: 'crypto_fundamentals',
            name: 'Crypto Fundamentals',
            icon: 'currency-bitcoin',
        },
        {
            id: 'investment_strategies',
            name: 'Investment Strategies',
            icon: 'trending-up',
        },
        {
            id: 'portfolio_management',
            name: 'Portfolio Management',
            icon: 'pie-chart',
        },
    ];

    const difficultyColors = {
        beginner: '#4CAF50',
        intermediate: '#FF9800',
        advanced: '#F44336',
    };

    const handleStartLearning = async (content: EducationalContent) => {
        try {
            const result = await learningService.startLearningModule(
                content.id
            );
            if (result.success) {
                setSelectedContent(content);
                setShowContentModal(true);
            } else {
                Alert.alert(
                    'Error',
                    result.error || 'Failed to start learning module'
                );
            }
        } catch (error) {
            Alert.alert('Error', 'Failed to start learning module');
        }
    };

    const handleCompleteLearning = async (contentId: string) => {
        try {
            const result =
                await learningService.completeLearningModule(contentId);
            if (result.success) {
                Alert.alert('Success', 'Module completed! You earned points!');
                setShowContentModal(false);
                setSelectedContent(null);
            } else {
                Alert.alert(
                    'Error',
                    result.error || 'Failed to complete module'
                );
            }
        } catch (error) {
            Alert.alert('Error', 'Failed to complete module');
        }
    };

    const getProgressForContent = (
        moduleId: string
    ): LearningProgress | undefined => {
        return progress?.data?.find(p => p.moduleId === moduleId);
    };

    const getProgressPercentage = (moduleId: string): number => {
        const progressData = getProgressForContent(moduleId);
        return progressData?.progress || 0;
    };

    const isContentCompleted = (moduleId: string): boolean => {
        const progressData = getProgressForContent(moduleId);
        return progressData?.status === 'completed';
    };

    if (isLoading) {
        return (
            <View style={styles.container}>
                <Text style={styles.loadingText}>
                    Loading educational content...
                </Text>
            </View>
        );
    }

    return (
        <ScrollView style={styles.container}>
            <Text style={styles.title}>Learn & Earn</Text>
            <Text style={styles.subtitle}>
                Build your financial knowledge and earn rewards
            </Text>

            {/* Learning Stats */}
            {stats?.success && stats.stats && (
                <View style={styles.statsCard}>
                    <Text style={styles.statsTitle}>Your Learning Journey</Text>
                    <View style={styles.statsGrid}>
                        <View style={styles.statItem}>
                            <Text style={styles.statValue}>
                                {stats.stats.completedModules}/
                                {stats.stats.totalModules}
                            </Text>
                            <Text style={styles.statLabel}>
                                Modules Completed
                            </Text>
                        </View>
                        <View style={styles.statItem}>
                            <Text style={styles.statValue}>
                                {stats.stats.totalPoints}
                            </Text>
                            <Text style={styles.statLabel}>Points Earned</Text>
                        </View>
                        <View style={styles.statItem}>
                            <Text style={styles.statValue}>
                                {stats.stats.currentStreak} days
                            </Text>
                            <Text style={styles.statLabel}>
                                Learning Streak
                            </Text>
                        </View>
                    </View>
                </View>
            )}

            {/* Search Bar */}
            <View style={styles.searchSection}>
                <View style={styles.searchContainer}>
                    <MaterialIcons name="search" size={20} color="#666" />
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Search learning content..."
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                        placeholderTextColor="#999"
                    />
                </View>
            </View>

            {/* Categories */}
            <View style={styles.categoriesContainer}>
                <Text style={styles.sectionTitle}>Categories</Text>
                <View style={styles.categoriesGrid}>
                    <TouchableOpacity
                        style={[
                            styles.categoryCard,
                            selectedCategory === null &&
                                styles.categoryCardActive,
                        ]}
                        onPress={() => setSelectedCategory(null)}
                    >
                        <MaterialIcons
                            name="all-inclusive"
                            size={32}
                            color="#007AFF"
                        />
                        <Text
                            style={[
                                styles.categoryName,
                                selectedCategory === null &&
                                    styles.categoryNameActive,
                            ]}
                        >
                            All
                        </Text>
                    </TouchableOpacity>
                    {categories.map(category => (
                        <TouchableOpacity
                            key={category.id}
                            style={[
                                styles.categoryCard,
                                selectedCategory === category.id &&
                                    styles.categoryCardActive,
                            ]}
                            onPress={() => setSelectedCategory(category.id)}
                        >
                            <MaterialIcons
                                name={category.icon as any}
                                size={32}
                                color="#007AFF"
                            />
                            <Text
                                style={[
                                    styles.categoryName,
                                    selectedCategory === category.id &&
                                        styles.categoryNameActive,
                                ]}
                            >
                                {category.name}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </View>

            {/* Content Section */}
            <View style={styles.contentSection}>
                <Text style={styles.sectionTitle}>Learning Content</Text>
                {content?.data?.length ? (
                    content.data.map(item => {
                        const progressPercentage =
                            getProgressForContent(item.id)?.progress || 0;
                        const isCompleted = isContentCompleted(item.id);

                        return (
                            <TouchableOpacity
                                key={item.id}
                                style={styles.contentCard}
                                onPress={() => handleStartLearning(item)}
                            >
                                <View style={styles.contentHeader}>
                                    <Text style={styles.contentTitle}>
                                        {item.title}
                                    </Text>
                                    <View style={styles.contentBadges}>
                                        <View
                                            style={[
                                                styles.difficultyBadge,
                                                {
                                                    backgroundColor:
                                                        difficultyColors[
                                                            item.difficulty
                                                        ],
                                                },
                                            ]}
                                        >
                                            <Text style={styles.difficultyText}>
                                                {item.difficulty
                                                    .charAt(0)
                                                    .toUpperCase() +
                                                    item.difficulty.slice(1)}
                                            </Text>
                                        </View>
                                        {isCompleted && (
                                            <View style={styles.completedBadge}>
                                                <MaterialIcons
                                                    name="check-circle"
                                                    size={16}
                                                    color="#4CAF50"
                                                />
                                                <Text
                                                    style={styles.completedText}
                                                >
                                                    Completed
                                                </Text>
                                            </View>
                                        )}
                                    </View>
                                </View>
                                <Text style={styles.contentDescription}>
                                    {item.description}
                                </Text>

                                {/* Progress Bar */}
                                {progressPercentage > 0 && !isCompleted && (
                                    <View style={styles.progressContainer}>
                                        <View style={styles.progressBar}>
                                            <View
                                                style={[
                                                    styles.progressFill,
                                                    {
                                                        width: `${progressPercentage}%`,
                                                    },
                                                ]}
                                            />
                                        </View>
                                        <Text style={styles.progressText}>
                                            {progressPercentage}% complete
                                        </Text>
                                    </View>
                                )}

                                <View style={styles.contentFooter}>
                                    <View style={styles.contentMeta}>
                                        <MaterialIcons
                                            name="schedule"
                                            size={16}
                                            color="#666"
                                        />
                                        <Text style={styles.metaText}>
                                            {item.duration} min
                                        </Text>
                                    </View>
                                    <View style={styles.contentMeta}>
                                        <MaterialIcons
                                            name="star"
                                            size={16}
                                            color="#FFD700"
                                        />
                                        <Text style={styles.metaText}>
                                            {item.rewardAmount} BONK
                                        </Text>
                                    </View>
                                    <View style={styles.contentMeta}>
                                        <MaterialIcons
                                            name="school"
                                            size={16}
                                            color="#666"
                                        />
                                        <Text style={styles.metaText}>
                                            {item.category}
                                        </Text>
                                    </View>
                                </View>
                            </TouchableOpacity>
                        );
                    })
                ) : (
                    <Text style={styles.emptyText}>No content available</Text>
                )}
            </View>

            {/* Content Modal */}
            <Modal
                visible={showContentModal}
                animationType="slide"
                presentationStyle="pageSheet"
            >
                <View style={styles.modalContainer}>
                    <View style={styles.modalHeader}>
                        <TouchableOpacity
                            onPress={() => setShowContentModal(false)}
                            style={styles.closeButton}
                        >
                            <MaterialIcons
                                name="close"
                                size={24}
                                color="#333"
                            />
                        </TouchableOpacity>
                        <Text style={styles.modalTitle}>Learning Module</Text>
                        <View style={styles.placeholder} />
                    </View>

                    {selectedContent && (
                        <ScrollView style={styles.modalContent}>
                            <View style={styles.contentHeader}>
                                <Text style={styles.modalContentTitle}>
                                    {selectedContent.title}
                                </Text>
                                <View style={styles.contentBadges}>
                                    <View
                                        style={[
                                            styles.difficultyBadge,
                                            {
                                                backgroundColor:
                                                    difficultyColors[
                                                        selectedContent
                                                            .difficulty
                                                    ],
                                            },
                                        ]}
                                    >
                                        <Text style={styles.difficultyText}>
                                            {selectedContent.difficulty
                                                .charAt(0)
                                                .toUpperCase() +
                                                selectedContent.difficulty.slice(
                                                    1
                                                )}
                                        </Text>
                                    </View>
                                </View>
                            </View>

                            <Text style={styles.modalContentDescription}>
                                {selectedContent.description}
                            </Text>

                            <View style={styles.contentDetails}>
                                <View style={styles.contentDetail}>
                                    <MaterialIcons
                                        name="schedule"
                                        size={20}
                                        color="#666"
                                    />
                                    <Text style={styles.contentDetailText}>
                                        Estimated time:{' '}
                                        {selectedContent.duration} minutes
                                    </Text>
                                </View>
                                <View style={styles.contentDetail}>
                                    <MaterialIcons
                                        name="star"
                                        size={20}
                                        color="#FFD700"
                                    />
                                    <Text style={styles.contentDetailText}>
                                        Reward: {selectedContent.rewardAmount}{' '}
                                        BONK
                                    </Text>
                                </View>
                                <View style={styles.contentDetail}>
                                    <MaterialIcons
                                        name="school"
                                        size={20}
                                        color="#666"
                                    />
                                    <Text style={styles.contentDetailText}>
                                        Category: {selectedContent.category}
                                    </Text>
                                </View>
                            </View>

                            <View style={styles.contentBody}>
                                <Text style={styles.contentBodyText}>
                                    {selectedContent.description}
                                </Text>
                            </View>

                            <TouchableOpacity
                                style={styles.completeButton}
                                onPress={() =>
                                    handleCompleteLearning(selectedContent.id)
                                }
                            >
                                <MaterialIcons
                                    name="check-circle"
                                    size={20}
                                    color="#fff"
                                />
                                <Text style={styles.completeButtonText}>
                                    Mark as Complete
                                </Text>
                            </TouchableOpacity>
                        </ScrollView>
                    )}
                </View>
            </Modal>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
        padding: 20,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        marginBottom: 8,
        color: '#333',
    },
    subtitle: {
        fontSize: 16,
        color: '#666',
        marginBottom: 24,
    },
    loadingText: {
        textAlign: 'center',
        fontSize: 16,
        color: '#666',
        marginTop: 50,
    },
    statsCard: {
        backgroundColor: '#fff',
        padding: 20,
        borderRadius: 12,
        marginBottom: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    statsTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 16,
        color: '#333',
    },
    statsGrid: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    statItem: {
        alignItems: 'center',
    },
    statValue: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#007AFF',
    },
    statLabel: {
        fontSize: 12,
        color: '#666',
        marginTop: 4,
    },
    searchSection: {
        marginBottom: 24,
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    searchInput: {
        flex: 1,
        marginLeft: 12,
        fontSize: 16,
        color: '#333',
    },
    categoriesContainer: {
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 16,
        color: '#333',
    },
    categoriesGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
    },
    categoryCard: {
        backgroundColor: '#fff',
        width: '48%',
        padding: 20,
        borderRadius: 12,
        alignItems: 'center',
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
        borderWidth: 2,
        borderColor: 'transparent',
    },
    categoryCardActive: {
        borderColor: '#007AFF',
        backgroundColor: '#f0f8ff',
    },
    categoryName: {
        fontSize: 14,
        fontWeight: '600',
        color: '#333',
        marginTop: 8,
        textAlign: 'center',
    },
    categoryNameActive: {
        color: '#007AFF',
    },
    contentSection: {
        marginBottom: 24,
    },
    contentCard: {
        backgroundColor: '#fff',
        padding: 16,
        borderRadius: 12,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    contentHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 8,
    },
    contentTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
        flex: 1,
        marginRight: 8,
    },
    contentBadges: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    difficultyBadge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
    },
    difficultyText: {
        fontSize: 12,
        fontWeight: '600',
        color: '#fff',
    },
    completedBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f0f8f0',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
    },
    completedText: {
        fontSize: 12,
        fontWeight: '600',
        color: '#4CAF50',
        marginLeft: 4,
    },
    contentDescription: {
        fontSize: 14,
        color: '#666',
        marginBottom: 12,
    },
    progressContainer: {
        marginBottom: 12,
    },
    progressBar: {
        height: 6,
        backgroundColor: '#e0e0e0',
        borderRadius: 3,
        overflow: 'hidden',
    },
    progressFill: {
        height: '100%',
        backgroundColor: '#007AFF',
        borderRadius: 3,
    },
    progressText: {
        fontSize: 12,
        color: '#666',
        marginTop: 4,
    },
    contentFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    contentMeta: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    metaText: {
        fontSize: 12,
        color: '#666',
        marginLeft: 4,
    },
    emptyText: {
        textAlign: 'center',
        color: '#666',
        padding: 20,
    },
    modalContainer: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    modalHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 16,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#e0e0e0',
    },
    closeButton: {
        padding: 8,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
    },
    placeholder: {
        width: 40,
    },
    modalContent: {
        flex: 1,
        padding: 20,
    },
    modalContentTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 8,
    },
    modalContentDescription: {
        fontSize: 16,
        color: '#666',
        marginBottom: 20,
        lineHeight: 24,
    },
    contentDetails: {
        backgroundColor: '#fff',
        padding: 16,
        borderRadius: 12,
        marginBottom: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    contentDetail: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    contentDetailText: {
        fontSize: 14,
        color: '#333',
        marginLeft: 12,
    },
    contentBody: {
        backgroundColor: '#fff',
        padding: 20,
        borderRadius: 12,
        marginBottom: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    contentBodyText: {
        fontSize: 16,
        color: '#333',
        lineHeight: 24,
    },
    completeButton: {
        backgroundColor: '#4CAF50',
        borderRadius: 12,
        paddingVertical: 16,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    completeButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
        marginLeft: 8,
    },
});
