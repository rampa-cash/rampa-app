import { Palette, Theme } from '@/constants/theme';
import { useTheme } from '@/hooks/theme';
import React from 'react';
import { Switch, ViewStyle } from 'react-native';
import { ListCard } from './list-card';

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
    const t = useTheme();
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
                    trackColor={{
                        false: t.outline.outline2,
                        true: Palette.primary.signalViolet,
                    }}
                    thumbColor={t.neutral.white}
                />
            }
        />
    );
}

export default ToggleCard;
