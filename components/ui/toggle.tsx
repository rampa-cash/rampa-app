import React, { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Switch, Text, View, ViewStyle } from 'react-native';


import { Palette, Theme } from '@/constants/theme';
import { useTheme, useThemeMode } from '@/hooks/theme';
 
type Mode = keyof typeof Theme;

export type ToggleSize = 'sm' | 'md' | 'lg';

export type ToggleProps = {
  // Controlled value
  value?: boolean;
  // Uncontrolled initial value
  defaultValue?: boolean;
  onValueChange?: (next: boolean) => void;

  disabled?: boolean;
  size?: ToggleSize; // visual scale

  // Colors (override theme)
  trackColorActive?: string;
  trackColorInactive?: string;
  thumbColorActive?: string;
  thumbColorInactive?: string;

  // Optional label
  label?: React.ReactNode;
  labelPosition?: 'left' | 'right';
  containerStyle?: ViewStyle | ViewStyle[];

  // Accessibility
  accessibilityLabel?: string;
  testID?: string;
};

function getScale(size: ToggleSize) {
  switch (size) {
    case 'sm':
      return 0.85;
    case 'lg':
      return 1.1;
    default:
      return 1;
  }
}

function resolveColors(mode: Mode, active: boolean,t:any, disabled?: boolean, overrides?: Pick<ToggleProps,
  'trackColorActive' | 'trackColorInactive' | 'thumbColorActive' | 'thumbColorInactive'>) {
 

  const trackOn = overrides?.trackColorActive ?? Palette.primary.signalViolet;
  const trackOff = overrides?.trackColorInactive ?? (mode === 'dark' ? t.outline.outline2 : t.outline.outline2);

  const thumbOn = overrides?.thumbColorActive ?? t.neutral.white;
  const thumbOff = overrides?.thumbColorInactive ?? t.neutral.white;

  // Disabled dims the track slightly
  const dim = disabled ? 0.6 : 1;
  const applyDim = (hex: string) => hex; // RN Switch doesn't support alpha directly; we control via style opacity

  return {
    track: active ? applyDim(trackOn) : applyDim(trackOff),
    trackFalse: applyDim(trackOff),
    trackTrue: applyDim(trackOn),
    thumb: active ? thumbOn : thumbOff,
    opacity: dim,
  } as const;
}

export function Toggle({
  value,
  defaultValue,
  onValueChange,
  disabled,
  size = 'md',
  trackColorActive,
  trackColorInactive,
  thumbColorActive,
  thumbColorInactive,
  label,
  labelPosition = 'left',
  containerStyle,
  accessibilityLabel,
  testID,
}: ToggleProps) {
  const t = useTheme( );
  const { isDark } = useThemeMode();
  const [inner, setInner] = useState<boolean>(defaultValue ?? false);
  const isControlled = typeof value === 'boolean';
  const current = isControlled ? (value as boolean) : inner;

  const colors = useMemo(
    () =>
      resolveColors(isDark ? 'dark' as Mode : 'light' as Mode, current,t, disabled, {
        trackColorActive,
        trackColorInactive,
        thumbColorActive,
        thumbColorInactive,
      }),
    [isDark, current, t, disabled, trackColorActive, trackColorInactive, thumbColorActive, thumbColorInactive]
  );

  const scale = getScale(size);

  const handleChange = (next: boolean) => {
    if (!isControlled) setInner(next);
    onValueChange?.(next);
  };

  const body = (
    <Switch
      value={current}
      onValueChange={handleChange}
      disabled={disabled}
      trackColor={{ false: colors.trackFalse, true: colors.trackTrue }}
      thumbColor={colors.thumb}
      style={{ transform: [{ scale }], opacity: colors.opacity }}
      testID={testID}
      accessibilityLabel={accessibilityLabel}
    />
  );

  if (!label) {
    return <View style={containerStyle as any}>{body}</View>;
  }

  // t already from useTheme
  const labelNode = typeof label === 'string' ? (
    <Text style={[styles.label, { color: disabled ? t.text.lessEmphasis : t.text.normal }]}>{label}</Text>
  ) : (
    label
  );

  const content = labelPosition === 'left' ? (
    <>
      {labelNode}
      {body}
    </>
  ) : (
    <>
      {body}
      {labelNode}
    </>
  );

  return (
    <Pressable
      accessibilityRole="switch"
      accessibilityState={{ disabled, checked: current }}
      onPress={() => handleChange(!current)}
      disabled={disabled}
      style={[styles.row, containerStyle as any]}
    >
      {content}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  label: {
    fontSize: 16,
  },
});

export default Toggle;
