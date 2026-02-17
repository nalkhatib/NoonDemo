import { Colors } from '../theme';
import { Participant, Question } from '../types';

export const QUESTION: Question = {
  text: 'A rectangle has a length of 12 cm and a width of 7 cm. What is its area?',
  options: [
    { key: 'A', text: '38 cm²' },
    { key: 'B', text: '84 cm²' },
    { key: 'C', text: '42 cm²' },
    { key: 'D', text: '19 cm²' },
  ],
  correctAnswer: 'B',
  explanation:
    'Area of a rectangle = length × width = 12 × 7 = 84 cm². Option A (38 cm²) is the perimeter of a 12×7 rectangle, a common mistake!',
};

export const INITIAL_PARTICIPANTS: Participant[] = [
  {
    id: 'local',
    name: 'You',
    initials: 'ME',
    avatarColor: Colors.avatar.local,
    selectedOption: null,
    contributed: false,
    isLocal: true,
  },
  {
    id: 'sara',
    name: 'Sara',
    initials: 'SA',
    avatarColor: Colors.avatar.sara,
    selectedOption: 'A', // will pick wrong answer
    contributed: false,
    isLocal: false,
  },
  {
    id: 'ahmed',
    name: 'Ahmed',
    initials: 'AH',
    avatarColor: Colors.avatar.ahmed,
    selectedOption: 'A', // will pick wrong answer, changes during vote
    contributed: false,
    isLocal: false,
  },
  {
    id: 'lina',
    name: 'Lina',
    initials: 'LI',
    avatarColor: Colors.avatar.lina,
    selectedOption: 'B', // correct from start
    contributed: false,
    isLocal: false,
  },
  {
    id: 'omar',
    name: 'Omar',
    initials: 'OM',
    avatarColor: Colors.avatar.omar,
    selectedOption: 'C', // wrong, changes during vote
    contributed: false,
    isLocal: false,
  },
];

// Guided prompt chips shown in Phase B
export const PROMPT_CHIPS = [
  'I think it\'s __ because…',
  'Let\'s eliminate __ because…',
  'What rule applies here?',
  'Can you explain your choice?',
];

// Simulated peer messages for Phase B (discussion)
export const PEER_MESSAGES: {
  participantId: string;
  text: string;
  delayMs: number; // delay from start of Phase B
  newOption?: 'A' | 'B' | 'C' | 'D'; // option change during voting
}[] = [
  {
    participantId: 'sara',
    text: 'I picked A (38 cm²) — I thought we add all sides.',
    delayMs: 4500,
  },
  {
    participantId: 'ahmed',
    text: "Let's eliminate C because 42 is just half of 84. That doesn't feel right.",
    delayMs: 9000,
  },
  {
    participantId: 'lina',
    text: 'Area = length × width. 12 × 7 = 84. The answer is B.',
    delayMs: 14000,
  },
  {
    participantId: 'omar',
    text: 'Oh wait… I mixed up area and perimeter. Makes sense now.',
    delayMs: 24000, // late contributor — simulates shy student
  },
];

// Option changes during Phase C (voting)
export const VOTE_CHANGES: {
  participantId: string;
  newOption: 'A' | 'B' | 'C' | 'D';
  delayMs: number;
}[] = [
  { participantId: 'sara', newOption: 'B', delayMs: 5000 },
  { participantId: 'ahmed', newOption: 'B', delayMs: 9000 },
];

export const PHASE_DURATIONS = {
  independent: 20,
  discussion: 30,
  voting: 20,
};
