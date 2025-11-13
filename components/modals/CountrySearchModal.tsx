import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

import { AppButton } from '@/components/ui/buttons/button';
import { ButtonVariant } from '@/components/ui/buttons/button-variants';
import { IconSymbol } from '@/components/ui/icon-symbol';
import Icon from '@/components/ui/icons/Icon';
import { IconName } from '@/components/ui/icons/icon-names';
import { AppInput } from '@/components/ui/input';
import { InputVariant } from '@/components/ui/input-variants';
import { AppText } from '@/components/ui/text';
import { TextVariant } from '@/components/ui/text-variants';
import ModalScaffold from './ModalScaffold';

export type CountryItem = {
  code: string; // ISO2
  dial: string; // +1
  name: string;
  emoji?: string; // flag emoji
};

export type CountrySearchModalProps = {
  query: string;
  onChangeQuery: (q: string) => void;
  onCancel?: () => void;
  countries: CountryItem[];
  onSelect?: (code: string) => void;
};

export function CountrySearchModal({
  query,
  onChangeQuery,
  onCancel,
  countries,
  onSelect,
}: CountrySearchModalProps) {
  return (
    <ModalScaffold>
      <View style={styles.headerRow}>
        <View style={{ flex: 1 }}>
          <AppInput
            value={query}
            onChangeText={onChangeQuery}
            placeholder="Search country / region"
            variant={InputVariant.Filled}
            left={<Icon name={IconName.Property1Search} size={18} />}
          />
        </View>
        {onCancel ? (
          <AppButton title="Cancel" variant={ButtonVariant.Tertiary} onPress={onCancel} />
        ) : null}
      </View>

      <ScrollView style={{ maxHeight: 420 }} contentContainerStyle={{ gap: 8 }}>
        {countries.map(c => (
          <View key={c.code} style={styles.row}>
            <AppText variant={TextVariant.Body} style={{ width: 28, textAlign: 'center' }}>
              {c.emoji ?? '🏳️'}
            </AppText>
            <AppText variant={TextVariant.BodyMedium} style={{ width: 44 }}>{c.dial}</AppText>
            <AppText variant={TextVariant.Body}>{c.name}</AppText>
            <View style={{ flex: 1 }} />
            <IconSymbol name={'chevron.right'} size={20} color={'#9BA1A6'} />
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
});

export default CountrySearchModal;
