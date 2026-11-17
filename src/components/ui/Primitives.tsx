import React from 'react';
import { AlertTriangle, CheckCircle2, Info, X, XCircle } from 'lucide-react';
import { ToastItem } from '../../types';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'dark-outline';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  className = '',
  children,
  ...props
}) => {
  const base =
    'inline-flex items-center justify-center gap-2 font-semibold rounded-lg transition-colors duration-150 whitespace-nowrap shrink-0 cursor-pointer disabled:opacity-45 disabled:cursor-not-allowed focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2563EB]';
  const variants: Record<string, string> = {
    primary: 'bg-[#2563EB] text-white hover:bg-[#1D4ED8]',
    secondary: 'bg-white text-[#0F172A] border border-slate-300 hover:bg-slate-50',
    ghost: 'bg-transparent text-slate-600 hover:bg-slate-100 hover:text-slate-900',
    danger: 'bg-[#DC2626] text-white hover:bg-[#B91C1C]',
    'dark-outline': 'bg-white/5 text-white border border-white/25 hover:bg-white/15',
  };
  const sizes: Record<string, string> = {
    sm: 'h-9 px-3 text-[13px]',
    md: 'h-10 px-4 text-sm',
    lg: 'h-11 px-5 text-[15px]',
  };

  return (
    <button
      className={`${base} ${variants[variant]} ${sizes[size]} ${fullWidth ? 'w-full' : ''} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hoverable?: boolean;
}

export const Card: React.FC<CardProps> = ({ children, className = '', hoverable = false }) => (
  <div
    className={`bg-white border border-slate-200 rounded-xl shadow-[0_1px_3px_rgba(11,18,32,0.05)] ${
      hoverable ? 'transition-all duration-150 hover:-translate-y-0.5 hover:shadow-md hover:border-slate-300' : ''
    } ${className}`}
  >
    {children}
  </div>
);

interface ProgressBarProps {
  value: number;
  tone?: 'royal' | 'success' | 'warning' | 'danger';
  className?: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({ value, tone = 'royal', className = '' }) => {
  const clamped = Math.max(0, Math.min(100, value));
  const tones: Record<string, string> = {
    royal: 'bg-[#2563EB]',
    success: 'bg-[#16A34A]',
    warning: 'bg-[#D97706]',
    danger: 'bg-[#DC2626]',
  };
  return (
    <div className={`w-full h-2 bg-slate-200 rounded-full overflow-hidden ${className}`} role="progressbar" aria-valuenow={clamped} aria-valuemin={0} aria-valuemax={100}>
      <div className={`h-full rounded-full transition-all duration-300 ${tones[tone]}`} style={{ width: `${clamped}%` }} />
    </div>
  );
};

interface AlertBannerProps {
  type: 'info' | 'success' | 'warning' | 'danger';
  title?: string;
  children: React.ReactNode;
  className?: string;
}

export const AlertBanner: React.FC<AlertBannerProps> = ({ type, title, children, className = '' }) => {
  const styles: Record<string, string> = {
    info: 'bg-[#EFF6FF] border-[#BFDBFE] text-[#1E3A8A]',
    success: 'bg-[#DCFCE7] border-[#86EFAC] text-[#14532D]',
    warning: 'bg-[#FEF3C7] border-[#FDE68A] text-[#78350F]',
    danger: 'bg-[#FEE2E2] border-[#FCA5A5] text-[#7F1D1D]',
  };
  const icons = {
    info: <Info className="w-4 h-4 shrink-0 mt-0.5 text-[#2563EB]" aria-hidden="true" />,
    success: <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-[#16A34A]" aria-hidden="true" />,
    warning: <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-[#D97706]" aria-hidden="true" />,
    danger: <XCircle className="w-4 h-4 shrink-0 mt-0.5 text-[#DC2626]" aria-hidden="true" />,
  };

  return (
    <div className={`flex items-start gap-3 p-3.5 rounded-lg border text-sm ${styles[type]} ${className}`} role="status">
      {icons[type]}
      <div className="min-w-0 flex-1">
        {title && <div className="font-semibold mb-0.5">{title}</div>}
        <div>{children}</div>
      </div>
    </div>
  );
};

interface EmptyStateProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  action?: React.ReactNode;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ icon, title, description, action }) => (
  <div className="text-center py-12 px-6">
    <div className="w-12 h-12 rounded-xl bg-[#EFF6FF] text-[#2563EB] inline-flex items-center justify-center mb-3">
      {icon}
    </div>
    <h3 className="text-base font-semibold text-[#0F172A] mb-1.5">{title}</h3>
    <p className="text-sm text-[#475569] max-w-md mx-auto mb-5">{description}</p>
    {action}
  </div>
);

interface ModalProps {
  open: boolean;
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}

export const Modal: React.FC<ModalProps> = ({ open, title, onClose, children }) => {
  if (!open) return null;
  return (
    <div
      className="fixed inset-0 z-50 bg-[#0B1220]/60 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6">
        <div className="flex items-center justify-between gap-4 pb-4 mb-5 border-b border-slate-200">
          <h3 className="text-lg font-semibold text-[#0F172A]">{title}</h3>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-900 cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
};

export const ToastContainer: React.FC<{ toasts: ToastItem[]; onDismiss: (id: string) => void }> = ({
  toasts,
  onDismiss,
}) => {
  if (!toasts.length) return null;
  const accents = {
    info: 'text-[#22D3EE]',
    success: 'text-[#4ADE80]',
    warning: 'text-[#FBBF24]',
    danger: 'text-[#F87171]',
  };
  return (
    <div className="fixed top-4 right-4 z-[60] flex flex-col gap-2.5 max-w-sm w-full pointer-events-none" aria-live="polite">
      {toasts.map((t) => (
        <div
          key={t.id}
          className="pointer-events-auto bg-[#0B1220] text-white px-4 py-3 rounded-xl shadow-lg border border-slate-800 flex items-center justify-between gap-3 text-sm"
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <span className={`shrink-0 ${accents[t.type]}`}>
              {t.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : t.type === 'danger' ? <XCircle className="w-4 h-4" /> : <Info className="w-4 h-4" />}
            </span>
            <span className="truncate">{t.message}</span>
          </div>
          <button onClick={() => onDismiss(t.id)} className="text-slate-400 hover:text-white cursor-pointer" aria-label="Dismiss notification">
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  );
};

export interface ChartPoint {
  label: string;
  value: number;
}

export const ScoreTrendChart: React.FC<{ points: ChartPoint[]; emptyText: string }> = ({ points, emptyText }) => {
  if (!points.length) {
    return (
      <div className="py-10 text-center text-sm text-[#475569]">
        {emptyText}
      </div>
    );
  }

  const w = 520;
  const h = 190;
  const padX = 34;
  const padY = 28;
  const slice = points.slice(-8);
  const stepX = slice.length > 1 ? (w - padX * 2) / (slice.length - 1) : 0;

  const coords = slice.map((pt, idx) => {
    const x = slice.length === 1 ? w / 2 : padX + idx * stepX;
    const y = h - padY - (pt.value / 100) * (h - padY * 2);
    return { ...pt, x, y };
  });

  const polyline = coords.map((c) => `${c.x},${c.y}`).join(' ');
  const area =
    coords.length > 1 ? `${coords[0].x},${h - padY} ${polyline} ${coords[coords.length - 1].x},${h - padY}` : '';

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-auto block" role="img" aria-label="Assessment score progression chart">
      <line x1={padX} y1={padY} x2={w - padX} y2={padY} stroke="#E2E8F0" strokeDasharray="4 4" />
      <line x1={padX} y1={h / 2} x2={w - padX} y2={h / 2} stroke="#E2E8F0" strokeDasharray="4 4" />
      <line x1={padX} y1={h - padY} x2={w - padX} y2={h - padY} stroke="#CBD5E1" />
      {area && <polygon points={area} fill="rgba(37, 99, 235, 0.09)" />}
      {coords.length > 1 && (
        <polyline
          fill="none"
          stroke="#2563EB"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          points={polyline}
        />
      )}
      {coords.map((c, i) => (
        <g key={`${c.label}-${i}`}>
          <circle cx={c.x} cy={c.y} r="4.5" fill="#2563EB" stroke="#FFFFFF" strokeWidth="2" />
          <text x={c.x} y={c.y - 10} textAnchor="middle" fontSize="11" fontWeight="600" fill="#0F172A">
            {c.value}%
          </text>
          <text x={c.x} y={h - 6} textAnchor="middle" fontSize="10.5" fill="#64748B">
            {c.label}
          </text>
        </g>
      ))}
    </svg>
  );
};
