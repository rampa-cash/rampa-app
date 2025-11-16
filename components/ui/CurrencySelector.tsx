import React, { useMemo, useState } from 'react';
import { Modal, Pressable, StyleSheet, View, ViewStyle } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

import { useTheme } from '@/hooks/theme';
import { AppText } from './text';
import { TextVariant } from './text-variants';
import { ListCard } from './list-card';
import { ModalScaffold } from '@/components/modals/ModalScaffold';

export type CurrencyCode = 'USD' | 'EUR' | 'SOL';

const OPTIONS: Array<{ id: CurrencyCode; label: string; description: string; symbol: string }>= [
  { id: 'USD', label: 'Dollar', description: 'US Dollar', symbol: '$' },
  { id: 'EUR', label: 'Euro', description: 'Euro', symbol: '€' },
  { id: 'SOL', label: 'Solana', description: 'Solana', symbol: '◎' },
];

export type CurrencySelectorProps = {
  value: CurrencyCode;
  onChange: (c: CurrencyCode) => void;
  style?: ViewStyle | ViewStyle[];
};

export function CurrencySelector({ value, onChange, style }: CurrencySelectorProps) {
  const t = useTheme();
  const [open, setOpen] = useState(false);
  const selected = useMemo(() => OPTIONS.find(o => o.id === value)!, [value]);

  return (
    <>
      <Pressable
        onPress={() => setOpen(true)}
        style={[styles.selector, { borderColor: t.outline.outline1, backgroundColor: t.background.onBase }, style as any]}
      >
        <View style={styles.selectorContent}>
          <View style={[styles.badge, { backgroundColor: t.background.onBase2 }]}>
            <AppText variant={TextVariant.BodyMedium}>{selected.symbol}</AppText>
          </View>
          <View style={{ gap: 2 }}>
            <AppText variant={TextVariant.BodyMedium}>{selected.label}</AppText>
            <AppText variant={TextVariant.Caption} color={'lessEmphasis' as any}>
              {selected.description}
            </AppText>
          </View>
        </View>
        <MaterialIcons name="keyboard-arrow-down" size={20} color={t.icon.lessEmphasis} />
      </Pressable>

      <Modal transparent visible={open} animationType="fade" onRequestClose={() => setOpen(false)}>
        <View style={styles.modalBackdrop}>
          <Pressable style={StyleSheet.absoluteFill} onPress={() => setOpen(false)} />
          <View style={styles.modalSheet}>
            <ModalScaffold>
              <AppText variant={TextVariant.BodyMedium}>Choose a currency</AppText>
              <View style={{ gap: 8 }}>
                {OPTIONS.map(opt => (
                  <ListCard
                    key={opt.id}
                    title={`${opt.label} - ${opt.description}`}
                    showChevron={false}
                    onPress={() => { onChange(opt.id); setOpen(false); }}
                    right={opt.id === value ? <MaterialIcons name="check" size={20} color={t.primary.signalViolet} /> : undefined}
                  />
                ))}
              </View>
            </ModalScaffold>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  selector: {
    borderWidth: 1,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  selectorContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  badge: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 14,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
    padding: 16,
  },
  modalSheet: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    overflow: 'hidden',
  },
});

export default CurrencySelector;

