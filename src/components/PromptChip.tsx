import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ScrollView, View } from 'react-native';
import { Colors, Typography, Radius, Spacing, Shadow } from '../theme';

interface PromptChipProps {
  prompts: string[];
  onSelect: (prompt: string) => void;
  disabled?: boolean;
}

export const PromptChipRow: React.FC<PromptChipProps> = ({
  prompts,
  onSelect,
  disabled = false,
}) => {
  return (
    <View style={styles.wrapper}>
      <Text style={styles.sectionLabel}>Start with a prompt</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {prompts.map((prompt) => (
          <TouchableOpacity
            key={prompt}
            onPress={() => !disabled && onSelect(prompt)}
            activeOpacity={disabled ? 1 : 0.7}
            style={[styles.chip, disabled && styles.chipDisabled]}
          >
            <Text style={[styles.chipText, disabled && styles.chipTextDisabled]}>
              {prompt}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    paddingTop: 10,
    paddingBottom: 6,
  },
  sectionLabel: {
    fontFamily: Typography.fontFamily.medium,
    fontSize: Typography.size.xs,
    color: Colors.text.light,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    paddingHorizontal: Spacing.md,
    marginBottom: 8,
  },
  scrollContent: {
    paddingHorizontal: Spacing.md,
    gap: 8,
  },
  chip: {
    backgroundColor: Colors.white,
    borderRadius: Radius.full,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderWidth: 1.5,
    borderColor: Colors.primary,
    ...Shadow.sm,
  },
  chipDisabled: {
    backgroundColor: Colors.surfaceAlt,
    borderColor: Colors.border,
  },
  chipText: {
    fontFamily: Typography.fontFamily.medium,
    fontSize: Typography.size.sm,
    color: Colors.primary,
  },
  chipTextDisabled: {
    color: Colors.text.light,
  },
});
