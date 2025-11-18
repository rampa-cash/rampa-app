import React, { useMemo, useRef } from 'react';
import { Pressable, StyleSheet, TextInput, View, ViewStyle } from 'react-native';

import { Palette } from '@/constants/theme';
import { useTheme } from '@/hooks/theme';
import { AppText } from './text';
import { TextVariant } from './text-variants';

export type UsdAmountInputProps = {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  helperText?: string;
  containerStyle?: ViewStyle | ViewStyle[];
};

const sanitize = (value: string) => {
  const normalized = value.replace(',', '.');
  const [head, ...rest] = normalized.replace(/[^0-9.]/g, '').split('.');
  const tail = rest.join('');
  return tail ? `${head}.${tail}` : head;
};

export function UsdAmountInput({
  value,
  onChange,
  placeholder = '0.00',
  helperText,
  containerStyle,
}: UsdAmountInputProps) {
  const inputRef = useRef<TextInput>(null);
  const t = useTheme();

  const parsedValue = useMemo(() => sanitize(value), [value]);

  const handleChange = (text: string) => {
    onChange(sanitize(text));
  };

  return (
    <View style={[containerStyle as any]}>
      <Pressable
        onPress={() => inputRef.current?.focus()}
        style={[styles.inputShell, { backgroundColor: t.background.onBase, borderColor: t.outline.outline1 }]}
      >
        <AppText
          variant={TextVariant.NumH2}
          style={[styles.currency, { color: t.text.normal }]}
        >
          $
        </AppText>
        <View style={[styles.divider, { backgroundColor: t.outline.outline1 }]} />
        <TextInput
          ref={inputRef}
          value={parsedValue}
          onChangeText={handleChange}
          placeholder={placeholder}
          keyboardType="decimal-pad"
          inputMode="decimal"
          placeholderTextColor={t.text.placeholder}
          style={[
            styles.input,
            { color: t.text.normal, backgroundColor: t.background.onBase },
          ]}
        />
      </Pressable>
      {helperText ? (
        <AppText
          variant={TextVariant.Caption}
          color="lessEmphasis"
          style={styles.helper}
        >
          {helperText}
        </AppText>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  inputShell: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Palette.outline.outline1,
  },
  currency: {
    fontSize: 36,
    fontWeight: '700',
    marginRight: 8,
  },
  divider: {
    width: StyleSheet.hairlineWidth,
    height: 36,
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 36,
    fontWeight: '600',
    paddingVertical: 6,
    paddingHorizontal: 0,
  },
  helper: {
    marginTop: 8,
  },
});

export default UsdAmountInput;
