import React from 'react';
import { ShieldCheck, AlertTriangle, ExternalLink, X, Lock, CheckCircle2 } from 'lucide-react';
import type { ExternalRedirectModalProps } from '../../types';

export type { ExternalRedirectModalProps };

export const ExternalRedirectModal: React.FC<ExternalRedirectModalProps> = ({ job, onClose }) => {
  let domain = job.verifiedDomain || '';
  if (!domain && job.applyUrl) {
    try {
      domain = new URL(job.applyUrl).hostname;
    } catch {
      domain = job.applyUrl;
    }
  }
  const isGov = domain.endsWith('.gov.in') || domain.endsWith('.nic.in');

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in overscroll-contain"
      onWheel={(e) => e.stopPropagation()}
    >
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden border border-slate-100 animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="p-6 border-b border-slate-100 bg-gradient-to-r from-emerald-50/70 via-teal-50/40 to-blue-50/30 flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-100/80 border border-emerald-200 flex items-center justify-center text-emerald-700 shadow-sm shrink-0">
              <ShieldCheck className="w-7 h-7" />
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-black tracking-wider uppercase bg-emerald-100 text-emerald-800 mb-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
                {isGov ? 'Official Government Portal' : 'Verified Recruitment Authority'}
              </div>
              <h3 className="text-lg font-bold text-slate-900">Official External Portal Alert</h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-white rounded-xl transition-colors shadow-sm"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-5 text-slate-700">
          <div>
            <span className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
              Destination Authority
            </span>
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3.5 flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-700 shadow-sm shrink-0">
                <Lock className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-bold text-slate-900 truncate">{domain}</p>
                <p className="text-xs text-slate-500 font-mono truncate">{job.applyUrl}</p>
              </div>
            </div>
          </div>

          {/* Safety Advisory Notice */}
          <div className="bg-amber-50/80 border border-amber-200/90 rounded-2xl p-4 flex gap-3 text-amber-900">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div className="text-xs leading-relaxed space-y-1">
              <p className="font-bold">Anti-Phishing & Trust Notice</p>
              <p>
                You are being redirected to an official government/recruitment portal. 
                <span className="font-bold"> GovtTech AI never asks for money, application fees, or credentials.</span>
              </p>
              <p className="text-amber-800 font-medium pt-1">
                Always verify the <span className="font-bold underline">.gov.in</span> or official domain before making any statutory payments.
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="p-5 border-t border-slate-100 bg-slate-50/80 flex flex-col sm:flex-row gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-3 px-4 bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 font-semibold rounded-xl text-sm transition-colors text-center"
          >
            Cancel
          </button>
          <a
            href={job.applyUrl}
            target="_blank"
            rel="noopener noreferrer nofollow"
            onClick={onClose}
            className="flex-1 py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-sm transition-all shadow-lg shadow-emerald-600/25 text-center flex items-center justify-center gap-2 group"
          >
            <span>Continue to Official Site</span>
            <ExternalLink className="w-4 h-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </a>
        </div>

      </div>
    </div>
  );
};
