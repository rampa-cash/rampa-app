import React from 'react';
import { Image, ScrollView, StyleSheet, Text, View } from 'react-native';

import { useTheme } from '@/hooks/theme';
import { AppText } from '@/components/ui/text';
import { TextVariant } from '@/components/ui/text-variants';
import { AppInput } from '@/components/ui/input';
import { InputVariant } from '@/components/ui/input-variants';
import Icon from '@/components/ui/icons/Icon';
import { IconName } from '@/components/ui/icons/icon-names';
import { AppButton } from '@/components/ui/button';
import { ButtonVariant } from '@/components/ui/button-variants';
import ModalScaffold from './ModalScaffold';

export type ContactItem = {
  id: string;
  name: string;
  phone: string;
  avatarUri?: string;
  invite?: boolean; // if true, show Invite action on trailing
};

export type ContactSearchModalProps = {
  title?: string;
  placeholder?: string;
  query: string;
  onChangeQuery: (q: string) => void;
  onCancel?: () => void;
  contacts: ContactItem[];
  onInvite?: (id: string) => void;
  onSelect?: (id: string) => void;
};

export function ContactSearchModal({
  title = 'Search for contact to send',
  placeholder = 'Search',
  query,
  onChangeQuery,
  onCancel,
  contacts,
  onInvite,
  onSelect,
}: ContactSearchModalProps) {
  const t = useTheme();

  return (
    <ModalScaffold>
      <View style={styles.headerRow}>
        <View style={{ flex: 1 }}>
          <AppInput
            value={query}
            onChangeText={onChangeQuery}
            placeholder={title}
            variant={InputVariant.Filled}
            left={<Icon name={IconName.Property1Search} size={18} />}
            containerStyle={{ marginBottom: 0 }}
          />
        </View>
        {onCancel ? (
          <AppButton title="Cancel" variant={ButtonVariant.Tertiary} onPress={onCancel} />
        ) : null}
      </View>

      <ScrollView style={{ maxHeight: 420 }} contentContainerStyle={{ gap: 8 }}>
        {contacts.map(c => (
          <View key={c.id} style={styles.row}>
            {c.avatarUri ? (
              <Image source={{ uri: c.avatarUri }} style={styles.avatar} />
            ) : (
              <View style={[styles.avatar, { backgroundColor: t.background.light }] } />
            )}
            <View style={{ flex: 1 }}>
              <AppText variant={TextVariant.BodyMedium}>{c.name}</AppText>
              <AppText variant={TextVariant.Caption} color={'lessEmphasis' as any}>
                {c.phone}
              </AppText>
            </View>
            {c.invite ? (
              <AppButton title="Invite" variant={ButtonVariant.Tertiary} onPress={() => onInvite?.(c.id)} />
            ) : (
              <AppButton title="Send" variant={ButtonVariant.PrimaryContrast} onPress={() => onSelect?.(c.id)} />
            )}
          </View>
        ))}
      </ScrollView>
    </ModalScaffold>
  );
}

const styles = StyleSheet.create({
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 10,
    borderRadius: 12,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
  },
});

export default ContactSearchModal;

