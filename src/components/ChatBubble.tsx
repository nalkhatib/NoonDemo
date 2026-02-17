import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { Colors, Typography, Radius, Spacing, Shadow } from '../theme';
import { ChatMessage } from '../types';
import { Avatar } from './Avatar';

interface ChatBubbleProps {
  message: ChatMessage;
}

export const ChatBubble: React.FC<ChatBubbleProps> = ({ message }) => {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(12)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 280,
        useNativeDriver: true,
      }),
      Animated.spring(translateY, {
        toValue: 0,
        friction: 8,
        tension: 60,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  if (message.isLocal) {
    return (
      <Animated.View style={[styles.localRow, { opacity, transform: [{ translateY }] }]}>
        <View style={[styles.localBubble]}>
          <Text style={styles.localText}>{message.text}</Text>
        </View>
        <Avatar
          initials={message.initials}
          color={message.avatarColor}
          size={32}
        />
      </Animated.View>
    );
  }

  return (
    <Animated.View style={[styles.peerRow, { opacity, transform: [{ translateY }] }]}>
      <Avatar
        initials={message.initials}
        color={message.avatarColor}
        size={32}
      />
      <View style={styles.peerContent}>
        <Text style={styles.peerName}>{message.participantName}</Text>
        <View style={styles.peerBubble}>
          <Text style={styles.peerText}>{message.text}</Text>
        </View>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  localRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'flex-end',
    marginBottom: Spacing.sm,
    paddingHorizontal: Spacing.md,
  },
  localBubble: {
    backgroundColor: Colors.primary,
    borderRadius: Radius.lg,
    borderBottomRightRadius: 4,
    paddingVertical: 10,
    paddingHorizontal: 14,
    maxWidth: '72%',
    marginRight: 8,
    ...Shadow.sm,
  },
  localText: {
    color: Colors.white,
    fontFamily: Typography.fontFamily.regular,
    fontSize: Typography.size.base,
    lineHeight: 21,
  },
  peerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: Spacing.sm,
    paddingHorizontal: Spacing.md,
  },
  peerContent: {
    marginLeft: 8,
    flex: 1,
  },
  peerName: {
    fontFamily: Typography.fontFamily.semiBold,
    fontSize: Typography.size.xs,
    color: Colors.text.secondary,
    marginBottom: 3,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  peerBubble: {
    backgroundColor: Colors.white,
    borderRadius: Radius.lg,
    borderTopLeftRadius: 4,
    paddingVertical: 10,
    paddingHorizontal: 14,
    maxWidth: '78%',
    ...Shadow.sm,
  },
  peerText: {
    color: Colors.text.primary,
    fontFamily: Typography.fontFamily.regular,
    fontSize: Typography.size.base,
    lineHeight: 21,
  },
});
