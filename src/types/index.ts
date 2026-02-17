export type OptionKey = 'A' | 'B' | 'C' | 'D';
export type Phase = 'independent' | 'discussion' | 'voting' | 'complete';

export interface Participant {
  id: string;
  name: string;
  initials: string;
  avatarColor: string;
  selectedOption: OptionKey | null;
  contributed: boolean;
  isLocal: boolean;
}

export interface ChatMessage {
  id: string;
  participantId: string;
  participantName: string;
  avatarColor: string;
  initials: string;
  text: string;
  timestamp: number;
  isLocal: boolean;
}

export interface MCQOption {
  key: OptionKey;
  text: string;
}

export interface Question {
  text: string;
  options: MCQOption[];
  correctAnswer: OptionKey;
  explanation: string;
}

export type RootStackParamList = {
  LiveSession: undefined;
  BreakoutRoom: undefined;
  Results: {
    correctAnswer: OptionKey;
    explanation: string;
    participants: Participant[];
    localAnswer: OptionKey | null;
  };
};
