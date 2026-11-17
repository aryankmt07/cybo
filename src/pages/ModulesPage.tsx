import React, { useMemo, useState } from 'react';
import { ArrowLeft, BookOpen, CheckCircle2, Clock, Search, ShieldAlert } from 'lucide-react';
import { AppShell } from '../components/layout/AppShell';
import { Button, Card, EmptyState, ProgressBar } from '../components/ui/Primitives';
import { useApp } from '../context/AppContext';
import { CATEGORIES, Difficulty } from '../types';

export const ModulesPage: React.FC = () => {
  const { db, currentUser, navigate, recordLessonAccess } = useApp();
  const [selectedCat, setSelectedCat] = useState<string>('All');
  const [difficulty, setDifficulty] = useState<'All' | Difficulty>('All');
  const [search, setSearch] = useState('');

  const publishedLessons = useMemo(() => db.lessons.filter((l) => l.published), [db.lessons]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return publishedLessons.filter((l) => {
      const matchCat = selectedCat === 'All' || l.category === selectedCat;
      const matchDiff = difficulty === 'All' || l.difficulty === difficulty;
      const matchSearch =
        !q ||
        l.title.toLowerCase().includes(q) ||
        l.description.toLowerCase().includes(q) ||
        l.category.toLowerCase().includes(q);
      return matchCat && matchDiff && matchSearch;
    });
  }, [publishedLessons, selectedCat, difficulty, search]);

  if (!currentUser) return null;

  const handleOpenLesson = (lessonId: string) => {
    recordLessonAccess(lessonId);
    navigate('lesson', { lessonId });
  };

  return (
    <AppShell title="Learning Modules">
      <div className="space-y-6">
        <div>
          <h1 className="font-display font-bold text-2xl sm:text-[28px] text-[#0F172A] tracking-tight">
            Learning Modules
          </h1>
          <p className="text-sm text-[#475569] mt-1">
            Six practical cybersecurity categories covering scams, passwords, identity protection, and safe browsing.
          </p>
        </div>

        {/* Search + Filter Controls */}
        <Card className="p-5 space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" aria-hidden="true" />
              <input
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search lessons (e.g., phishing, UPI, passwords, Wi-Fi)..."
                aria-label="Search learning modules"
                className="w-full h-10 pl-9 pr-3 rounded-lg border border-slate-300 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB]"
              />
            </div>

            <select
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value as 'All' | Difficulty)}
              aria-label="Filter by difficulty level"
              className="h-10 px-3 rounded-lg border border-slate-300 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB]"
            >
              <option value="All">All Difficulties</option>
              <option value="Beginner">Beginner</option>
              <option value="Intermediate">Intermediate</option>
              <option value="Advanced">Advanced</option>
            </select>
          </div>

          <div className="flex flex-wrap gap-2" role="group" aria-label="Filter by cybersecurity category">
            {['All', ...CATEGORIES].map((cat) => {
              const active = selectedCat === cat;
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCat(cat)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap ${
                    active
                      ? 'bg-[#0B1220] text-white'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {cat}
                </button>
              );
            })}
          </div>
        </Card>

        {/* Modules Grid */}
        {filtered.length ? (
          <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-5">
            {filtered.map((lesson) => {
              const completed = currentUser.completedLessons.includes(lesson.id);
              return (
                <Card key={lesson.id} hoverable className="p-6 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-2 text-xs text-[#475569] mb-2">
                      <span className="font-medium text-[#2563EB]">{lesson.category}</span>
                      <span aria-hidden="true">·</span>
                      <span>{lesson.difficulty}</span>
                      <span aria-hidden="true">·</span>
                      <span className="inline-flex items-center gap-1 tabular-nums">
                        <Clock className="w-3.5 h-3.5" aria-hidden="true" />
                        {lesson.duration} min
                      </span>
                    </div>
                    <h2 className="font-display font-semibold text-base text-[#0F172A] mb-2 leading-snug">
                      {lesson.title}
                    </h2>
                    <p className="text-sm text-[#475569] leading-relaxed mb-5">{lesson.description}</p>
                  </div>

                  <div className="space-y-3 pt-4 border-t border-slate-100">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-500">Module Progress</span>
                      <span
                        className={`font-semibold inline-flex items-center gap-1 ${
                          completed ? 'text-[#16A34A]' : 'text-slate-600'
                        }`}
                      >
                        {completed && <CheckCircle2 className="w-3.5 h-3.5" />}
                        {completed ? 'Completed' : 'Not started'}
                      </span>
                    </div>
                    <ProgressBar value={completed ? 100 : 0} tone={completed ? 'success' : 'royal'} />
                    <Button
                      variant={completed ? 'secondary' : 'primary'}
                      fullWidth
                      onClick={() => handleOpenLesson(lesson.id)}
                    >
                      {completed ? 'Review Lesson' : 'Start Lesson'}
                    </Button>
                  </div>
                </Card>
              );
            })}
          </div>
        ) : (
          <Card>
            <EmptyState
              icon={<BookOpen className="w-6 h-6" />}
              title="No matching lessons found"
              description="Try clearing your search input or switching back to all cybersecurity categories."
              action={
                <Button
                  variant="secondary"
                  onClick={() => {
                    setSelectedCat('All');
                    setDifficulty('All');
                    setSearch('');
                  }}
                >
                  Reset Filters
                </Button>
              }
            />
          </Card>
        )}
      </div>
    </AppShell>
  );
};

export const LessonReaderPage: React.FC = () => {
  const { db, currentUser, activeLessonId, navigate, markLessonComplete } = useApp();
  if (!currentUser) return null;

  const lesson = db.lessons.find((l) => l.id === activeLessonId) || db.lessons[0];
  if (!lesson) {
    return (
      <AppShell title="Lesson">
        <Card>
          <EmptyState
            icon={<BookOpen className="w-6 h-6" />}
            title="Lesson unavailable"
            description="Return to the Learning Modules catalog to select a topic."
            action={<Button onClick={() => navigate('modules')}>Back to Modules</Button>}
          />
        </Card>
      </AppShell>
    );
  }

  const completed = currentUser.completedLessons.includes(lesson.id);
  const relatedScenarioIndex = db.scenarios.findIndex((s) => s.category === lesson.category);

  return (
    <AppShell title={lesson.title}>
      <div className="max-w-3xl space-y-5">
        <button
          type="button"
          onClick={() => navigate('modules')}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-[#0F172A] cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Learning Modules</span>
        </button>

        <Card className="p-6 sm:p-8 space-y-6">
          <div className="space-y-2 border-b border-slate-200 pb-5">
            <div className="flex flex-wrap items-center gap-2 text-xs text-[#475569]">
              <span className="font-semibold text-[#2563EB]">{lesson.category}</span>
              <span aria-hidden="true">·</span>
              <span>{lesson.difficulty}</span>
              <span aria-hidden="true">·</span>
              <span className="tabular-nums">{lesson.duration} min read</span>
              {completed && (
                <>
                  <span aria-hidden="true">·</span>
                  <span className="text-[#16A34A] font-semibold inline-flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Completed
                  </span>
                </>
              )}
            </div>
            <h1 className="font-display font-bold text-2xl sm:text-3xl text-[#0F172A] tracking-tight">
              {lesson.title}
            </h1>
            <p className="text-[#475569] text-base">{lesson.description}</p>
          </div>

          <div className="space-y-4 text-[15.5px] leading-relaxed text-[#0F172A]">
            {lesson.content.map((para, idx) => (
              <p key={idx}>{para}</p>
            ))}
          </div>

          {lesson.realWorldExample && (
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
              <div className="text-xs font-semibold text-slate-700">Real-World Threat Pattern</div>
              <p className="text-sm text-[#475569] leading-relaxed">{lesson.realWorldExample}</p>
            </div>
          )}

          <div className="p-5 rounded-xl bg-[#EFF6FF] border border-[#BFDBFE] space-y-3">
            <div className="text-sm font-semibold text-[#1E3A8A]">Actionable Security Checklist</div>
            <ul className="space-y-2 text-sm text-[#1E3A8A]">
              {lesson.checklist.map((item, idx) => (
                <li key={idx} className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-[#2563EB]" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="pt-4 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
            <Button
              variant={completed ? 'secondary' : 'primary'}
              onClick={() => markLessonComplete(lesson.id)}
              disabled={completed}
            >
              <CheckCircle2 className="w-4 h-4" />
              {completed ? 'Lesson Completed' : 'Mark Lesson as Complete'}
            </Button>

            {relatedScenarioIndex >= 0 && (
              <Button
                variant="secondary"
                onClick={() => navigate('scenarios', { scenarioIndex: relatedScenarioIndex })}
              >
                <ShieldAlert className="w-4 h-4 text-[#2563EB]" />
                Practice Related Threat Scenario
              </Button>
            )}
          </div>
        </Card>
      </div>
    </AppShell>
  );
};
