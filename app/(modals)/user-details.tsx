import { Colors } from '@/constants/theme';
import { useTheme } from '@/hooks/theme';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import {
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import Toggle from '../../components/ui/toggle';
import { useAuth } from '../../src/domain/auth';

export default function UserDetailsScreen() {
    const router = useRouter();
    const { user, logout } = useAuth();
    const { theme, toggleTheme } = useTheme();

    const handleLogout = () => {
        logout();
        router.replace('/(auth)/login' as any);
    };

    const menuItems = [
        {
            id: 'profile',
            name: 'Edit Profile',
            icon: 'person',
            action: () => console.log('Edit Profile'),
        },
        {
            id: 'security',
            name: 'Security Settings',
            icon: 'security',
            action: () => console.log('Security'),
        },
        {
            id: 'notifications',
            name: 'Notifications',
            icon: 'notifications',
            action: () => console.log('Notifications'),
        },
        {
            id: 'contacts',
            name: 'Manage Contacts',
            icon: 'contacts',
            action: () => console.log('Contacts'),
        },
        {
            id: 'preferences',
            name: 'Preferences',
            icon: 'settings',
            action: () => console.log('Preferences'),
        },
        {
            id: 'help',
            name: 'Help & Support',
            icon: 'help',
            action: () => console.log('Help'),
        },
        {
            id: 'about',
            name: 'About',
            icon: 'info',
            action: () => console.log('About'),
        },
    ];

    const styles = getStyles(theme);

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity
                    onPress={() => router.back()}
                    style={styles.closeButton}
                >
                    <MaterialIcons name="close" size={24} color={Colors[theme].text} />
                </TouchableOpacity>
                <Text style={styles.title}>Profile</Text>
                <View style={styles.placeholder} />
            </View>

            <ScrollView style={styles.content}>
                <View style={styles.profileSection}>
                    <View style={styles.avatarContainer}>
                        <MaterialIcons
                            name="account-circle"
                            size={80}
                            color="#007AFF"
                        />
                    </View>
                    <Text style={styles.userName}>
                        {user?.firstName} {user?.lastName}
                    </Text>
                    <Text style={styles.userEmail}>{user?.email}</Text>
                    <View style={styles.kycStatus}>
                        <MaterialIcons
                            name={
                                user?.kycStatus === 'verified'
                                    ? 'verified'
                                    : 'pending'
                            }
                            size={16}
                            color={
                                user?.kycStatus === 'verified'
                                    ? '#4CAF50'
                                    : '#FF9800'
                            }
                        />
                        <Text
                            style={[
                                styles.kycText,
                                {
                                    color:
                                        user?.kycStatus === 'verified'
                                            ? '#4CAF50'
                                            : '#FF9800',
                                },
                            ]}
                        >
                            {user?.kycStatus === 'verified'
                                ? 'Verified'
                                : 'Pending Verification'}
                        </Text>
                    </View>
                </View>

                <View style={styles.menuSection}>
                    {menuItems.map(item => (
                        <TouchableOpacity
                            key={item.id}
                            style={styles.menuItem}
                            onPress={item.action}
                        >
                            <View style={styles.menuItemLeft}>
                                <MaterialIcons
                                    name={item.icon as any}
                                    size={24}
                                    color={Colors[theme].icon}
                                />
                                <Text style={styles.menuItemText}>
                                    {item.name}
                                </Text>
                            </View>
                            <MaterialIcons
                                name="chevron-right"
                                size={20}
                                color="#ccc"
                            />
                        </TouchableOpacity>
                    ))}
                     <View style={[styles.menuItem, { justifyContent: 'space-between' }]}>
                        <View style={styles.menuItemLeft}>
                            <MaterialIcons name="brightness-6" size={24} color={Colors[theme].icon} />
                            <Text style={styles.menuItemText}>Dark Mode</Text>
                        </View>
                        <Toggle
                            value={theme === 'dark'}
                            onValueChange={toggleTheme}
                        />
                    </View>
                </View>

                <View style={styles.statsSection}>
                    <Text style={styles.sectionTitle}>Account Statistics</Text>
                    <View style={styles.statsGrid}>
                        <View style={styles.statItem}>
                            <Text style={styles.statValue}>0</Text>
                            <Text style={styles.statLabel}>Transactions</Text>
                        </View>
                        <View style={styles.statItem}>
                            <Text style={styles.statValue}>0</Text>
                            <Text style={styles.statLabel}>Contacts</Text>
                        </View>
                        <View style={styles.statItem}>
                            <Text style={styles.statValue}>0</Text>
                            <Text style={styles.statLabel}>
                                Learning Points
                            </Text>
                        </View>
                        <View style={styles.statItem}>
                            <Text style={styles.statValue}>0</Text>
                            <Text style={styles.statLabel}>
                                Courses Completed
                            </Text>
                        </View>
                    </View>
                </View>

                <TouchableOpacity
                    style={styles.logoutButton}
                    onPress={handleLogout}
                >
                    <MaterialIcons name="logout" size={20} color="#F44336" />
                    <Text style={styles.logoutText}>Logout</Text>
                </TouchableOpacity>
            </ScrollView>
        </View>
    );
}

const getStyles = (theme: 'light' | 'dark') => StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors[theme].background,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 20,
        backgroundColor: Colors[theme].background,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    closeButton: {
        padding: 4,
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
        color: Colors[theme].text,
    },
    placeholder: {
        width: 32,
    },
    content: {
        flex: 1,
        padding: 20,
    },
    profileSection: {
        backgroundColor: Colors[theme].background,
        padding: 24,
        borderRadius: 12,
        alignItems: 'center',
        marginBottom: 20,
    },
    avatarContainer: {
        marginBottom: 16,
    },
    userName: {
        fontSize: 24,
        fontWeight: 'bold',
        color: Colors[theme].text,
        marginBottom: 4,
    },
    userEmail: {
        fontSize: 16,
        color: '#666',
        marginBottom: 12,
    },
    kycStatus: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f0f8ff',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 16,
    },
    kycText: {
        fontSize: 14,
        fontWeight: '600',
        marginLeft: 4,
    },
    menuSection: {
        backgroundColor: Colors[theme].background,
        borderRadius: 12,
        marginBottom: 20,
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    menuItemLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    menuItemText: {
        fontSize: 16,
        color: Colors[theme].text,
        marginLeft: 12,
    },
    statsSection: {
        backgroundColor: Colors[theme].background,
        padding: 20,
        borderRadius: 12,
        marginBottom: 20,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: Colors[theme].text,
        marginBottom: 16,
    },
    statsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
    },
    statItem: {
        width: '48%',
        alignItems: 'center',
        padding: 16,
        backgroundColor: '#f9f9f9',
        borderRadius: 8,
        marginBottom: 12,
    },
    statValue: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#007AFF',
        marginBottom: 4,
    },
    statLabel: {
        fontSize: 12,
        color: '#666',
        textAlign: 'center',
    },
    logoutButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: Colors[theme].background,
        padding: 16,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#F44336',
    },
    logoutText: {
        color: '#F44336',
        fontSize: 16,
        fontWeight: '600',
        marginLeft: 8,
    },
});
