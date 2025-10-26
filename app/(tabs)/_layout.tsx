import { MaterialIcons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import React from 'react';

import { HapticTab } from '@/components/haptic-tab';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function TabLayout() {
    const colorScheme = useColorScheme();

    return (
        <Tabs
            screenOptions={{
                tabBarActiveTintColor: Colors[colorScheme === 'dark' ? 'dark' : 'light'].tint,
                headerShown: false,
                tabBarButton: HapticTab,
            }}
        >
            <Tabs.Screen
                name="home"
                options={{
                    title: 'Home',
                    tabBarIcon: ({ color }) => (
                        <MaterialIcons name="home" size={24} color={color} />
                    ),
                }}
            />
            <Tabs.Screen
                name="send"
                options={{
                    title: 'Send',
                    tabBarIcon: ({ color }) => (
                        <MaterialIcons name="send" size={24} color={color} />
                    ),
                }}
            />
            <Tabs.Screen
                name="learn"
                options={{
                    title: 'Learn',
                    tabBarIcon: ({ color }) => (
                        <MaterialIcons name="school" size={24} color={color} />
                    ),
                }}
            />
        </Tabs>
    );
}
