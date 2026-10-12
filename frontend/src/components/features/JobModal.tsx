import React from 'react';
import { X, CheckCircle2, AlertCircle, Banknote, Users, MapPin, Clock, Award, FileText, Briefcase, ExternalLink, XCircle, Eye } from 'lucide-react';
import type { PositionDetail, JobModalProps } from '../../types';
import { TagBadge } from './TagBadge';

export type { JobModalProps };

export const JobModal: React.FC<JobModalProps> = ({ job, onClose, onDirectApply }) => {
  const [selectedPosIdx, setSelectedPosIdx] = React.useState(0);
  const [popupPos, setPopupPos] = React.useState<PositionDetail | null>(null);

  const [prevJobId, setPrevJobId] = React.useState(job.id);
  if (job.id !== prevJobId) {
    setPrevJobId(job.id);
    setSelectedPosIdx(0);
    setPopupPos(null);
  }

  const positions = job.positions && job.positions.length > 0 ? job.positions : [
    {
      sNo: 1,
      postName: job.title,
      vacancies: job.vacancies || '1 Post',
      compensation: job.salary || 'Refer Notification',
      minQualification: job.reqDegree || 'Refer Notification',
      experience: job.reqExp || 'As per notification',
      age: job.ageLimit || 'Refer Notification',
      placeOfPosting: job.location || 'Refer Notification',
      selectionMode: job.selectionMode || 'Refer Notification',
      tenure: job.tenure || ''
    }
  ];

  const activePos = positions[selectedPosIdx] || positions[0];

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in overscroll-contain"
      onWheel={(e) => e.stopPropagation()}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[92vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200 border border-slate-100">

        {/* Modal Header */}
        <div className="p-5 border-b border-slate-100 flex items-start justify-between bg-gradient-to-r from-slate-50 via-white to-blue-50/30 shrink-0">
          <div className="pr-4">
            <div className="flex flex-wrap items-center gap-2 mb-1.5">
              <span className="px-2.5 py-0.5 bg-blue-100 text-blue-800 text-xs font-bold rounded-full uppercase tracking-wider">
                Official Notification Extracted
              </span>
              <span className="text-xs font-medium text-slate-500">
                {job.sector}
              </span>
              {job.isVerifiedOfficial && job.verifiedDomain && (
                <span className="px-2.5 py-0.5 bg-emerald-100 text-emerald-800 text-xs font-bold rounded-full flex items-center gap-1 shadow-sm">
                  Verified: {job.verifiedDomain}
                </span>
              )}
            </div>
            <h3 className="font-bold text-lg sm:text-xl text-slate-900 leading-snug">
              {job.title}
            </h3>
            <p className="text-sm font-medium text-slate-500 mt-0.5">{job.department}</p>
            {job.tags && job.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-2">
                {job.tags.map((tag, idx) => (
                  <TagBadge key={idx} tag={tag} departmentContext={job.department} />
                ))}
              </div>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body - Scrollable (Frozen when sub-popup is open) */}
        <div className={`p-5 sm:p-6 space-y-6 text-slate-800 overscroll-contain transition-opacity duration-150 ${
          popupPos ? 'overflow-hidden pointer-events-none opacity-40 select-none' : 'overflow-y-auto'
        }`}>

          {/* Key Metrics Banner */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-emerald-50/70 border border-emerald-100/80 p-3 rounded-xl">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-700 mb-1">
                <Banknote className="w-4 h-4" /> Compensation / CTC
              </div>
              <p className="text-sm font-black text-emerald-900">
                {activePos.compensation || job.salary || 'Refer Notification'}
              </p>
              {positions.length > 1 && (
                <span className="text-[10px] text-emerald-700 font-semibold block mt-0.5">
                  For: {activePos.postName.slice(0, 24)}...
                </span>
              )}
            </div>

            <div className="bg-blue-50/70 border border-blue-100/80 p-3 rounded-xl">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-blue-700 mb-1">
                <Users className="w-4 h-4" /> Vacancies
              </div>
              <p className="text-sm font-black text-blue-900">{job.vacancies || '1 Post'}</p>
              {positions.length > 1 && (
                <span className="text-[10px] text-blue-700 font-semibold block mt-0.5">
                  Total Across {positions.length} Posts
                </span>
              )}
            </div>

            <div className="bg-amber-50/70 border border-amber-100/80 p-3 rounded-xl">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-700 mb-1">
                <Clock className="w-4 h-4" /> Age Limit
              </div>
              <p className="text-sm font-black text-amber-900">{activePos.age || job.ageLimit || 'Refer Notification'}</p>
            </div>

            <div className="bg-rose-50/70 border border-rose-100/80 p-3 rounded-xl">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-rose-700 mb-1">
                <MapPin className="w-4 h-4" /> Place of Posting
              </div>
              <p className="text-sm font-black text-rose-900">{activePos.placeOfPosting || job.location || 'Refer Notification'}</p>
            </div>

            {(activePos.tenure || job.tenure) && (
              <div className="bg-purple-50/90 border border-purple-200 p-3 rounded-xl col-span-2 sm:col-span-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-purple-600 shrink-0" />
                  <span className="text-xs font-bold text-purple-900 uppercase tracking-wider">Service Tenure:</span>
                  <span className="text-sm font-black text-purple-950">{activePos.tenure || job.tenure}</span>
                </div>
                <span className="text-[10px] font-bold text-purple-700 bg-purple-100 px-2.5 py-0.5 rounded-full uppercase">Contractual / Project Post</span>
              </div>
            )}
          </div>

          {/* AI Eligibility Reasoning Verdict */}
          {job.eligibilityStatus !== 'Unchecked' && (
            <div className={`p-4 rounded-xl border ${job.isEligible !== false
                ? 'bg-emerald-50/80 border-emerald-200'
                : 'bg-rose-50/90 border-rose-200'
              }`}>
              <div className="flex items-start gap-3">
                {job.isEligible !== false ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                ) : (
                  <XCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                )}
                <div className="flex-1">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className={`text-xs font-black uppercase tracking-wider ${job.isEligible !== false ? 'text-emerald-800' : 'text-rose-800'
                      }`}>
                      {job.isEligible !== false ? 'AI Eligibility Verdict: Eligible' : 'AI Eligibility Verdict: Not Eligible'}
                    </span>
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${job.isEligible !== false ? 'bg-emerald-200 text-emerald-900' : 'bg-rose-200 text-rose-900'
                      }`}>
                      {job.matchScore}% Match Score
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm font-medium text-slate-800 leading-relaxed">
                    {job.verdictReason}
                  </p>
                  {job.isEligible === false && (
                    <p className="text-xs text-rose-700 font-semibold mt-1">
                      ⚠️ Mandatory criteria failure: Match score is penalized to {job.matchScore}% because required qualification rules are not satisfied.
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Section 1 & 2: Position & Compensation Breakdown Table */}
          <div>
            <div className="flex flex-wrap items-center justify-between gap-2 mb-2.5">
              <h4 className="text-xs font-bold text-slate-600 uppercase tracking-wider flex items-center gap-1.5">
                <Award className="w-4 h-4 text-blue-600" /> Details of Position(s) & Compensation ({positions.length} Positions)
              </h4>
              {positions.length > 1 && (
                <span className="text-[11px] text-blue-700 font-semibold bg-blue-50 px-2.5 py-1 rounded-full border border-blue-200 flex items-center gap-1">
                  💡 Click on any position row or 'View' button to inspect complete criteria
                </span>
              )}
            </div>

            <div className="overflow-x-auto border border-slate-200 rounded-xl shadow-xs">
              <table className="w-full text-left text-xs sm:text-sm min-w-[560px]">
                <thead className="bg-slate-100/80 text-slate-700 font-bold border-b border-slate-200">
                  <tr>
                    <th className="py-2.5 px-3 w-12 text-center">S.No</th>
                    <th className="py-2.5 px-3">Name of Position(s) / Discipline(s)</th>
                    <th className="py-2.5 px-3 w-28 text-center">Vacancy/ies</th>
                    <th className="py-2.5 px-3">Compensation / CTC</th>
                    <th className="py-2.5 px-3 w-28 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {positions.map((pos, idx) => {
                    const isSelected = selectedPosIdx === idx;
                    return (
                      <tr
                        key={idx}
                        onClick={() => setSelectedPosIdx(idx)}
                        className={`transition-colors cursor-pointer select-none ${isSelected
                            ? 'bg-blue-50 text-blue-950 font-semibold border-l-4 border-l-blue-600'
                            : 'hover:bg-slate-50 text-slate-700'
                          }`}
                      >
                        <td className="py-3 px-3 text-center font-bold text-slate-500">
                          {pos.sNo || idx + 1}
                        </td>
                        <td className="py-3 px-3">
                          <div className="flex items-center gap-2">
                            <span className={`font-semibold ${isSelected ? 'text-blue-950 font-bold' : 'text-slate-900'}`}>
                              {pos.postName}
                            </span>
                            {isSelected && (
                              <span className="px-1.5 py-0.5 bg-blue-200/70 text-blue-800 text-[10px] font-bold rounded">
                                Selected
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="py-3 px-3 text-center">
                          <span className="inline-block px-2 py-0.5 bg-emerald-100 text-emerald-800 text-xs font-bold rounded-md">
                            {pos.vacancies}
                          </span>
                        </td>
                        <td className="py-3 px-3 font-bold text-emerald-700">
                          {pos.compensation || job.salary}
                        </td>
                        <td className="py-3 px-3 text-center">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedPosIdx(idx);
                              setPopupPos(pos);
                            }}
                            className="inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1.5 rounded-lg transition-all bg-blue-600 hover:bg-blue-700 text-white shadow-xs hover:shadow cursor-pointer"
                            title="Click to view full position criteria in pop-up"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>View</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Section 3: Educational Qualification, Experience & Selection Mode */}
          <div>
            <div className="flex flex-wrap items-center justify-between gap-2 mb-2.5">
              <h4 className="text-xs font-bold text-slate-600 uppercase tracking-wider flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-blue-600" /> Educational Qualification & Experience Criteria
              </h4>
              <div className="flex items-center gap-2">
                {positions.length > 1 && (
                  <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-blue-50 text-blue-800 border border-blue-200">
                    Inspecting Post #{activePos.sNo || selectedPosIdx + 1}: <span className="font-black underline">{activePos.postName}</span>
                  </span>
                )}
                {/* <button
                  type="button"
                  onClick={() => setPopupPos(activePos)}
                  className="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors shadow-xs cursor-pointer"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>View Pop-up</span>
                </button> */}
              </div>
            </div>

            <div className="bg-slate-50/90 border border-slate-200 rounded-xl p-4 space-y-4 shadow-xs">
              {/* Active Position Highlighting Banner */}
              <div className="flex flex-wrap items-center justify-between gap-2 p-3 bg-white rounded-lg border border-blue-100 shadow-xs">
                <div className="flex items-center gap-2">
                  <span className="w-7 h-7 rounded-full bg-blue-600 text-white font-black text-xs flex items-center justify-center shrink-0">
                    {activePos.sNo || selectedPosIdx + 1}
                  </span>
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase block tracking-wider">Currently Selected Post</span>
                    <span className="text-sm font-bold text-slate-900">{activePos.postName}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-md text-xs font-bold">
                    💰 {activePos.compensation || job.salary}
                  </span>
                  <span className="px-2.5 py-1 bg-blue-50 text-blue-800 border border-blue-200 rounded-md text-xs font-bold">
                    👥 {activePos.vacancies}
                  </span>
                </div>
              </div>

              <div>
                <span className="text-xs font-bold text-slate-500 uppercase block mb-1 flex items-center gap-1">
                  <FileText className="w-3.5 h-3.5 text-blue-600" /> Minimum Educational Qualification
                </span>
                <p className="text-sm font-semibold text-slate-800 bg-white p-3 rounded-lg border border-slate-200/60 leading-relaxed shadow-2xs">
                  {activePos.minQualification || job.reqDegree}
                </p>
              </div>

              <div>
                <span className="text-xs font-bold text-slate-500 uppercase block mb-1 flex items-center gap-1">
                  <Briefcase className="w-3.5 h-3.5 text-blue-600" /> Mandatory Professional Experience
                </span>
                <p className="text-sm font-semibold text-slate-800 bg-white p-3 rounded-lg border border-slate-200/60 leading-relaxed shadow-2xs">
                  {activePos.experience || job.reqExp}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                <div className="bg-white p-3 rounded-lg border border-slate-200/60">
                  <span className="text-xs font-bold text-slate-400 block mb-0.5">Mode of Selection</span>
                  <span className="text-sm font-bold text-slate-800">{activePos.selectionMode || job.selectionMode || 'Refer Notification'}</span>
                </div>
                <div className="bg-white p-3 rounded-lg border border-slate-200/60">
                  <span className="text-xs font-bold text-slate-400 block mb-0.5">Place of Posting</span>
                  <span className="text-sm font-bold text-slate-800">{activePos.placeOfPosting || job.location || 'Refer Notification'}</span>
                </div>
                <div className="bg-white p-3 rounded-lg border border-slate-200/60">
                  <span className="text-xs font-bold text-slate-400 block mb-0.5">Age Limit</span>
                  <span className="text-sm font-bold text-slate-800">{activePos.age || job.ageLimit || 'Refer Notification'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Application Fees & How to Apply */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                  <AlertCircle className="w-4 h-4 text-blue-600" /> Application Fees (Online Processing)
                </h4>
                <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                  Official Rate
                </span>
              </div>
              <p className="text-xs sm:text-sm font-medium text-slate-700 bg-slate-50 p-3 rounded-xl border border-slate-100 min-h-[4rem] leading-relaxed">
                {job.feeText || "Nil / As per notification"}
              </p>
            </div>

            <div>
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-blue-600" /> Mandatory Checklist
              </h4>
              <ul className="space-y-1.5 bg-slate-50 p-3 rounded-xl border border-slate-100 min-h-[4rem]">
                {job.documents.map((doc: string, idx: number) => (
                  <li key={idx} className="flex items-center gap-2 text-xs sm:text-sm font-medium text-slate-700">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>{doc}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* How to Apply Procedure */}
          <div>
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <AlertCircle className="w-4 h-4 text-blue-600" /> Official Step-by-Step Application Procedure
            </h4>
            <div className="text-xs sm:text-sm font-medium text-slate-700 bg-slate-50 p-4 rounded-xl border border-slate-200 whitespace-pre-wrap leading-relaxed max-h-60 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-slate-300">
              {job.applyProcedure || "Download application form from official website, fill out required details, attach self-attested documents, and submit as per notification instructions."}
            </div>
          </div>

        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50 flex gap-3 shrink-0">
          {(job.pdfUrl && job.pdfUrl !== '#') ? (
            <a
              href={job.pdfUrl}
              target="_blank"
              rel="noreferrer"
              className="flex-1 py-2.5 bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 font-semibold rounded-xl text-sm transition-colors text-center flex items-center justify-center gap-2 shadow-sm"
            >
              <FileText className="w-4 h-4 text-blue-600" />
              <span>Read Official Notification PDF</span>
            </a>
          ) : null}

          {(job.applyUrl && job.applyUrl !== '#' && job.isVerifiedOfficial) ? (
            <button
              type="button"
              onClick={() => {
                if (onDirectApply) {
                  onDirectApply(job);
                } else {
                  window.open(job.applyUrl, '_blank', 'noopener,noreferrer');
                }
              }}
              className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl text-sm transition-colors shadow-lg shadow-emerald-500/20 text-center flex items-center justify-center gap-2"
            >
              <span>Go to Apply Link</span>
              <ExternalLink className="w-4 h-4" />
            </button>
          ) : (
            <button disabled className="flex-1 py-2.5 bg-slate-200 text-slate-500 font-semibold rounded-xl text-sm text-center cursor-not-allowed">
              Apply Link Unavailable
            </button>
          )}
        </div>
      </div>

      {/* Dedicated Position Details Sub-Modal / Pop-up Dialog */}
      {popupPos && (
        <div 
          className="fixed inset-0 z-[60] flex items-center justify-center p-3 sm:p-4 bg-slate-950/75 backdrop-blur-md animate-in fade-in duration-150 overscroll-contain select-none"
          onClick={() => setPopupPos(null)}
          onWheel={(e) => e.stopPropagation()}
        >
          <div 
            className="bg-white rounded-2xl shadow-2xl w-full max-w-xl max-h-[85vh] flex flex-col overflow-hidden border border-slate-200 animate-in zoom-in-95 duration-150 select-text"
            onClick={(e) => e.stopPropagation()}
            onWheel={(e) => e.stopPropagation()}
          >
            {/* Pop up Header */}
            <div className="p-4 sm:p-5 bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 text-white flex items-start justify-between shrink-0">
              <div className="pr-2">
                <div className="flex flex-wrap items-center gap-2 mb-1.5">
                  <span className="px-2 py-0.5 bg-white/20 text-white text-[11px] font-bold rounded-full uppercase tracking-wider">
                    Position #{popupPos.sNo || selectedPosIdx + 1}
                  </span>
                  <span className="px-2.5 py-0.5 bg-emerald-400 text-slate-900 text-xs font-black rounded-full shadow-xs">
                    {popupPos.vacancies || '1 Post'}
                  </span>
                </div>
                <h4 className="font-bold text-lg sm:text-xl leading-snug">
                  {popupPos.postName}
                </h4>
                <p className="text-xs text-blue-100 mt-1 font-medium">{job.department}</p>
              </div>
              <button
                type="button"
                onClick={() => setPopupPos(null)}
                className="p-1.5 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-colors shrink-0"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Pop up Body */}
            <div 
              className="p-5 space-y-4 overflow-y-auto overscroll-contain text-slate-800 text-sm"
              onWheel={(e) => e.stopPropagation()}
            >
              {/* Compensation & Vacancies Banner */}
              <div className="grid grid-cols-2 gap-3 bg-gradient-to-br from-emerald-50/80 to-teal-50/80 p-3.5 rounded-xl border border-emerald-200/80">
                <div>
                  <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider block mb-0.5">
                    💰 Compensation / CTC
                  </span>
                  <span className="text-sm sm:text-base font-black text-emerald-950">
                    {popupPos.compensation || job.salary || 'As per Norms'}
                  </span>
                </div>
                <div>
                  <span className="text-[11px] font-bold text-teal-800 uppercase tracking-wider block mb-0.5">
                    👥 Total Vacancies
                  </span>
                  <span className="text-sm sm:text-base font-black text-teal-950">
                    {popupPos.vacancies || '1 Post'}
                  </span>
                </div>
              </div>

              {/* Minimum Educational Qualification */}
              <div className="bg-slate-50/90 p-4 rounded-xl border border-slate-200/80">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1.5 flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-blue-600" /> Minimum Educational Qualification
                </span>
                <p className="text-sm font-semibold text-slate-900 bg-white p-3 rounded-lg border border-slate-200 leading-relaxed shadow-2xs">
                  {popupPos.minQualification || job.reqDegree}
                </p>
              </div>

              {/* Mandatory Professional Experience */}
              <div className="bg-slate-50/90 p-4 rounded-xl border border-slate-200/80">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1.5 flex items-center gap-1.5">
                  <Briefcase className="w-4 h-4 text-blue-600" /> Mandatory Professional Experience
                </span>
                <p className="text-sm font-semibold text-slate-900 bg-white p-3 rounded-lg border border-slate-200 leading-relaxed shadow-2xs">
                  {popupPos.experience || job.reqExp}
                </p>
              </div>

              {/* Additional Specs Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                <div className="bg-slate-50 p-3 rounded-lg border border-slate-200/70">
                  <span className="text-[11px] font-bold text-slate-400 block mb-0.5">Selection Mode</span>
                  <span className="text-xs font-bold text-slate-800">
                    {popupPos.selectionMode || job.selectionMode || 'Refer Notification'}
                  </span>
                </div>
                <div className="bg-slate-50 p-3 rounded-lg border border-slate-200/70">
                  <span className="text-[11px] font-bold text-slate-400 block mb-0.5">Place of Posting</span>
                  <span className="text-xs font-bold text-slate-800">
                    {popupPos.placeOfPosting || job.location || 'Refer Notification'}
                  </span>
                </div>
                <div className="bg-slate-50 p-3 rounded-lg border border-slate-200/70">
                  <span className="text-[11px] font-bold text-slate-400 block mb-0.5">Age Limit</span>
                  <span className="text-xs font-bold text-slate-800">
                    {popupPos.age || job.ageLimit || 'Refer Notification'}
                  </span>
                </div>
              </div>
            </div>

            {/* Pop up Footer */}
            <div className="p-3.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between shrink-0">
              <span className="text-[11px] font-medium text-slate-500">
                Official Post Criteria Extracted
              </span>
              <button
                type="button"
                onClick={() => setPopupPos(null)}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs transition-colors shadow-sm cursor-pointer"
              >
                Close Post Details
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

