import React from 'react';
import { Sparkles } from 'lucide-react';
import { InstallPwaButton } from '../features/InstallPwaButton';

export const Header: React.FC = () => {
  return (
    <header className="pt-14 pb-10 px-4 text-center max-w-4xl mx-auto relative z-10">
      {/* Brand Header Bar / Logo Badge & Install App */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-6">
        <div className="inline-flex items-center gap-3.5 px-5 py-2.5 bg-white/95 backdrop-blur-md border border-slate-200/90 rounded-2xl shadow-sm hover:shadow-md transition-all">
          <img 
            src="/favicon.svg" 
            alt="GovtTech AI Logo" 
            className="w-10 h-10 rounded-xl shadow-sm drop-shadow" 
          />
          <div className="text-left">
            <div className="text-lg font-black tracking-tight text-slate-900 leading-tight flex items-center gap-2">
              GovtTech <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">AI</span>
              <span className="px-1.5 py-0.5 text-[10px] font-extrabold bg-blue-50 text-blue-700 rounded-md border border-blue-200/70 tracking-wider">
                ENGINE
              </span>
            </div>
            <div className="text-[11px] font-semibold text-slate-500 tracking-wider uppercase">
              Official Indian Govt & Tech Jobs
            </div>
          </div>
        </div>

        <InstallPwaButton />
      </div>

      <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-blue-50/80 backdrop-blur-sm border border-blue-100 rounded-full text-blue-700 font-semibold text-xs mb-5 shadow-sm">
        <Sparkles className="w-3.5 h-3.5 text-blue-600" />
        <span>Powered by Sentence Transformers & Zero-Trust Verification</span>
      </div>

      <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-slate-900 tracking-tight mb-5 leading-tight">
        Next-Gen Govt Job <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">Discovery Engine</span>
      </h1>
      <p className="text-base sm:text-lg text-slate-600 mb-6 max-w-2xl mx-auto font-medium leading-relaxed">
        Stop reading 50-page PDFs. Our AI analyzes official notifications, verifies authenticity, and instantly matches you with the right role.
      </p>
    </header>
  );
};
