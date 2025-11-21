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
        <ModalScaffold>
            <AppText
                variant={TextVariant.H2}
                style={{ gap: 10, marginTop: 20, padding: 10 }}
            >
                {title}
            </AppText>
            <View style={{ gap: 10, marginTop: 12, marginBottom: 20 }}>
                {methods.map(m => (
                    <ListCard
                        key={m.id}
                        title={m.title}
                        description={m.subtitle}
                        onPress={m.onPress}
                        style={{ padding: 10 }}
                        left={
                            <Icon
                                bgColor={t.background.base}
                                size={16}
                                style={{
                                    color: isDark.isDark
                                        ? t.icon.variant
                                        : t.icon.normal,
                                }}
                                name={m.icon}
                                shape="circle"
                                containerStyle={{
                                    padding: 22,
                                    borderRadius: 22,
                                }}
                                bordered
                                borderColor={t.outline.outline2}
                            />
                        }
                    />
                ))}
            </View>
            <AppButton
                style={{ marginTop: 20 }}
                title="Done"
                variant={ButtonVariant.PrimaryContrast}
                onPress={onDone}
            />
        </ModalScaffold>
    );
}

export default AddFundsMethodModal;
