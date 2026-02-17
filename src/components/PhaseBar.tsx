import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors, Typography, Spacing, Radius } from '../theme';
import { Phase } from '../types';

interface PhaseBarProps {
  phase: Phase;
}

const PHASES: { key: Phase; label: string; icon: string }[] = [
  { key: 'independent', label: 'Think', icon: '💭' },
  { key: 'discussion', label: 'Discuss', icon: '💬' },
  { key: 'voting', label: 'Vote', icon: '✋' },
];

export const PhaseBar: React.FC<PhaseBarProps> = ({ phase }) => {
  const currentIndex = PHASES.findIndex((p) => p.key === phase);

  return (
    <View style={styles.container}>
      {PHASES.map((p, i) => {
        const isActive = p.key === phase;
        const isDone = i < currentIndex;

        return (
          <React.Fragment key={p.key}>
            <View style={styles.step}>
              <View
                style={[
                  styles.circle,
                  isActive && styles.circleActive,
                  isDone && styles.circleDone,
                ]}
              >
                {isDone ? (
                  <Text style={styles.checkmark}>✓</Text>
                ) : (
                  <Text style={styles.stepIcon}>{p.icon}</Text>
                )}
              </View>
              <Text
                style={[
                  styles.stepLabel,
                  isActive && styles.stepLabelActive,
                  isDone && styles.stepLabelDone,
                ]}
              >
                {p.label}
              </Text>
            </View>
            {i < PHASES.length - 1 && (
              <View style={[styles.connector, isDone && styles.connectorDone]} />
            )}
          </React.Fragment>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: Spacing.lg,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  step: {
    alignItems: 'center',
  },
  circle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.surfaceAlt,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  circleActive: {
    backgroundColor: Colors.primary,
  },
  circleDone: {
    backgroundColor: Colors.primary + '30',
  },
  checkmark: {
    color: Colors.primary,
    fontSize: 14,
    fontFamily: Typography.fontFamily.bold,
  },
  stepIcon: {
    fontSize: 14,
  },
  stepLabel: {
    fontFamily: Typography.fontFamily.medium,
    fontSize: Typography.size.xs,
    color: Colors.text.light,
  },
  stepLabelActive: {
    color: Colors.primary,
    fontFamily: Typography.fontFamily.semiBold,
  },
  stepLabelDone: {
    color: Colors.text.secondary,
  },
  connector: {
    flex: 1,
    height: 2,
    backgroundColor: Colors.border,
    marginHorizontal: 6,
    marginBottom: 14,
  },
  connectorDone: {
    backgroundColor: Colors.primary + '50',
  },
});
