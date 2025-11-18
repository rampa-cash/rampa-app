import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

import { ContactListItem, type ContactItem } from '@/components/contacts/ContactListItem';
import { AppButton } from '@/components/ui/buttons/button';
import { ButtonVariant } from '@/components/ui/buttons/button-variants';
import Icon from '@/components/ui/icons/Icon';
import { IconName } from '@/components/ui/icons/icon-names';
import { AppInput } from '@/components/ui/input';
import { InputVariant } from '@/components/ui/input-variants';
import { useTheme } from '@/hooks/theme';
import { ModalScaffold } from './ModalScaffold';

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
  placeholder = 'Search for contact to send',
  query,
  onChangeQuery,
  onCancel,
  contacts,
  onInvite,
  onSelect,
}: ContactSearchModalProps) {

  const t = useTheme();
  const sortedContacts = React.useMemo(
    () =>
      [...contacts].sort((a, b) => {
        if (a.invite === b.invite) return 0;
        return a.invite ? 1 : -1;
      }),
    [contacts]
  );

  return (
    <ModalScaffold>
      <View style={styles.headerRow}>
        <View style={{ flex: 1 }}>
          <AppInput
            value={query}
            onChangeText={onChangeQuery}
            placeholder={placeholder || title}
            variant={InputVariant.Filled}
            left={<Icon name={IconName.Property1Search} size={20} color={t.icon.normal} />}
            containerStyle={{ marginBottom: 0 }}
            backgroundColor={t.background.base}
            inputStyle={{ height: 58 , fontSize: 18}}
          />
        </View>
        {onCancel ? (
          <AppButton title="Cancel" variant={ButtonVariant.Tertiary} onPress={onCancel} color='normal' />
        ) : null}
      </View>

      <ScrollView style={{ maxHeight: 520, borderColor: t.background.dim, borderWidth: 1, borderRadius: 14, padding: 12, backgroundColor: t.background.base }} contentContainerStyle={{ gap: 8 }}>
        {sortedContacts.map(c => (
          <ContactListItem
            key={c.id}
            contact={c}
            onPress={onSelect}
            onInvite={onInvite}
            showInvite
          />
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
});

export default ContactSearchModal;

