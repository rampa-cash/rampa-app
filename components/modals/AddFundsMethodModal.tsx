import React from 'react';
import { View } from 'react-native';

import { AppButton } from '@/components/ui/buttons/button';
import { ButtonVariant } from '@/components/ui/buttons/button-variants';
import Icon from '@/components/ui/icons/Icon';
import { ListCard } from '@/components/ui/list-card';
import type { AddFundsMethod } from '@/constants/add-funds';
import { useTheme, useThemeMode } from '@/hooks/theme';
import { AppText } from '../ui/text';
import { TextVariant } from '../ui/text-variants';
import { ModalScaffold } from './ModalScaffold';

export type AddMethod = AddFundsMethod & {
    highlighted?: boolean;
    onPress?: () => void;
};

export type AddFundsMethodModalProps = {
    title?: string;
    methods: AddMethod[];
    onDone?: () => void;
};

export function AddFundsMethodModal({
    title = 'Change add funds method',
    methods,
    onDone,
}: AddFundsMethodModalProps) {
    const t = useTheme();
    const isDark = useThemeMode();
    return (
        <ModalScaffold >
            <AppText variant={TextVariant.H2}>{title}</AppText>
            <View style={{ gap: 10, marginTop: 12 }}>
                {methods.map(m => (
                    <ListCard
                        key={m.id}
                        title={m.title}
                        description={m.subtitle}
                        onPress={m.onPress}
                        left={
                            <Icon
                                name={m.icon}
                                color={isDark ? t.icon.variant : undefined}
                            />
                        }
                    />
                ))}
            </View>
            <AppButton
                title="Done"
                variant={ButtonVariant.PrimaryContrast}
                onPress={onDone}
            />
        </ModalScaffold>
    );
}

export default AddFundsMethodModal;
