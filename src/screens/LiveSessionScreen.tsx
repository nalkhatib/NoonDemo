import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';
import { Colors, Typography, Spacing, Radius, Shadow } from '../theme';
import { NoonLogo } from '../components/NoonLogo';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'LiveSession'>;
};

const { width } = Dimensions.get('window');

const STUDENT_AVATARS = [
  { color: '#FF6B6B', label: 'SA', top: 60, left: 40 },
  { color: '#4ECDC4', label: 'AH', top: 100, right: 50 },
  { color: '#F59E0B', label: 'LI', top: 180, left: 60 },
  { color: '#A78BFA', label: 'OM', top: 160, right: 30 },
];

export const LiveSessionScreen: React.FC<Props> = ({ navigation }) => {
  const fadeIn = useRef(new Animated.Value(0)).current;
  const slideUp = useRef(new Animated.Value(30)).current;
  const pulseDot = useRef(new Animated.Value(1)).current;
  const participantAnims = STUDENT_AVATARS.map(() => ({
    opacity: useRef(new Animated.Value(0)).current,
    scale: useRef(new Animated.Value(0.6)).current,
  }));

  useEffect(() => {
    console.log('[Analytics] session_screen_viewed');

    // Fade in hero content
    Animated.parallel([
      Animated.timing(fadeIn, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.spring(slideUp, {
        toValue: 0,
        friction: 8,
        tension: 50,
        useNativeDriver: true,
      }),
    ]).start();

    // Stagger participant avatars in
    participantAnims.forEach((anim, i) => {
      Animated.sequence([
        Animated.delay(300 + i * 120),
        Animated.parallel([
          Animated.spring(anim.scale, {
            toValue: 1,
            friction: 6,
            tension: 60,
            useNativeDriver: true,
          }),
          Animated.timing(anim.opacity, {
            toValue: 1,
            duration: 250,
            useNativeDriver: true,
          }),
        ]),
      ]).start();
    });

    // Pulse the LIVE badge
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseDot, {
          toValue: 1.3,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.timing(pulseDot, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
      ])
    );
    pulse.start();
    return () => pulse.stop();
  }, []);

  const handleStartBreakout = () => {
    console.log('[Analytics] breakout_joined', { sessionId: 'math-grade7-001', ts: Date.now() });
    navigation.navigate('BreakoutRoom');
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <NoonLogo size="md" />
        <View style={styles.liveBadge}>
          <Animated.View style={[styles.liveDot, { transform: [{ scale: pulseDot }] }]} />
          <Text style={styles.liveText}>LIVE</Text>
        </View>
      </View>

      {/* Floating student avatars */}
      <View style={styles.avatarField}>
        {STUDENT_AVATARS.map((av, i) => (
          <Animated.View
            key={i}
            style={[
              styles.floatingAvatar,
              {
                top: av.top,
                left: (av as any).left ?? undefined,
                right: (av as any).right ?? undefined,
                opacity: participantAnims[i].opacity,
                transform: [{ scale: participantAnims[i].scale }],
              },
            ]}
          >
            <View style={[styles.avatarCircle, { backgroundColor: av.color }]}>
              <Text style={styles.avatarInitials}>{av.label}</Text>
            </View>
          </Animated.View>
        ))}

        {/* Center hero card */}
        <Animated.View
          style={[
            styles.heroCard,
            {
              opacity: fadeIn,
              transform: [{ translateY: slideUp }],
            },
          ]}
        >
          <Text style={styles.courseTag}>Math • Grade 7</Text>
          <Text style={styles.heroTitle}>Geometry &{'\n'}Area</Text>
          <View style={styles.statRow}>
            <View style={styles.stat}>
              <Text style={styles.statValue}>5</Text>
              <Text style={styles.statLabel}>Students</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.stat}>
              <Text style={styles.statValue}>Q3</Text>
              <Text style={styles.statLabel}>Question</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.stat}>
              <Text style={styles.statValue}>2 min</Text>
              <Text style={styles.statLabel}>Breakout</Text>
            </View>
          </View>
        </Animated.View>
      </View>

      {/* Bottom section */}
      <Animated.View style={[styles.bottomSection, { opacity: fadeIn }]}>
        <View style={styles.newBadge}>
          <Text style={styles.newBadgeText}>NEW</Text>
          <Text style={styles.newBadgeLabel}>Structured Discussion</Text>
        </View>
        <Text style={styles.description}>
          Everyone shares their reasoning{'\n'}before the group votes. Better thinking,{'\n'}better scores.
        </Text>
        <TouchableOpacity
          style={styles.startButton}
          onPress={handleStartBreakout}
          activeOpacity={0.85}
        >
          <Text style={styles.startButtonText}>Start Breakout</Text>
          <Text style={styles.startButtonArrow}>→</Text>
        </TouchableOpacity>
        <Text style={styles.footerNote}>5 students • Room B-3</Text>
      </Animated.View>
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
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  liveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.live + '15',
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: Radius.full,
    gap: 5,
  },
  liveDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: Colors.live,
  },
  liveText: {
    fontFamily: Typography.fontFamily.bold,
    fontSize: Typography.size.xs,
    color: Colors.live,
    letterSpacing: 0.8,
  },
  avatarField: {
    flex: 1,
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  floatingAvatar: {
    position: 'absolute',
  },
  avatarCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: Colors.white,
    ...Shadow.md,
  },
  avatarInitials: {
    color: Colors.white,
    fontFamily: Typography.fontFamily.semiBold,
    fontSize: 13,
  },
  heroCard: {
    backgroundColor: Colors.white,
    borderRadius: Radius.xl,
    padding: Spacing.lg,
    width: width * 0.72,
    alignItems: 'center',
    ...Shadow.lg,
  },
  courseTag: {
    fontFamily: Typography.fontFamily.medium,
    fontSize: Typography.size.sm,
    color: Colors.primary,
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  heroTitle: {
    fontFamily: Typography.fontFamily.bold,
    fontSize: Typography.size.xl,
    color: Colors.text.primary,
    textAlign: 'center',
    marginBottom: Spacing.md,
    lineHeight: 30,
  },
  statRow: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
  },
  stat: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontFamily: Typography.fontFamily.bold,
    fontSize: Typography.size.md,
    color: Colors.text.primary,
  },
  statLabel: {
    fontFamily: Typography.fontFamily.regular,
    fontSize: Typography.size.xs,
    color: Colors.text.light,
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 28,
    backgroundColor: Colors.border,
  },
  bottomSection: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xl,
    alignItems: 'center',
  },
  newBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primaryLight,
    paddingVertical: 5,
    paddingHorizontal: 12,
    borderRadius: Radius.full,
    marginBottom: Spacing.md,
    gap: 6,
  },
  newBadgeText: {
    fontFamily: Typography.fontFamily.bold,
    fontSize: Typography.size.xs,
    color: Colors.primary,
    letterSpacing: 0.8,
  },
  newBadgeLabel: {
    fontFamily: Typography.fontFamily.medium,
    fontSize: Typography.size.sm,
    color: Colors.primaryDark,
  },
  description: {
    fontFamily: Typography.fontFamily.regular,
    fontSize: Typography.size.base,
    color: Colors.text.secondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: Spacing.lg,
  },
  startButton: {
    flexDirection: 'row',
    backgroundColor: Colors.primary,
    paddingVertical: 16,
    paddingHorizontal: Spacing.xl,
    borderRadius: Radius.xl,
    alignItems: 'center',
    gap: 10,
    width: '100%',
    justifyContent: 'center',
    ...Shadow.md,
  },
  startButtonText: {
    fontFamily: Typography.fontFamily.semiBold,
    fontSize: Typography.size.md,
    color: Colors.white,
  },
  startButtonArrow: {
    fontFamily: Typography.fontFamily.semiBold,
    fontSize: Typography.size.md,
    color: Colors.white,
  },
  footerNote: {
    marginTop: 12,
    fontFamily: Typography.fontFamily.regular,
    fontSize: Typography.size.xs,
    color: Colors.text.light,
  },
});
