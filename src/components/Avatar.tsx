import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors, Typography, Radius, Shadow } from '../theme';
import { OptionKey } from '../types';

interface AvatarProps {
  initials: string;
  color: string;
  size?: number;
  selectedOption?: OptionKey | null;
  contributed?: boolean;
  showOption?: boolean;
}

const OPTION_COLORS: Record<OptionKey, string> = {
  A: Colors.option.A,
  B: Colors.option.B,
  C: Colors.option.C,
  D: Colors.option.D,
};

export const Avatar: React.FC<AvatarProps> = ({
  initials,
  color,
  size = 52,
  selectedOption,
  contributed,
  showOption = false,
}) => {
  const fontSize = size * 0.3;
  const badgeSize = size * 0.38;

  return (
    <View style={styles.wrapper}>
      <View
        style={[
          styles.circle,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            backgroundColor: color,
            ...(contributed ? styles.contributedRing : {}),
          },
        ]}
      >
        <Text style={[styles.initials, { fontSize }]}>{initials}</Text>
      </View>

      {showOption && selectedOption && (
        <View
          style={[
            styles.optionBadge,
            {
              backgroundColor: OPTION_COLORS[selectedOption],
              width: badgeSize,
              height: badgeSize,
              borderRadius: badgeSize / 2,
              bottom: -2,
              right: -2,
            },
          ]}
        >
          <Text style={[styles.optionText, { fontSize: badgeSize * 0.5 }]}>
            {selectedOption}
          </Text>
        </View>
      )}

      {contributed && (
        <View style={[styles.checkBadge, { top: -2, right: -2 }]}>
          <Text style={styles.checkText}>✓</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    position: 'relative',
    alignItems: 'center',
  },
  circle: {
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadow.sm,
  },
  contributedRing: {
    borderWidth: 2.5,
    borderColor: Colors.primary,
  },
  initials: {
    color: Colors.white,
    fontFamily: Typography.fontFamily.semiBold,
    letterSpacing: 0.5,
  },
  optionBadge: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: Colors.white,
    ...Shadow.sm,
  },
  optionText: {
    color: Colors.white,
    fontFamily: Typography.fontFamily.bold,
    letterSpacing: 0,
  },
  checkBadge: {
    position: 'absolute',
    backgroundColor: Colors.primary,
    width: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: Colors.white,
  },
  checkText: {
    color: Colors.white,
    fontSize: 9,
    fontFamily: Typography.fontFamily.bold,
  },
});
