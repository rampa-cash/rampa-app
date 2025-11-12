import React from 'react';
import { Pressable, StyleSheet, View, ViewStyle, TextStyle } from 'react-native';

import { useTheme, useThemeMode } from '@/hooks/theme';
import { Palette } from '@/constants/theme';
import Icon from './icons/Icon';
import { IconName } from './icons/icon-names';
import { AppText } from './text';
import { TextVariant } from './text-variants';

export type CircularButtonProps = {
  iconName?: IconName;
  icon?: React.ReactNode; // custom icon node override
  label?: string; // caption below the circle
  onPress?: () => void;
  disabled?: boolean;

  diameter?: number; // circle size
  backgroundColor?: string; // override
  iconColor?: string; // override

  style?: ViewStyle | ViewStyle[]; // wrapper (align items vertically)
  circleStyle?: ViewStyle | ViewStyle[]; // circle only
  labelStyle?: TextStyle | TextStyle[];
};

/**
 * Circular action button with an icon inside and an optional label below.
 * Matches the visual shown (white/neutral pill, centered glyph, caption).
 */
export function CircularButton({
  iconName = IconName.Property1ArrowUp,
  icon,
  label,
  onPress,
  disabled,
  diameter = 72,
  backgroundColor,
  iconColor,
  style,
  circleStyle,
  labelStyle,
}: CircularButtonProps) {
  const t = useTheme();
  const { isDark } = useThemeMode();

  const circleBg = backgroundColor ?? t.neutral.white;
  const glyphColor = iconColor ?? (isDark ? t.icon.variant : t.icon.variant);

  const iconNode = icon ?? (
    <Icon name={iconName} size={24} color={glyphColor} />
  );

  return (
    <View style={[styles.wrapper, style as any]}>
      <Pressable
        onPress={onPress}
        disabled={disabled}
        style={({ pressed }) => [
          styles.circle,
          {
            width: diameter,
            height: diameter,
            borderRadius: diameter / 2,
            backgroundColor: circleBg,
            opacity: disabled ? 0.6 : pressed ? 0.9 : 1,
          },
          circleStyle as any,
        ]}
      >
        {iconNode}
      </Pressable>
      {label ? (
        <AppText
          variant={TextVariant.Secondary}
          align="center"
          style={[{ marginTop: 6 }, labelStyle as any]}
        >
          {label}
        </AppText>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  circle: {
    alignItems: 'center',
    justifyContent: 'center',
    // subtle shadow on light theme can be added by parent if desired
  },
});

export default CircularButton;

