import React from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';

import { useTheme, useThemeMode } from '@/hooks/theme';

export type ModalScaffoldProps = {
    children: React.ReactNode;
    style?: ViewStyle | ViewStyle[];
};

// A simple themed card-like container for modal content
export function ModalScaffold({ children, style }: ModalScaffoldProps) {
    const t = useTheme();
    const { isDark } = useThemeMode();
    const bg = isDark ? t.background.onBase2 : t.background.onBase;
    const border = isDark ? t.outline.outline2 : t.outline.outline1;

    return (
        <View
            style={[
                styles.container,
                { backgroundColor: bg, borderColor: border },
                style as any,
            ]}
        >
            {children}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        padding: 16,
        borderRadius: 16,
        borderWidth: 1,
        gap: 12,
    },
});

export default ModalScaffold;
