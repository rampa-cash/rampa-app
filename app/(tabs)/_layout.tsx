import { Tabs } from 'expo-router';
import React from 'react';

import { HapticTab } from '@/components/haptic-tab';
import CustomTabBar from '@/components/TabBar';
import Icon from '@/components/ui/icons/Icon';
import { IconName } from '@/components/ui/icons/icon-names';
import { Palette } from '@/constants/theme';
import { useTheme, useThemeMode } from '@/hooks/theme';
import { View } from 'react-native';

export default function TabLayout() {
    const { icon, background, primary, neutral, text } = useTheme();
    const { isDark } = useThemeMode();

    return (
        <View style={{ flex: 1 }}>
            <Tabs
                screenOptions={{
                    tabBarActiveTintColor: Palette.primary.flowAqua,
                    headerShown: false,
                    tabBarShowLabel: false,

                    tabBarButton: HapticTab,
                    tabBarStyle: {
                        minHeight: 80,
                        backgroundColor: '#fcfcfd', // fondo del tab bar + stepper

                    },
                    tabBarIconStyle: {
                        height: '100%',
                        width: '100%',
                    },
                }}
                tabBar={props => (
                    <CustomTabBar inactiveSteps={[2]} {...props} />
                )}
            >
                <Tabs.Screen
                    name="home"
                    options={{
                        title: 'Home',
                        tabBarIcon: ({ color, focused }) => (
                            <Icon
                                name={
                                    focused
                                        ? IconName.Property1RampaSolid
                                        : IconName.Property1RampaOutline
                                }
                                size={24}
                                color={color}
                            />
                        ),
                    }}
                />

                <Tabs.Screen
                    name="card"
                    options={{
                        title: 'Card',
                        tabBarIcon: ({ color, focused }) => (
                            <Icon
                                name={
                                    focused
                                        ? IconName.Property1Wallet
                                        : IconName.Property1CardOutline
                                }
                                size={24}
                                color={color}
                            />
                        ),
                    }}
                />
                <Tabs.Screen
                    name="send"
                    options={{
                        title: 'Send',
                        tabBarIcon: ({ color, focused }) => (
                            <Icon
                                name={IconName.Property1Send}
                                bordered={!isDark && !focused}
                                size={24}
                                bgColor={
                                    focused
                                        ? color
                                        : isDark
                                            ? neutral.graphiteGrey
                                            : 'transparent'
                                }
                                label="Send"
                                shape="circle"
                                borderColor={icon.lessEmphasis}
                                color={
                                    isDark
                                        ? icon.normal
                                        : focused
                                            ? 'white'
                                            : icon.normal
                                }
                            />
                        ),
                    }}
                />

                <Tabs.Screen
                    name="invest"
                    options={{
                        title: 'Invest',
                        tabBarIcon: ({ color, focused }) => (
                            <Icon
                                name={
                                    focused
                                        ? IconName.Property1Chart
                                        : IconName.Property1ChartOutline
                                }
                                size={24}
                                color={color}
                            />
                        ),
                    }}
                />
                <Tabs.Screen
                    name="explore"
                    options={{
                        title: 'Explore',
                        tabBarIcon: ({ color, focused }) => (
                            <Icon
                                name={
                                    focused
                                        ? IconName.Property1Learn
                                        : IconName.Property1LearnOutline
                                }
                                size={24}
                                color={color}
                            />
                        ),
                    }}
                />
            </Tabs>
        </View>
    );
}
