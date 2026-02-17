import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';

import { Colors, Typography, Spacing, Radius, Shadow } from '../theme';
import { RootStackParamList, OptionKey, Participant } from '../types';
import { QUESTION } from '../data/session';
import { Avatar } from '../components/Avatar';
import { OptionButton } from '../components/OptionButton';
import { NoonLogo } from '../components/NoonLogo';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Results'>;
  route: RouteProp<RootStackParamList, 'Results'>;
};

const { width } = Dimensions.get('window');

export const ResultsScreen: React.FC<Props> = ({ navigation, route }) => {
  const { correctAnswer, explanation, participants, localAnswer } = route.params;

  const correctCount = participants.filter((p) => {
    const ans = p.isLocal ? localAnswer : p.selectedOption;
    return ans === correctAnswer;
  }).length;

  const isAllCorrect = correctCount === participants.length;
  const localCorrect = localAnswer === correctAnswer;

  // Animations
  const scoreScale = useRef(new Animated.Value(0.4)).current;
  const scoreOpacity = useRef(new Animated.Value(0)).current;
  const contentSlide = useRef(new Animated.Value(30)).current;
  const contentOpacity = useRef(new Animated.Value(0)).current;
  const celebrateScale = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Sequence: score pops in → content slides up → celebrate
    Animated.sequence([
      Animated.parallel([
        Animated.spring(scoreScale, {
          toValue: 1,
          friction: 5,
          tension: 60,
          useNativeDriver: true,
        }),
        Animated.timing(scoreOpacity, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
      ]),
      Animated.parallel([
        Animated.spring(contentSlide, {
          toValue: 0,
          friction: 8,
          useNativeDriver: true,
        }),
        Animated.timing(contentOpacity, {
          toValue: 1,
          duration: 350,
          useNativeDriver: true,
        }),
      ]),
      isAllCorrect
        ? Animated.spring(celebrateScale, {
            toValue: 1,
            friction: 5,
            tension: 60,
            useNativeDriver: true,
          })
        : Animated.timing(celebrateScale, { toValue: 0, duration: 0, useNativeDriver: true }),
    ]).start();
  }, []);

  const handleBackToLive = () => {
    console.log('[Analytics] returned_to_live_session');
    navigation.navigate('LiveSession');
  };

  const OPTION_COLORS: Record<OptionKey, string> = {
    A: Colors.option.A,
    B: Colors.option.B,
    C: Colors.option.C,
    D: Colors.option.D,
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      {/* Header */}
      <View style={styles.header}>
        <NoonLogo size="sm" />
        <Text style={styles.headerTitle}>Breakout Results</Text>
        <View style={{ width: 48 }} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* ─── Score hero ──────────────────────────────────────────────── */}
        <Animated.View
          style={[
            styles.scoreHero,
            {
              opacity: scoreOpacity,
              transform: [{ scale: scoreScale }],
            },
          ]}
        >
          {isAllCorrect ? (
            <>
              <Text style={styles.trophyEmoji}>🏆</Text>
              <Text style={styles.scoreMain}>5/5</Text>
              <Text style={styles.scoreLabel}>Perfect score!</Text>
              <Text style={styles.scoreSub}>
                The whole group reasoned their way to the right answer.
              </Text>
            </>
          ) : (
            <>
              <Text style={styles.scoreMain}>
                {correctCount}/{participants.length}
              </Text>
              <Text style={styles.scoreLabel}>
                {correctCount >= 3 ? 'Great teamwork!' : 'Keep practicing!'}
              </Text>
              <Text style={styles.scoreSub}>
                {correctCount} out of {participants.length} students got it right.
              </Text>
            </>
          )}

          {/* Local result pill */}
          <View
            style={[
              styles.myResultPill,
              {
                backgroundColor: localCorrect ? Colors.primaryLight : '#FEF2F2',
              },
            ]}
          >
            <Text style={styles.myResultIcon}>{localCorrect ? '✓' : '✗'}</Text>
            <Text
              style={[
                styles.myResultText,
                { color: localCorrect ? Colors.primaryDark : Colors.option.A },
              ]}
            >
              {localCorrect ? 'You got it right!' : `You picked ${localAnswer ?? '—'}`}
            </Text>
          </View>
        </Animated.View>

        <Animated.View
          style={{
            opacity: contentOpacity,
            transform: [{ translateY: contentSlide }],
          }}
        >
          {/* ─── Correct answer ─────────────────────────────────────── */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Correct Answer</Text>
            {QUESTION.options.map((opt) => (
              <OptionButton
                key={opt.key}
                optionKey={opt.key}
                text={opt.text}
                selected={localAnswer === opt.key}
                disabled
                onPress={() => {}}
                correct={opt.key === correctAnswer}
                showResult
              />
            ))}
          </View>

          {/* ─── Explanation ─────────────────────────────────────────── */}
          <View style={styles.explanationCard}>
            <View style={styles.explanationHeader}>
              <Text style={styles.explanationIcon}>💡</Text>
              <Text style={styles.explanationTitle}>Explanation</Text>
            </View>
            <Text style={styles.explanationText}>{explanation}</Text>
          </View>

          {/* ─── Group breakdown ─────────────────────────────────────── */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Group breakdown</Text>
            <View style={styles.groupGrid}>
              {participants.map((p) => {
                const ans = p.isLocal ? localAnswer : p.selectedOption;
                const correct = ans === correctAnswer;
                return (
                  <View key={p.id} style={styles.groupCell}>
                    <Avatar
                      initials={p.initials}
                      color={p.avatarColor}
                      size={44}
                      selectedOption={ans ?? undefined}
                      showOption
                    />
                    <Text style={styles.groupName} numberOfLines={1}>
                      {p.name}
                    </Text>
                    <View
                      style={[
                        styles.resultTag,
                        {
                          backgroundColor: correct ? Colors.primaryLight : '#FEF2F2',
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.resultTagText,
                          { color: correct ? Colors.primaryDark : Colors.option.A },
                        ]}
                      >
                        {correct ? '✓' : ans ?? '—'}
                      </Text>
                    </View>
                  </View>
                );
              })}
            </View>
          </View>

          {/* ─── Discussion impact callout ────────────────────────────── */}
          <View style={styles.impactCard}>
            <Text style={styles.impactTitle}>Discussion helped</Text>
            <Text style={styles.impactBody}>
              2 students changed their answer after hearing the group reason together.
              That's the power of structured discussion.
            </Text>
            <View style={styles.impactStat}>
              <Text style={styles.impactStatNum}>+2</Text>
              <Text style={styles.impactStatLabel}>answers improved through discussion</Text>
            </View>
          </View>

          {/* ─── Back button ─────────────────────────────────────────── */}
          <TouchableOpacity
            style={styles.backButton}
            onPress={handleBackToLive}
            activeOpacity={0.85}
          >
            <Text style={styles.backButtonText}>Back to LIVE class</Text>
          </TouchableOpacity>

          <View style={{ height: Spacing.xl }} />
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingVertical: 12,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  headerTitle: {
    fontFamily: Typography.fontFamily.semiBold,
    fontSize: Typography.size.base,
    color: Colors.text.primary,
  },
  scrollContent: {
    paddingTop: Spacing.lg,
    paddingHorizontal: Spacing.md,
  },
  scoreHero: {
    backgroundColor: Colors.white,
    borderRadius: Radius.xl,
    padding: Spacing.xl,
    alignItems: 'center',
    marginBottom: Spacing.lg,
    ...Shadow.lg,
  },
  trophyEmoji: {
    fontSize: 44,
    marginBottom: 8,
  },
  scoreMain: {
    fontFamily: Typography.fontFamily.bold,
    fontSize: 52,
    color: Colors.text.primary,
    lineHeight: 58,
  },
  scoreLabel: {
    fontFamily: Typography.fontFamily.semiBold,
    fontSize: Typography.size.lg,
    color: Colors.text.primary,
    marginTop: 4,
  },
  scoreSub: {
    fontFamily: Typography.fontFamily.regular,
    fontSize: Typography.size.base,
    color: Colors.text.secondary,
    marginTop: 6,
    textAlign: 'center',
    lineHeight: 22,
  },
  myResultPill: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: Spacing.md,
    paddingVertical: 7,
    paddingHorizontal: 14,
    borderRadius: Radius.full,
    gap: 6,
  },
  myResultIcon: {
    fontSize: 15,
    fontFamily: Typography.fontFamily.bold,
  },
  myResultText: {
    fontFamily: Typography.fontFamily.semiBold,
    fontSize: Typography.size.sm,
  },
  section: {
    marginBottom: Spacing.lg,
  },
  sectionTitle: {
    fontFamily: Typography.fontFamily.semiBold,
    fontSize: Typography.size.sm,
    color: Colors.text.secondary,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: Spacing.sm,
  },
  explanationCard: {
    backgroundColor: Colors.white,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.lg,
    ...Shadow.sm,
  },
  explanationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  explanationIcon: {
    fontSize: 18,
  },
  explanationTitle: {
    fontFamily: Typography.fontFamily.semiBold,
    fontSize: Typography.size.base,
    color: Colors.text.primary,
  },
  explanationText: {
    fontFamily: Typography.fontFamily.regular,
    fontSize: Typography.size.base,
    color: Colors.text.secondary,
    lineHeight: 22,
  },
  groupGrid: {
    flexDirection: 'row',
    backgroundColor: Colors.white,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    justifyContent: 'space-around',
    ...Shadow.sm,
  },
  groupCell: {
    alignItems: 'center',
    gap: 5,
    flex: 1,
  },
  groupName: {
    fontFamily: Typography.fontFamily.medium,
    fontSize: 11,
    color: Colors.text.secondary,
    textAlign: 'center',
    maxWidth: 52,
  },
  resultTag: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: Radius.full,
  },
  resultTagText: {
    fontFamily: Typography.fontFamily.semiBold,
    fontSize: Typography.size.xs,
  },
  impactCard: {
    backgroundColor: Colors.primaryLight,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.lg,
    borderLeftWidth: 3,
    borderLeftColor: Colors.primary,
  },
  impactTitle: {
    fontFamily: Typography.fontFamily.semiBold,
    fontSize: Typography.size.base,
    color: Colors.primaryDark,
    marginBottom: 6,
  },
  impactBody: {
    fontFamily: Typography.fontFamily.regular,
    fontSize: Typography.size.sm,
    color: Colors.primaryDark,
    lineHeight: 20,
    marginBottom: Spacing.sm,
  },
  impactStat: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 6,
  },
  impactStatNum: {
    fontFamily: Typography.fontFamily.bold,
    fontSize: Typography.size.xl,
    color: Colors.primary,
  },
  impactStatLabel: {
    fontFamily: Typography.fontFamily.medium,
    fontSize: Typography.size.sm,
    color: Colors.primaryDark,
    flex: 1,
  },
  backButton: {
    backgroundColor: Colors.primary,
    borderRadius: Radius.xl,
    paddingVertical: 15,
    alignItems: 'center',
    ...Shadow.md,
  },
  backButtonText: {
    fontFamily: Typography.fontFamily.semiBold,
    fontSize: Typography.size.md,
    color: Colors.white,
  },
});
