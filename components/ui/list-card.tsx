import React from 'react';
import { Pressable, View, ViewStyle, StyleSheet } from 'react-native';
import { AppText } from './text';
import { TextVariant } from './text-variants';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Theme } from '@/constants/theme';
import { IconSymbol } from './icon-symbol';

type Mode = keyof typeof Theme;

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

function surface(mode: Mode) {
    const t = Theme[mode];
    return {
        bg: mode === 'dark' ? t.background.onBase2 : t.background.onBase,
        border: mode === 'dark' ? t.outline.outline2 : t.outline.outline1,
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
    const mode: Mode = useColorScheme() === 'dark' ? 'dark' : 'light';
    const c = surface(mode);

    const Container = onPress ? Pressable : View;

    return (
        <Container
            onPress={onPress as any}
            disabled={disabled}
            style={({ pressed }: any) => [
                styles.card,
                { backgroundColor: c.bg, borderColor: c.border, opacity: disabled ? 0.6 : pressed ? 0.9 : 1 },
                style as any,
            ]}
        >
            {left ? <View style={styles.side}>{left}</View> : null}

            <View style={styles.body}>
                <AppText variant={TextVariant.BodyMedium} style={{ color: c.title }}>
                    {title}
                </AppText>
                {description ? (
                    <AppText variant={TextVariant.Secondary} style={{ color: c.desc }}>
                        {description}
                    </AppText>
                ) : null}
            </View>

            {right ? <View style={styles.side}>{right}</View> : null}
            {showChevron && !right ? (
                <View style={styles.side}>
                    <IconSymbol name="chevron.right" color={c.chevron} size={20} />
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

