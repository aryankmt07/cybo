import React, { useMemo, useState } from 'react';
import { Eye, Pencil, Plus, Search, Trash2, Users } from 'lucide-react';
import { AppShell } from '../components/layout/AppShell';
import { Button, Card, EmptyState, Modal, ProgressBar } from '../components/ui/Primitives';
import { useApp } from '../context/AppContext';
import {
  AdminTab,
  CATEGORIES,
  Category,
  Difficulty,
  Lesson,
  QuizQuestion,
  ScenarioFormat,
  ThreatScenario,
  User,
} from '../types';

export const AdminPage: React.FC = () => {
  const {
    db,
    currentUser,
    adminTab,
    setAdminTab,
    toggleUserStatus,
    saveLesson,
    deleteLesson,
    saveQuestion,
    deleteQuestion,
    saveScenario,
    deleteScenario,
    computeMetrics,
  } = useApp();

  const [userSearch, setUserSearch] = useState('');
  const [inspectUser, setInspectUser] = useState<User | null>(null);

  // Lesson Modal State
  const [lessonModalOpen, setLessonModalOpen] = useState(false);
  const [editingLesson, setEditingLesson] = useState<Lesson | null>(null);
  const [lessonForm, setLessonForm] = useState({
    title: '',
    category: CATEGORIES[0] as Category,
    difficulty: 'Beginner' as Difficulty,
    duration: 10,
    description: '',
    contentText: '',
    realWorldExample: '',
    checklistText: '',
    published: true,
  });

  // Quiz Question Modal State
  const [quizModalOpen, setQuizModalOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<QuizQuestion | null>(null);
  const [quizForm, setQuizForm] = useState({
    category: CATEGORIES[0] as Category,
    question: '',
    opt0: '',
    opt1: '',
    opt2: '',
    opt3: '',
    correctIndex: 0,
    explanation: '',
  });

  // Scenario Modal State
  const [scenarioModalOpen, setScenarioModalOpen] = useState(false);
  const [editingScenario, setEditingScenario] = useState<ThreatScenario | null>(null);
  const [scenarioForm, setScenarioForm] = useState({
    title: '',
    category: CATEGORIES[0] as Category,
    format: 'email' as ScenarioFormat,
    prompt: '',
    senderName: '',
    senderAddress: '',
    subject: '',
    body: '',
    hoverUrl: '',
    url: '',
    https: false,
    heading: '',
    redFlagsText: '',
    opt0: '',
    opt1: '',
    opt2: '',
    opt3: '',
    correctIndex: 0,
    explanation: '',
  });

  // Delete Confirmation Modal
  const [deleteConfirm, setDeleteConfirm] = useState<{
    title: string;
    message: string;
    onConfirm: () => void;
  } | null>(null);

  const learners = useMemo(() => db.users.filter((u) => u.role === 'learner'), [db.users]);
  const allQuizScores = useMemo(
    () => learners.flatMap((u) => u.quizAttempts.map((q) => q.score)),
    [learners]
  );
  const platformAvg = allQuizScores.length
    ? Math.round(allQuizScores.reduce((s, n) => s + n, 0) / allQuizScores.length)
    : null;

  const totalQuizSubmissions = learners.reduce((s, u) => s + u.quizAttempts.length, 0);
  const totalScenarioAttempts = learners.reduce((s, u) => s + u.scenarioAttempts.length, 0);

  const aggregateActivity = useMemo(() => {
    const items = learners.flatMap((u) => [
      ...u.quizAttempts.map((q) => ({
        id: q.id,
        text: `${u.name} completed a Cybersecurity Quiz (${q.score}%)`,
        time: q.completedAt,
      })),
      ...u.scenarioAttempts.map((s) => ({
        id: s.id,
        text: `${u.name} attempted "${s.title}" (${s.isCorrect ? 'Correct' : 'Missed'})`,
        time: s.timestamp,
      })),
    ]);
    return items.sort((a, b) => b.time.localeCompare(a.time)).slice(0, 8);
  }, [learners]);

  const domainBreakdown = useMemo(() => {
    return CATEGORIES.map((cat) => {
      const qItems = learners.flatMap((u) => u.quizAttempts.flatMap((a) => a.breakdown)).filter((b) => b.category === cat);
      const sItems = learners.flatMap((u) => u.scenarioAttempts).filter((s) => s.category === cat);
      const combined = [...qItems.map((x) => x.isCorrect), ...sItems.map((x) => x.isCorrect)];
      const accuracy = combined.length
        ? Math.round((combined.filter(Boolean).length / combined.length) * 100)
        : null;
      return { category: cat, accuracy, attempts: combined.length };
    });
  }, [learners]);

  if (!currentUser || currentUser.role !== 'admin') return null;

  const filteredUsers = db.users.filter(
    (u) =>
      !userSearch.trim() ||
      u.name.toLowerCase().includes(userSearch.toLowerCase()) ||
      u.email.toLowerCase().includes(userSearch.toLowerCase())
  );

  // Handlers for Modals
  const openCreateLesson = (lesson?: Lesson) => {
    if (lesson) {
      setEditingLesson(lesson);
      setLessonForm({
        title: lesson.title,
        category: lesson.category,
        difficulty: lesson.difficulty,
        duration: lesson.duration,
        description: lesson.description,
        contentText: lesson.content.join('\n\n'),
        realWorldExample: lesson.realWorldExample,
        checklistText: lesson.checklist.join('\n'),
        published: lesson.published,
      });
    } else {
      setEditingLesson(null);
      setLessonForm({
        title: '',
        category: CATEGORIES[0],
        difficulty: 'Beginner',
        duration: 10,
        description: '',
        contentText: '',
        realWorldExample: '',
        checklistText: '',
        published: true,
      });
    }
    setLessonModalOpen(true);
  };

  const handleSaveLesson = (e: React.FormEvent) => {
    e.preventDefault();
    if (!lessonForm.title.trim() || !lessonForm.description.trim()) return;
    saveLesson({
      id: editingLesson?.id,
      title: lessonForm.title.trim(),
      category: lessonForm.category,
      difficulty: lessonForm.difficulty,
      duration: Number(lessonForm.duration) || 10,
      description: lessonForm.description.trim(),
      content: lessonForm.contentText
        .split('\n\n')
        .map((p) => p.trim())
        .filter(Boolean),
      realWorldExample: lessonForm.realWorldExample.trim(),
      checklist: lessonForm.checklistText
        .split('\n')
        .map((c) => c.trim())
        .filter(Boolean),
      published: lessonForm.published,
    });
    setLessonModalOpen(false);
  };

  const openCreateQuiz = (q?: QuizQuestion) => {
    if (q) {
      setEditingQuestion(q);
      setQuizForm({
        category: q.category,
        question: q.question,
        opt0: q.options[0] || '',
        opt1: q.options[1] || '',
        opt2: q.options[2] || '',
        opt3: q.options[3] || '',
        correctIndex: q.correctIndex,
        explanation: q.explanation,
      });
    } else {
      setEditingQuestion(null);
      setQuizForm({
        category: CATEGORIES[0],
        question: '',
        opt0: '',
        opt1: '',
        opt2: '',
        opt3: '',
        correctIndex: 0,
        explanation: '',
      });
    }
    setQuizModalOpen(true);
  };

  const handleSaveQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quizForm.question.trim() || !quizForm.opt0.trim() || !quizForm.opt1.trim()) return;
    saveQuestion({
      id: editingQuestion?.id,
      category: quizForm.category,
      question: quizForm.question.trim(),
      options: [quizForm.opt0.trim(), quizForm.opt1.trim(), quizForm.opt2.trim(), quizForm.opt3.trim()],
      correctIndex: Number(quizForm.correctIndex),
      explanation: quizForm.explanation.trim(),
    });
    setQuizModalOpen(false);
  };

  const openCreateScenario = (sc?: ThreatScenario) => {
    if (sc) {
      setEditingScenario(sc);
      setScenarioForm({
        title: sc.title,
        category: sc.category,
        format: sc.format,
        prompt: sc.prompt,
        senderName: sc.artifact.senderName || '',
        senderAddress: sc.artifact.senderAddress || '',
        subject: sc.artifact.subject || '',
        body: sc.artifact.body || '',
        hoverUrl: sc.artifact.hoverUrl || '',
        url: sc.artifact.url || '',
        https: Boolean(sc.artifact.https),
        heading: sc.artifact.heading || '',
        redFlagsText: sc.redFlags.join('\n'),
        opt0: sc.options[0] || '',
        opt1: sc.options[1] || '',
        opt2: sc.options[2] || '',
        opt3: sc.options[3] || '',
        correctIndex: sc.correctIndex,
        explanation: sc.explanation,
      });
    } else {
      setEditingScenario(null);
      setScenarioForm({
        title: '',
        category: CATEGORIES[0],
        format: 'email',
        prompt: 'Inspect this simulated message carefully. What is the safest response?',
        senderName: 'Account Security',
        senderAddress: 'alert@example-verify.invalid',
        subject: 'Urgent Verification Needed',
        body: 'Your account requires verification within 2 hours.',
        hoverUrl: 'http://example-verify.invalid/login',
        url: 'http://example-verify.invalid/login',
        https: false,
        heading: 'Verify Account Details',
        redFlagsText: 'Lookalike sender domain\nArtificial urgency',
        opt0: 'Click the link immediately',
        opt1: 'Report & verify independently on the official website',
        opt2: 'Reply with your password',
        opt3: 'Ignore and share with friends',
        correctIndex: 1,
        explanation: '',
      });
    }
    setScenarioModalOpen(true);
  };

  const handleSaveScenario = (e: React.FormEvent) => {
    e.preventDefault();
    if (!scenarioForm.title.trim()) return;
    const artifact =
      scenarioForm.format === 'email'
        ? {
            senderName: scenarioForm.senderName.trim(),
            senderAddress: scenarioForm.senderAddress.trim(),
            subject: scenarioForm.subject.trim(),
            body: scenarioForm.body.trim(),
            ctaText: 'Verify Now',
            hoverUrl: scenarioForm.hoverUrl.trim(),
          }
        : scenarioForm.format === 'sms'
        ? {
            senderName: scenarioForm.senderName.trim(),
            body: scenarioForm.body.trim(),
          }
        : {
            url: scenarioForm.url.trim(),
            https: scenarioForm.https,
            heading: scenarioForm.heading.trim(),
            fields: ['Email Address', 'Password / PIN'],
          };

    saveScenario({
      id: editingScenario?.id,
      title: scenarioForm.title.trim(),
      category: scenarioForm.category,
      format: scenarioForm.format,
      prompt: scenarioForm.prompt.trim(),
      artifact,
      redFlags: scenarioForm.redFlagsText
        .split('\n')
        .map((r) => r.trim())
        .filter(Boolean),
      options: [
        scenarioForm.opt0.trim(),
        scenarioForm.opt1.trim(),
        scenarioForm.opt2.trim(),
        scenarioForm.opt3.trim(),
      ],
      correctIndex: Number(scenarioForm.correctIndex),
      explanation: scenarioForm.explanation.trim(),
    });
    setScenarioModalOpen(false);
  };

  const tabs: { id: AdminTab; label: string }[] = [
    { id: 'analytics', label: 'Analytics' },
    { id: 'users', label: 'Users' },
    { id: 'lessons', label: 'Lessons' },
    { id: 'quizzes', label: 'Quiz Bank' },
    { id: 'scenarios', label: 'Threat Scenarios' },
  ];

  return (
    <AppShell title="Admin Dashboard">
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="font-display font-bold text-2xl sm:text-[28px] text-[#0F172A] tracking-tight">
              Admin Console
            </h1>
            <p className="text-sm text-[#475569] mt-1">
              Manage learners, educational modules, quiz questions, threat scenarios, and aggregate analytics.
            </p>
          </div>

          <div className="flex flex-wrap gap-1 p-1 bg-slate-200/70 rounded-lg" role="tablist">
            {tabs.map((t) => (
              <button
                key={t.id}
                type="button"
                role="tab"
                aria-selected={adminTab === t.id}
                onClick={() => setAdminTab(t.id)}
                className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap ${
                  adminTab === t.id ? 'bg-white text-[#0F172A] shadow-xs' : 'text-slate-600 hover:text-[#0F172A]'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* 1. ANALYTICS TAB */}
        {adminTab === 'analytics' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
              <Card className="p-5">
                <div className="text-xs font-medium text-slate-500">Registered Learners</div>
                <div className="font-display font-bold text-3xl text-[#0F172A] tabular-nums mt-2">
                  {learners.length}
                </div>
              </Card>
              <Card className="p-5">
                <div className="text-xs font-medium text-slate-500">Quiz Submissions</div>
                <div className="font-display font-bold text-3xl text-[#0F172A] tabular-nums mt-2">
                  {totalQuizSubmissions}
                </div>
              </Card>
              <Card className="p-5">
                <div className="text-xs font-medium text-slate-500">Scenario Attempts</div>
                <div className="font-display font-bold text-3xl text-[#0F172A] tabular-nums mt-2">
                  {totalScenarioAttempts}
                </div>
              </Card>
              <Card className="p-5">
                <div className="text-xs font-medium text-slate-500">Platform Avg Quiz Score</div>
                <div className="font-display font-bold text-3xl text-[#0F172A] tabular-nums mt-2">
                  {platformAvg !== null ? `${platformAvg}%` : '—'}
                </div>
              </Card>
            </div>

            <div className="grid lg:grid-cols-2 gap-6">
              <Card className="p-6 space-y-4">
                <h2 className="font-display font-semibold text-base text-[#0F172A]">
                  Aggregate Domain Accuracy
                </h2>
                <div className="space-y-3.5">
                  {domainBreakdown.map((d) => (
                    <div key={d.category}>
                      <div className="flex justify-between text-xs mb-1.5">
                        <span className="font-medium text-[#0F172A]">{d.category}</span>
                        <span className="text-slate-500 tabular-nums">
                          {d.accuracy !== null ? `${d.accuracy}% (${d.attempts} checks)` : 'No learner data yet'}
                        </span>
                      </div>
                      <ProgressBar
                        value={d.accuracy ?? 0}
                        tone={d.accuracy === null ? 'royal' : d.accuracy >= 80 ? 'success' : 'warning'}
                      />
                    </div>
                  ))}
                </div>
              </Card>

              <Card className="p-6 space-y-4">
                <h2 className="font-display font-semibold text-base text-[#0F172A]">
                  Aggregate Learner Activity
                </h2>
                {aggregateActivity.length ? (
                  <div className="divide-y divide-slate-100">
                    {aggregateActivity.map((item) => (
                      <div key={item.id} className="py-2.5 first:pt-0 last:pb-0">
                        <div className="text-sm text-[#0F172A]">{item.text}</div>
                        <div className="text-xs text-slate-500 tabular-nums mt-0.5">
                          {item.time.slice(0, 16).replace('T', ' ')}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-[#475569]">
                    No learner activity logged yet. Register a learner account and complete a lesson, scenario, or quiz to populate real activity logs.
                  </p>
                )}
              </Card>
            </div>
          </div>
        )}

        {/* 2. USER MANAGEMENT TAB */}
        {adminTab === 'users' && (
          <div className="space-y-4">
            <Card className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="relative flex-1 max-w-sm">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" aria-hidden="true" />
                <input
                  type="search"
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  placeholder="Search users by name or email..."
                  aria-label="Search users"
                  className="w-full h-10 pl-9 pr-3 rounded-lg border border-slate-300 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB]"
                />
              </div>
              <div className="text-xs font-medium text-slate-500 tabular-nums">{filteredUsers.length} account(s)</div>
            </Card>

            <Card className="overflow-hidden">
              {filteredUsers.length ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm border-collapse">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-600">
                        <th className="py-3 px-4">Name</th>
                        <th className="py-3 px-4">Email</th>
                        <th className="py-3 px-4">Role</th>
                        <th className="py-3 px-4 text-right">Lessons</th>
                        <th className="py-3 px-4">Status</th>
                        <th className="py-3 px-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {filteredUsers.map((u) => (
                        <tr key={u.id} className="hover:bg-slate-50/70">
                          <td className="py-3 px-4 font-semibold text-[#0F172A]">{u.name}</td>
                          <td className="py-3 px-4 text-slate-600">{u.email}</td>
                          <td className="py-3 px-4 capitalize text-slate-700">{u.role}</td>
                          <td className="py-3 px-4 text-right tabular-nums text-slate-600">
                            {u.completedLessons.length}/{db.lessons.length}
                          </td>
                          <td className="py-3 px-4">
                            <span
                              className={`text-xs font-semibold ${
                                u.status === 'Active' ? 'text-[#16A34A]' : 'text-[#DC2626]'
                              }`}
                            >
                              {u.status}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex justify-end gap-2">
                              <Button variant="ghost" size="sm" onClick={() => setInspectUser(u)} aria-label="View user progress">
                                <Eye className="w-4 h-4" />
                              </Button>
                              {u.id !== currentUser.id && (
                                <Button variant="secondary" size="sm" onClick={() => toggleUserStatus(u.id)}>
                                  {u.status === 'Active' ? 'Deactivate' : 'Activate'}
                                </Button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <EmptyState
                  icon={<Users className="w-6 h-6" />}
                  title="No matching users"
                  description="Adjust your search filter to locate an account."
                />
              )}
            </Card>
          </div>
        )}

        {/* 3. MANAGE LESSONS TAB */}
        {adminTab === 'lessons' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between gap-4">
              <h2 className="font-display font-semibold text-lg text-[#0F172A]">
                Curriculum Lessons ({db.lessons.length})
              </h2>
              <Button variant="primary" size="sm" onClick={() => openCreateLesson()}>
                <Plus className="w-4 h-4" />
                Add Lesson
              </Button>
            </div>

            <Card className="overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-600">
                      <th className="py-3 px-4">Title</th>
                      <th className="py-3 px-4">Category</th>
                      <th className="py-3 px-4">Difficulty</th>
                      <th className="py-3 px-4 text-right">Duration</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {db.lessons.map((l) => (
                      <tr key={l.id} className="hover:bg-slate-50/70">
                        <td className="py-3 px-4 font-semibold text-[#0F172A]">{l.title}</td>
                        <td className="py-3 px-4 text-slate-600">{l.category}</td>
                        <td className="py-3 px-4 text-slate-600">{l.difficulty}</td>
                        <td className="py-3 px-4 text-right tabular-nums text-slate-600">{l.duration} min</td>
                        <td className="py-3 px-4">
                          <div className="flex justify-end gap-1.5">
                            <Button variant="ghost" size="sm" aria-label="Edit lesson" onClick={() => openCreateLesson(l)}>
                              <Pencil className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              aria-label="Delete lesson"
                              className="text-[#DC2626] hover:bg-[#FEE2E2]"
                              onClick={() =>
                                setDeleteConfirm({
                                  title: 'Delete Lesson',
                                  message: `Remove "${l.title}" from the curriculum?`,
                                  onConfirm: () => deleteLesson(l.id),
                                })
                              }
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>
        )}

        {/* 4. MANAGE QUIZ BANK TAB */}
        {adminTab === 'quizzes' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between gap-4">
              <h2 className="font-display font-semibold text-lg text-[#0F172A]">
                Quiz Question Bank ({db.questions.length})
              </h2>
              <Button variant="primary" size="sm" onClick={() => openCreateQuiz()}>
                <Plus className="w-4 h-4" />
                Add Question
              </Button>
            </div>

            <Card className="overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-600">
                      <th className="py-3 px-4">Question</th>
                      <th className="py-3 px-4">Category</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {db.questions.map((q) => (
                      <tr key={q.id} className="hover:bg-slate-50/70">
                        <td className="py-3 px-4 font-medium text-[#0F172A]">{q.question}</td>
                        <td className="py-3 px-4 text-slate-600 whitespace-nowrap">{q.category}</td>
                        <td className="py-3 px-4">
                          <div className="flex justify-end gap-1.5">
                            <Button variant="ghost" size="sm" aria-label="Edit question" onClick={() => openCreateQuiz(q)}>
                              <Pencil className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              aria-label="Delete question"
                              className="text-[#DC2626] hover:bg-[#FEE2E2]"
                              onClick={() =>
                                setDeleteConfirm({
                                  title: 'Delete Quiz Question',
                                  message: 'Remove this question from the Cybersecurity Quiz bank?',
                                  onConfirm: () => deleteQuestion(q.id),
                                })
                              }
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>
        )}

        {/* 5. MANAGE THREAT SCENARIOS TAB */}
        {adminTab === 'scenarios' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between gap-4">
              <h2 className="font-display font-semibold text-lg text-[#0F172A]">
                Threat Scenarios ({db.scenarios.length})
              </h2>
              <Button variant="primary" size="sm" onClick={() => openCreateScenario()}>
                <Plus className="w-4 h-4" />
                Add Scenario
              </Button>
            </div>

            <Card className="overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-600">
                      <th className="py-3 px-4">Scenario Title</th>
                      <th className="py-3 px-4">Category</th>
                      <th className="py-3 px-4">Format</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {db.scenarios.map((sc) => (
                      <tr key={sc.id} className="hover:bg-slate-50/70">
                        <td className="py-3 px-4 font-semibold text-[#0F172A]">{sc.title}</td>
                        <td className="py-3 px-4 text-slate-600">{sc.category}</td>
                        <td className="py-3 px-4 uppercase font-mono text-xs text-slate-600">{sc.format}</td>
                        <td className="py-3 px-4">
                          <div className="flex justify-end gap-1.5">
                            <Button
                              variant="ghost"
                              size="sm"
                              aria-label="Edit scenario"
                              onClick={() => openCreateScenario(sc)}
                            >
                              <Pencil className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              aria-label="Delete scenario"
                              className="text-[#DC2626] hover:bg-[#FEE2E2]"
                              onClick={() =>
                                setDeleteConfirm({
                                  title: 'Delete Threat Scenario',
                                  message: `Remove "${sc.title}" from Threat Lab?`,
                                  onConfirm: () => deleteScenario(sc.id),
                                })
                              }
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>
        )}
      </div>

      {/* Inspect Learner Progress Modal */}
      <Modal open={!!inspectUser} title={inspectUser ? `Learner Summary: ${inspectUser.name}` : ''} onClose={() => setInspectUser(null)}>
        {inspectUser && (() => {
          const um = computeMetrics(inspectUser);
          return (
            <div className="space-y-4 text-sm">
              <div className="grid grid-cols-3 gap-3">
                <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                  <div className="text-xs text-slate-500">Lessons</div>
                  <div className="font-bold tabular-nums mt-0.5">{um.completedCount}/{um.totalLessons}</div>
                </div>
                <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                  <div className="text-xs text-slate-500">Avg Quiz</div>
                  <div className="font-bold tabular-nums mt-0.5">{um.quizAttempts.length ? `${um.avgQuiz}%` : '—'}</div>
                </div>
                <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                  <div className="text-xs text-slate-500">Scenarios</div>
                  <div className="font-bold tabular-nums mt-0.5">{um.uniqueScenariosSolved}/{db.scenarios.length}</div>
                </div>
              </div>
              <div className="text-xs text-slate-500">
                Email: {inspectUser.email} · Joined: {inspectUser.joinedAt} · Status: {inspectUser.status}
              </div>
            </div>
          );
        })()}
      </Modal>

      {/* Add/Edit Lesson Modal */}
      <Modal open={lessonModalOpen} title={editingLesson ? 'Edit Lesson' : 'Add New Lesson'} onClose={() => setLessonModalOpen(false)}>
        <form onSubmit={handleSaveLesson} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Lesson Title</label>
            <input
              required
              value={lessonForm.title}
              onChange={(e) => setLessonForm({ ...lessonForm, title: e.target.value })}
              className="w-full h-10 px-3 rounded-lg border border-slate-300 text-sm"
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Category</label>
              <select
                value={lessonForm.category}
                onChange={(e) => setLessonForm({ ...lessonForm, category: e.target.value as Category })}
                className="w-full h-10 px-2.5 rounded-lg border border-slate-300 text-sm"
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Difficulty</label>
              <select
                value={lessonForm.difficulty}
                onChange={(e) => setLessonForm({ ...lessonForm, difficulty: e.target.value as Difficulty })}
                className="w-full h-10 px-2.5 rounded-lg border border-slate-300 text-sm"
              >
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Duration (min)</label>
              <input
                type="number"
                min={3}
                max={90}
                value={lessonForm.duration}
                onChange={(e) => setLessonForm({ ...lessonForm, duration: Number(e.target.value) })}
                className="w-full h-10 px-3 rounded-lg border border-slate-300 text-sm"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Short Description</label>
            <input
              required
              value={lessonForm.description}
              onChange={(e) => setLessonForm({ ...lessonForm, description: e.target.value })}
              className="w-full h-10 px-3 rounded-lg border border-slate-300 text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Lesson Body (separate paragraphs with blank lines)</label>
            <textarea
              rows={4}
              value={lessonForm.contentText}
              onChange={(e) => setLessonForm({ ...lessonForm, contentText: e.target.value })}
              className="w-full p-3 rounded-lg border border-slate-300 text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Security Checklist (one bullet per line)</label>
            <textarea
              rows={3}
              value={lessonForm.checklistText}
              onChange={(e) => setLessonForm({ ...lessonForm, checklistText: e.target.value })}
              className="w-full p-3 rounded-lg border border-slate-300 text-sm"
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="secondary" onClick={() => setLessonModalOpen(false)}>Cancel</Button>
            <Button type="submit" variant="primary">{editingLesson ? 'Save Changes' : 'Publish Lesson'}</Button>
          </div>
        </form>
      </Modal>

      {/* Add/Edit Quiz Question Modal */}
      <Modal open={quizModalOpen} title={editingQuestion ? 'Edit Quiz Question' : 'Add Quiz Question'} onClose={() => setQuizModalOpen(false)}>
        <form onSubmit={handleSaveQuestion} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Category</label>
            <select
              value={quizForm.category}
              onChange={(e) => setQuizForm({ ...quizForm, category: e.target.value as Category })}
              className="w-full h-10 px-3 rounded-lg border border-slate-300 text-sm"
            >
              {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Question Text</label>
            <input
              required
              value={quizForm.question}
              onChange={(e) => setQuizForm({ ...quizForm, question: e.target.value })}
              className="w-full h-10 px-3 rounded-lg border border-slate-300 text-sm"
            />
          </div>
          <div className="grid sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Option A</label>
              <input required value={quizForm.opt0} onChange={(e) => setQuizForm({ ...quizForm, opt0: e.target.value })} className="w-full h-10 px-3 rounded-lg border border-slate-300 text-sm" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Option B</label>
              <input required value={quizForm.opt1} onChange={(e) => setQuizForm({ ...quizForm, opt1: e.target.value })} className="w-full h-10 px-3 rounded-lg border border-slate-300 text-sm" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Option C</label>
              <input required value={quizForm.opt2} onChange={(e) => setQuizForm({ ...quizForm, opt2: e.target.value })} className="w-full h-10 px-3 rounded-lg border border-slate-300 text-sm" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Option D</label>
              <input required value={quizForm.opt3} onChange={(e) => setQuizForm({ ...quizForm, opt3: e.target.value })} className="w-full h-10 px-3 rounded-lg border border-slate-300 text-sm" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Correct Option</label>
            <select
              value={quizForm.correctIndex}
              onChange={(e) => setQuizForm({ ...quizForm, correctIndex: Number(e.target.value) })}
              className="w-full h-10 px-3 rounded-lg border border-slate-300 text-sm"
            >
              <option value={0}>Option A</option>
              <option value={1}>Option B</option>
              <option value={2}>Option C</option>
              <option value={3}>Option D</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Explanation Shown to Learners</label>
            <textarea
              required
              rows={2}
              value={quizForm.explanation}
              onChange={(e) => setQuizForm({ ...quizForm, explanation: e.target.value })}
              className="w-full p-3 rounded-lg border border-slate-300 text-sm"
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="secondary" onClick={() => setQuizModalOpen(false)}>Cancel</Button>
            <Button type="submit" variant="primary">{editingQuestion ? 'Save Question' : 'Add Question'}</Button>
          </div>
        </form>
      </Modal>

      {/* Add/Edit Scenario Modal */}
      <Modal open={scenarioModalOpen} title={editingScenario ? 'Edit Threat Scenario' : 'Create Threat Scenario'} onClose={() => setScenarioModalOpen(false)}>
        <form onSubmit={handleSaveScenario} className="space-y-4">
          <div className="grid sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">Scenario Title</label>
              <input required value={scenarioForm.title} onChange={(e) => setScenarioForm({ ...scenarioForm, title: e.target.value })} className="w-full h-10 px-3 rounded-lg border border-slate-300 text-sm" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Format</label>
              <select value={scenarioForm.format} onChange={(e) => setScenarioForm({ ...scenarioForm, format: e.target.value as ScenarioFormat })} className="w-full h-10 px-2.5 rounded-lg border border-slate-300 text-sm">
                <option value="email">Email</option>
                <option value="sms">SMS</option>
                <option value="web">Web Login</option>
                <option value="payment">Payment</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Category</label>
            <select value={scenarioForm.category} onChange={(e) => setScenarioForm({ ...scenarioForm, category: e.target.value as Category })} className="w-full h-10 px-3 rounded-lg border border-slate-300 text-sm">
              {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          {scenarioForm.format === 'email' || scenarioForm.format === 'sms' ? (
            <div className="grid sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Fictional Sender Name</label>
                <input value={scenarioForm.senderName} onChange={(e) => setScenarioForm({ ...scenarioForm, senderName: e.target.value })} className="w-full h-10 px-3 rounded-lg border border-slate-300 text-sm" />
              </div>
              {scenarioForm.format === 'email' && (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Spoofed Email (.invalid)</label>
                  <input value={scenarioForm.senderAddress} onChange={(e) => setScenarioForm({ ...scenarioForm, senderAddress: e.target.value })} className="w-full h-10 px-3 rounded-lg border border-slate-300 text-sm" />
                </div>
              )}
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1">Simulated Message Body</label>
                <textarea rows={2} value={scenarioForm.body} onChange={(e) => setScenarioForm({ ...scenarioForm, body: e.target.value })} className="w-full p-2.5 rounded-lg border border-slate-300 text-sm" />
              </div>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Simulated URL (.invalid)</label>
                <input value={scenarioForm.url} onChange={(e) => setScenarioForm({ ...scenarioForm, url: e.target.value })} className="w-full h-10 px-3 rounded-lg border border-slate-300 text-sm" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Form Heading</label>
                <input value={scenarioForm.heading} onChange={(e) => setScenarioForm({ ...scenarioForm, heading: e.target.value })} className="w-full h-10 px-3 rounded-lg border border-slate-300 text-sm" />
              </div>
            </div>
          )}

          <div className="grid sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Option A</label>
              <input required value={scenarioForm.opt0} onChange={(e) => setScenarioForm({ ...scenarioForm, opt0: e.target.value })} className="w-full h-10 px-3 rounded-lg border border-slate-300 text-sm" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Option B</label>
              <input required value={scenarioForm.opt1} onChange={(e) => setScenarioForm({ ...scenarioForm, opt1: e.target.value })} className="w-full h-10 px-3 rounded-lg border border-slate-300 text-sm" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Option C</label>
              <input required value={scenarioForm.opt2} onChange={(e) => setScenarioForm({ ...scenarioForm, opt2: e.target.value })} className="w-full h-10 px-3 rounded-lg border border-slate-300 text-sm" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Option D</label>
              <input required value={scenarioForm.opt3} onChange={(e) => setScenarioForm({ ...scenarioForm, opt3: e.target.value })} className="w-full h-10 px-3 rounded-lg border border-slate-300 text-sm" />
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Correct Option</label>
              <select value={scenarioForm.correctIndex} onChange={(e) => setScenarioForm({ ...scenarioForm, correctIndex: Number(e.target.value) })} className="w-full h-10 px-3 rounded-lg border border-slate-300 text-sm">
                <option value={0}>Option A</option>
                <option value={1}>Option B</option>
                <option value={2}>Option C</option>
                <option value={3}>Option D</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Red Flags (one per line)</label>
              <input value={scenarioForm.redFlagsText} onChange={(e) => setScenarioForm({ ...scenarioForm, redFlagsText: e.target.value })} className="w-full h-10 px-3 rounded-lg border border-slate-300 text-sm" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Diagnostic Explanation</label>
            <textarea required rows={2} value={scenarioForm.explanation} onChange={(e) => setScenarioForm({ ...scenarioForm, explanation: e.target.value })} className="w-full p-2.5 rounded-lg border border-slate-300 text-sm" />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="secondary" onClick={() => setScenarioModalOpen(false)}>Cancel</Button>
            <Button type="submit" variant="primary">{editingScenario ? 'Save Scenario' : 'Create Scenario'}</Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal open={!!deleteConfirm} title={deleteConfirm?.title || 'Confirm Delete'} onClose={() => setDeleteConfirm(null)}>
        <p className="text-sm text-[#475569]">{deleteConfirm?.message}</p>
        <div className="flex justify-end gap-2 mt-6">
          <Button variant="secondary" onClick={() => setDeleteConfirm(null)}>Cancel</Button>
          <Button
            variant="danger"
            onClick={() => {
              deleteConfirm?.onConfirm();
              setDeleteConfirm(null);
            }}
          >
            Delete
          </Button>
        </div>
      </Modal>
    </AppShell>
  );
};
