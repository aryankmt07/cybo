import React, { useMemo, useState } from 'react';
import { ArrowRight, CheckCircle2, CheckSquare, RotateCcw, XCircle } from 'lucide-react';
import { AppShell } from '../components/layout/AppShell';
import { AlertBanner, Button, Card, EmptyState, ProgressBar } from '../components/ui/Primitives';
import { useApp } from '../context/AppContext';
import { CATEGORIES, QuizAttempt, QuizBreakdownItem } from '../types';

type QuizPhase = 'intro' | 'active' | 'result';

export const QuizPage: React.FC = () => {
  const { db, currentUser, submitQuizAttempt, navigate } = useApp();
  const [phase, setPhase] = useState<QuizPhase>('intro');
  const [topicFilter, setTopicFilter] = useState<string>('All Topics');
  const [qIndex, setQIndex] = useState(0);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [answers, setAnswers] = useState<QuizBreakdownItem[]>([]);
  const [lastResult, setLastResult] = useState<QuizAttempt | null>(null);

  const activeQuestions = useMemo(() => {
    if (topicFilter === 'All Topics') return db.questions;
    return db.questions.filter((q) => q.category === topicFilter);
  }, [db.questions, topicFilter]);

  if (!currentUser) return null;

  if (!db.questions.length) {
    return (
      <AppShell title="Cybersecurity Quiz">
        <Card>
          <EmptyState
            icon={<CheckSquare className="w-6 h-6" />}
            title="Quiz bank is empty"
            description="Questions can be added from the Admin Dashboard."
          />
        </Card>
      </AppShell>
    );
  }

  const bestScore = currentUser.quizAttempts.length
    ? Math.max(...currentUser.quizAttempts.map((a) => a.score))
    : null;

  const startQuiz = () => {
    if (!activeQuestions.length) return;
    setPhase('active');
    setQIndex(0);
    setSelectedIndex(null);
    setSubmitted(false);
    setAnswers([]);
    setLastResult(null);
  };

  const handleSubmitQuestion = () => {
    const q = activeQuestions[qIndex];
    if (selectedIndex === null || !q) return;
    setSubmitted(true);
    setAnswers((prev) => [
      ...prev,
      {
        questionId: q.id,
        category: q.category,
        selectedIndex,
        correctIndex: q.correctIndex,
        isCorrect: selectedIndex === q.correctIndex,
      },
    ]);
  };

  const handleNextQuestion = () => {
    if (qIndex < activeQuestions.length - 1) {
      setQIndex((i) => i + 1);
      setSelectedIndex(null);
      setSubmitted(false);
    } else {
      const correctCount = answers.filter((a) => a.isCorrect).length;
      const total = answers.length;
      const score = total ? Math.round((correctCount / total) * 100) : 0;
      const saved = submitQuizAttempt({
        topicFilter,
        score,
        correctCount,
        total,
        breakdown: answers,
      });
      setLastResult(saved);
      setPhase('result');
    }
  };

  if (phase === 'intro') {
    return (
      <AppShell title="Cybersecurity Quiz">
        <div className="max-w-2xl mx-auto space-y-6">
          <Card className="p-6 sm:p-8 space-y-6">
            <div>
              <div className="text-xs font-semibold text-[#2563EB] mb-1">Knowledge Verification</div>
              <h1 className="font-display font-bold text-2xl sm:text-3xl text-[#0F172A]">
                Cybersecurity Readiness Quiz
              </h1>
              <p className="text-sm text-[#475569] mt-2 leading-relaxed">
                Evaluate your mastery across phishing defense, payment safety, password hygiene, identity protection, privacy, and safe browsing. Immediate explanations follow every question.
              </p>
            </div>

            <div>
              <label htmlFor="quiz-topic-select" className="block text-xs font-semibold text-slate-700 mb-1.5">
                Assessment Scope
              </label>
              <select
                id="quiz-topic-select"
                value={topicFilter}
                onChange={(e) => setTopicFilter(e.target.value)}
                className="w-full h-10 px-3 rounded-lg border border-slate-300 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB]"
              >
                <option value="All Topics">Full Readiness Assessment (All 6 Domains)</option>
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    Topic Focus: {cat}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="p-4 rounded-xl bg-[#F5F8FC] border border-slate-200">
                <div className="text-xs text-slate-500">Questions</div>
                <div className="font-display font-bold text-xl text-[#0F172A] tabular-nums mt-1">
                  {activeQuestions.length}
                </div>
              </div>
              <div className="p-4 rounded-xl bg-[#F5F8FC] border border-slate-200">
                <div className="text-xs text-slate-500">Target Benchmark</div>
                <div className="font-display font-bold text-xl text-[#0F172A] tabular-nums mt-1">80%</div>
              </div>
              <div className="p-4 rounded-xl bg-[#F5F8FC] border border-slate-200">
                <div className="text-xs text-slate-500">Your Best Score</div>
                <div className="font-display font-bold text-xl text-[#0F172A] tabular-nums mt-1">
                  {bestScore !== null ? `${bestScore}%` : '—'}
                </div>
              </div>
            </div>

            <Button variant="primary" size="lg" fullWidth disabled={!activeQuestions.length} onClick={startQuiz}>
              Start Assessment
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Card>
        </div>
      </AppShell>
    );
  }

  if (phase === 'active') {
    const q = activeQuestions[qIndex];
    const progressPct = Math.round(((qIndex + 1) / activeQuestions.length) * 100);
    const isCorrect = submitted && selectedIndex === q.correctIndex;

    return (
      <AppShell title="Cybersecurity Quiz">
        <div className="max-w-2xl mx-auto space-y-5">
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs sm:text-sm">
              <span className="font-semibold text-[#0F172A] tabular-nums">
                Question {qIndex + 1} of {activeQuestions.length}
              </span>
              <span className="text-[#475569]">{q.category}</span>
            </div>
            <ProgressBar value={progressPct} />
          </div>

          <Card className="p-6 sm:p-8 space-y-5">
            <h2 className="font-display font-semibold text-lg sm:text-xl text-[#0F172A] leading-snug">
              {q.question}
            </h2>

            <fieldset className="space-y-2.5" disabled={submitted}>
              <legend className="sr-only">Select your answer</legend>
              {q.options.map((opt, idx) => {
                const letter = ['A', 'B', 'C', 'D'][idx] || String(idx + 1);
                const isSelected = selectedIndex === idx;
                const isAnswer = idx === q.correctIndex;

                let stateClasses = 'border-slate-300 bg-white hover:border-[#2563EB] hover:bg-[#EFF6FF]/60';
                let badgeClasses = 'bg-slate-100 text-slate-700';

                if (!submitted && isSelected) {
                  stateClasses = 'border-[#2563EB] bg-[#EFF6FF] ring-1 ring-[#2563EB]';
                  badgeClasses = 'bg-[#2563EB] text-white';
                } else if (submitted) {
                  if (isAnswer) {
                    stateClasses = 'border-[#16A34A] bg-[#DCFCE7]';
                    badgeClasses = 'bg-[#16A34A] text-white';
                  } else if (isSelected) {
                    stateClasses = 'border-[#DC2626] bg-[#FEE2E2]';
                    badgeClasses = 'bg-[#DC2626] text-white';
                  } else {
                    stateClasses = 'border-slate-200 bg-slate-50 opacity-70';
                  }
                }

                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => !submitted && setSelectedIndex(idx)}
                    className={`w-full text-left p-3.5 rounded-lg border-[1.5px] flex items-start gap-3 text-sm text-[#0F172A] transition-colors cursor-pointer disabled:cursor-default ${stateClasses}`}
                  >
                    <span
                      className={`w-6 h-6 rounded-md text-xs font-bold inline-flex items-center justify-center shrink-0 mt-0.5 ${badgeClasses}`}
                    >
                      {letter}
                    </span>
                    <span className="leading-snug flex-1">{opt}</span>
                    {submitted && isAnswer && <CheckCircle2 className="w-4 h-4 text-[#16A34A] shrink-0 mt-0.5" />}
                    {submitted && !isAnswer && isSelected && (
                      <XCircle className="w-4 h-4 text-[#DC2626] shrink-0 mt-0.5" />
                    )}
                  </button>
                );
              })}
            </fieldset>

            {!submitted ? (
              <Button variant="primary" size="lg" fullWidth disabled={selectedIndex === null} onClick={handleSubmitQuestion}>
                Submit Answer
              </Button>
            ) : (
              <div className="space-y-4" aria-live="polite">
                <AlertBanner
                  type={isCorrect ? 'success' : 'danger'}
                  title={isCorrect ? 'Correct Answer' : 'Incorrect Answer'}
                >
                  {q.explanation}
                </AlertBanner>
                <Button variant="primary" size="lg" fullWidth onClick={handleNextQuestion}>
                  {qIndex < activeQuestions.length - 1 ? 'Next Question' : 'Finish & View Results'}
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
            )}
          </Card>
        </div>
      </AppShell>
    );
  }

  // Final Result Screen
  const result = lastResult || currentUser.quizAttempts[currentUser.quizAttempts.length - 1];
  const passed = result.score >= 80;

  return (
    <AppShell title="Assessment Results">
      <div className="max-w-3xl mx-auto space-y-6">
        <Card className="p-8 text-center space-y-4">
          <div
            className={`inline-flex items-center gap-1.5 text-sm font-semibold ${
              passed ? 'text-[#16A34A]' : 'text-[#D97706]'
            }`}
          >
            {passed ? <CheckCircle2 className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
            <span>{passed ? 'Passed — Mastery Benchmark Met' : 'Needs Review — Below 80% Benchmark'}</span>
          </div>

          <div
            className={`font-display font-bold text-5xl tabular-nums ${
              passed ? 'text-[#16A34A]' : 'text-[#D97706]'
            }`}
          >
            {result.score}%
          </div>

          <p className="text-sm text-[#475569] tabular-nums">
            You answered <strong>{result.correctCount}</strong> out of <strong>{result.total}</strong> questions correctly ({result.topicFilter}).
          </p>

          <div className="flex flex-wrap justify-center gap-3 pt-2">
            <Button variant="primary" onClick={() => navigate('feedback')}>
              View Personalized Feedback
              <ArrowRight className="w-4 h-4" />
            </Button>
            <Button variant="secondary" onClick={() => setPhase('intro')}>
              <RotateCcw className="w-4 h-4" />
              Retake Assessment
            </Button>
            <Button variant="ghost" onClick={() => navigate('progress')}>
              Results & Certificate
            </Button>
          </div>
        </Card>

        <Card className="p-6 space-y-4">
          <h2 className="font-display font-semibold text-base text-[#0F172A]">Question-by-Question Review</h2>
          <div className="divide-y divide-slate-200">
            {result.breakdown.map((item, idx) => {
              const q = db.questions.find((x) => x.id === item.questionId);
              if (!q) return null;
              return (
                <div key={item.questionId + idx} className="py-4 first:pt-0 last:pb-0 space-y-1.5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="text-sm font-semibold text-[#0F172A]">
                      {idx + 1}. {q.question}
                    </div>
                    <span
                      className={`text-xs font-semibold shrink-0 inline-flex items-center gap-1 ${
                        item.isCorrect ? 'text-[#16A34A]' : 'text-[#DC2626]'
                      }`}
                    >
                      {item.isCorrect ? <CheckCircle2 className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                      {item.isCorrect ? 'Correct' : 'Incorrect'}
                    </span>
                  </div>
                  <div className="text-xs text-[#475569]">
                    <span className="font-semibold text-slate-700">Correct answer:</span> {q.options[q.correctIndex]}
                  </div>
                  <p className="text-xs text-slate-500 leading-relaxed">{q.explanation}</p>
                </div>
              );
            })}
          </div>
        </Card>
      </div>
    </AppShell>
  );
};
