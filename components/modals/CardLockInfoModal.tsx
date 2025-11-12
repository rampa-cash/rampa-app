import React from 'react';
import { StyleSheet, View } from 'react-native';

import { useTheme } from '@/hooks/theme';
import { AppText } from '@/components/ui/text';
import { TextVariant } from '@/components/ui/text-variants';
import Icon from '@/components/ui/icons/Icon';
import { IconName } from '@/components/ui/icons/icon-names';
import { AppButton } from '@/components/ui/button';
import { ButtonVariant } from '@/components/ui/button-variants';
import ModalScaffold from './ModalScaffold';

export type CardLockInfoModalProps = {
  title?: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm?: () => void;
  onCancel?: () => void;
};

export function CardLockInfoModal({
  title = 'What occurs when I lock my card?',
  description = "You can temporarily block withdrawals, card payments, and online purchases. This feature lets you control your card and safeguard against unauthorized transactions. Unlock it whenever you need.",
  confirmText = 'Lock my card',
  cancelText = 'Cancel card lock',
  onConfirm,
  onCancel,
}: CardLockInfoModalProps) {
  const t = useTheme();
  return (
    <ModalScaffold>
      <View style={{ alignItems: 'center', gap: 12 }}>
        <Icon name={IconName.Property1Padlock} size={28} bordered shape="circle" />
        <AppText variant={TextVariant.BodyMedium} style={{ textAlign: 'center' }}>{title}</AppText>
        <AppText variant={TextVariant.Secondary} color={'lessEmphasis' as any} style={{ textAlign: 'center' }}>
          {description}
        </AppText>
        <AppButton title={confirmText} variant={ButtonVariant.PrimaryContrast} onPress={onConfirm} />
        <AppButton title={cancelText} variant={ButtonVariant.Tertiary} onPress={onCancel} />
      </View>
    </ModalScaffold>
  );
}

const styles = StyleSheet.create({});

export default CardLockInfoModal;

