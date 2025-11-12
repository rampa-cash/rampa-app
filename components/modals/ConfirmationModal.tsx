import React from 'react';
import { StyleSheet, View } from 'react-native';

import { useTheme } from '@/hooks/theme';
import { AppText } from '@/components/ui/text';
import { TextVariant } from '@/components/ui/text-variants';
import { AppButton } from '@/components/ui/button';
import { ButtonVariant } from '@/components/ui/button-variants';
import ModalScaffold from './ModalScaffold';

export type ConfirmationModalProps = {
  title?: string;
  subtitle?: string;
  valueLabel?: string; // e.g., email
  value?: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm?: () => void;
  onCancel?: () => void;
};

export function ConfirmationModal({
  title,
  subtitle,
  valueLabel,
  value,
  confirmText = 'Confirm',
  cancelText = 'Go back',
  onConfirm,
  onCancel,
}: ConfirmationModalProps) {
  const t = useTheme();

  return (
    <ModalScaffold>
      {value ? (
        <View style={styles.valueBox}>
          <AppText variant={TextVariant.BodyMedium}>{value}</AppText>
          {valueLabel ? (
            <AppText variant={TextVariant.Secondary} color={'lessEmphasis' as any}>
              {valueLabel}
            </AppText>
          ) : null}
        </View>
      ) : null}

      {title ? (
        <AppText variant={TextVariant.BodyMedium}>{title}</AppText>
      ) : null}
      {subtitle ? (
        <AppText variant={TextVariant.Secondary} color={'lessEmphasis' as any}>
          {subtitle}
        </AppText>
      ) : null}

      <AppButton title={confirmText} variant={ButtonVariant.Primary} onPress={onConfirm} />
      <AppButton title={cancelText} variant={ButtonVariant.Tertiary} onPress={onCancel} />
    </ModalScaffold>
  );
}

const styles = StyleSheet.create({
  valueBox: {
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
});

export default ConfirmationModal;

