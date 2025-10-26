import { MaterialIcons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import React from 'react';
import {
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { apiClient } from '../../src/lib/apiClient';

export default function LearnScreen() {
    const { data: content, isLoading } = useQuery({
        queryKey: ['educational-content'],
        queryFn: () => apiClient.getEducationalContent({ limit: 10 }),
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

            <View style={styles.categoriesContainer}>
                <Text style={styles.sectionTitle}>Categories</Text>
                <View style={styles.categoriesGrid}>
                    {categories.map(category => (
                        <TouchableOpacity
                            key={category.id}
                            style={styles.categoryCard}
                        >
                            <MaterialIcons
                                name={category.icon as any}
                                size={32}
                                color="#007AFF"
                            />
                            <Text style={styles.categoryName}>
                                {category.name}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </View>

            <View style={styles.contentSection}>
                <Text style={styles.sectionTitle}>Featured Content</Text>
                {content?.data?.length ? (
                    content.data.map(item => (
                        <TouchableOpacity
                            key={item.id}
                            style={styles.contentCard}
                        >
                            <View style={styles.contentHeader}>
                                <Text style={styles.contentTitle}>
                                    {item.title}
                                </Text>
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
                            </View>
                            <Text style={styles.contentDescription}>
                                {item.description}
                            </Text>
                            <View style={styles.contentFooter}>
                                <View style={styles.contentMeta}>
                                    <MaterialIcons
                                        name="schedule"
                                        size={16}
                                        color="#666"
                                    />
                                    <Text style={styles.metaText}>
                                        {item.estimatedTime} min
                                    </Text>
                                </View>
                                <View style={styles.contentMeta}>
                                    <MaterialIcons
                                        name="star"
                                        size={16}
                                        color="#FFD700"
                                    />
                                    <Text style={styles.metaText}>
                                        {item.points} pts
                                    </Text>
                                </View>
                                <View style={styles.contentMeta}>
                                    <MaterialIcons
                                        name="school"
                                        size={16}
                                        color="#666"
                                    />
                                    <Text style={styles.metaText}>
                                        {item.type}
                                    </Text>
                                </View>
                            </View>
                        </TouchableOpacity>
                    ))
                ) : (
                    <Text style={styles.emptyText}>No content available</Text>
                )}
            </View>

            <View style={styles.progressSection}>
                <Text style={styles.sectionTitle}>Your Progress</Text>
                <View style={styles.progressCard}>
                    <View style={styles.progressItem}>
                        <Text style={styles.progressLabel}>
                            Courses Completed
                        </Text>
                        <Text style={styles.progressValue}>0</Text>
                    </View>
                    <View style={styles.progressItem}>
                        <Text style={styles.progressLabel}>Points Earned</Text>
                        <Text style={styles.progressValue}>0</Text>
                    </View>
                    <View style={styles.progressItem}>
                        <Text style={styles.progressLabel}>
                            Learning Streak
                        </Text>
                        <Text style={styles.progressValue}>0 days</Text>
                    </View>
                </View>
            </View>
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
    },
    categoryName: {
        fontSize: 14,
        fontWeight: '600',
        color: '#333',
        marginTop: 8,
        textAlign: 'center',
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
        alignItems: 'center',
        marginBottom: 8,
    },
    contentTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
        flex: 1,
        marginRight: 8,
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
    contentDescription: {
        fontSize: 14,
        color: '#666',
        marginBottom: 12,
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
    progressSection: {
        marginBottom: 24,
    },
    progressCard: {
        backgroundColor: '#fff',
        padding: 20,
        borderRadius: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    progressItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 8,
    },
    progressLabel: {
        fontSize: 16,
        color: '#333',
    },
    progressValue: {
        fontSize: 16,
        fontWeight: '600',
        color: '#007AFF',
    },
});
