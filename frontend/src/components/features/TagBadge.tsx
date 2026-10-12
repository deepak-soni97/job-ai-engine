import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Sparkles, HelpCircle, GraduationCap, Briefcase, ChevronRight, X } from 'lucide-react';
import { getTagInsight } from '../../constants/tagGlossary';
import type { TagBadgeProps } from '../../types';

export type { TagBadgeProps };

export const TagBadge: React.FC<TagBadgeProps> = ({ tag, departmentContext, className = '' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const insight = React.useMemo(() => getTagInsight(tag, departmentContext), [tag, departmentContext]);
  const [isMobile, setIsMobile] = useState(() => typeof window !== 'undefined' ? window.innerWidth < 640 : false);
  const [desktopAlign, setDesktopAlign] = useState<'center' | 'left' | 'right'>('center');
  const [desktopPlacement, setDesktopPlacement] = useState<'top' | 'bottom'>('top');
  
  const containerRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Window resize listener to detect mobile vs desktop
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 640);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Position calculation for desktop popover collision avoidance
  useEffect(() => {
    if (isOpen && containerRef.current && !isMobile) {
      const rect = containerRef.current.getBoundingClientRect();
      
      // Horizontal bounds checking
      if (rect.left < 200) {
        setDesktopAlign('left');
      } else if (window.innerWidth - rect.right < 200) {
        setDesktopAlign('right');
      } else {
        setDesktopAlign('center');
      }

      // Vertical bounds checking (if near top of screen, flip downwards)
      if (rect.top < 360) {
        setDesktopPlacement('bottom');
      } else {
        setDesktopPlacement('top');
      }
    }
  }, [isOpen, isMobile]);

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

  // Lock body scroll on mobile when sheet is active
  useEffect(() => {
    if (isMobile && isOpen) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [isMobile, isOpen]);

  const handleMouseEnter = () => {
    if (isMobile) return;
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      setIsOpen(true);
    }, 120); // slight debounce for smooth UX
  };

  const handleMouseLeave = () => {
    if (isMobile) return;
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      setIsOpen(false);
    }, 180);
  };

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsOpen(prev => !prev);
  };

  // Close when clicking outside on desktop
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (!isMobile && containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen && !isMobile) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, isMobile]);

  if (!insight) return null;

  // Reusable body content for both desktop tooltip and mobile bottom sheet
  const renderInsightBody = () => (
    <>
      {/* Professional Role Overview Callout */}
      <div className="bg-gradient-to-br from-blue-50/90 via-slate-50 to-indigo-50/70 border border-blue-200/80 rounded-xl p-3 mb-2.5">
        <div className="flex items-center gap-1.5 text-[11px] font-bold text-blue-900 mb-1">
          <Sparkles className="w-3.5 h-3.5 text-blue-600 shrink-0" />
          <span className="uppercase tracking-wider">What Does This Role Entail?</span>
        </div>
        <p className="text-xs font-semibold text-slate-800 leading-relaxed">
          {insight.roleSummary}
        </p>
      </div>

      {/* Detailed Context & Scope */}
      {insight.detailedScope && (
        <p className="text-xs text-slate-600 leading-relaxed mb-3 font-medium">
          {insight.detailedScope}
        </p>
      )}

      {/* Core Responsibilities */}
      {insight.coreResponsibilities && insight.coreResponsibilities.length > 0 && (
        <div className="mb-3 bg-slate-50 p-2.5 rounded-xl border border-slate-200/80">
          <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
            <Briefcase className="w-3.5 h-3.5 text-blue-600 shrink-0" />
            <span>Key Job Responsibilities</span>
          </div>
          <ul className="space-y-1.5 text-xs text-slate-700 font-medium">
            {insight.coreResponsibilities.map((duty, idx) => (
              <li key={idx} className="flex items-start gap-1.5">
                <ChevronRight className="w-3.5 h-3.5 text-blue-500 shrink-0 mt-0.5" />
                <span>{duty}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Typical Qualifications */}
      <div className="flex items-start gap-2.5 bg-emerald-50/70 border border-emerald-200/80 rounded-xl p-2.5 text-xs mb-2.5">
        <GraduationCap className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
        <div>
          <span className="font-bold text-emerald-950 block text-[11px] uppercase tracking-wider mb-0.5">
            Standard Educational Eligibility
          </span>
          <span className="text-emerald-900 font-medium leading-snug block">
            {insight.typicalQualification}
          </span>
        </div>
      </div>

      {/* Career Growth Path (if available) */}
      {insight.careerScope && (
        <div className="bg-purple-50/70 border border-purple-200/70 rounded-xl p-2.5 text-xs mb-2">
          <span className="font-bold text-purple-950 block text-[11px] uppercase tracking-wider mb-0.5">
            Typical Career Progression
          </span>
          <span className="text-purple-900 font-semibold text-[11px]">
            {insight.careerScope}
          </span>
        </div>
      )}
    </>
  );

  return (
    <div 
      ref={containerRef}
      className="relative inline-block"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Interactive Tag Pill */}
      <button
        type="button"
        onClick={handleToggle}
        className={`group inline-flex items-center gap-1.5 px-2.5 py-1 bg-slate-100 hover:bg-blue-50 text-slate-700 hover:text-blue-700 text-xs font-semibold rounded-lg transition-all duration-150 border border-slate-200/80 hover:border-blue-300 shadow-2xs hover:shadow-xs cursor-pointer select-none ${
          isOpen ? 'bg-blue-50 text-blue-700 border-blue-300 ring-2 ring-blue-100' : ''
        } ${className}`}
        title={`Click or hover to learn what "${tag}" role involves`}
      >
        <span>{tag}</span>
        <HelpCircle className="w-3 h-3 text-slate-400 group-hover:text-blue-500 transition-colors shrink-0 opacity-70 group-hover:opacity-100" />
      </button>

      {/* DESKTOP POPUP CARD (Rendered locally in-place) */}
      {!isMobile && isOpen && (
        <div 
          className={`absolute ${
            desktopPlacement === 'top' ? 'bottom-full mb-2' : 'top-full mt-2'
          } ${
            desktopAlign === 'left' 
              ? 'left-0' 
              : desktopAlign === 'right' 
                ? 'right-0' 
                : 'left-1/2 -translate-x-1/2'
          } w-88 sm:w-96 z-50 bg-white/95 backdrop-blur-md border border-slate-200 shadow-2xl rounded-2xl p-4 text-left animate-in fade-in zoom-in-95 duration-150 text-slate-800`}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Card Arrow */}
          <div 
            className={`absolute ${
              desktopPlacement === 'top'
                ? 'top-full -mt-1 border-4 border-transparent border-t-white'
                : 'bottom-full -mb-1 border-4 border-transparent border-b-white'
            } ${
              desktopAlign === 'left'
                ? 'left-6'
                : desktopAlign === 'right'
                  ? 'right-6'
                  : 'left-1/2 -translate-x-1/2'
            }`} 
          />

          {/* Header */}
          <div className="flex items-start justify-between gap-2 border-b border-slate-100 pb-2.5 mb-2.5">
            <div>
              <div className="flex items-center gap-1.5 mb-1">
                <span className="text-sm">{insight.icon}</span>
                <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200/60">
                  {insight.category}
                </span>
              </div>
              <h4 className="font-bold text-sm text-slate-900 flex items-center gap-1.5">
                <span>{insight.tag}</span>
                <span className="text-[11px] font-medium text-slate-400 font-normal">Role Overview</span>
              </h4>
            </div>

            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors shrink-0"
              title="Close"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Body */}
          {renderInsightBody()}

          {/* Footer note */}
          <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400">
            <span>💡 Click to toggle</span>
            <span className="font-semibold text-blue-600">GovtTech Knowledge Base</span>
          </div>
        </div>
      )}

      {/* MOBILE BOTTOM SHEET MODAL (Rendered via React Portal directly into body) */}
      {isMobile && isOpen && typeof document !== 'undefined' && createPortal(
        <div className="fixed inset-0 z-[100] flex flex-col justify-end">
          {/* Dimmed Backdrop */}
          <div 
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
            onClick={() => setIsOpen(false)}
          />

          {/* Bottom Sheet Drawer */}
          <div 
            className="relative z-10 w-full max-h-[85vh] bg-white rounded-t-3xl shadow-2xl border-t border-slate-200 flex flex-col animate-in slide-in-from-bottom duration-250 text-left"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Top Drag Handle */}
            <div className="pt-3 pb-1 flex justify-center shrink-0">
              <div className="w-12 h-1.5 bg-slate-300 rounded-full" />
            </div>

            {/* Mobile Header */}
            <div className="px-5 py-3 border-b border-slate-100 flex items-start justify-between gap-3 shrink-0">
              <div>
                <div className="flex items-center gap-1.5 mb-1">
                  <span className="text-sm">{insight.icon}</span>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200/60">
                    {insight.category}
                  </span>
                </div>
                <h3 className="font-bold text-base text-slate-900">
                  {insight.tag}
                </h3>
              </div>

              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-colors shrink-0"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Content Body */}
            <div className="overflow-y-auto px-5 py-3">
              {renderInsightBody()}
            </div>

            {/* Mobile Footer with dismiss button */}
            <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between shrink-0">
              <span className="text-[11px] font-semibold text-blue-600">GovtTech Knowledge Base</span>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold text-xs rounded-xl shadow-xs transition-colors"
              >
                Done
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};
