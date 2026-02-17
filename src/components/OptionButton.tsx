import React from 'react';
import { TouchableOpacity, Text, StyleSheet, View } from 'react-native';
import { Colors, Typography, Radius, Shadow, Spacing } from '../theme';
import { OptionKey } from '../types';

interface OptionButtonProps {
  optionKey: OptionKey;
  text: string;
  selected: boolean;
  disabled?: boolean;
  onPress: (key: OptionKey) => void;
  correct?: boolean;   // for results screen
  showResult?: boolean;
}

const OPTION_COLORS: Record<OptionKey, string> = {
  A: Colors.option.A,
  B: Colors.option.B,
  C: Colors.option.C,
  D: Colors.option.D,
};

export const OptionButton: React.FC<OptionButtonProps> = ({
  optionKey,
  text,
  selected,
  disabled = false,
  onPress,
  correct,
  showResult,
}) => {
  const accentColor = OPTION_COLORS[optionKey];

  let bgColor = Colors.white;
  let borderColor = Colors.border;
  let textColor = Colors.text.primary;

  if (showResult) {
    if (correct) {
      bgColor = Colors.primaryLight;
      borderColor = Colors.primary;
      textColor = Colors.primaryDark;
    } else if (selected && !correct) {
      bgColor = '#FEF2F2';
      borderColor = Colors.option.A;
      textColor = Colors.option.A;
    }
  } else if (selected) {
    bgColor = accentColor + '18';
    borderColor = accentColor;
    textColor = Colors.text.primary;
  }

  return (
    <TouchableOpacity
      onPress={() => !disabled && onPress(optionKey)}
      activeOpacity={disabled ? 1 : 0.75}
      style={[
        styles.button,
        {
          backgroundColor: bgColor,
          borderColor: borderColor,
        },
        selected && !showResult && styles.selectedShadow,
      ]}
    >
      <View
        style={[
          styles.keyBadge,
          {
            backgroundColor: selected || (showResult && correct) ? accentColor : Colors.surfaceAlt,
          },
        ]}
      >
        <Text
          style={[
            styles.keyText,
            {
              color: selected || (showResult && correct) ? Colors.white : Colors.text.secondary,
            },
          ]}
        >
          {optionKey}
        </Text>
      </View>
      <Text style={[styles.optionText, { color: textColor }]} numberOfLines={2}>
        {text}
      </Text>
      {showResult && correct && (
        <Text style={styles.correctIcon}>✓</Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 14,
    borderRadius: Radius.lg,
    borderWidth: 1.5,
    marginBottom: Spacing.sm,
    ...Shadow.sm,
  },
  selectedShadow: {
    ...Shadow.md,
  },
  keyBadge: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  keyText: {
    fontFamily: Typography.fontFamily.bold,
    fontSize: Typography.size.base,
  },
  optionText: {
    flex: 1,
    fontFamily: Typography.fontFamily.medium,
    fontSize: Typography.size.base,
    lineHeight: 22,
  },
  correctIcon: {
    fontSize: 16,
    color: Colors.primary,
    fontFamily: Typography.fontFamily.bold,
    marginLeft: 8,
  },
});
