import React from 'react';
import {
    ScrollView,
    ScrollViewProps,
    StyleSheet,
    View,
    ViewStyle,
} from 'react-native';

import { Gradient } from '@/constants/theme';
import { useTheme, useThemeMode } from '@/hooks/theme';
import { LinearGradient } from 'expo-linear-gradient';

export type ScreenContainerProps = {
    children: React.ReactNode;
    style?: ViewStyle | ViewStyle[];
    contentContainerStyle?: ScrollViewProps['contentContainerStyle'];
    scroll?: boolean; // wrap in ScrollView
    padded?: boolean | number; // default padding 16
    variant?: 'base' | 'surface' | 'transparent';
    gradient?: Gradient; // optional gradient background
};

export function ScreenContainer({
    children,
    style,
    contentContainerStyle,
    scroll,
    padded = false,
    variant = 'base',
    gradient,
}: ScreenContainerProps) {
    const t = useTheme();
    const { isDark } = useThemeMode();

    const backgroundColor = (() => {
        if (variant === 'transparent') return 'transparent';
        if (variant === 'surface')
            return isDark ? t.background.onBase2 : t.background.onBase;
        return t.background.base;
    })();

    const paddingStyle: ViewStyle | undefined = padded
        ? { padding: typeof padded === 'number' ? padded : 16 }
        : undefined;

    const Container = scroll ? ScrollView : View;

    const baseStyle: any = [
        styles.base,
        { backgroundColor },
        paddingStyle,
        style as any,
    ];

    if (gradient) {
        return (
            <LinearGradient
                colors={[gradient![0], gradient![1]]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={[styles.base, paddingStyle, style as any]}
            >
                {scroll ? (
                    <ScrollView
                        contentContainerStyle={contentContainerStyle}
                        style={{ flex: 1 }}
                    >
                        {children}
                    </ScrollView>
                ) : (
                    children
                )}
            </LinearGradient>
        );
    }
    return (
        <Container
            style={baseStyle}
            {...(scroll
                ? {
                      contentContainerStyle,
                      keyboardShouldPersistTaps: 'handled',
                      keyboardDismissMode: 'on-drag',
                  }
                : {})}
        >
            {children}
        </Container>
    );
}

const styles = StyleSheet.create({
    base: {
        flex: 1,
    },
});

export default ScreenContainer;
