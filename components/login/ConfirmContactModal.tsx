import React from 'react';
import { Modal, Pressable, StyleSheet, View } from 'react-native';

import { useTheme } from '@/hooks/theme';
import { AppButton } from '../ui/buttons/button';
import { ButtonVariant } from '../ui/buttons/button-variants';
import { AppText } from '../ui/text';
import { TextVariant } from '../ui/text-variants';

type Props = {
  visible: boolean;
  contact: string;
  title?: string;
  message?: string;
  onConfirm: () => void;
  onCancel: () => void;
};

export function ConfirmContactModal({
  visible,
  contact,
  title,
  message,
  onCancel,
  onConfirm,
}: Props) {
  const t = useTheme();
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onCancel}
    >
      <View style={styles.backdrop}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onCancel} />
        <View style={[styles.card, { backgroundColor: t.background.onBase }]}>
          <AppText variant={TextVariant.H3} style={styles.contact}>
            {title ?? contact}
          </AppText>
          <AppText
            variant={TextVariant.Secondary}
            style={styles.message}
            color="lessEmphasis"
          >
            {message ??
              'Is this correct? We will send a confirmation code to this contact.'}
          </AppText>

          <View style={styles.actions}>
            <AppButton title="Confirm" onPress={onConfirm} />
            <AppButton
              title="Go back"
              onPress={onCancel}
              variant={ButtonVariant.Secondary}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  card: {
    width: '100%',
    maxWidth: 460,
    padding: 24,
    borderRadius: 20,
    gap: 12,
  },
  contact: {
    textAlign: 'center',
  },
  message: {
    textAlign: 'center',
  },
  actions: {
    gap: 12,
  },
});

export default ConfirmContactModal;
