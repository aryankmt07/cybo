import React, { useMemo, useState } from 'react';
import { ArrowLeft, Eye, EyeOff, Lock, ShieldCheck } from 'lucide-react';
import { AlertBanner, Button, Card } from '../components/ui/Primitives';
import { useApp } from '../context/AppContext';

type AuthMode = 'login' | 'register' | 'forgot';

export const AuthPage: React.FC = () => {
  const { navigate, login, register } = useApp();
  const [mode, setMode] = useState<AuthMode>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [formError, setFormError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<{ name?: string; email?: string; password?: string }>({});
  const [forgotSuccess, setForgotSuccess] = useState('');

  const passwordStrength = useMemo(() => {
    let score = 0;
    if (password.length >= 8) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;
    return score;
  }, [password]);

  const strengthLabels = [
    'Use 8+ characters with uppercase, numbers, and symbols.',
    'Weak — add length and variety.',
    'Fair — add numbers or uppercase letters.',
    'Good — almost there.',
    'Strong passphrase.',
  ];
  const strengthColors = ['bg-slate-200', 'bg-[#DC2626]', 'bg-[#D97706]', 'bg-[#2563EB]', 'bg-[#16A34A]'];

  const resetMessages = () => {
    setFormError('');
    setFieldErrors({});
    setForgotSuccess('');
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    resetMessages();
    const errs: typeof fieldErrors = {};
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) errs.email = 'Enter a valid email address.';
    if (!password) errs.password = 'Enter your password.';
    if (Object.keys(errs).length) {
      setFieldErrors(errs);
      return;
    }
    const res = login(email, password);
    if (!res.ok && res.error) setFormError(res.error);
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    resetMessages();
    const errs: typeof fieldErrors = {};
    if (name.trim().length < 2) errs.name = 'Full name must be at least 2 characters.';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) errs.email = 'Enter a valid email address.';
    if (password.length < 8) errs.password = 'Password must be at least 8 characters long.';
    if (Object.keys(errs).length) {
      setFieldErrors(errs);
      return;
    }
    const res = register(name, email, password);
    if (!res.ok && res.error) setFormError(res.error);
  };

  const handleForgotSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    resetMessages();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setFieldErrors({ email: 'Enter a valid email address.' });
      return;
    }
    setForgotSuccess(
      `If an account exists for ${email.trim()}, password recovery instructions have been dispatched.`
    );
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-12 bg-[#F5F8FC]">
      {/* Left Brand & Privacy Panel */}
      <aside className="hidden lg:flex lg:col-span-5 bg-gradient-to-b from-[#0B1220] to-[#111C33] text-white p-10 flex-col justify-between">
        <div>
          <button
            onClick={() => navigate('landing')}
            className="flex items-center gap-2.5 font-display font-bold text-lg text-white cursor-pointer"
          >
            <span className="w-8 h-8 rounded-lg bg-[#1E293B] border border-[#22D3EE]/30 text-[#22D3EE] inline-flex items-center justify-center">
              <ShieldCheck className="w-4 h-4" />
            </span>
            <span>CyberShield</span>
          </button>

          <h1 className="font-display font-bold text-3xl leading-tight mt-14 mb-4 text-balance">
            Practice Spotting Real-World Cyber Threats Safely.
          </h1>
          <p className="text-slate-300 text-sm leading-relaxed max-w-md">
            Track your progress across six core cybersecurity domains, challenge yourself in interactive threat labs, and receive tailored feedback on your weak spots.
          </p>
        </div>

        <div className="rounded-xl bg-white/5 border border-white/10 p-5 space-y-2">
          <div className="flex items-center gap-2 text-sm font-semibold text-[#22D3EE]">
            <Lock className="w-4 h-4" />
            <span>Security & Privacy Notice</span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            CyberShield never asks for real banking details, PINs, or live one-time passcodes. All simulated scenarios run safely inside your browser.
          </p>
        </div>
      </aside>

      {/* Right Authentication Form Panel */}
      <main className="lg:col-span-7 flex items-center justify-center p-4 sm:p-8">
        <div className="w-full max-w-md space-y-4">
          <button
            type="button"
            onClick={() => navigate('landing')}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-[#0F172A] cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Home</span>
          </button>

          <Card className="p-6 sm:p-7">
            {mode !== 'forgot' ? (
              <div className="grid grid-cols-2 p-1 bg-slate-100 rounded-lg mb-6" role="tablist">
                <button
                  type="button"
                  role="tab"
                  aria-selected={mode === 'login'}
                  onClick={() => {
                    setMode('login');
                    resetMessages();
                  }}
                  className={`py-2 text-sm font-semibold rounded-md transition-colors cursor-pointer ${
                    mode === 'login' ? 'bg-white text-[#0F172A] shadow-xs' : 'text-slate-600 hover:text-[#0F172A]'
                  }`}
                >
                  Sign In
                </button>
                <button
                  type="button"
                  role="tab"
                  aria-selected={mode === 'register'}
                  onClick={() => {
                    setMode('register');
                    resetMessages();
                  }}
                  className={`py-2 text-sm font-semibold rounded-md transition-colors cursor-pointer ${
                    mode === 'register' ? 'bg-white text-[#0F172A] shadow-xs' : 'text-slate-600 hover:text-[#0F172A]'
                  }`}
                >
                  Create Account
                </button>
              </div>
            ) : (
              <div className="mb-5">
                <h2 className="font-display font-bold text-xl text-[#0F172A]">Reset Password</h2>
                <p className="text-sm text-[#475569] mt-1">
                  Enter your registered email to receive recovery instructions.
                </p>
              </div>
            )}

            {formError && (
              <AlertBanner type="danger" className="mb-5">
                {formError}
              </AlertBanner>
            )}

            {forgotSuccess && (
              <AlertBanner type="success" className="mb-5">
                {forgotSuccess}
              </AlertBanner>
            )}

            {mode === 'login' && (
              <form onSubmit={handleLoginSubmit} noValidate className="space-y-4">
                <div>
                  <label htmlFor="login-email" className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Email Address
                  </label>
                  <input
                    id="login-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className={`w-full h-10 px-3 rounded-lg border text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB] ${
                      fieldErrors.email ? 'border-[#DC2626]' : 'border-slate-300'
                    }`}
                  />
                  {fieldErrors.email && <p className="text-xs text-[#DC2626] mt-1">{fieldErrors.email}</p>}
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label htmlFor="login-password" className="block text-xs font-semibold text-slate-700">
                      Password
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        setMode('forgot');
                        resetMessages();
                      }}
                      className="text-xs font-semibold text-[#2563EB] hover:underline cursor-pointer"
                    >
                      Forgot password?
                    </button>
                  </div>
                  <div className="relative">
                    <input
                      id="login-password"
                      type={showPass ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter your password"
                      className={`w-full h-10 pl-3 pr-10 rounded-lg border text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB] ${
                        fieldErrors.password ? 'border-[#DC2626]' : 'border-slate-300'
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPass((v) => !v)}
                      aria-label={showPass ? 'Hide password' : 'Show password'}
                      className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-slate-500 hover:text-slate-900 rounded-md cursor-pointer"
                    >
                      {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {fieldErrors.password && <p className="text-xs text-[#DC2626] mt-1">{fieldErrors.password}</p>}
                </div>

                <Button type="submit" variant="primary" size="lg" fullWidth>
                  Sign In
                </Button>

                <div className="pt-4 border-t border-slate-200 space-y-2">
                  <p className="text-xs text-[#475569]">
                    Admin console credentials: <code className="font-mono text-[#0F172A]">admin@cybershield.local</code> /{' '}
                    <code className="font-mono text-[#0F172A]">Admin@123</code>
                  </p>
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    fullWidth
                    onClick={() => {
                      setEmail('admin@cybershield.local');
                      setPassword('Admin@123');
                      resetMessages();
                    }}
                  >
                    Fill Admin Credentials
                  </Button>
                </div>
              </form>
            )}

            {mode === 'register' && (
              <form onSubmit={handleRegisterSubmit} noValidate className="space-y-4">
                <div>
                  <label htmlFor="reg-name" className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Full Name
                  </label>
                  <input
                    id="reg-name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g., Priya Nair"
                    className={`w-full h-10 px-3 rounded-lg border text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB] ${
                      fieldErrors.name ? 'border-[#DC2626]' : 'border-slate-300'
                    }`}
                  />
                  {fieldErrors.name && <p className="text-xs text-[#DC2626] mt-1">{fieldErrors.name}</p>}
                </div>

                <div>
                  <label htmlFor="reg-email" className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Email Address
                  </label>
                  <input
                    id="reg-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className={`w-full h-10 px-3 rounded-lg border text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB] ${
                      fieldErrors.email ? 'border-[#DC2626]' : 'border-slate-300'
                    }`}
                  />
                  {fieldErrors.email && <p className="text-xs text-[#DC2626] mt-1">{fieldErrors.email}</p>}
                </div>

                <div>
                  <label htmlFor="reg-password" className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      id="reg-password"
                      type={showPass ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Minimum 8 characters"
                      className={`w-full h-10 pl-3 pr-10 rounded-lg border text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB] ${
                        fieldErrors.password ? 'border-[#DC2626]' : 'border-slate-300'
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPass((v) => !v)}
                      aria-label={showPass ? 'Hide password' : 'Show password'}
                      className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-slate-500 hover:text-slate-900 rounded-md cursor-pointer"
                    >
                      {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  <div className="grid grid-cols-4 gap-1.5 mt-2" aria-hidden="true">
                    {[1, 2, 3, 4].map((step) => (
                      <div
                        key={step}
                        className={`h-1.5 rounded-full transition-colors ${
                          passwordStrength >= step ? strengthColors[passwordStrength] : 'bg-slate-200'
                        }`}
                      />
                    ))}
                  </div>
                  <p className="text-xs text-slate-500 mt-1.5">{strengthLabels[passwordStrength]}</p>
                  {fieldErrors.password && <p className="text-xs text-[#DC2626] mt-1">{fieldErrors.password}</p>}
                </div>

                <Button type="submit" variant="primary" size="lg" fullWidth>
                  Create Free Account
                </Button>
              </form>
            )}

            {mode === 'forgot' && (
              <form onSubmit={handleForgotSubmit} noValidate className="space-y-4">
                <div>
                  <label htmlFor="forgot-email" className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Registered Email Address
                  </label>
                  <input
                    id="forgot-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className={`w-full h-10 px-3 rounded-lg border text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB] ${
                      fieldErrors.email ? 'border-[#DC2626]' : 'border-slate-300'
                    }`}
                  />
                  {fieldErrors.email && <p className="text-xs text-[#DC2626] mt-1">{fieldErrors.email}</p>}
                </div>
                <Button type="submit" variant="primary" size="lg" fullWidth>
                  Send Reset Instructions
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  fullWidth
                  onClick={() => {
                    setMode('login');
                    resetMessages();
                  }}
                >
                  Back to Sign In
                </Button>
              </form>
            )}
          </Card>
        </div>
      </main>
    </div>
  );
};
