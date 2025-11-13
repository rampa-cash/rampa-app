import React from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { AppButton } from '@/components/ui/buttons/button';
import { ButtonVariant } from '@/components/ui/buttons/button-variants';
import { IconSymbol } from '@/components/ui/icon-symbol';
import Icon from '@/components/ui/icons/Icon';
import { IconName } from '@/components/ui/icons/icon-names';
import { AppInput } from '@/components/ui/input';
import { InputVariant } from '@/components/ui/input-variants';
import { AppText } from '@/components/ui/text';
import { TextVariant } from '@/components/ui/text-variants';
import { useTheme } from '@/hooks/theme';
import { ModalScaffold } from './ModalScaffold';

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
  selectedCode?: string;
};

export function CountrySearchModal({
  query,
  onChangeQuery,
  onCancel,
  countries,
  onSelect,
  selectedCode,
}: CountrySearchModalProps) {
  const t = useTheme();

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
        {countries.map(c => {
          const isSelected = c.code === selectedCode;
          return (
            <Pressable
              key={c.code}
              onPress={() => onSelect?.(c.code)}
              disabled={!onSelect}
              style={({ pressed }) => [
                styles.row,
                {
                  backgroundColor: isSelected ? t.background.secondary : t.background.onBase,
                  borderColor: isSelected ? t.primary.signalViolet : t.outline.outline1,
                  opacity: pressed ? 0.9 : 1,
                },
              ]}
            >
              <AppText variant={TextVariant.Body} style={{ width: 32, textAlign: 'center' }}>
                {c.emoji ?? '🌐'}
              </AppText>
              <AppText variant={TextVariant.BodyMedium} style={{ width: 48 }}>
                {c.dial}
              </AppText>
              <AppText variant={TextVariant.Body}>{c.name}</AppText>
              <View style={{ flex: 1 }} />
              <IconSymbol name={'chevron.right'} size={20} color={'#9BA1A6'} />
            </Pressable>
          );
        })}
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
    borderWidth: 1,
  },
});

export default CountrySearchModal;
