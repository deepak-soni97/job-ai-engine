import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Sparkles, HelpCircle, GraduationCap, Briefcase, ChevronRight, X, Check } from 'lucide-react';
import { getTagInsight } from '../../constants/tagGlossary';
import type { TagBadgeProps } from '../../types';

export type { TagBadgeProps };

export const TagBadge: React.FC<TagBadgeProps> = ({ tag, departmentContext, className = '' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const insight = React.useMemo(() => getTagInsight(tag, departmentContext), [tag, departmentContext]);
  const [isMobile, setIsMobile] = useState(() => typeof window !== 'undefined' ? window.innerWidth < 640 : false);

  // Window resize listener
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 640);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Close when pressing Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  // Lock body scroll when popup is active
  useEffect(() => {
    if (isOpen) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [isOpen]);

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsOpen(prev => !prev);
  };

  if (!insight) return null;

  return (
    <>
      {/* Interactive Tag Pill */}
      <button
        type="button"
        onClick={handleToggle}
        className={`group inline-flex items-center gap-1.5 px-2.5 py-1 bg-slate-100 hover:bg-blue-50 text-slate-700 hover:text-blue-700 text-xs font-semibold rounded-lg transition-all duration-150 border border-slate-200/80 hover:border-blue-300 shadow-2xs hover:shadow-xs cursor-pointer select-none ${
          isOpen ? 'bg-blue-50 text-blue-700 border-blue-300 ring-2 ring-blue-100' : ''
        } ${className}`}
        title={`Click to learn what "${tag}" role involves`}
      >
        <span>{tag}</span>
        <HelpCircle className="w-3 h-3 text-slate-400 group-hover:text-blue-500 transition-colors shrink-0 opacity-70 group-hover:opacity-100" />
      </button>

      {/* PORTAL MODAL DIALOG (Rendered directly into document.body to avoid any clipping by parent modals) */}
      {isOpen && typeof document !== 'undefined' && createPortal(
        <div 
          className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-900/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
          onClick={() => setIsOpen(false)}
        >
          {/* Main Dialog / Bottom Sheet Card */}
          <div 
            className="relative w-full sm:max-w-md max-h-[88vh] bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden animate-in slide-in-from-bottom sm:zoom-in-95 duration-200 text-left"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Mobile Top Drag Indicator */}
            {isMobile && (
              <div className="pt-2.5 pb-1 flex justify-center shrink-0">
                <div className="w-10 h-1 bg-slate-300 rounded-full" />
              </div>
            )}

            {/* Modal Header */}
            <div className="px-5 py-3.5 border-b border-slate-100 flex items-start justify-between gap-3 shrink-0 bg-slate-50/60">
              <div>
                <div className="flex items-center gap-1.5 mb-1">
                  <span className="text-base">{insight.icon}</span>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700 bg-blue-100/80 px-2 py-0.5 rounded-full border border-blue-200/80">
                    {insight.category}
                  </span>
                </div>
                <h3 className="font-bold text-base text-slate-900 flex items-center gap-1.5">
                  <span>{insight.tag}</span>
                  <span className="text-xs font-medium text-slate-400 font-normal">· Role Overview</span>
                </h3>
              </div>

              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200/70 rounded-xl transition-colors shrink-0 cursor-pointer"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Content Body */}
            <div className="overflow-y-auto px-5 py-4 space-y-3.5 text-slate-700 scrollbar-thin scrollbar-thumb-slate-300">
              {/* Professional Role Overview Callout */}
              <div className="bg-gradient-to-br from-blue-50/90 via-slate-50 to-indigo-50/70 border border-blue-200/80 rounded-xl p-3.5">
                <div className="flex items-center gap-1.5 text-[11px] font-bold text-blue-900 mb-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                  <span className="uppercase tracking-wider">What Does This Role Entail?</span>
                </div>
                <p className="text-xs sm:text-sm font-semibold text-slate-800 leading-relaxed break-words">
                  {insight.roleSummary}
                </p>
              </div>

              {/* Detailed Context & Scope */}
              {insight.detailedScope && (
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-medium break-words">
                  {insight.detailedScope}
                </p>
              )}

              {/* Core Responsibilities */}
              {insight.coreResponsibilities && insight.coreResponsibilities.length > 0 && (
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/80">
                  <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-2">
                    <Briefcase className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                    <span>Key Job Responsibilities</span>
                  </div>
                  <ul className="space-y-2 text-xs sm:text-sm text-slate-700 font-medium">
                    {insight.coreResponsibilities.map((duty, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <ChevronRight className="w-3.5 h-3.5 text-blue-500 shrink-0 mt-0.5" />
                        <span className="break-words">{duty}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Typical Qualifications */}
              <div className="flex items-start gap-2.5 bg-emerald-50/80 border border-emerald-200/80 rounded-xl p-3 text-xs sm:text-sm">
                <GraduationCap className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-emerald-950 block text-[11px] uppercase tracking-wider mb-0.5">
                    Standard Educational Eligibility
                  </span>
                  <span className="text-emerald-900 font-medium leading-snug block break-words">
                    {insight.typicalQualification}
                  </span>
                </div>
              </div>

              {/* Career Growth Path (if available) */}
              {insight.careerScope && (
                <div className="bg-purple-50/80 border border-purple-200/80 rounded-xl p-3 text-xs sm:text-sm">
                  <span className="font-bold text-purple-950 block text-[11px] uppercase tracking-wider mb-0.5">
                    Typical Career Progression
                  </span>
                  <span className="text-purple-900 font-semibold text-xs block break-words">
                    {insight.careerScope}
                  </span>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-3.5 px-5 border-t border-slate-100 bg-slate-50 flex items-center justify-between shrink-0">
              <span className="text-[11px] font-semibold text-blue-600">GovtTech Knowledge Base</span>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Got it</span>
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
};
