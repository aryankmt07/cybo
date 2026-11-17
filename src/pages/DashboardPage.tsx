import React from 'react';
import { ArrowRight, BookOpen, CheckSquare, ShieldAlert } from 'lucide-react';
import { AppShell } from '../components/layout/AppShell';
import { Button, Card, ProgressBar, ScoreTrendChart } from '../components/ui/Primitives';
import { useApp } from '../context/AppContext';

export const DashboardPage: React.FC = () => {
  const { db, currentUser, navigate, computeMetrics, recordLessonAccess } = useApp();
  if (!currentUser) return null;

  const m = computeMetrics(currentUser);
  const firstName = currentUser.name.split(' ')[0];

  const openLesson = (lessonId: string) => {
    recordLessonAccess(lessonId);
    navigate('lesson', { lessonId });
  };

  const recentLessons = currentUser.recentLessons
    .map((id) => db.lessons.find((l) => l.id === id))
    .filter((l): l is NonNullable<typeof l> => Boolean(l))
    .slice(0, 3);

  const weakTopics = m.topicStats.filter((t) => t.mastery !== null && t.mastery < 80);
  const recommended = weakTopics.length
    ? weakTopics.slice(0, 2).map((t) => ({
        category: t.category,
        reason: `Current accuracy: ${t.mastery}% — targeted review recommended`,
        lesson: db.lessons.find((l) => l.published && l.category === t.category),
      }))
    : db.lessons
        .filter((l) => l.published && !currentUser.completedLessons.includes(l.id))
        .slice(0, 2)
        .map((l) => ({
          category: l.category,
          reason: 'Next uncompleted module in your learning path',
          lesson: l,
        }));

  const trendPoints = m.quizAttempts.map((q, idx) => ({
    label: `Quiz ${idx + 1}`,
    value: q.score,
  }));

  const isBrandNew =
    m.completedCount === 0 && m.quizAttempts.length === 0 && m.scenarioAttempts.length === 0;

  return (
    <AppShell title="Dashboard">
      <div className="space-y-6">
        {/* Welcome Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="font-display font-bold text-2xl sm:text-[28px] text-[#0F172A] tracking-tight">
              Welcome back, {firstName}
            </h1>
            <p className="text-sm text-[#475569] mt-1">
              {isBrandNew
                ? 'Start your first module or inspect a simulated phishing email to build momentum.'
                : `You have completed ${m.completedCount} of ${m.totalLessons} lessons and solved ${m.uniqueScenariosSolved} threat scenarios.`}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2.5">
            <Button variant="secondary" onClick={() => navigate('modules')}>
              <BookOpen className="w-4 h-4" />
              Browse Modules
            </Button>
            <Button variant="primary" onClick={() => navigate('scenarios')}>
              <ShieldAlert className="w-4 h-4" />
              Launch Threat Lab
            </Button>
          </div>
        </div>

        {/* 4 KPI Summary Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          <Card className="p-5">
            <div className="text-xs font-medium text-slate-500">Overall Learning Progress</div>
            <div className="font-display font-bold text-3xl text-[#0F172A] tabular-nums mt-2">
              {m.lessonPct}%
            </div>
            <ProgressBar value={m.lessonPct} className="mt-3" />
          </Card>

          <Card className="p-5">
            <div className="text-xs font-medium text-slate-500">Completed Lessons</div>
            <div className="font-display font-bold text-3xl text-[#0F172A] tabular-nums mt-2">
              {m.completedCount} <span className="text-base font-medium text-slate-400">/ {m.totalLessons}</span>
            </div>
            <div className="text-xs text-slate-500 mt-3">Across 6 cybersecurity domains</div>
          </Card>

          <Card className="p-5">
            <div className="text-xs font-medium text-slate-500">Quiz Performance</div>
            <div className="font-display font-bold text-3xl text-[#0F172A] tabular-nums mt-2">
              {m.quizAttempts.length ? `${m.avgQuiz}%` : '—'}
            </div>
            <div className="text-xs text-slate-500 mt-3 tabular-nums">
              {m.quizAttempts.length} assessment(s) completed
            </div>
          </Card>

          <Card className="p-5">
            <div className="text-xs font-medium text-slate-500">Threat Scenarios Solved</div>
            <div className="font-display font-bold text-3xl text-[#0F172A] tabular-nums mt-2">
              {m.uniqueScenariosSolved}{' '}
              <span className="text-base font-medium text-slate-400">/ {db.scenarios.length}</span>
            </div>
            <div className="text-xs text-slate-500 mt-3 tabular-nums">
              {m.scenarioAttempts.length ? `Accuracy: ${m.scenarioAccuracy}%` : 'No scenario attempts yet'}
            </div>
          </Card>
        </div>

        {/* Visualizations */}
        <div className="grid lg:grid-cols-12 gap-6">
          <Card className="lg:col-span-7 p-6">
            <div className="flex items-center justify-between gap-3 mb-4">
              <div>
                <h2 className="font-display font-semibold text-base text-[#0F172A]">Quiz Score Progression</h2>
                <p className="text-xs text-[#475569]">Assessment accuracy across recent attempts</p>
              </div>
              <Button variant="ghost" size="sm" onClick={() => navigate('quiz')}>
                <CheckSquare className="w-4 h-4" />
                Take Quiz
              </Button>
            </div>
            <ScoreTrendChart
              points={trendPoints}
              emptyText="Complete your first Cybersecurity Quiz to visualize your score trend over time."
            />
          </Card>

          <Card className="lg:col-span-5 p-6">
            <div className="flex items-center justify-between gap-3 mb-4">
              <h2 className="font-display font-semibold text-base text-[#0F172A]">Domain Readiness</h2>
              <button
                onClick={() => navigate('feedback')}
                className="text-xs font-semibold text-[#2563EB] hover:underline cursor-pointer"
              >
                View Feedback
              </button>
            </div>
            <div className="space-y-3.5">
              {m.topicStats.map((t) => {
                const value = t.mastery !== null ? t.mastery : t.lessonProgress;
                const tone =
                  t.mastery === null ? 'royal' : t.mastery >= 80 ? 'success' : t.mastery >= 60 ? 'royal' : 'warning';
                return (
                  <div key={t.category}>
                    <div className="flex items-center justify-between text-xs mb-1.5">
                      <span className="font-medium text-[#0F172A]">{t.category}</span>
                      <span className="text-slate-500 tabular-nums">
                        {t.mastery !== null ? `${t.mastery}% accuracy` : `${t.lessonProgress}% read`}
                      </span>
                    </div>
                    <ProgressBar value={value} tone={tone} />
                  </div>
                );
              })}
            </div>
          </Card>
        </div>

        {/* Recommendations & Recent Activity */}
        <div className="grid lg:grid-cols-2 gap-6">
          <Card className="p-6">
            <h2 className="font-display font-semibold text-base text-[#0F172A] mb-4">Recommended Learning Topics</h2>
            {recommended.length ? (
              <div className="divide-y divide-slate-100">
                {recommended.map((item, idx) => (
                  <div key={idx} className="py-3 first:pt-0 last:pb-0 flex items-center justify-between gap-4">
                    <div className="min-w-0">
                      <div className="text-sm font-semibold text-[#0F172A] truncate">{item.category}</div>
                      <div className="text-xs text-[#475569] mt-0.5">{item.reason}</div>
                    </div>
                    {item.lesson && (
                      <Button variant="secondary" size="sm" onClick={() => openLesson(item.lesson!.id)}>
                        Open
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-[#475569]">
                All modules are complete. Challenge yourself again in the Interactive Threat Lab.
              </p>
            )}
          </Card>

          <Card className="p-6">
            <h2 className="font-display font-semibold text-base text-[#0F172A] mb-4">Recently Accessed Lessons</h2>
            {recentLessons.length ? (
              <div className="divide-y divide-slate-100">
                {recentLessons.map((lesson) => (
                  <div key={lesson.id} className="py-3 first:pt-0 last:pb-0 flex items-center justify-between gap-4">
                    <div className="min-w-0">
                      <div className="text-sm font-semibold text-[#0F172A] truncate">{lesson.title}</div>
                      <div className="text-xs text-[#475569] mt-0.5">
                        {lesson.category} · {lesson.duration} min
                      </div>
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => openLesson(lesson.id)}>
                      Review
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-6 text-center space-y-3">
                <p className="text-sm text-[#475569]">You haven’t opened any lessons yet.</p>
                <Button variant="primary" size="sm" onClick={() => navigate('modules')}>
                  Explore Learning Modules
                </Button>
              </div>
            )}
          </Card>
        </div>
      </div>
    </AppShell>
  );
};
