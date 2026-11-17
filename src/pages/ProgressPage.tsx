import React from 'react';
import { ArrowRight, CheckCircle2, Download, Lock, ShieldCheck } from 'lucide-react';
import { AppShell } from '../components/layout/AppShell';
import { Button, Card, ScoreTrendChart } from '../components/ui/Primitives';
import { useApp } from '../context/AppContext';

export const ProgressPage: React.FC = () => {
  const { db, currentUser, navigate, computeMetrics, recordLessonAccess, showToast } = useApp();
  if (!currentUser) return null;

  const m = computeMetrics(currentUser);
  const nextLesson = db.lessons.find((l) => l.published && !currentUser.completedLessons.includes(l.id));
  const trendPoints = m.quizAttempts.map((q, idx) => ({ label: `Quiz ${idx + 1}`, value: q.score }));
  const scenarioGoal = Math.min(4, db.scenarios.length);

  const handleDownloadCertificate = () => {
    if (!m.certUnlocked) return;
    const certId = `CS-${new Date().getFullYear()}-${String(Date.now()).slice(-5)}`;
    const safeName = currentUser.name.replace(/[<>&"']/g, '');
    const html = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <title>CyberShield Certificate — ${safeName}</title>
  <style>
    body { font-family: 'Plus Jakarta Sans', Arial, sans-serif; background: #F5F8FC; padding: 48px; display: flex; justify-content: center; }
    .cert { background: #fff; border: 6px solid #0B1220; border-radius: 16px; max-width: 780px; width: 100%; padding: 56px; text-align: center; }
    .brand { font-size: 13px; letter-spacing: 2px; font-weight: 700; color: #0E7490; text-transform: uppercase; }
    h1 { font-size: 34px; color: #0B1220; margin: 12px 0 8px; }
    .name { font-size: 30px; font-weight: 700; color: #2563EB; margin: 22px 0; }
    p { color: #475569; font-size: 15px; line-height: 1.7; max-width: 560px; margin: 0 auto; }
    .meta { margin-top: 40px; padding-top: 20px; border-top: 1px solid #E2E8F0; display: flex; justify-content: space-between; font-size: 13px; color: #64748B; }
  </style>
</head>
<body>
  <div class="cert">
    <div class="brand">CyberShield Security Academy</div>
    <h1>Certificate of Completion</h1>
    <p>This certifies that</p>
    <div class="name">${safeName}</div>
    <p>has successfully completed all ${m.totalLessons} CyberShield cybersecurity awareness modules, solved ${m.uniqueScenariosSolved} interactive threat scenarios, and achieved an average assessment score of ${m.avgQuiz}%.</p>
    <div class="meta">
      <span>Issued: ${new Date().toISOString().slice(0, 10)}</span>
      <span>Certificate ID: ${certId}</span>
    </div>
  </div>
</body>
</html>`;

    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `CyberShield_Certificate_${safeName.replace(/\s+/g, '_')}.html`;
    link.click();
    URL.revokeObjectURL(url);
    showToast('Completion certificate downloaded.', 'success');
  };

  return (
    <AppShell title="Results & Progress">
      <div className="space-y-6">
        <div>
          <h1 className="font-display font-bold text-2xl sm:text-[28px] text-[#0F172A] tracking-tight">
            Results &amp; Progress
          </h1>
          <p className="text-sm text-[#475569] mt-1">
            Detailed module completion, topic mastery, and verified certificate eligibility.
          </p>
        </div>

        {/* Summary KPI Strip */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          <Card className="p-5">
            <div className="text-xs font-medium text-slate-500">Total Lessons Completed</div>
            <div className="font-display font-bold text-3xl text-[#0F172A] tabular-nums mt-2">
              {m.completedCount} <span className="text-base font-medium text-slate-400">/ {m.totalLessons}</span>
            </div>
          </Card>

          <Card className="p-5">
            <div className="text-xs font-medium text-slate-500">Average Quiz Score</div>
            <div className="font-display font-bold text-3xl text-[#0F172A] tabular-nums mt-2">
              {m.quizAttempts.length ? `${m.avgQuiz}%` : '—'}
            </div>
          </Card>

          <Card className="p-5">
            <div className="text-xs font-medium text-slate-500">Threat Scenarios Solved</div>
            <div className="font-display font-bold text-3xl text-[#0F172A] tabular-nums mt-2">
              {m.uniqueScenariosSolved}{' '}
              <span className="text-base font-medium text-slate-400">/ {db.scenarios.length}</span>
            </div>
          </Card>

          <Card className="p-5">
            <div className="text-xs font-medium text-slate-500">Certificate Eligibility</div>
            <div
              className={`font-display font-bold text-xl mt-2.5 flex items-center gap-2 ${
                m.certUnlocked ? 'text-[#16A34A]' : 'text-[#D97706]'
              }`}
            >
              {m.certUnlocked ? <CheckCircle2 className="w-5 h-5" /> : <Lock className="w-5 h-5" />}
              <span>{m.certUnlocked ? 'Eligible & Unlocked' : 'Requirements Pending'}</span>
            </div>
          </Card>
        </div>

        {/* Topic Performance & Timeline */}
        <div className="grid lg:grid-cols-12 gap-6">
          <Card className="lg:col-span-6 p-6 space-y-4">
            <h2 className="font-display font-semibold text-base text-[#0F172A]">Topic-Wise Performance</h2>
            <div className="overflow-x-auto border border-slate-200 rounded-xl">
              <table className="w-full text-left text-sm border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-600">
                    <th className="py-3 px-4">Category</th>
                    <th className="py-3 px-4 text-right">Lessons</th>
                    <th className="py-3 px-4 text-right">Accuracy</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {m.topicStats.map((t) => (
                    <tr key={t.category} className="hover:bg-slate-50/70">
                      <td className="py-3 px-4 font-medium text-[#0F172A]">{t.category}</td>
                      <td className="py-3 px-4 text-right tabular-nums text-slate-600">
                        {t.lessonsDone}/{t.lessonsTotal}
                      </td>
                      <td className="py-3 px-4 text-right tabular-nums font-semibold">
                        {t.mastery !== null ? (
                          <span className={t.mastery >= 80 ? 'text-[#16A34A]' : 'text-[#D97706]'}>
                            {t.mastery}%
                          </span>
                        ) : (
                          <span className="text-slate-400 font-normal">Not tested</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          <Card className="lg:col-span-6 p-6 space-y-4">
            <div>
              <h2 className="font-display font-semibold text-base text-[#0F172A]">Learning Progress Over Time</h2>
              <p className="text-xs text-[#475569]">Assessment score trajectory</p>
            </div>
            <ScoreTrendChart
              points={trendPoints}
              emptyText="Complete Cybersecurity Quizzes to plot your learning progress over time."
            />

            {nextLesson && (
              <div className="p-4 rounded-xl bg-[#EFF6FF] border border-[#BFDBFE] flex items-center justify-between gap-4">
                <div className="min-w-0">
                  <div className="text-xs font-semibold text-[#1E3A8A]">Recommended Next Lesson</div>
                  <div className="text-sm font-semibold text-[#0F172A] truncate mt-0.5">{nextLesson.title}</div>
                </div>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => {
                    recordLessonAccess(nextLesson.id);
                    navigate('lesson', { lessonId: nextLesson.id });
                  }}
                >
                  Start
                  <ArrowRight className="w-3.5 h-3.5" />
                </Button>
              </div>
            )}
          </Card>
        </div>

        {/* Gated Completion Certificate */}
        <Card className="p-6 sm:p-8">
          <div className="grid lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-6 space-y-4">
              <h2 className="font-display font-bold text-xl text-[#0F172A]">
                CyberShield Completion Certificate
              </h2>
              <p className="text-sm text-[#475569] leading-relaxed">
                Your completion certificate unlocks automatically only after all three mastery criteria below are satisfied.
              </p>

              <ul className="space-y-3 text-sm">
                <li className="flex items-center gap-3">
                  {m.certCriteria.allLessons ? (
                    <CheckCircle2 className="w-5 h-5 text-[#16A34A] shrink-0" />
                  ) : (
                    <Lock className="w-5 h-5 text-slate-400 shrink-0" />
                  )}
                  <span className="tabular-nums">
                    Complete all {m.totalLessons} Learning Modules ({m.completedCount}/{m.totalLessons})
                  </span>
                </li>
                <li className="flex items-center gap-3">
                  {m.certCriteria.minScenarios ? (
                    <CheckCircle2 className="w-5 h-5 text-[#16A34A] shrink-0" />
                  ) : (
                    <Lock className="w-5 h-5 text-slate-400 shrink-0" />
                  )}
                  <span className="tabular-nums">
                    Attempt at least {scenarioGoal} Threat Scenarios ({m.uniqueScenariosSolved}/{scenarioGoal})
                  </span>
                </li>
                <li className="flex items-center gap-3">
                  {m.certCriteria.minQuizScore ? (
                    <CheckCircle2 className="w-5 h-5 text-[#16A34A] shrink-0" />
                  ) : (
                    <Lock className="w-5 h-5 text-slate-400 shrink-0" />
                  )}
                  <span className="tabular-nums">
                    Achieve at least 80% average quiz score (Current: {m.quizAttempts.length ? `${m.avgQuiz}%` : '0%'})
                  </span>
                </li>
              </ul>

              <div className="pt-2">
                <Button variant="primary" size="lg" disabled={!m.certUnlocked} onClick={handleDownloadCertificate}>
                  <Download className="w-4 h-4" />
                  {m.certUnlocked ? 'Download Completion Certificate' : 'Certificate Locked Until Requirements Met'}
                </Button>
              </div>
            </div>

            <div className="lg:col-span-6">
              <div
                className={`rounded-xl p-7 text-center border-2 transition-opacity ${
                  m.certUnlocked
                    ? 'border-[#0B1220] bg-gradient-to-br from-white to-[#F5F8FC]'
                    : 'border-dashed border-slate-300 bg-slate-50 opacity-65'
                }`}
              >
                <div className="inline-flex items-center gap-2 text-xs font-semibold text-[#0E7490] tracking-wider uppercase mb-3">
                  <ShieldCheck className="w-4 h-4" />
                  <span>CyberShield Academy</span>
                </div>
                <div className="text-xs text-slate-500">Certificate of Cybersecurity Readiness</div>
                <div className="font-display font-bold text-2xl text-[#0B1220] my-2">{currentUser.name}</div>
                <p className="text-xs text-[#475569] max-w-sm mx-auto leading-relaxed">
                  Awarded upon completing the CyberShield curriculum, interactive threat simulations, and mastery assessment.
                </p>
                <div className="mt-4 text-xs font-semibold tabular-nums text-slate-600">
                  {m.certUnlocked ? `Verified Mastery · Avg ${m.avgQuiz}%` : 'Locked Preview — Complete Criteria to Unlock'}
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </AppShell>
  );
};
