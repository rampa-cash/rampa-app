import { Theme } from '@/constants/theme';
import { useTheme, useThemeMode } from '@/hooks/theme';
import React from 'react';
import { Pressable, StyleSheet, View, ViewStyle } from 'react-native';
import { IconSymbol } from './icon-symbol';
import { AppText } from './text';
import { TextVariant } from './text-variants';

export type ListCardProps = {
    title: string;
    description?: string;
    onPress?: () => void;
    left?: React.ReactNode;
    right?: React.ReactNode;
    showChevron?: boolean;
    disabled?: boolean;
    style?: ViewStyle | ViewStyle[];
};

function surface(t: typeof Theme.light, isDark: boolean) {
    return {
        bg: isDark ? t.background.onBase2 : t.background.secondary,
        border: isDark ? t.outline.outline2 : t.outline.outline1,
        title: t.text.normal,
        desc: t.text.lessEmphasis,
        chevron: t.icon.normal,
    } as const;
}

export function ListCard({
    title,
    description,
    onPress,
    left,
    right,
    showChevron = true,
    disabled,
    style,
}: ListCardProps) {
    const t = useTheme();
    const { isDark } = useThemeMode();
    const c = surface(t, isDark);

    const Container = onPress ? Pressable : View;

    return (
        <Container
            onPress={onPress as any}
            disabled={disabled}
            style={[
                styles.card,
                {
                    backgroundColor: c.bg,
                    borderColor: c.border,
                    opacity: disabled ? 0.6 : 1,
                },
                style as any,
            ]}
        >
            {left ? <View style={styles.side}>{left}</View> : null}

            <View style={styles.body}>
                <AppText
                    variant={TextVariant.BodyMedium}
                    style={{ color: c.title }}
                >
                    {title}
                </AppText>
                {description ? (
                    <AppText
                        variant={TextVariant.Secondary}
                        style={{ color: c.desc }}
                    >
                        {description}
                    </AppText>
                ) : null}
            </View>

            {right ? <View style={styles.side}>{right}</View> : null}
            {showChevron && !right ? (
                <View style={styles.side}>
                    <IconSymbol
                        name="chevron.right"
                        color={c.chevron}
                        size={20}
                    />
                </View>
            ) : null}
        </Container>
    );
}

const styles = StyleSheet.create({
    card: {
        minHeight: 56,
        borderRadius: 14,
        borderWidth: 1,
        flexDirection: 'row',
        display: 'flex',
        alignItems: 'center',
        paddingHorizontal: 12,
    },
    side: {
        marginRight: 10,
    },
    body: {
        flex: 1,
        paddingVertical: 10,
    },
});

export default ListCard;
