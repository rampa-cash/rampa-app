import React from 'react';
import { Image, StyleSheet, View } from 'react-native';
import { useTheme } from '@/hooks/theme';

export default function SplashScreen() {
  const { background } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: background.base }]}>
      <Image
        source={require('../../assets/images/splash-icon.png')}
        style={styles.image}
        resizeMode="contain"
        accessibilityLabel="Splash image"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  image: {
    width: 160,
    height: 160,
  },
});

