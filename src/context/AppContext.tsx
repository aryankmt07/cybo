import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { CyberShieldDatabase, INITIAL_SEED_DATA } from '../data/seedData';
import {
  AdminTab,
  AppRoute,
  CATEGORIES,
  Category,
  Lesson,
  QuizAttempt,
  QuizQuestion,
  ScenarioAttempt,
  ThreatScenario,
  ToastItem,
  User,
} from '../types';

const STORAGE_KEY = 'cybershield_react_state_v1';

export interface TopicStat {
  category: Category;
  lessonsDone: number;
  lessonsTotal: number;
  lessonProgress: number;
  mastery: number | null;
  evaluatedCount: number;
}

export interface UserMetrics {
  totalLessons: number;
  completedCount: number;
  lessonPct: number;
  quizAttempts: QuizAttempt[];
  avgQuiz: number;
  scenarioAttempts: ScenarioAttempt[];
  uniqueScenariosSolved: number;
  scenarioAccuracy: number;
  topicStats: TopicStat[];
  certCriteria: {
    allLessons: boolean;
    minScenarios: boolean;
    minQuizScore: boolean;
  };
  certUnlocked: boolean;
}

interface AppContextValue {
  db: CyberShieldDatabase;
  currentUser: User | null;
  route: AppRoute;
  adminTab: AdminTab;
  activeLessonId: string | null;
  activeScenarioIndex: number;
  toasts: ToastItem[];
  navigate: (route: AppRoute, opts?: { adminTab?: AdminTab; lessonId?: string; scenarioIndex?: number }) => void;
  setAdminTab: (tab: AdminTab) => void;
  setActiveScenarioIndex: (index: number) => void;
  showToast: (message: string, type?: ToastItem['type']) => void;
  dismissToast: (id: string) => void;
  login: (email: string, password: string) => { ok: boolean; error?: string };
  register: (name: string, email: string, password: string) => { ok: boolean; error?: string };
  logout: () => void;
  recordLessonAccess: (lessonId: string) => void;
  markLessonComplete: (lessonId: string) => void;
  submitScenarioAttempt: (scenario: ThreatScenario, selectedIndex: number) => boolean;
  submitQuizAttempt: (attempt: Omit<QuizAttempt, 'id' | 'completedAt'>) => QuizAttempt;
  toggleUserStatus: (userId: string) => void;
  saveLesson: (lesson: Omit<Lesson, 'id'> & { id?: string }) => void;
  deleteLesson: (lessonId: string) => void;
  saveQuestion: (question: Omit<QuizQuestion, 'id'> & { id?: string }) => void;
  deleteQuestion: (questionId: string) => void;
  saveScenario: (scenario: Omit<ThreatScenario, 'id'> & { id?: string }) => void;
  deleteScenario: (scenarioId: string) => void;
  computeMetrics: (user: User) => UserMetrics;
  platformStats: {
    hasRealActivity: boolean;
    learnerCount: number;
    totalQuizzes: number;
    totalScenarios: number;
  };
}

const AppContext = createContext<AppContextValue | null>(null);

function loadInitialDb(): CyberShieldDatabase {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as CyberShieldDatabase;
      if (parsed && Array.isArray(parsed.users) && Array.isArray(parsed.lessons)) {
        return parsed;
      }
    }
  } catch {
    // Ignore storage read errors and fall back to seed
  }
  return structuredClone(INITIAL_SEED_DATA);
}

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [db, setDb] = useState<CyberShieldDatabase>(loadInitialDb);
  const [currentUserId, setCurrentUserId] = useState<string | null>(() => {
    try {
      return localStorage.getItem('cybershield_session_uid');
    } catch {
      return null;
    }
  });
  const [route, setRoute] = useState<AppRoute>(() => {
    try {
      return localStorage.getItem('cybershield_session_uid') ? 'dashboard' : 'landing';
    } catch {
      return 'landing';
    }
  });
  const [adminTab, setAdminTab] = useState<AdminTab>('analytics');
  const [activeLessonId, setActiveLessonId] = useState<string | null>(null);
  const [activeScenarioIndex, setActiveScenarioIndex] = useState<number>(0);
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
    } catch {
      // Ignore storage quota issues
    }
  }, [db]);

  useEffect(() => {
    try {
      if (currentUserId) localStorage.setItem('cybershield_session_uid', currentUserId);
      else localStorage.removeItem('cybershield_session_uid');
    } catch {
      // Ignore storage issues
    }
  }, [currentUserId]);

  const currentUser = useMemo(
    () => db.users.find((u) => u.id === currentUserId) || null,
    [db.users, currentUserId]
  );

  const showToast = (message: string, type: ToastItem['type'] = 'info') => {
    const id = 't-' + Date.now() + Math.random().toString(36).slice(2, 6);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3600);
  };

  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const navigate: AppContextValue['navigate'] = (nextRoute, opts) => {
    const protectedRoutes: AppRoute[] = [
      'dashboard',
      'modules',
      'lesson',
      'scenarios',
      'quiz',
      'feedback',
      'progress',
      'admin',
    ];

    if (protectedRoutes.includes(nextRoute) && !currentUser) {
      setRoute('auth');
      showToast('Please sign in to access your workspace.', 'info');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    if (nextRoute === 'admin' && currentUser?.role !== 'admin') {
      setRoute('dashboard');
      showToast('Administrator access is required for that section.', 'danger');
      return;
    }

    if (opts?.adminTab) setAdminTab(opts.adminTab);
    if (opts?.lessonId !== undefined) setActiveLessonId(opts.lessonId);
    if (opts?.scenarioIndex !== undefined) setActiveScenarioIndex(opts.scenarioIndex);
    setRoute(nextRoute);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const login = (email: string, password: string) => {
    const normalized = email.trim().toLowerCase();
    const user = db.users.find((u) => u.email.toLowerCase() === normalized && u.password === password);
    if (!user) {
      return { ok: false, error: 'Incorrect email or password. Please verify your credentials.' };
    }
    if (user.status === 'Inactive') {
      return { ok: false, error: 'This account has been deactivated by an administrator.' };
    }
    setCurrentUserId(user.id);
    showToast(`Welcome back, ${user.name.split(' ')[0]}!`, 'success');
    setRoute(user.role === 'admin' ? 'admin' : 'dashboard');
    window.scrollTo({ top: 0, behavior: 'smooth' });
    return { ok: true };
  };

  const register = (name: string, email: string, password: string) => {
    const normalized = email.trim().toLowerCase();
    if (db.users.some((u) => u.email.toLowerCase() === normalized)) {
      return { ok: false, error: 'An account with this email already exists.' };
    }
    const newUser: User = {
      id: 'u-' + Date.now(),
      name: name.trim(),
      email: normalized,
      password,
      role: 'learner',
      status: 'Active',
      joinedAt: new Date().toISOString().slice(0, 10),
      completedLessons: [],
      recentLessons: [],
      scenarioAttempts: [],
      quizAttempts: [],
    };
    setDb((prev) => ({ ...prev, users: [...prev.users, newUser] }));
    setCurrentUserId(newUser.id);
    showToast('Account created! Welcome to CyberShield.', 'success');
    setRoute('dashboard');
    window.scrollTo({ top: 0, behavior: 'smooth' });
    return { ok: true };
  };

  const logout = () => {
    setCurrentUserId(null);
    setRoute('landing');
    showToast('Signed out safely.', 'info');
  };

  const recordLessonAccess = (lessonId: string) => {
    if (!currentUserId) return;
    setDb((prev) => ({
      ...prev,
      users: prev.users.map((u) =>
        u.id === currentUserId
          ? {
              ...u,
              recentLessons: [lessonId, ...u.recentLessons.filter((id) => id !== lessonId)].slice(0, 5),
            }
          : u
      ),
    }));
  };

  const markLessonComplete = (lessonId: string) => {
    if (!currentUserId) return;
    setDb((prev) => ({
      ...prev,
      users: prev.users.map((u) => {
        if (u.id !== currentUserId) return u;
        if (u.completedLessons.includes(lessonId)) return u;
        return { ...u, completedLessons: [...u.completedLessons, lessonId] };
      }),
    }));
    showToast('Lesson marked complete! Progress updated.', 'success');
  };

  const submitScenarioAttempt = (scenario: ThreatScenario, selectedIndex: number) => {
    const isCorrect = selectedIndex === scenario.correctIndex;
    if (!currentUserId) return isCorrect;
    const attempt: ScenarioAttempt = {
      id: 'sa-' + Date.now(),
      scenarioId: scenario.id,
      category: scenario.category,
      title: scenario.title,
      selectedIndex,
      isCorrect,
      timestamp: new Date().toISOString(),
    };
    setDb((prev) => ({
      ...prev,
      users: prev.users.map((u) =>
        u.id === currentUserId ? { ...u, scenarioAttempts: [...u.scenarioAttempts, attempt] } : u
      ),
    }));
    return isCorrect;
  };

  const submitQuizAttempt = (attemptInput: Omit<QuizAttempt, 'id' | 'completedAt'>) => {
    const attempt: QuizAttempt = {
      ...attemptInput,
      id: 'qa-' + Date.now(),
      completedAt: new Date().toISOString(),
    };
    if (currentUserId) {
      setDb((prev) => ({
        ...prev,
        users: prev.users.map((u) =>
          u.id === currentUserId ? { ...u, quizAttempts: [...u.quizAttempts, attempt] } : u
        ),
      }));
    }
    return attempt;
  };

  const toggleUserStatus = (userId: string) => {
    setDb((prev) => ({
      ...prev,
      users: prev.users.map((u) =>
        u.id === userId ? { ...u, status: u.status === 'Active' ? 'Inactive' : 'Active' } : u
      ),
    }));
    showToast('User account status updated.', 'success');
  };

  const saveLesson = (lessonInput: Omit<Lesson, 'id'> & { id?: string }) => {
    setDb((prev) => {
      if (lessonInput.id) {
        return {
          ...prev,
          lessons: prev.lessons.map((l) => (l.id === lessonInput.id ? { ...(lessonInput as Lesson) } : l)),
        };
      }
      const created: Lesson = { ...lessonInput, id: 'l-' + Date.now() };
      return { ...prev, lessons: [...prev.lessons, created] };
    });
    showToast(lessonInput.id ? 'Lesson updated.' : 'New lesson published.', 'success');
  };

  const deleteLesson = (lessonId: string) => {
    setDb((prev) => ({
      ...prev,
      lessons: prev.lessons.filter((l) => l.id !== lessonId),
    }));
    showToast('Lesson removed.', 'info');
  };

  const saveQuestion = (qInput: Omit<QuizQuestion, 'id'> & { id?: string }) => {
    setDb((prev) => {
      if (qInput.id) {
        return {
          ...prev,
          questions: prev.questions.map((q) => (q.id === qInput.id ? { ...(qInput as QuizQuestion) } : q)),
        };
      }
      const created: QuizQuestion = { ...qInput, id: 'q-' + Date.now() };
      return { ...prev, questions: [...prev.questions, created] };
    });
    showToast(qInput.id ? 'Quiz question updated.' : 'Quiz question added.', 'success');
  };

  const deleteQuestion = (questionId: string) => {
    setDb((prev) => ({
      ...prev,
      questions: prev.questions.filter((q) => q.id !== questionId),
    }));
    showToast('Question removed from quiz bank.', 'info');
  };

  const saveScenario = (sInput: Omit<ThreatScenario, 'id'> & { id?: string }) => {
    setDb((prev) => {
      if (sInput.id) {
        return {
          ...prev,
          scenarios: prev.scenarios.map((s) => (s.id === sInput.id ? { ...(sInput as ThreatScenario) } : s)),
        };
      }
      const created: ThreatScenario = { ...sInput, id: 's-' + Date.now() };
      return { ...prev, scenarios: [...prev.scenarios, created] };
    });
    showToast(sInput.id ? 'Threat scenario updated.' : 'New threat scenario created.', 'success');
  };

  const deleteScenario = (scenarioId: string) => {
    setDb((prev) => ({
      ...prev,
      scenarios: prev.scenarios.filter((s) => s.id !== scenarioId),
    }));
    showToast('Scenario removed.', 'info');
  };

  const computeMetrics = (user: User): UserMetrics => {
    const publishedLessons = db.lessons.filter((l) => l.published);
    const totalLessons = publishedLessons.length;
    const completedCount = user.completedLessons.filter((id) =>
      publishedLessons.some((l) => l.id === id)
    ).length;
    const lessonPct = totalLessons ? Math.round((completedCount / totalLessons) * 100) : 0;

    const quizAttempts = user.quizAttempts || [];
    const avgQuiz = quizAttempts.length
      ? Math.round(quizAttempts.reduce((sum, q) => sum + q.score, 0) / quizAttempts.length)
      : 0;

    const scenarioAttempts = user.scenarioAttempts || [];
    const uniqueScenariosSolved = new Set(scenarioAttempts.map((s) => s.scenarioId)).size;
    const scenarioAccuracy = scenarioAttempts.length
      ? Math.round((scenarioAttempts.filter((s) => s.isCorrect).length / scenarioAttempts.length) * 100)
      : 0;

    const topicStats: TopicStat[] = CATEGORIES.map((category) => {
      const catLessons = publishedLessons.filter((l) => l.category === category);
      const lessonsDone = catLessons.filter((l) => user.completedLessons.includes(l.id)).length;
      const lessonProgress = catLessons.length ? Math.round((lessonsDone / catLessons.length) * 100) : 0;

      const qItems = quizAttempts.flatMap((a) => a.breakdown || []).filter((b) => b.category === category);
      const sItems = scenarioAttempts.filter((s) => s.category === category);
      const combined = [...qItems.map((x) => x.isCorrect), ...sItems.map((x) => x.isCorrect)];
      const mastery = combined.length
        ? Math.round((combined.filter(Boolean).length / combined.length) * 100)
        : null;

      return {
        category,
        lessonsDone,
        lessonsTotal: catLessons.length,
        lessonProgress,
        mastery,
        evaluatedCount: combined.length,
      };
    });

    const minScenarioTarget = Math.min(4, db.scenarios.length);
    const certCriteria = {
      allLessons: totalLessons > 0 && completedCount >= totalLessons,
      minScenarios: db.scenarios.length > 0 && uniqueScenariosSolved >= minScenarioTarget,
      minQuizScore: quizAttempts.length > 0 && avgQuiz >= 80,
    };

    return {
      totalLessons,
      completedCount,
      lessonPct,
      quizAttempts,
      avgQuiz,
      scenarioAttempts,
      uniqueScenariosSolved,
      scenarioAccuracy,
      topicStats,
      certCriteria,
      certUnlocked: certCriteria.allLessons && certCriteria.minScenarios && certCriteria.minQuizScore,
    };
  };

  const platformStats = useMemo(() => {
    const learners = db.users.filter((u) => u.role === 'learner');
    const totalQuizzes = learners.reduce((s, u) => s + u.quizAttempts.length, 0);
    const totalScenarios = learners.reduce((s, u) => s + u.scenarioAttempts.length, 0);
    return {
      hasRealActivity: learners.length > 0 && (totalQuizzes > 0 || totalScenarios > 0),
      learnerCount: learners.length,
      totalQuizzes,
      totalScenarios,
    };
  }, [db.users]);

  return (
    <AppContext.Provider
      value={{
        db,
        currentUser,
        route,
        adminTab,
        activeLessonId,
        activeScenarioIndex,
        toasts,
        navigate,
        setAdminTab,
        setActiveScenarioIndex,
        showToast,
        dismissToast,
        login,
        register,
        logout,
        recordLessonAccess,
        markLessonComplete,
        submitScenarioAttempt,
        submitQuizAttempt,
        toggleUserStatus,
        saveLesson,
        deleteLesson,
        saveQuestion,
        deleteQuestion,
        saveScenario,
        deleteScenario,
        computeMetrics,
        platformStats,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
