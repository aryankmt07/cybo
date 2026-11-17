import React from 'react';
import { AlertTriangle, ArrowRight, CheckCircle2, ShieldAlert, TrendingUp } from 'lucide-react';
import { AppShell } from '../components/layout/AppShell';
import { AlertBanner, Button, Card, EmptyState, ScoreTrendChart } from '../components/ui/Primitives';
import { useApp } from '../context/AppContext';

export const FeedbackPage: React.FC = () => {
  const { db, currentUser, navigate, computeMetrics, recordLessonAccess } = useApp();
  if (!currentUser) return null;

  const m = computeMetrics(currentUser);
  const hasEvaluations = m.quizAttempts.length > 0 || m.scenarioAttempts.length > 0;

  if (!hasEvaluations) {
    return (
      <AppShell title="Personalized Learning Feedback">
        <Card>
          <EmptyState
            icon={<TrendingUp className="w-6 h-6" />}
            title="Personalized coaching unlocks after your first check"
            description="Complete a Threat Lab scenario or Cybersecurity Quiz so CyberShield can analyze your strong topics, mistakes, and tailored next lessons."
            action={
              <div className="flex flex-wrap justify-center gap-3">
                <Button variant="primary" onClick={() => navigate('scenarios')}>
                  Launch Threat Scenarios
                </Button>
                <Button variant="secondary" onClick={() => navigate('quiz')}>
                  Take Cybersecurity Quiz
                </Button>
              </div>
            }
          />
        </Card>
      </AppShell>
    );
  }

  const evaluatedTopics = m.topicStats.filter((t) => t.mastery !== null);
  const strongTopics = evaluatedTopics.filter((t) => (t.mastery ?? 0) >= 80);
  const weakTopics = evaluatedTopics.filter((t) => (t.mastery ?? 0) < 80);

  const missedScenarios = m.scenarioAttempts.filter((s) => !s.isCorrect);
  const missedQuizItems = m.quizAttempts.flatMap((a) => a.breakdown).filter((b) => !b.isCorrect);

  const trendPoints = m.quizAttempts.map((q, i) => ({
    label: `Attempt ${i + 1}`,
    value: q.score,
  }));
  const improvementDelta =
    m.quizAttempts.length >= 2
      ? m.quizAttempts[m.quizAttempts.length - 1].score - m.quizAttempts[0].score
      : null;

  const openRecommendedLesson = (lessonId: string) => {
    recordLessonAccess(lessonId);
    navigate('lesson', { lessonId });
  };

  return (
    <AppShell title="Personalized Learning Feedback">
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="font-display font-bold text-2xl sm:text-[28px] text-[#0F172A] tracking-tight">
              Personalized Learning Feedback
            </h1>
            <p className="text-sm text-[#475569] mt-1">
              Coaching generated directly from your quiz results and threat scenario decisions.
            </p>
          </div>
          {improvementDelta !== null && (
            <div
              className={`px-3.5 py-2 rounded-lg border text-xs font-semibold tabular-nums ${
                improvementDelta >= 0
                  ? 'bg-[#DCFCE7] border-[#86EFAC] text-[#14532D]'
                  : 'bg-[#FEF3C7] border-[#FDE68A] text-[#78350F]'
              }`}
            >
              Assessment Improvement: {improvementDelta >= 0 ? '+' : ''}
              {improvementDelta}% since first quiz
            </div>
          )}
        </div>

        {/* Strong vs Weak Topics */}
        <div className="grid md:grid-cols-2 gap-6">
          <Card className="p-6 space-y-4">
            <div className="flex items-center gap-2 text-[#15803D] font-display font-semibold text-base">
              <CheckCircle2 className="w-5 h-5" />
              <h2>Strong Topics (80% or Higher)</h2>
            </div>
            {strongTopics.length ? (
              <div className="divide-y divide-slate-100">
                {strongTopics.map((t) => (
                  <div key={t.category} className="py-3 first:pt-0 last:pb-0 flex items-center justify-between gap-3">
                    <div>
                      <div className="text-sm font-semibold text-[#0F172A]">{t.category}</div>
                      <div className="text-xs text-[#475569] tabular-nums">{t.evaluatedCount} check(s) evaluated</div>
                    </div>
                    <span className="text-sm font-semibold text-[#16A34A] tabular-nums">{t.mastery}%</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-[#475569]">
                No evaluated topics have reached 80%+ accuracy yet. Study the recommended lessons below and try again.
              </p>
            )}
          </Card>

          <Card className="p-6 space-y-4">
            <div className="flex items-center gap-2 text-[#B45309] font-display font-semibold text-base">
              <AlertTriangle className="w-5 h-5" />
              <h2>Areas Needing Improvement (&lt; 80%)</h2>
            </div>
            {weakTopics.length ? (
              <div className="divide-y divide-slate-100">
                {weakTopics.map((t) => (
                  <div key={t.category} className="py-3 first:pt-0 last:pb-0 flex items-center justify-between gap-3">
                    <div>
                      <div className="text-sm font-semibold text-[#0F172A]">{t.category}</div>
                      <div className="text-xs text-[#475569] tabular-nums">{t.evaluatedCount} check(s) evaluated</div>
                    </div>
                    <span className="text-sm font-semibold text-[#D97706] tabular-nums">{t.mastery}%</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-[#475569]">
                Every evaluated topic is currently at 80% accuracy or higher. Keep practicing any remaining unassessed domains.
              </p>
            )}
          </Card>
        </div>

        {/* Mistakes & Improvement Chart */}
        <div className="grid lg:grid-cols-2 gap-6">
          <Card className="p-6 space-y-4">
            <h2 className="font-display font-semibold text-base text-[#0F172A]">Areas With Incorrect Answers</h2>
            {missedScenarios.length || missedQuizItems.length ? (
              <div className="space-y-3">
                {missedScenarios.slice(-3).map((s) => (
                  <AlertBanner key={s.id} type="warning" title={`Threat Scenario Miss · ${s.category}`}>
                    {s.title}
                  </AlertBanner>
                ))}
                {missedQuizItems.slice(-3).map((item, idx) => {
                  const q = db.questions.find((x) => x.id === item.questionId);
                  if (!q) return null;
                  return (
                    <AlertBanner key={`${item.questionId}-${idx}`} type="danger" title={`Quiz Miss · ${q.category}`}>
                      <div className="font-medium">{q.question}</div>
                      <div className="text-xs mt-1 opacity-90">Tip: {q.explanation}</div>
                    </AlertBanner>
                  );
                })}
              </div>
            ) : (
              <AlertBanner type="success" title="Clean Accuracy Record">
                Zero incorrect answers recorded in your assessments so far.
              </AlertBanner>
            )}
          </Card>

          <Card className="p-6 space-y-3">
            <h2 className="font-display font-semibold text-base text-[#0F172A]">Improvement Across Assessments</h2>
            <p className="text-xs text-[#475569]">Quiz scores plotted sequentially from your first attempt to your latest</p>
            <ScoreTrendChart
              points={trendPoints}
              emptyText="Complete at least one Cybersecurity Quiz to plot your assessment progression."
            />
          </Card>
        </div>

        {/* Clear Recommended Next Steps */}
        <Card className="p-6 space-y-4">
          <h2 className="font-display font-semibold text-base text-[#0F172A]">Recommended Next Steps</h2>
          <div className="grid md:grid-cols-3 gap-4">
            {weakTopics.length ? (
              weakTopics.slice(0, 3).map((t) => {
                const lesson = db.lessons.find((l) => l.published && l.category === t.category);
                const scenIdx = db.scenarios.findIndex((s) => s.category === t.category);
                return (
                  <div key={t.category} className="p-4 rounded-xl border border-slate-200 bg-[#F5F8FC]/60 flex flex-col justify-between gap-4">
                    <div>
                      <div className="text-xs font-semibold text-[#D97706] mb-1">Focus Topic · {t.mastery}%</div>
                      <div className="font-display font-semibold text-sm text-[#0F172A]">{t.category}</div>
                      <p className="text-xs text-[#475569] mt-1">
                        {lesson ? `Review "${lesson.title}" to reinforce key warning signs.` : 'Practice scenarios in this domain.'}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      {lesson && (
                        <Button variant="primary" size="sm" fullWidth onClick={() => openRecommendedLesson(lesson.id)}>
                          Study Lesson
                        </Button>
                      )}
                      {scenIdx >= 0 && (
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => navigate('scenarios', { scenarioIndex: scenIdx })}
                        >
                          <ShieldAlert className="w-3.5 h-3.5" />
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })
            ) : (
              <>
                <div className="p-4 rounded-xl border border-slate-200 bg-[#F5F8FC]/60 flex flex-col justify-between gap-4">
                  <div>
                    <div className="text-xs font-semibold text-[#2563EB] mb-1">Step 01</div>
                    <div className="font-display font-semibold text-sm text-[#0F172A]">Complete Remaining Modules</div>
                    <p className="text-xs text-[#475569] mt-1">
                      {m.completedCount} of {m.totalLessons} lessons completed.
                    </p>
                  </div>
                  <Button variant="primary" size="sm" onClick={() => navigate('modules')}>
                    Open Modules
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Button>
                </div>

                <div className="p-4 rounded-xl border border-slate-200 bg-[#F5F8FC]/60 flex flex-col justify-between gap-4">
                  <div>
                    <div className="text-xs font-semibold text-[#2563EB] mb-1">Step 02</div>
                    <div className="font-display font-semibold text-sm text-[#0F172A]">Finish Threat Lab Drills</div>
                    <p className="text-xs text-[#475569] mt-1">
                      {m.uniqueScenariosSolved} of {db.scenarios.length} scenarios solved.
                    </p>
                  </div>
                  <Button variant="secondary" size="sm" onClick={() => navigate('scenarios')}>
                    Open Threat Lab
                  </Button>
                </div>

                <div className="p-4 rounded-xl border border-slate-200 bg-[#F5F8FC]/60 flex flex-col justify-between gap-4">
                  <div>
                    <div className="text-xs font-semibold text-[#2563EB] mb-1">Step 03</div>
                    <div className="font-display font-semibold text-sm text-[#0F172A]">Track Certificate Eligibility</div>
                    <p className="text-xs text-[#475569] mt-1">
                      Review all requirements on your Results &amp; Progress page.
                    </p>
                  </div>
                  <Button variant="secondary" size="sm" onClick={() => navigate('progress')}>
                    View Progress
                  </Button>
                </div>
              </>
            )}
          </div>
        </Card>
      </div>
    </AppShell>
  );
};
