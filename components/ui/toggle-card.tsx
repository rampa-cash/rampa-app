import React from 'react';
import { Switch, ViewStyle } from 'react-native';
import { ListCard } from './list-card';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Theme, Palette } from '@/constants/theme';

type Mode = keyof typeof Theme;

export type ToggleCardProps = {
    title: string;
    description?: string;
    value: boolean;
    onValueChange: (value: boolean) => void;
    disabled?: boolean;
    style?: ViewStyle | ViewStyle[];
};

export function ToggleCard({
    title,
    description,
    value,
    onValueChange,
    disabled,
    style,
}: ToggleCardProps) {
    const mode: Mode = useColorScheme() === 'dark' ? 'dark' : 'light';
    const t = Theme[mode];
    return (
        <ListCard
            title={title}
            description={description}
            disabled={disabled}
            showChevron={false}
            style={style}
            right={
                <Switch
                    value={value}
                    disabled={disabled}
                    onValueChange={onValueChange}
                    trackColor={{ false: t.outline.outline2, true: Palette.primary.signalViolet }}
                    thumbColor={mode === 'dark' ? t.neutral.white : t.neutral.white}
                />
            }
        />
    );
}

export default ToggleCard;

