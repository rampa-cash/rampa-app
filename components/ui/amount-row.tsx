import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';

import { useTheme, useThemeMode } from '@/hooks/use-theme';
import { Amount } from './amount';
import { AmountSize, AmountTone } from './amount-variants';
import { SupportedCurrency } from '@/constants/currency';
import { AppText } from './text';
import { TextVariant } from './text-variants';

export type AmountRowProps = {
  label: string;
  value: number;
  currency: SupportedCurrency;
  tone?: AmountTone; // controls the color of amount
  size?: AmountSize;
  showDivider?: boolean; // central thin divider
  useIcon?: boolean;
  containerStyle?: ViewStyle | ViewStyle[];
};

export function AmountRow({
  label,
  value,
  currency,
  tone = AmountTone.Default,
  size = AmountSize.Lg,
  showDivider = true,
  useIcon,
  containerStyle,
}: AmountRowProps) {
  const t = useTheme();
  const { isDark } = useThemeMode();

  return (
    <View style={[styles.row, containerStyle as any]}>
      <View style={styles.left}> 
        <AppText variant={TextVariant.Secondary} style={{ color: t.text.lessEmphasis }}>{label}</AppText>
      </View>

      {showDivider ? (
        <View style={{ width: 1, backgroundColor: isDark ? t.outline.outline2 : t.outline.outline2, opacity: 0.6, alignSelf: 'stretch', marginHorizontal: 8 }} />
      ) : null}

      <View style={styles.right}>
        <Amount value={value} currency={currency} size={size} tone={tone} useIcon={useIcon} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  left: {
    flex: 1,
  },
  right: {
    flex: 1,
    alignItems: 'flex-end',
  },
});

export default AmountRow;

