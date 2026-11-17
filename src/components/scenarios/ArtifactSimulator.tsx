import React from 'react';
import { Lock, ShieldAlert } from 'lucide-react';
import { ThreatScenario } from '../../types';

interface ArtifactSimulatorProps {
  scenario: ThreatScenario;
  revealFlags: boolean;
}

export const ArtifactSimulator: React.FC<ArtifactSimulatorProps> = ({ scenario, revealFlags }) => {
  const { format, artifact } = scenario;

  if (format === 'email') {
    return (
      <div className="bg-white border border-slate-300 rounded-xl overflow-hidden shadow-sm">
        <div className="bg-slate-100 px-4 py-2.5 border-b border-slate-200 flex items-center justify-between text-xs font-medium text-slate-600">
          <div className="flex items-center gap-1.5" aria-hidden="true">
            <span className="w-2.5 h-2.5 rounded-full bg-slate-300" />
            <span className="w-2.5 h-2.5 rounded-full bg-slate-300" />
            <span className="w-2.5 h-2.5 rounded-full bg-slate-300" />
          </div>
          <span>Simulated Mail Client</span>
        </div>

        <div className="px-5 py-4 bg-slate-50/70 border-b border-slate-200 space-y-1.5 text-[13.5px]">
          <div className="flex flex-wrap items-baseline gap-1.5">
            <span className="font-semibold text-slate-700">From:</span>
            <span className="text-slate-900">{artifact.senderName}</span>
            <span
              className={`font-mono text-xs px-1.5 py-0.5 rounded ${
                revealFlags ? 'bg-[#FEE2E2] text-[#B91C1C] border border-[#FCA5A5] font-semibold' : 'text-slate-600'
              }`}
            >
              &lt;{artifact.senderAddress}&gt;
            </span>
          </div>
          <div className="flex flex-wrap items-baseline gap-1.5">
            <span className="font-semibold text-slate-700">Subject:</span>
            <span
              className={
                revealFlags
                  ? 'bg-[#FEE2E2] text-[#B91C1C] px-1.5 py-0.5 rounded border border-[#FCA5A5] font-semibold'
                  : 'text-slate-900 font-medium'
              }
            >
              {artifact.subject}
            </span>
          </div>
        </div>

        <div className="p-5 text-sm text-[#0F172A] space-y-4">
          <p className="leading-relaxed">{artifact.body}</p>
          <div>
            <span
              className="inline-flex items-center px-4 py-2 rounded-lg bg-[#2563EB] text-white text-xs font-semibold opacity-90 cursor-not-allowed select-none"
              title="Link disabled inside training sandbox"
            >
              {artifact.ctaText || 'Verify Now'}
            </span>
          </div>
          <div className="p-2.5 rounded-lg bg-slate-50 border border-dashed border-slate-300 font-mono text-xs text-slate-600 break-all">
            <span className="font-sans font-semibold text-slate-700 mr-1.5">Destination preview:</span>
            <span className={revealFlags ? 'bg-[#FEE2E2] text-[#B91C1C] px-1 rounded font-semibold' : ''}>
              {artifact.hoverUrl}
            </span>
          </div>
        </div>
      </div>
    );
  }

  if (format === 'sms') {
    return (
      <div className="bg-slate-100 border border-slate-300 rounded-xl p-6 flex justify-center">
        <div className="w-full max-w-[340px] bg-[#F8FAFC] border-[7px] border-[#0B1220] rounded-[26px] overflow-hidden shadow-md">
          <div className="bg-white py-3 px-4 text-center border-b border-slate-200 text-xs font-semibold text-[#0F172A]">
            {artifact.senderName}
          </div>
          <div className="p-4 space-y-3 min-h-[190px]">
            <div className="bg-slate-200 text-[#0F172A] text-[13.5px] leading-relaxed p-3.5 rounded-2xl rounded-bl-sm">
              {artifact.body}
            </div>
            {revealFlags && (
              <div className="p-2.5 rounded-lg bg-[#FEE2E2] border border-[#FCA5A5] text-[#991B1B] text-xs font-medium flex items-start gap-2">
                <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
                <span>Social engineering cue: Requests sensitive PIN/OTP confirmation under urgent pressure.</span>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // 'web' or 'payment' simulated browser frame
  return (
    <div className="bg-white border border-slate-300 rounded-xl overflow-hidden shadow-sm">
      <div className="bg-slate-100 px-3.5 py-2.5 border-b border-slate-200 flex items-center gap-3">
        <div className="flex items-center gap-1.5 shrink-0" aria-hidden="true">
          <span className="w-2.5 h-2.5 rounded-full bg-slate-300" />
          <span className="w-2.5 h-2.5 rounded-full bg-slate-300" />
          <span className="w-2.5 h-2.5 rounded-full bg-slate-300" />
        </div>
        <div className="flex-1 min-w-0 bg-white border border-slate-300 rounded-md px-2.5 py-1 flex items-center gap-2 font-mono text-xs overflow-hidden">
          <span
            className={`shrink-0 font-sans font-semibold flex items-center gap-1 ${
              artifact.https ? 'text-[#16A34A]' : 'text-[#DC2626]'
            }`}
          >
            {artifact.https ? <Lock className="w-3 h-3" /> : <ShieldAlert className="w-3 h-3" />}
            {artifact.https ? 'HTTPS' : 'Not Secure'}
          </span>
          <span className={`truncate ${revealFlags ? 'bg-[#FEE2E2] text-[#B91C1C] px-1 rounded font-semibold' : 'text-slate-700'}`}>
            {artifact.url}
          </span>
        </div>
      </div>

      <div className="p-6 bg-slate-50/50">
        <div className="max-w-md mx-auto bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
          {format === 'payment' && (
            <div className="pb-3 border-b border-slate-200 flex items-center justify-between gap-2 text-sm">
              <span className="font-semibold text-[#0F172A]">{artifact.merchant || 'Merchant Checkout'}</span>
              <span className="font-mono font-semibold text-[#2563EB] tabular-nums">{artifact.amount}</span>
            </div>
          )}
          {artifact.heading && <h3 className="text-base font-semibold text-[#0F172A]">{artifact.heading}</h3>}

          <div className="space-y-3">
            {(artifact.fields || []).map((field, idx) => {
              const suspiciousField =
                revealFlags && (field.toLowerCase().includes('otp') || field.toLowerCase().includes('atm pin'));
              return (
                <div key={idx}>
                  <label
                    className={`block text-xs font-semibold mb-1 ${
                      suspiciousField ? 'text-[#B91C1C]' : 'text-slate-700'
                    }`}
                  >
                    {field}
                    {suspiciousField ? ' — Suspicious Request' : ''}
                  </label>
                  <input
                    type="text"
                    disabled
                    placeholder="Input disabled in safe sandbox"
                    className={`w-full px-3 py-2 text-xs rounded-lg border bg-slate-100 text-slate-500 cursor-not-allowed ${
                      suspiciousField ? 'border-[#FCA5A5] bg-[#FEE2E2]/40' : 'border-slate-300'
                    }`}
                  />
                </div>
              );
            })}
          </div>

          <button
            type="button"
            disabled
            className="w-full h-10 rounded-lg bg-[#2563EB]/60 text-white text-sm font-semibold cursor-not-allowed"
          >
            {format === 'payment' ? 'Pay Now (Disabled in Sandbox)' : 'Continue (Disabled in Sandbox)'}
          </button>
        </div>
      </div>
    </div>
  );
};
