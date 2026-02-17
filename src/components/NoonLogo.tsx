import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors, Typography } from '../theme';

interface NoonLogoProps {
  size?: 'sm' | 'md' | 'lg';
  color?: string;
}

export const NoonLogo: React.FC<NoonLogoProps> = ({ size = 'md', color }) => {
  const fontSize = size === 'sm' ? 18 : size === 'lg' ? 32 : 24;
  const dotSize = size === 'sm' ? 5 : size === 'lg' ? 8 : 6;

  return (
    <View style={styles.container}>
      <Text style={[styles.text, { fontSize, color: color ?? Colors.text.primary }]}>
        noon
      </Text>
      <View
        style={[
          styles.dot,
          {
            width: dotSize,
            height: dotSize,
            borderRadius: dotSize / 2,
            backgroundColor: Colors.primary,
            marginLeft: 2,
            alignSelf: 'flex-start',
            marginTop: size === 'sm' ? 5 : size === 'lg' ? 8 : 6,
          },
        ]}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  text: {
    fontFamily: Typography.fontFamily.bold,
    letterSpacing: -0.5,
    color: Colors.text.primary,
  },
  dot: {},
});
