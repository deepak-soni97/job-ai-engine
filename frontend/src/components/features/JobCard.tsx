import React from 'react';
import { Calendar, Building2, Briefcase, FileText, MapPin, Users, Banknote, Clock, CheckCircle2, AlertTriangle, XCircle, ShieldCheck, SlidersHorizontal, ExternalLink } from 'lucide-react';
import type { JobCardProps } from '../../types';
import { TagBadge } from './TagBadge';

export type { JobCardProps };

export const JobCard: React.FC<JobCardProps> = ({ job, onQuickSummary, onDirectApply }) => {
  const isEligible = job.isEligible !== false;
  const isUnchecked = job.eligibilityStatus === 'Unchecked' || job.matchScore === null || job.matchScore === undefined;

  return (
    <div className={`bg-white rounded-2xl p-6 border transition-all duration-300 group shadow-sm hover:shadow-xl ${!isEligible ? 'border-rose-100 bg-rose-50/10' : 'border-slate-100'
      }`}>
      <div className="flex flex-col md:flex-row gap-6">

        {/* Left Col: Job Details */}
        <div className="flex-1">
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <span className="px-2.5 py-1 bg-amber-50 text-amber-700 text-xs font-bold rounded-md tracking-wider uppercase">
              {job.selectionMode}
            </span>
            <span className="text-xs font-semibold text-slate-500 flex items-center gap-1 bg-slate-50 px-2.5 py-1 rounded-md border border-slate-100">
              <Building2 className="w-3.5 h-3.5 text-slate-400" /> {job.sector}
            </span>
            {job.isVerifiedOfficial && job.verifiedDomain && (
              <span className="text-xs font-bold text-emerald-800 bg-emerald-50 border border-emerald-200/90 px-2.5 py-1 rounded-md flex items-center gap-1.5 shadow-sm">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>Verified: {job.verifiedDomain}</span>
              </span>
            )}
            {job.vacancies && (
              <span className="text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-100 px-2.5 py-1 rounded-md flex items-center gap-1">
                <Users className="w-3.5 h-3.5 text-emerald-600" /> {job.vacancies}
              </span>
            )}
            {job.positions && job.positions.length > 1 && (
              <span className="text-xs font-bold text-blue-700 bg-blue-50 border border-blue-200 px-2.5 py-1 rounded-md flex items-center gap-1.5 shadow-2xs">
                <Briefcase className="w-3.5 h-3.5 text-blue-600" />
                <span>{job.positions.length} Distinct Posts</span>
              </span>
            )}
            {job.location && (
              <span className="text-xs font-semibold text-rose-700 bg-rose-50 border border-rose-100 px-2.5 py-1 rounded-md flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-rose-500" /> {job.location}
              </span>
            )}
            {job.isNew && (
              <div className="ml-auto flex items-center">
                <div className="px-3 py-1 bg-gradient-to-br from-rose-400 to-rose-600 text-white text-xs font-black tracking-widest rounded shadow-[0_4px_0_0_rgb(159,18,57)] -translate-y-1 transform animate-pulse uppercase">
                  NEW
                </div>
              </div>
            )}
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-1">
            <h3 className="text-xl font-bold text-blue-600 group-hover:text-blue-700 transition-colors">
              {job.title}
            </h3>
            {job.salary && (
              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200/80 rounded-lg text-emerald-800 text-xs font-bold shadow-sm shrink-0">
                <Banknote className="w-4 h-4 text-emerald-600" />
                <span>{job.salary}</span>
              </div>
            )}
          </div>
          <p className="text-slate-600 text-sm font-medium mb-3">{job.department}</p>

          {/* AI Eligibility Reasoning Pill */}
          {!isUnchecked && !isEligible && job.verdictReason && (
            <div className="mb-3 px-3.5 py-2 bg-rose-50/90 border border-rose-200 rounded-xl flex items-start gap-2 text-xs font-semibold text-rose-800 shadow-sm animate-in fade-in">
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span>{job.verdictReason}</span>
            </div>
          )}

          {!isUnchecked && isEligible && job.verdictReason && (
            <div className="mb-3 px-3.5 py-1.5 bg-emerald-50/80 border border-emerald-200/80 rounded-xl flex items-center gap-2 text-xs font-semibold text-emerald-800 shadow-sm animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{job.verdictReason}</span>
            </div>
          )}

          <div className="flex flex-wrap gap-2 mb-4">
            {job.tags.map((tag, idx) => (
              <TagBadge key={idx} tag={tag} departmentContext={job.department} />
            ))}
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-100">
            <div>
              <span className="block text-xs font-semibold text-slate-400 mb-0.5">Important Date</span>
              <div className="flex items-center gap-1.5 text-xs sm:text-sm font-semibold">
                <Calendar className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                <span className={
                  job.isExpired || job.date?.includes('Expired')
                    ? 'text-rose-600 font-bold'
                    : job.date?.includes('Ends Today')
                      ? 'text-amber-600 font-bold'
                      : 'text-slate-700'
                }>
                  {job.date}
                </span>
              </div>
            </div>
            <div>
              <span className="block text-xs font-semibold text-slate-400 mb-0.5">Req. Qualification</span>
              <div className="flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-slate-700 truncate" title={job.reqDegree}>
                <FileText className="w-3.5 h-3.5 text-blue-500 shrink-0" /> <span className="truncate">{job.reqDegree}</span>
              </div>
            </div>
            <div>
              {/* <span className="block text-xs font-semibold text-slate-400 mb-0.5">Min. Exp</span> */}
              <div className="flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-slate-700">
                {/* <Briefcase className="w-3.5 h-3.5 text-blue-500 shrink-0" /> {job.reqExp} */}
              </div>
            </div>
            <div>
              <span className="block text-xs font-semibold text-slate-400 mb-0.5">Age Limit</span>
              <div className="flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-slate-700">
                <Clock className="w-3.5 h-3.5 text-blue-500 shrink-0" /> {job.ageLimit || 'Refer Notification'}
              </div>
            </div>
          </div>
        </div>

        {/* Right Col: Score & Actions */}
        <div className="flex flex-row md:flex-col items-center md:items-end justify-between md:justify-start gap-4 md:w-52 shrink-0 border-t md:border-t-0 md:border-l border-slate-100 pt-4 md:pt-0 md:pl-4">
          <div className="text-center md:text-right w-full">
            {isUnchecked ? (
              <div className="flex flex-col items-center md:items-end mb-2">
                <div 
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-slate-100 hover:bg-slate-200/80 border border-slate-200/90 rounded-full text-slate-600 transition-colors"
                  title="Select your Degree or Experience above to view personalized AI match score"
                >
                  <SlidersHorizontal className="w-3.5 h-3.5 text-slate-400" />
                  <span className="text-xs font-semibold">Filter to Check Fit</span>
                </div>
                <span className="text-[10px] text-slate-400 font-medium mt-1">Select Degree to view %</span>
              </div>
            ) : isEligible ? (
              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 border border-emerald-200 rounded-full mb-2 shadow-sm">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span className="text-xs sm:text-sm font-bold text-emerald-700">{job.matchScore}% Match • Eligible</span>
              </div>
            ) : (
              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-rose-50 border border-rose-200 rounded-full mb-2 shadow-sm">
                <XCircle className="w-4 h-4 text-rose-600" />
                <span className="text-xs sm:text-sm font-bold text-rose-700">{job.matchScore}% • Ineligible</span>
              </div>
            )}

            {!isUnchecked && (
              <div className="w-full bg-slate-100 rounded-full h-1.5 mb-1 overflow-hidden">
                <div
                  className={`h-1.5 rounded-full ${
                    isEligible
                      ? 'bg-gradient-to-r from-emerald-500 to-teal-500'
                      : 'bg-gradient-to-r from-rose-400 to-rose-600'
                  }`}
                  style={{ width: `${job.matchScore || 0}%` }}
                />
              </div>
            )}
          </div>

          <div className="flex flex-col gap-2 w-full mt-auto">
            <button
              onClick={(e) => { e.stopPropagation(); onQuickSummary(job); }}
              className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg text-sm transition-colors flex items-center justify-center gap-2"
            >
              Quick Summary
            </button>
            {(job.applyUrl && job.applyUrl !== '#' && job.isVerifiedOfficial) ? (
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); onDirectApply(job); }}
                className={`w-full py-2 text-white font-semibold rounded-lg text-sm transition-colors flex items-center justify-center gap-2 shadow-md ${!isEligible
                  ? 'bg-slate-600 hover:bg-slate-700 shadow-slate-200'
                  : 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/20'
                  }`}
              >
                <ShieldCheck className="w-4 h-4 text-emerald-200" />
                <span>Apply Link</span> <ExternalLink className="w-4 h-4" />
              </button>
            ) : (
              <button disabled onClick={(e) => { e.stopPropagation(); }} className="w-full py-2 bg-slate-100 text-slate-400 font-semibold rounded-lg text-sm flex items-center justify-center gap-2 cursor-not-allowed">
                Apply Link Unavailable
              </button>
            )}
          </div>
        </div>

      </div>
    </div >
  );
};

