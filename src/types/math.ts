export type Operation = 'add' | 'sub' | 'mul' | 'div' | 'mixed';
export type Difficulty = 'easy' | 'medium' | 'hard' | 'expert';
export type GameMode = 'practice' | 'blitz' | 'sprint10';

export interface MathProblem {
  id: string;
  num1: number;
  num2: number;
  num3?: number;
  op: '+' | '-' | '×' | '÷';
  op2?: '+' | '-' | '×';
  question: string;
  answer: number;
  explanation: string;
  hint: string;
  visualType?: 'dots' | 'numberline' | 'split';
}

export interface QuizResult {
  problem: MathProblem;
  userAnswer: number;
  isCorrect: boolean;
  timeSpentMs: number;
}

export interface UserStats {
  totalSolved: number;
  totalCorrect: number;
  bestBlitzScore: number;
  currentStreak: number;
  bestStreak: number;
  recentMistakes: MathProblem[];
  lastPlayedDate: string;
}

export type ActiveTab = 'mental' | 'table' | 'written' | 'visual';
