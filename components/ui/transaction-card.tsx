import { Theme } from '@/constants/theme';
import { useTheme, useThemeMode } from '@/hooks/theme';
import React from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';
import { AppText } from './text';
import { TextVariant } from './text-variants';

type Mode = keyof typeof Theme;

export type TransactionCardProps = {
    title: string; // Merchant or category
    subtitle?: string; // Date/time or note
    amount: string; // formatted amount
    positive?: boolean; // income vs expense
    left?: React.ReactNode; // avatar/icon
    right?: React.ReactNode; // custom trailing node
    style?: ViewStyle | ViewStyle[];
};

export function TransactionCard({
    title,
    subtitle,
    amount,
    positive,
    left,
    right,
    style,
}: TransactionCardProps) {
    const t = useTheme( );
    const { isDark } = useThemeMode();
    const bg = isDark ? t.background.onBase2 : t.background.onBase;
    const border = isDark ? t.outline.outline2 : t.outline.outline1;

    return (
        <View
            style={[
                styles.card,
                { backgroundColor: bg, borderColor: border },
                style as any,
            ]}
        >
            {left ? <View style={styles.left}>{left}</View> : null}
            <View style={styles.body}>
                <AppText
                    variant={TextVariant.BodyMedium}
                    style={{ color: t.text.normal }}
                >
                    {title}
                </AppText>
                {subtitle ? (
                    <AppText
                        variant={TextVariant.Caption}
                        style={{ color: t.text.lessEmphasis }}
                    >
                        {subtitle}
                    </AppText>
                ) : null}
            </View>
            <View style={styles.trailing}>
                <AppText
                    variant={TextVariant.BodyMedium}
                    style={{ color: positive ? t.text.success : t.text.normal }}
                >
                    {positive ? '+' : ''}
                    {amount}
                </AppText>
                {right}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    card: {
        minHeight: 60,
        borderRadius: 14,
        borderWidth: 1,
        paddingHorizontal: 12,
        alignItems: 'center',
        flexDirection: 'row',
    },
    left: {
        marginRight: 10,
    },
    body: {
        flex: 1,
        paddingVertical: 8,
    },
    trailing: {
        alignItems: 'flex-end',
        justifyContent: 'center',
    },
});

export default TransactionCard;
