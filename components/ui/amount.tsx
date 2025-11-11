import React, { useMemo } from 'react';
import { View, StyleSheet, ViewStyle, TextStyle } from 'react-native';

import { useTheme } from '@/hooks/use-theme';
import { Palette } from '@/constants/theme';
import { AppText } from './text';
import { TextVariant } from './text-variants';
import Icon from './icons/Icon';
import { IconName } from './icons/icon-names';
import { AmountSize, AmountTone } from './amount-variants';
import { SupportedCurrency, CurrencySymbol } from '@/constants/currency';

export type AmountProps = {
  value: number;
  currency: SupportedCurrency;
  locale?: string;
  showCents?: boolean;
  useIcon?: boolean; // otherwise, use currency character
  size?: AmountSize;
  tone?: AmountTone;
  align?: 'left' | 'center' | 'right';
  containerStyle?: ViewStyle | ViewStyle[];
  textStyle?: TextStyle | TextStyle[];
};

function resolveVariant(size: AmountSize): TextVariant {
  switch (size) {
    case AmountSize.Sm:
      return TextVariant.NumBody;
    case AmountSize.Lg:
      return TextVariant.NumH2;
    case AmountSize.Md:
    default:
      return TextVariant.NumH3;
  }
}

export function Amount({
  value,
  currency,
  locale,
  showCents = true,
  useIcon = false,
  size = AmountSize.Lg,
  tone = AmountTone.Default,
  align,
  containerStyle,
  textStyle,
}: AmountProps) {
  const t = useTheme();

  const color = useMemo(() => {
    switch (tone) {
      case AmountTone.Muted:
        return t.text.lessEmphasis;
      case AmountTone.Accent:
        return Palette.primary.flowAqua;
      case AmountTone.Default:
      default:
        return t.text.normal;
    }
  }, [tone, t]);

  // Format parts so we can style currency symbol separately
  const formatter = useMemo(() => new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: showCents ? 2 : 0,
    maximumFractionDigits: showCents ? 2 : 0,
  }), [currency, locale, showCents]);

  const parts = formatter.formatToParts(value);
  const currencyPart = parts.find(p => p.type === 'currency')?.value ?? CurrencySymbol[currency];
  const integer = parts.filter(p => p.type === 'integer' || p.type === 'group').map(p => p.value).join('');
  const decimal = showCents ? parts.find(p => p.type === 'decimal')?.value + (parts.find(p => p.type === 'fraction')?.value ?? '00') : '';

  const variant = resolveVariant(size);

  return (
    <View style={[styles.row, containerStyle as any]}>
      {useIcon ? (
        <Icon
          name={currency === 'USD' ? IconName.Property1CurrencyDollar : IconName.Property1Euro}
          size={variant === TextVariant.NumH2 ? 24 : variant === TextVariant.NumH3 ? 20 : 16}
          color={color}
          containerStyle={{ marginRight: 6 }}
        />
      ) : (
        <AppText variant={variant} style={[{ color, marginRight: 4 }, textStyle as any]}>
          {currencyPart}
        </AppText>
      )}

      <AppText variant={variant} style={[{ color }, textStyle as any, align ? { textAlign: align } : null]}>
        {integer}
        {decimal}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
});

export default Amount;

