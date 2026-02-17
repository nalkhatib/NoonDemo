import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { Colors, Typography, Spacing, Radius, Shadow } from '../theme';
import {
  QUESTION,
  INITIAL_PARTICIPANTS,
  PEER_MESSAGES,
  VOTE_CHANGES,
  PROMPT_CHIPS,
  PHASE_DURATIONS,
} from '../data/session';
import { Phase, OptionKey, Participant, ChatMessage, RootStackParamList } from '../types';

import { Avatar } from '../components/Avatar';
import { OptionButton } from '../components/OptionButton';
import { ChatBubble } from '../components/ChatBubble';
import { ContributionBar } from '../components/ContributionBar';
import { CountdownRing } from '../components/CountdownRing';
import { PromptChipRow } from '../components/PromptChip';
import { PhaseBar } from '../components/PhaseBar';
import { NoonLogo } from '../components/NoonLogo';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'BreakoutRoom'>;
};

let messageIdCounter = 0;
const nextId = () => `msg-${++messageIdCounter}`;

export const BreakoutRoomScreen: React.FC<Props> = ({ navigation }) => {
  // ─── Core state ──────────────────────────────────────────────────────────────
  const [phase, setPhase] = useState<Phase>('independent');
  const [timeLeft, setTimeLeft] = useState(PHASE_DURATIONS.independent);
  const [participants, setParticipants] = useState<Participant[]>(
    INITIAL_PARTICIPANTS.map((p) => ({ ...p }))
  );
  const [localAnswer, setLocalAnswer] = useState<OptionKey | null>(null);
  const [localContributed, setLocalContributed] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [votingUnlocked, setVotingUnlocked] = useState(false);
  const [bannerVisible, setBannerVisible] = useState(false);
  const [bannerText, setBannerText] = useState('');

  // ─── Refs ─────────────────────────────────────────────────────────────────
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const phaseRef = useRef<Phase>('independent');
  const scrollRef = useRef<ScrollView>(null);
  const bannerAnim = useRef(new Animated.Value(-60)).current;
  const silentFlagged = useRef(false);
  const peerMessageScheduled = useRef<ReturnType<typeof setTimeout>[]>([]);
  const voteChangeScheduled = useRef<ReturnType<typeof setTimeout>[]>([]);

  phaseRef.current = phase;

  // ─── Helpers ──────────────────────────────────────────────────────────────
  const localParticipant = participants.find((p) => p.isLocal)!;
  const contributedCount = participants.filter((p) => p.contributed || (p.isLocal && localContributed)).length;
  const totalCount = participants.length;

  const showBanner = useCallback((text: string, duration = 3000) => {
    setBannerText(text);
    setBannerVisible(true);
    Animated.sequence([
      Animated.spring(bannerAnim, {
        toValue: 0,
        friction: 8,
        useNativeDriver: true,
      }),
      Animated.delay(duration),
      Animated.timing(bannerAnim, {
        toValue: -60,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => setBannerVisible(false));
  }, []);

  const addMessage = useCallback((msg: Omit<ChatMessage, 'id' | 'timestamp'>) => {
    setMessages((prev) => [
      ...prev,
      { ...msg, id: nextId(), timestamp: Date.now() },
    ]);
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 80);
  }, []);

  const markParticipantContributed = useCallback((participantId: string) => {
    setParticipants((prev) =>
      prev.map((p) => (p.id === participantId ? { ...p, contributed: true } : p))
    );
  }, []);

  const changeParticipantVote = useCallback((participantId: string, newOption: OptionKey) => {
    setParticipants((prev) =>
      prev.map((p) => (p.id === participantId ? { ...p, selectedOption: newOption } : p))
    );
  }, []);

  // ─── Phase transitions ─────────────────────────────────────────────────────
  const startDiscussion = useCallback(() => {
    setPhase('discussion');
    setTimeLeft(PHASE_DURATIONS.discussion);
    showBanner('💬 Discuss your answers — share your reasoning!');
    console.log('[Analytics] discussion_phase_started');

    // Check silent risk after 8s
    const silentCheck = setTimeout(() => {
      if (!silentFlagged.current) {
        const contributed = participants.filter((p) => p.contributed || p.isLocal).length;
        if (contributed <= 1) {
          console.log('[Analytics] silent_risk_flag', { contributedCount: contributed });
          silentFlagged.current = true;
          showBanner('🤫 No one has spoken yet — be the first!');
        }
      }
    }, 8000);
    peerMessageScheduled.current.push(silentCheck);

    // Schedule peer messages
    PEER_MESSAGES.forEach((pm) => {
      const peer = INITIAL_PARTICIPANTS.find((p) => p.id === pm.participantId)!;
      const t = setTimeout(() => {
        if (phaseRef.current !== 'discussion') return;
        addMessage({
          participantId: peer.id,
          participantName: peer.name,
          avatarColor: peer.avatarColor,
          initials: peer.initials,
          text: pm.text,
          isLocal: false,
        });
        markParticipantContributed(peer.id);
        console.log('[Analytics] peer_contribution_submitted', { participantId: peer.id });
      }, pm.delayMs);
      peerMessageScheduled.current.push(t);
    });
  }, [participants, showBanner, addMessage, markParticipantContributed]);

  const startVoting = useCallback(() => {
    setPhase('voting');
    setTimeLeft(PHASE_DURATIONS.voting);
    setVotingUnlocked(true);
    showBanner('✋ Voting open — finalize your answer!');
    console.log('[Analytics] voting_phase_started');

    // Simulate peer vote changes
    VOTE_CHANGES.forEach((vc) => {
      const t = setTimeout(() => {
        if (phaseRef.current !== 'voting') return;
        changeParticipantVote(vc.participantId, vc.newOption);
        console.log('[Analytics] peer_vote_changed', {
          participantId: vc.participantId,
          newOption: vc.newOption,
        });
      }, vc.delayMs);
      voteChangeScheduled.current.push(t);
    });
  }, [showBanner, changeParticipantVote]);

  const finishBreakout = useCallback(() => {
    // Clear all timers
    peerMessageScheduled.current.forEach(clearTimeout);
    voteChangeScheduled.current.forEach(clearTimeout);

    const finalParticipants = participants.map((p) =>
      p.isLocal
        ? { ...p, selectedOption: localAnswer, contributed: localContributed }
        : p
    );

    console.log('[Analytics] breakout_completed', {
      localAnswer,
      totalContributed: contributedCount,
      ts: Date.now(),
    });

    navigation.replace('Results', {
      correctAnswer: QUESTION.correctAnswer,
      explanation: QUESTION.explanation,
      participants: finalParticipants,
      localAnswer,
    });
  }, [participants, localAnswer, localContributed, contributedCount, navigation]);

  // ─── Timer engine — restarts on each phase change ─────────────────────────
  useEffect(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current!);
          const currentPhase = phaseRef.current;
          if (currentPhase === 'independent') {
            startDiscussion();
          } else if (currentPhase === 'discussion') {
            showBanner('⏭ Moving to voting…');
            setTimeout(() => startVoting(), 800);
          } else if (currentPhase === 'voting') {
            setTimeout(() => finishBreakout(), 400);
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [phase]);

  // ─── Analytics — breakout joined ──────────────────────────────────────────
  useEffect(() => {
    console.log('[Analytics] breakout_joined', { roomId: 'B-3', participantCount: 5 });
  }, []);

  // ─── Check if all contributed → unlock voting early ───────────────────────
  useEffect(() => {
    if (phase === 'discussion' && localContributed) {
      const peerContributed = participants.filter((p) => !p.isLocal && p.contributed).length;
      const allDone = localContributed && peerContributed === participants.filter((p) => !p.isLocal).length;
      if (allDone && !votingUnlocked) {
        // Don't auto-advance immediately — let user see the moment
      }
    }
  }, [localContributed, participants, phase, votingUnlocked]);

  // ─── User interactions ────────────────────────────────────────────────────
  const handleSelectOption = (key: OptionKey) => {
    if (phase === 'independent') {
      setLocalAnswer(key);
      setParticipants((prev) =>
        prev.map((p) => (p.isLocal ? { ...p, selectedOption: key } : p))
      );
      console.log('[Analytics] independent_answer_selected', { option: key });
    } else if (phase === 'voting' && votingUnlocked) {
      const previous = localAnswer;
      setLocalAnswer(key);
      setParticipants((prev) =>
        prev.map((p) => (p.isLocal ? { ...p, selectedOption: key } : p))
      );
      if (previous !== key) {
        console.log('[Analytics] vote_changed', { from: previous, to: key });
      }
    }
  };

  const handlePromptSelect = (prompt: string) => {
    if (localContributed) return;
    console.log('[Analytics] discussion_prompt_opened', { prompt });
    setInputText(prompt.replace('__', localAnswer ?? '…'));
  };

  const handleSubmitMessage = () => {
    if (!inputText.trim()) return;
    if (localContributed) return;

    addMessage({
      participantId: 'local',
      participantName: 'You',
      avatarColor: Colors.avatar.local,
      initials: 'ME',
      text: inputText.trim(),
      isLocal: true,
    });

    markParticipantContributed('local');
    setLocalContributed(true);
    setInputText('');
    console.log('[Analytics] contribution_submitted', { method: 'text', phase });
  };

  const handleSpeakButton = () => {
    if (localContributed) return;
    const msg = localAnswer
      ? `I think it's ${localAnswer} — ${localAnswer === 'B' ? 'area is length × width.' : 'that was my calculation.'}`
      : 'Let me think this through with everyone.';

    addMessage({
      participantId: 'local',
      participantName: 'You',
      avatarColor: Colors.avatar.local,
      initials: 'ME',
      text: `🎤 ${msg}`,
      isLocal: true,
    });

    markParticipantContributed('local');
    setLocalContributed(true);
    console.log('[Analytics] contribution_submitted', { method: 'voice', phase });
  };

  // ─── Phase config ──────────────────────────────────────────────────────────
  const phaseTotal =
    phase === 'independent'
      ? PHASE_DURATIONS.independent
      : phase === 'discussion'
      ? PHASE_DURATIONS.discussion
      : PHASE_DURATIONS.voting;

  const phaseLabel =
    phase === 'independent'
      ? 'Think solo first.'
      : phase === 'discussion'
      ? 'Share your reasoning.'
      : 'Lock in your vote.';

  const phaseColor =
    phase === 'independent'
      ? Colors.primary
      : phase === 'discussion'
      ? '#6366F1'
      : Colors.warning;

  // ─── Render ────────────────────────────────────────────────────────────────
  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <NoonLogo size="sm" />
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Math • Grade 7</Text>
          <Text style={styles.headerRoom}>Room B-3</Text>
        </View>
        <CountdownRing
          timeLeft={timeLeft}
          total={phaseTotal}
          size={46}
          color={phaseColor}
        />
      </View>

      {/* Phase progress bar */}
      <PhaseBar phase={phase} />

      {/* Phase label */}
      <View style={[styles.phaseLabelRow, { borderLeftColor: phaseColor }]}>
        <Text style={[styles.phaseLabel, { color: phaseColor }]}>{phaseLabel}</Text>
      </View>

      {/* Scrollable content */}
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={0}
      >
        <ScrollView
          ref={scrollRef}
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Participants row — always visible */}
          <View style={styles.participantsSection}>
            <Text style={styles.sectionTitle}>
              {phase === 'independent' ? 'Your group' : 'Group answers'}
            </Text>
            <View style={styles.participantsRow}>
              {participants.map((p) => (
                <View key={p.id} style={styles.participantCell}>
                  <Avatar
                    initials={p.initials}
                    color={p.avatarColor}
                    size={52}
                    selectedOption={p.isLocal ? localAnswer : p.selectedOption}
                    contributed={p.isLocal ? localContributed : p.contributed}
                    showOption={phase !== 'independent'}
                  />
                  <Text style={styles.participantName} numberOfLines={1}>
                    {p.name}
                  </Text>
                  {phase === 'independent' && p.isLocal && localAnswer && (
                    <View style={styles.hiddenDot} />
                  )}
                </View>
              ))}
            </View>
          </View>

          {/* Question card */}
          <View style={styles.questionCard}>
            <Text style={styles.questionLabel}>Question 3</Text>
            <Text style={styles.questionText}>{QUESTION.text}</Text>
          </View>

          {/* Options */}
          <View style={styles.optionsSection}>
            {QUESTION.options.map((opt) => (
              <OptionButton
                key={opt.key}
                optionKey={opt.key}
                text={opt.text}
                selected={localAnswer === opt.key}
                disabled={phase === 'discussion' || (phase === 'voting' && !votingUnlocked)}
                onPress={handleSelectOption}
              />
            ))}
          </View>

          {/* Discussion phase content */}
          {phase === 'discussion' && (
            <View style={styles.discussionSection}>
              {/* Voting locked notice */}
              {!votingUnlocked && (
                <View style={styles.lockedNotice}>
                  <Text style={styles.lockedIcon}>🔒</Text>
                  <Text style={styles.lockedText}>
                    {localContributed
                      ? 'Waiting for others… voting opens soon'
                      : 'Add your reasoning to unlock voting'}
                  </Text>
                </View>
              )}
            </View>
          )}

          {/* Voting phase info */}
          {phase === 'voting' && (
            <View style={styles.votingInfo}>
              <Text style={styles.votingInfoText}>
                You can change your answer. What does the group think now?
              </Text>
            </View>
          )}

          {/* Chat messages */}
          {messages.length > 0 && (
            <View style={styles.messagesSection}>
              {messages.map((msg) => (
                <ChatBubble key={msg.id} message={msg} />
              ))}
            </View>
          )}

          <View style={{ height: 120 }} />
        </ScrollView>

        {/* ─── Discussion input area ─────────────────────────────────────── */}
        {phase === 'discussion' && (
          <View style={styles.inputArea}>
            {/* Contribution progress */}
            <ContributionBar contributed={contributedCount} total={totalCount} />

            {!localContributed && (
              <>
                {/* Prompt chips */}
                <View style={styles.promptSection}>
                  <PromptChipRow
                    prompts={PROMPT_CHIPS}
                    onSelect={handlePromptSelect}
                    disabled={localContributed}
                  />
                </View>

                {/* Text input + speak */}
                <View style={styles.inputRow}>
                  <TextInput
                    style={styles.textInput}
                    value={inputText}
                    onChangeText={setInputText}
                    placeholder="Type your reasoning…"
                    placeholderTextColor={Colors.text.light}
                    multiline
                    maxLength={200}
                    returnKeyType="send"
                    onSubmitEditing={handleSubmitMessage}
                  />
                  <TouchableOpacity
                    style={[
                      styles.sendButton,
                      !inputText.trim() && styles.sendButtonDisabled,
                    ]}
                    onPress={handleSubmitMessage}
                    disabled={!inputText.trim()}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.sendIcon}>↑</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.speakButton}
                    onPress={handleSpeakButton}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.speakIcon}>🎤</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}

            {localContributed && (
              <View style={styles.contributedBanner}>
                <Text style={styles.contributedText}>
                  ✓ You've shared your reasoning. Waiting for the group…
                </Text>
              </View>
            )}
          </View>
        )}

        {/* ─── Voting CTA ───────────────────────────────────────────────── */}
        {phase === 'voting' && (
          <View style={styles.votingFooter}>
            <TouchableOpacity
              style={[styles.doneButton, !localAnswer && styles.doneButtonDisabled]}
              onPress={finishBreakout}
              disabled={!localAnswer}
              activeOpacity={0.85}
            >
              <Text style={styles.doneButtonText}>Lock in my vote</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* ─── Independent — no answer yet nudge ────────────────────────── */}
        {phase === 'independent' && !localAnswer && (
          <View style={styles.nudgeBar}>
            <Text style={styles.nudgeText}>👆 Tap an option to select your answer</Text>
          </View>
        )}

        {phase === 'independent' && localAnswer && (
          <View style={styles.selectedBar}>
            <Text style={styles.selectedBarText}>
              You picked {localAnswer}  — waiting for the timer…
            </Text>
          </View>
        )}
      </KeyboardAvoidingView>

      {/* ─── Floating banner ──────────────────────────────────────────────── */}
      {bannerVisible && (
        <Animated.View
          style={[styles.banner, { transform: [{ translateY: bannerAnim }] }]}
        >
          <Text style={styles.bannerText}>{bannerText}</Text>
        </Animated.View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  flex: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: 10,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    gap: 10,
  },
  headerCenter: {
    flex: 1,
    paddingHorizontal: 6,
  },
  headerTitle: {
    fontFamily: Typography.fontFamily.semiBold,
    fontSize: Typography.size.base,
    color: Colors.text.primary,
  },
  headerRoom: {
    fontFamily: Typography.fontFamily.regular,
    fontSize: Typography.size.xs,
    color: Colors.text.light,
    marginTop: 1,
  },
  phaseLabelRow: {
    paddingHorizontal: Spacing.md,
    paddingVertical: 8,
    borderLeftWidth: 3,
    marginHorizontal: Spacing.md,
    marginTop: 10,
    marginBottom: 4,
    borderRadius: 2,
    backgroundColor: Colors.white + 'aa',
  },
  phaseLabel: {
    fontFamily: Typography.fontFamily.medium,
    fontSize: Typography.size.sm,
    letterSpacing: 0.2,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: Spacing.sm,
  },
  participantsSection: {
    paddingHorizontal: Spacing.md,
    marginBottom: Spacing.md,
  },
  sectionTitle: {
    fontFamily: Typography.fontFamily.medium,
    fontSize: Typography.size.xs,
    color: Colors.text.light,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 10,
  },
  participantsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: Colors.white,
    borderRadius: Radius.lg,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.sm,
    ...Shadow.sm,
  },
  participantCell: {
    alignItems: 'center',
    gap: 6,
    flex: 1,
  },
  participantName: {
    fontFamily: Typography.fontFamily.medium,
    fontSize: Typography.size.xs,
    color: Colors.text.secondary,
    maxWidth: 52,
    textAlign: 'center',
  },
  hiddenDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.primary,
  },
  questionCard: {
    marginHorizontal: Spacing.md,
    marginBottom: Spacing.md,
    backgroundColor: Colors.white,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    ...Shadow.sm,
  },
  questionLabel: {
    fontFamily: Typography.fontFamily.semiBold,
    fontSize: Typography.size.xs,
    color: Colors.primary,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 6,
  },
  questionText: {
    fontFamily: Typography.fontFamily.semiBold,
    fontSize: Typography.size.md,
    color: Colors.text.primary,
    lineHeight: 24,
  },
  optionsSection: {
    paddingHorizontal: Spacing.md,
    marginBottom: Spacing.sm,
  },
  discussionSection: {
    paddingHorizontal: Spacing.md,
    marginBottom: Spacing.sm,
  },
  lockedNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    gap: 10,
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderStyle: 'dashed',
  },
  lockedIcon: {
    fontSize: 18,
  },
  lockedText: {
    flex: 1,
    fontFamily: Typography.fontFamily.medium,
    fontSize: Typography.size.sm,
    color: Colors.text.secondary,
    lineHeight: 20,
  },
  votingInfo: {
    marginHorizontal: Spacing.md,
    backgroundColor: Colors.primaryLight,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
  },
  votingInfoText: {
    fontFamily: Typography.fontFamily.medium,
    fontSize: Typography.size.sm,
    color: Colors.primaryDark,
    lineHeight: 20,
    textAlign: 'center',
  },
  messagesSection: {
    paddingVertical: Spacing.sm,
  },
  inputArea: {
    backgroundColor: Colors.background,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  promptSection: {
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: Spacing.md,
    gap: 8,
  },
  textInput: {
    flex: 1,
    backgroundColor: Colors.white,
    borderRadius: Radius.lg,
    paddingVertical: 10,
    paddingHorizontal: Spacing.md,
    fontFamily: Typography.fontFamily.regular,
    fontSize: Typography.size.base,
    color: Colors.text.primary,
    borderWidth: 1.5,
    borderColor: Colors.border,
    maxHeight: 80,
    ...Shadow.sm,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadow.sm,
  },
  sendButtonDisabled: {
    backgroundColor: Colors.border,
  },
  sendIcon: {
    color: Colors.white,
    fontSize: 18,
    fontFamily: Typography.fontFamily.bold,
  },
  speakButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: Colors.border,
    ...Shadow.sm,
  },
  speakIcon: {
    fontSize: 18,
  },
  contributedBanner: {
    margin: Spacing.md,
    backgroundColor: Colors.primaryLight,
    borderRadius: Radius.lg,
    padding: 12,
    alignItems: 'center',
  },
  contributedText: {
    fontFamily: Typography.fontFamily.medium,
    fontSize: Typography.size.sm,
    color: Colors.primaryDark,
    textAlign: 'center',
  },
  votingFooter: {
    padding: Spacing.md,
    backgroundColor: Colors.background,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  doneButton: {
    backgroundColor: Colors.primary,
    borderRadius: Radius.xl,
    paddingVertical: 15,
    alignItems: 'center',
    ...Shadow.md,
  },
  doneButtonDisabled: {
    backgroundColor: Colors.text.light,
  },
  doneButtonText: {
    fontFamily: Typography.fontFamily.semiBold,
    fontSize: Typography.size.md,
    color: Colors.white,
  },
  nudgeBar: {
    padding: Spacing.md,
    backgroundColor: Colors.white,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    alignItems: 'center',
  },
  nudgeText: {
    fontFamily: Typography.fontFamily.regular,
    fontSize: Typography.size.sm,
    color: Colors.text.secondary,
  },
  selectedBar: {
    padding: Spacing.md,
    backgroundColor: Colors.primaryLight,
    borderTopWidth: 1,
    borderTopColor: Colors.primary + '30',
    alignItems: 'center',
  },
  selectedBarText: {
    fontFamily: Typography.fontFamily.medium,
    fontSize: Typography.size.sm,
    color: Colors.primaryDark,
  },
  banner: {
    position: 'absolute',
    top: 0,
    left: Spacing.md,
    right: Spacing.md,
    backgroundColor: Colors.text.primary,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    alignItems: 'center',
    ...Shadow.lg,
    zIndex: 100,
  },
  bannerText: {
    fontFamily: Typography.fontFamily.medium,
    fontSize: Typography.size.sm,
    color: Colors.white,
    textAlign: 'center',
  },
});
