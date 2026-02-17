import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { Colors, Typography, Spacing, Radius } from '../theme';

interface ContributionBarProps {
  contributed: number;
  total: number;
}

export const ContributionBar: React.FC<ContributionBarProps> = ({
  contributed,
  total,
}) => {
  const progress = useRef(new Animated.Value(0)).current;
  const ratio = contributed / total;

  useEffect(() => {
    Animated.spring(progress, {
      toValue: ratio,
      friction: 7,
      tension: 50,
      useNativeDriver: false,
    }).start();
  }, [ratio]);

  const allContributed = contributed === total;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.label}>
          {allContributed ? '🎉 Everyone shared their reasoning!' : 'Discussion progress'}
        </Text>
        <Text style={[styles.count, allContributed && styles.countDone]}>
          {contributed}/{total}
        </Text>
      </View>
      <View style={styles.track}>
        <Animated.View
          style={[
            styles.fill,
            {
              width: progress.interpolate({
                inputRange: [0, 1],
                outputRange: ['0%', '100%'],
              }),
              backgroundColor: allContributed ? Colors.primary : Colors.primary,
            },
          ]}
        />
        <View style={styles.dots}>
          {Array.from({ length: total }).map((_, i) => (
            <View
              key={i}
              style={[
                styles.dot,
                i < contributed && styles.dotFilled,
              ]}
            />
          ))}
        </View>
      </View>
      {!allContributed && (
        <Text style={styles.hint}>
          Share your reasoning before voting unlocks
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: Spacing.md,
    paddingVertical: 10,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  label: {
    fontFamily: Typography.fontFamily.medium,
    fontSize: Typography.size.sm,
    color: Colors.text.secondary,
  },
  count: {
    fontFamily: Typography.fontFamily.semiBold,
    fontSize: Typography.size.sm,
    color: Colors.primary,
  },
  countDone: {
    color: Colors.primary,
  },
  track: {
    height: 6,
    backgroundColor: Colors.surfaceAlt,
    borderRadius: Radius.full,
    overflow: 'hidden',
    position: 'relative',
  },
  fill: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    borderRadius: Radius.full,
  },
  dots: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: 4,
  },
  dot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.surfaceAlt,
  },
  dotFilled: {
    backgroundColor: Colors.white,
    opacity: 0.7,
  },
  hint: {
    marginTop: 5,
    fontFamily: Typography.fontFamily.regular,
    fontSize: Typography.size.xs,
    color: Colors.text.light,
    textAlign: 'center',
  },
});
