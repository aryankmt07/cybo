export const CATEGORIES = [
  'Phishing Awareness',
  'Online Payment Fraud',
  'Password Security',
  'Identity Theft',
  'Data Privacy',
  'Safe Internet Browsing',
] as const;

export type Category = (typeof CATEGORIES)[number];

export type Difficulty = 'Beginner' | 'Intermediate' | 'Advanced';

export type UserRole = 'learner' | 'admin';

export type UserStatus = 'Active' | 'Inactive';

export type ScenarioFormat = 'email' | 'sms' | 'web' | 'payment';

export interface Lesson {
  id: string;
  category: Category;
  title: string;
  description: string;
  difficulty: Difficulty;
  duration: number;
  content: string[];
  realWorldExample: string;
  checklist: string[];
  published: boolean;
}

export interface ScenarioArtifact {
  senderName?: string;
  senderAddress?: string;
  subject?: string;
  body?: string;
  ctaText?: string;
  hoverUrl?: string;
  url?: string;
  https?: boolean;
  heading?: string;
  fields?: string[];
  amount?: string;
  merchant?: string;
}

export interface ThreatScenario {
  id: string;
  category: Category;
  title: string;
  format: ScenarioFormat;
  prompt: string;
  artifact: ScenarioArtifact;
  redFlags: string[];
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface QuizQuestion {
  id: string;
  category: Category;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface ScenarioAttempt {
  id: string;
  scenarioId: string;
  category: Category;
  title: string;
  selectedIndex: number;
  isCorrect: boolean;
  timestamp: string;
}

export interface QuizBreakdownItem {
  questionId: string;
  category: Category;
  selectedIndex: number;
  correctIndex: number;
  isCorrect: boolean;
}

export interface QuizAttempt {
  id: string;
  topicFilter: string;
  score: number;
  correctCount: number;
  total: number;
  breakdown: QuizBreakdownItem[];
  completedAt: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  password: string;
  role: UserRole;
  status: UserStatus;
  joinedAt: string;
  completedLessons: string[];
  recentLessons: string[];
  scenarioAttempts: ScenarioAttempt[];
  quizAttempts: QuizAttempt[];
}

export type AppRoute =
  | 'landing'
  | 'auth'
  | 'dashboard'
  | 'modules'
  | 'lesson'
  | 'scenarios'
  | 'quiz'
  | 'feedback'
  | 'progress'
  | 'admin';

export type AdminTab = 'analytics' | 'users' | 'lessons' | 'quizzes' | 'scenarios';

export interface ToastItem {
  id: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'danger';
}
