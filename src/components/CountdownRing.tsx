import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { Colors, Typography } from '../theme';

interface CountdownRingProps {
  timeLeft: number;
  total: number;
  size?: number;
  color?: string;
  label?: string;
}

export const CountdownRing: React.FC<CountdownRingProps> = ({
  timeLeft,
  total,
  size = 52,
  color = Colors.primary,
  label,
}) => {
  const ratio = timeLeft / total;
  const isUrgent = timeLeft <= 5;
  const displayColor = isUrgent ? Colors.warning : color;

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <View
        style={[
          styles.ring,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            borderColor: isUrgent ? Colors.warning + '40' : color + '30',
          },
        ]}
      >
        <View
          style={[
            styles.innerFill,
            {
              width: size - 6,
              height: size - 6,
              borderRadius: (size - 6) / 2,
              backgroundColor: isUrgent ? Colors.warning + '15' : color + '12',
            },
          ]}
        />
      </View>
      <View style={styles.content}>
        <Text style={[styles.number, { color: displayColor, fontSize: size * 0.3 }]}>
          {timeLeft}
        </Text>
        {label && (
          <Text style={[styles.label, { fontSize: size * 0.14 }]}>{label}</Text>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  ring: {
    position: 'absolute',
    borderWidth: 3,
    alignItems: 'center',
    justifyContent: 'center',
  },
  innerFill: {
    position: 'absolute',
  },
  content: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  number: {
    fontFamily: Typography.fontFamily.bold,
    lineHeight: undefined,
  },
  label: {
    fontFamily: Typography.fontFamily.regular,
    color: Colors.text.light,
    marginTop: 1,
  },
});
