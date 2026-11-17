import React, { useEffect, useState } from 'react';
import { ArrowRight, CheckCircle2, ShieldAlert, ShieldCheck, XCircle } from 'lucide-react';
import { AppShell } from '../components/layout/AppShell';
import { ArtifactSimulator } from '../components/scenarios/ArtifactSimulator';
import { AlertBanner, Button, Card, EmptyState, ProgressBar } from '../components/ui/Primitives';
import { useApp } from '../context/AppContext';

export const ScenariosPage: React.FC = () => {
  const {
    db,
    currentUser,
    activeScenarioIndex,
    setActiveScenarioIndex,
    submitScenarioAttempt,
    navigate,
  } = useApp();

  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    setSelectedIndex(null);
    setSubmitted(false);
  }, [activeScenarioIndex]);

  if (!currentUser) return null;

  if (!db.scenarios.length) {
    return (
      <AppShell title="Interactive Threat Lab">
        <Card>
          <EmptyState
            icon={<ShieldAlert className="w-6 h-6" />}
            title="No threat scenarios available"
            description="Scenarios can be added from the Admin Dashboard."
          />
        </Card>
      </AppShell>
    );
  }

  const safeIndex = Math.min(activeScenarioIndex, db.scenarios.length - 1);
  const scenario = db.scenarios[safeIndex];
  const progressPct = Math.round(((safeIndex + 1) / db.scenarios.length) * 100);
  const isCorrect = submitted && selectedIndex === scenario.correctIndex;
  const solvedIds = new Set(
    currentUser.scenarioAttempts.filter((a) => a.isCorrect).map((a) => a.scenarioId)
  );

  const handleSubmit = () => {
    if (selectedIndex === null) return;
    submitScenarioAttempt(scenario, selectedIndex);
    setSubmitted(true);
  };

  const handleNext = () => {
    if (safeIndex < db.scenarios.length - 1) {
      setActiveScenarioIndex(safeIndex + 1);
    } else {
      navigate('feedback');
    }
  };

  return (
    <AppShell title="Interactive Threat Scenarios">
      <div className="space-y-5">
        {/* Header & Progress */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="text-xs font-medium text-[#2563EB] mb-1">
              Scenario {safeIndex + 1} of {db.scenarios.length} · {scenario.category}
            </div>
            <h1 className="font-display font-bold text-2xl sm:text-[28px] text-[#0F172A] tracking-tight">
              {scenario.title}
            </h1>
          </div>

          <div className="w-full md:w-56 space-y-1.5">
            <div className="flex justify-between text-xs text-[#475569] tabular-nums">
              <span>Lab Progress</span>
              <span className="font-semibold">{progressPct}%</span>
            </div>
            <ProgressBar value={progressPct} />
          </div>
        </div>

        {/* Scenario Selector Tabs */}
        <div className="flex flex-wrap gap-2" role="tablist" aria-label="Select threat scenario">
          {db.scenarios.map((sc, idx) => {
            const active = idx === safeIndex;
            const mastered = solvedIds.has(sc.id);
            return (
              <button
                key={sc.id}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => setActiveScenarioIndex(idx)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold inline-flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap ${
                  active
                    ? 'bg-[#0B1220] text-white'
                    : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                <span className="tabular-nums">#{idx + 1}</span>
                <span>{sc.format.toUpperCase()}</span>
                {mastered && (
                  <CheckCircle2
                    className={`w-3.5 h-3.5 ${active ? 'text-[#22D3EE]' : 'text-[#16A34A]'}`}
                    aria-label="Solved correctly"
                  />
                )}
              </button>
            );
          })}
        </div>

        {/* Mandatory Sandbox Safety Notice */}
        <AlertBanner type="info" title="Safe Training Sandbox">
          All emails, text messages, domains, and payment forms below are 100% fictional. Links and form inputs are disabled—never enter real passwords, OTPs, or banking information.
        </AlertBanner>

        {/* Split Threat Lab Workspace */}
        <div className="grid lg:grid-cols-12 gap-6 items-start">
          {/* Left: Simulated Artifact */}
          <div className="lg:col-span-7 space-y-4">
            <ArtifactSimulator scenario={scenario} revealFlags={submitted} />

            {submitted && (
              <Card className="p-5">
                <h2 className="font-display font-semibold text-sm text-[#0F172A] mb-3">
                  Warning Signs Highlighted in This Scenario
                </h2>
                <ul className="space-y-2 text-sm text-[#475569]">
                  {scenario.redFlags.map((flag, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <ShieldAlert className="w-4 h-4 text-[#DC2626] shrink-0 mt-0.5" />
                      <span>{flag}</span>
                    </li>
                  ))}
                </ul>
              </Card>
            )}
          </div>

          {/* Right: Interactive Decision Panel */}
          <Card className="lg:col-span-5 p-6 space-y-5">
            <div>
              <h2 className="font-display font-semibold text-lg text-[#0F172A]">Inspect and Respond</h2>
              <p className="text-sm text-[#475569] mt-1 leading-relaxed">{scenario.prompt}</p>
            </div>

            <fieldset className="space-y-2.5" disabled={submitted}>
              <legend className="sr-only">Choose the safest response</legend>
              {scenario.options.map((opt, idx) => {
                const letter = ['A', 'B', 'C', 'D'][idx] || String(idx + 1);
                const isSelected = selectedIndex === idx;
                const isAnswer = idx === scenario.correctIndex;

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
              <Button variant="primary" size="lg" fullWidth disabled={selectedIndex === null} onClick={handleSubmit}>
                <ShieldCheck className="w-4 h-4" />
                Submit Assessment
              </Button>
            ) : (
              <div className="space-y-4" aria-live="polite">
                <AlertBanner
                  type={isCorrect ? 'success' : 'danger'}
                  title={isCorrect ? 'Correct Decision — Threat Avoided' : 'Incorrect Choice — Risky Action'}
                >
                  {scenario.explanation}
                </AlertBanner>

                <Button variant="primary" size="lg" fullWidth onClick={handleNext}>
                  {safeIndex < db.scenarios.length - 1 ? 'Next Scenario' : 'View Personalized Feedback'}
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
            )}
          </Card>
        </div>
      </div>
    </AppShell>
  );
};
