import React, { useState } from 'react';
import {
  ArrowRight,
  Award,
  CheckCircle2,
  Globe,
  Lock,
  Mail,
  Menu,
  ShieldAlert,
  ShieldCheck,
  TrendingUp,
  X,
} from 'lucide-react';
import { Button, Card, Modal } from '../components/ui/Primitives';
import { useApp } from '../context/AppContext';

export const LandingPage: React.FC = () => {
  const { db, currentUser, navigate, platformStats } = useApp();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [previewFlagsRevealed, setPreviewFlagsRevealed] = useState(true);
  const [infoModal, setInfoModal] = useState<{ title: string; body: string } | null>(null);

  const handleStart = () => {
    if (currentUser) {
      navigate(currentUser.role === 'admin' ? 'admin' : 'dashboard');
    } else {
      navigate('auth');
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F5F8FC] text-[#0F172A]">
      {/* Top Navigation */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-8">
          <a
            href="#home"
            onClick={(e) => {
              e.preventDefault();
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="flex items-center gap-2.5 font-display font-bold text-lg tracking-tight text-[#0B1220] whitespace-nowrap shrink-0"
          >
            <span className="w-8 h-8 rounded-lg bg-[#0B1220] text-[#22D3EE] inline-flex items-center justify-center">
              <ShieldCheck className="w-4 h-4" />
            </span>
            <span>CyberShield</span>
          </a>

          <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-slate-600" aria-label="Primary navigation">
            <a href="#home" className="hover:text-[#2563EB] hover:underline underline-offset-4 whitespace-nowrap shrink-0">
              Home
            </a>
            <a href="#learn" className="hover:text-[#2563EB] hover:underline underline-offset-4 whitespace-nowrap shrink-0">
              Learn
            </a>
            <a href="#threats" className="hover:text-[#2563EB] hover:underline underline-offset-4 whitespace-nowrap shrink-0">
              Threats
            </a>
            <a href="#about" className="hover:text-[#2563EB] hover:underline underline-offset-4 whitespace-nowrap shrink-0">
              About
            </a>
          </nav>

          <div className="hidden md:flex items-center gap-3 shrink-0">
            {currentUser ? (
              <Button variant="primary" size="sm" onClick={handleStart}>
                Open Workspace
              </Button>
            ) : (
              <>
                <Button variant="ghost" size="sm" onClick={() => navigate('auth')}>
                  Login
                </Button>
                <Button variant="primary" size="sm" onClick={() => navigate('auth')}>
                  Get Started
                </Button>
              </>
            )}
          </div>

          <button
            className="md:hidden p-2 rounded-lg text-slate-700 hover:bg-slate-100 cursor-pointer"
            onClick={() => setMobileMenuOpen((v) => !v)}
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-t border-slate-200 px-4 py-4 space-y-3">
            <div className="flex flex-col space-y-2 text-sm font-medium text-slate-700">
              <a href="#home" onClick={() => setMobileMenuOpen(false)} className="py-1.5">Home</a>
              <a href="#learn" onClick={() => setMobileMenuOpen(false)} className="py-1.5">Learn</a>
              <a href="#threats" onClick={() => setMobileMenuOpen(false)} className="py-1.5">Threats</a>
              <a href="#about" onClick={() => setMobileMenuOpen(false)} className="py-1.5">About</a>
            </div>
            <div className="flex gap-2.5 pt-2 border-t border-slate-100">
              <Button variant="secondary" fullWidth onClick={() => navigate('auth')}>
                Login
              </Button>
              <Button variant="primary" fullWidth onClick={handleStart}>
                Get Started
              </Button>
            </div>
          </div>
        )}
      </header>

      {/* Hero Section */}
      <section
        id="home"
        className="bg-gradient-to-br from-[#0B1220] via-[#111C33] to-[#17284A] text-white py-16 lg:py-24 border-b border-white/10"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 grid lg:grid-cols-12 gap-10 lg:gap-12 items-center">
          <div className="lg:col-span-6 space-y-6">
            <p className="text-sm font-medium text-[#22D3EE] tracking-wide">
              Interactive Cybersecurity Awareness · Fictional Training Sandbox
            </p>
            <h1 className="font-display font-bold text-3xl sm:text-5xl leading-[1.12] tracking-tight text-balance">
              Stay Smart. Stay Safe.{' '}
              <span className="text-[#22D3EE]">Stay CyberSecure.</span>
            </h1>
            <p className="text-base sm:text-lg text-slate-300 max-w-xl leading-relaxed">
              CyberShield goes beyond passive articles. Practice identifying phishing emails, online payment scams, password pitfalls, and privacy risks through realistic simulations and personalized feedback.
            </p>
            <div className="flex flex-wrap items-center gap-3.5 pt-1">
              <Button variant="primary" size="lg" onClick={handleStart}>
                Start Learning
                <ArrowRight className="w-4 h-4" />
              </Button>
              <Button
                variant="dark-outline"
                size="lg"
                onClick={() => document.getElementById('threats')?.scrollIntoView({ behavior: 'smooth' })}
              >
                Explore Cyber Threats
              </Button>
            </div>
          </div>

          {/* Interactive Threat Lab Preview Card */}
          <div className="lg:col-span-6">
            <div className="bg-white text-[#0F172A] rounded-2xl border border-slate-200/80 shadow-2xl p-5 sm:p-6">
              <div className="flex items-center justify-between gap-3 pb-4 mb-4 border-b border-slate-200">
                <div>
                  <div className="text-xs font-medium text-slate-500">Interactive Threat Lab · Sample</div>
                  <div className="text-sm font-semibold text-[#0F172A]">Simulated Phishing Email Inspection</div>
                </div>
                <button
                  type="button"
                  onClick={() => setPreviewFlagsRevealed((v) => !v)}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 text-slate-800 hover:bg-slate-200 transition-colors cursor-pointer whitespace-nowrap"
                >
                  {previewFlagsRevealed ? 'Hide Red Flags' : 'Inspect Red Flags'}
                </button>
              </div>

              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm space-y-2.5">
                <div className="text-xs text-slate-600">
                  <span className="font-semibold text-slate-800">From:</span> Security Desk &lt;
                  <span
                    className={
                      previewFlagsRevealed
                        ? 'bg-[#FEE2E2] text-[#B91C1C] px-1.5 py-0.5 rounded font-mono font-semibold'
                        : 'font-mono'
                    }
                  >
                    alert@paypa1-verify.invalid
                  </span>
                  &gt;
                </div>
                <div className="font-semibold text-[#0F172A]">
                  Subject:{' '}
                  <span className={previewFlagsRevealed ? 'bg-[#FEE2E2] text-[#B91C1C] px-1.5 py-0.5 rounded' : ''}>
                    Urgent: Account Suspended in 2 Hours
                  </span>
                </div>
                <p className="text-slate-600 text-[13.5px] leading-relaxed">
                  Verify your billing credentials immediately using the button below to prevent permanent account lock.
                </p>
                <div className="pt-1 font-mono text-xs text-slate-500">
                  Link preview:{' '}
                  <span className={previewFlagsRevealed ? 'text-[#B91C1C] font-semibold' : ''}>
                    http://paypa1-verify.invalid/login
                  </span>
                </div>
              </div>

              {previewFlagsRevealed && (
                <div className="mt-4 p-3.5 rounded-lg bg-[#DCFCE7] border border-[#86EFAC] text-[#14532D] text-xs sm:text-sm flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-[#16A34A]" />
                  <div>
                    <span className="font-semibold">2 Red Flags Identified:</span> Lookalike domain{' '}
                    <code className="font-mono">paypa1</code> (digit 1 instead of L) paired with artificial 2-hour urgency.
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Core Curriculum Showcase */}
      <section id="learn" className="py-16 lg:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="max-w-2xl mb-10">
            <h2 className="font-display font-bold text-2xl sm:text-3xl text-[#0F172A] tracking-tight">
              Practical Defense Across Everyday Digital Risks
            </h2>
            <p className="text-[#475569] mt-2.5">
              Structured modules designed for students and everyday internet users—clear guidance without jargon.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <Card hoverable className="p-6">
              <div className="w-10 h-10 rounded-lg bg-[#EFF6FF] text-[#2563EB] inline-flex items-center justify-center mb-4">
                <Mail className="w-5 h-5" />
              </div>
              <div className="text-xs font-medium text-slate-500 mb-1">01 · Email & Messaging</div>
              <h3 className="font-display font-semibold text-lg text-[#0F172A] mb-2">Phishing Awareness</h3>
              <p className="text-sm text-[#475569] leading-relaxed">
                Spot spoofed sender domains, deceptive urgency cues, and smishing lures before clicking malicious links.
              </p>
            </Card>

            <Card hoverable className="p-6">
              <div className="w-10 h-10 rounded-lg bg-[#EFF6FF] text-[#2563EB] inline-flex items-center justify-center mb-4">
                <Lock className="w-5 h-5" />
              </div>
              <div className="text-xs font-medium text-slate-500 mb-1">02 · Account Protection</div>
              <h3 className="font-display font-semibold text-lg text-[#0F172A] mb-2">Password Security</h3>
              <p className="text-sm text-[#475569] leading-relaxed">
                Stop credential-stuffing attacks with unique passphrases, password managers, and phishing-resistant 2FA.
              </p>
            </Card>

            <Card hoverable className="p-6">
              <div className="w-10 h-10 rounded-lg bg-[#EFF6FF] text-[#2563EB] inline-flex items-center justify-center mb-4">
                <Globe className="w-5 h-5" />
              </div>
              <div className="text-xs font-medium text-slate-500 mb-1">03 · Permissions & Networks</div>
              <h3 className="font-display font-semibold text-lg text-[#0F172A] mb-2">Digital Privacy</h3>
              <p className="text-sm text-[#475569] leading-relaxed">
                Audit mobile app permissions, avoid public Wi-Fi traps, and protect personally identifiable information.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* Platform Benefits */}
      <section id="threats" className="py-16 lg:py-20 bg-white border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="max-w-2xl mb-10">
            <h2 className="font-display font-bold text-2xl sm:text-3xl text-[#0F172A] tracking-tight">
              Built Around Active Threat Recognition
            </h2>
            <p className="text-[#475569] mt-2.5">
              Every lesson connects directly to hands-on scenario labs and diagnostic feedback.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 gap-6">
            <div className="p-6 rounded-xl border border-slate-200 bg-[#F5F8FC]/60">
              <div className="flex items-center gap-3 mb-2.5">
                <ShieldAlert className="w-5 h-5 text-[#2563EB]" />
                <h3 className="font-display font-semibold text-base text-[#0F172A]">
                  Realistic Fictional Threat Scenarios
                </h3>
              </div>
              <p className="text-sm text-[#475569] leading-relaxed">
                Examine simulated emails, SMS messages, fake login forms, and suspicious checkout screens in a safe sandbox with disabled links.
              </p>
            </div>

            <div className="p-6 rounded-xl border border-slate-200 bg-[#F5F8FC]/60">
              <div className="flex items-center gap-3 mb-2.5">
                <CheckCircle2 className="w-5 h-5 text-[#2563EB]" />
                <h3 className="font-display font-semibold text-base text-[#0F172A]">
                  Instant Diagnostic Explanations
                </h3>
              </div>
              <p className="text-sm text-[#475569] leading-relaxed">
                Immediate visual breakdowns highlight the exact red flags and explain why an action is safe or risky.
              </p>
            </div>

            <div className="p-6 rounded-xl border border-slate-200 bg-[#F5F8FC]/60">
              <div className="flex items-center gap-3 mb-2.5">
                <TrendingUp className="w-5 h-5 text-[#2563EB]" />
                <h3 className="font-display font-semibold text-base text-[#0F172A]">
                  Personalized Learning Feedback
                </h3>
              </div>
              <p className="text-sm text-[#475569] leading-relaxed">
                Automatic topic diagnostics pinpoint weak areas, review missed questions, and recommend the right lessons next.
              </p>
            </div>

            <div className="p-6 rounded-xl border border-slate-200 bg-[#F5F8FC]/60">
              <div className="flex items-center gap-3 mb-2.5">
                <Award className="w-5 h-5 text-[#2563EB]" />
                <h3 className="font-display font-semibold text-base text-[#0F172A]">
                  Earned Completion Certificates
                </h3>
              </div>
              <p className="text-sm text-[#475569] leading-relaxed">
                Completion certificates unlock only after completing all modules, passing scenario drills, and meeting quiz benchmarks.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Conditional Live Stats / Curriculum Overview */}
      <section id="about" className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          {platformStats.hasRealActivity ? (
            <div>
              <div className="mb-8">
                <h2 className="font-display font-bold text-2xl text-[#0F172A]">Live Platform Learning Activity</h2>
                <p className="text-sm text-[#475569] mt-1">
                  Measured directly from completed learner sessions in this workspace.
                </p>
              </div>
              <div className="grid sm:grid-cols-3 gap-6">
                <Card className="p-6">
                  <div className="text-xs font-medium text-slate-500">Registered Learners</div>
                  <div className="text-3xl font-display font-bold text-[#2563EB] tabular-nums mt-2">
                    {platformStats.learnerCount}
                  </div>
                </Card>
                <Card className="p-6">
                  <div className="text-xs font-medium text-slate-500">Threat Scenarios Completed</div>
                  <div className="text-3xl font-display font-bold text-[#2563EB] tabular-nums mt-2">
                    {platformStats.totalScenarios}
                  </div>
                </Card>
                <Card className="p-6">
                  <div className="text-xs font-medium text-slate-500">Quizzes Submitted</div>
                  <div className="text-3xl font-display font-bold text-[#2563EB] tabular-nums mt-2">
                    {platformStats.totalQuizzes}
                  </div>
                </Card>
              </div>
            </div>
          ) : (
            <div className="bg-[#0B1220] text-white rounded-2xl p-8 sm:p-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              <div className="space-y-2 max-w-2xl">
                <div className="text-xs font-medium text-[#22D3EE]">Structured Cybersecurity Curriculum</div>
                <h2 className="font-display font-bold text-2xl sm:text-3xl">
                  6 Core Domains · {db.lessons.length} Lessons · {db.scenarios.length} Interactive Threat Scenarios
                </h2>
                <p className="text-sm text-slate-300">
                  Aggregate learner statistics appear here automatically once learners register and complete real assessments—no fabricated metrics.
                </p>
              </div>
              <Button variant="primary" size="lg" onClick={handleStart}>
                Start Learning Free
              </Button>
            </div>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto bg-[#0B1220] text-slate-400 py-12 border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 grid sm:grid-cols-2 lg:grid-cols-4 gap-8 pb-8 border-b border-white/10 text-sm">
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-white font-display font-bold text-base">
              <ShieldCheck className="w-5 h-5 text-[#22D3EE]" />
              <span>CyberShield</span>
            </div>
            <p className="text-xs leading-relaxed text-slate-400">
              Interactive cybersecurity education for students and everyday internet users. All simulations use safe, fictional examples.
            </p>
          </div>
          <div>
            <div className="text-white font-semibold mb-3">Platform</div>
            <ul className="space-y-2 text-xs">
              <li><a href="#learn" className="hover:text-[#22D3EE]">Learning Modules</a></li>
              <li><a href="#threats" className="hover:text-[#22D3EE]">Threat Scenarios</a></li>
              <li><button onClick={handleStart} className="hover:text-[#22D3EE] cursor-pointer">Learner Workspace</button></li>
            </ul>
          </div>
          <div>
            <div className="text-white font-semibold mb-3">Resources</div>
            <ul className="space-y-2 text-xs">
              <li>
                <button
                  onClick={() =>
                    setInfoModal({
                      title: 'Sandbox Safety Policy',
                      body: 'All threat simulations in CyberShield are 100% fictional. Links are disabled and no real passwords, banking credentials, or OTPs are ever collected.',
                    })
                  }
                  className="hover:text-[#22D3EE] cursor-pointer"
                >
                  Safety Guidelines
                </button>
              </li>
              <li>
                <button
                  onClick={() =>
                    setInfoModal({
                      title: 'Contact CyberShield Support',
                      body: 'For curriculum questions or educational partnerships, reach our team at education@cybershield.example.',
                    })
                  }
                  className="hover:text-[#22D3EE] cursor-pointer"
                >
                  Contact Support
                </button>
              </li>
            </ul>
          </div>
          <div>
            <div className="text-white font-semibold mb-3">Privacy & Legal</div>
            <ul className="space-y-2 text-xs">
              <li>
                <button
                  onClick={() =>
                    setInfoModal({
                      title: 'Privacy Notice',
                      body: 'In this UI-only build, your profile, quiz results, and scenario logs remain strictly inside your own browser localStorage.',
                    })
                  }
                  className="hover:text-[#22D3EE] cursor-pointer"
                >
                  Privacy Policy
                </button>
              </li>
              <li>
                <button
                  onClick={() =>
                    setInfoModal({
                      title: 'Terms of Educational Use',
                      body: 'CyberShield materials are intended solely for defensive awareness training and personal digital safety.',
                    })
                  }
                  className="hover:text-[#22D3EE] cursor-pointer"
                >
                  Terms of Use
                </button>
              </li>
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-6 flex flex-wrap justify-between gap-2 text-xs text-slate-500">
          <span>© 2026 CyberShield Education. All rights reserved.</span>
          <span>Safe Interactive Cybersecurity Training</span>
        </div>
      </footer>

      <Modal open={!!infoModal} title={infoModal?.title || ''} onClose={() => setInfoModal(null)}>
        <p className="text-sm text-[#475569] leading-relaxed">{infoModal?.body}</p>
        <div className="mt-6 flex justify-end">
          <Button variant="primary" size="sm" onClick={() => setInfoModal(null)}>
            Close
          </Button>
        </div>
      </Modal>
    </div>
  );
};
