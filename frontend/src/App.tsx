import React, { useState, useEffect } from 'react';
import { Bot, FileWarning, ShieldCheck } from 'lucide-react';
import type { Job } from './types/job';
import { fetchJobs } from './services/api';
import { 
  MESSAGES, 
  DEFAULT_FILTERS, 
  parseExperienceValue, 
  checkIsFilterActive 
} from './constants';
import { Header } from './components/layout/Header';
import { FilterForm } from './components/features/FilterForm';
import { JobCard } from './components/features/JobCard';
import { JobModal } from './components/features/JobModal';
import { ExternalRedirectModal } from './components/features/ExternalRedirectModal';

function App() {
  const [degree, setDegree] = useState<string>(DEFAULT_FILTERS.DEGREE);
  const [experience, setExperience] = useState<string>(DEFAULT_FILTERS.EXPERIENCE);
  const [sector, setSector] = useState<string>(DEFAULT_FILTERS.SECTOR);
  const [searchQuery, setSearchQuery] = useState<string>(DEFAULT_FILTERS.SEARCH_QUERY);
  const [onlyEligible, setOnlyEligible] = useState<boolean>(DEFAULT_FILTERS.ONLY_ELIGIBLE);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [totalJobs, setTotalJobs] = useState(0);
  const [skip, setSkip] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [redirectJob, setRedirectJob] = useState<Job | null>(null);
  const LIMIT = DEFAULT_FILTERS.LIMIT;

  const loadJobs = async (reset: boolean = false) => {
    if (reset) setIsLoading(true);
    else setIsFetchingMore(true);
    
    setError(null);
    try {
      const currentSkip = reset ? 0 : skip;
      const data = await fetchJobs({
        degree,
        experience: parseExperienceValue(experience),
        sector,
        searchQuery,
        onlyEligible,
        skip: currentSkip,
        limit: LIMIT
      });
      
      if (reset) {
        setJobs(data.jobs);
        setSkip(LIMIT);
      } else {
        setJobs(prev => {
          const existingIds = new Set(prev.map(j => j.id));
          const newJobs = data.jobs.filter(j => !existingIds.has(j.id));
          return [...prev, ...newJobs];
        });
        setSkip(currentSkip + LIMIT);
      }
      setTotalJobs(data.total);
    } catch (err) {
      console.error(err);
      setError(MESSAGES.API_ERROR);
    } finally {
      setIsLoading(false);
      setIsFetchingMore(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void loadJobs(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [onlyEligible]);

  // Centralized Modal Body Scroll Lock
  useEffect(() => {
    if (selectedJob || redirectJob) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [selectedJob, redirectJob]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    loadJobs(true);
  };

  const handleReset = () => {
    setDegree(DEFAULT_FILTERS.DEGREE);
    setExperience(DEFAULT_FILTERS.EXPERIENCE);
    setSector(DEFAULT_FILTERS.SECTOR);
    setSearchQuery(DEFAULT_FILTERS.SEARCH_QUERY);
    setOnlyEligible(DEFAULT_FILTERS.ONLY_ELIGIBLE);
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] font-sans selection:bg-blue-100 flex flex-col justify-between">
      
      {/* Background decoration */}
      <div className="absolute top-0 inset-x-0 h-[500px] bg-gradient-to-b from-blue-50 to-transparent -z-10" />
      <div className="absolute top-0 inset-x-0 h-[500px] bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.03] -z-10" />

      <div>
        <Header />

        <main className="max-w-7xl mx-auto px-4 pb-16 relative z-10">
          
          <FilterForm 
            degree={degree} setDegree={setDegree}
            experience={experience} setExperience={setExperience}
            sector={sector} setSector={setSector}
            searchQuery={searchQuery} setSearchQuery={setSearchQuery}
            onlyEligible={onlyEligible} setOnlyEligible={setOnlyEligible}
            onSearch={handleSearch}
            onReset={handleReset}
            isLoading={isLoading}
          />

          {error && (
            <div className="max-w-3xl mx-auto mb-8 p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 flex items-center gap-3 font-medium">
              <FileWarning className="w-5 h-5" /> {error}
            </div>
          )}

          <section>
            {(() => {
              const isFilterActive = checkIsFilterActive(degree, experience, sector, searchQuery);
              return (
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-6">
                  <h2 className="text-xl font-bold text-slate-800">
                    {isFilterActive
                      ? (totalJobs > 0 
                          ? (totalJobs > jobs.length ? `AI Matched Jobs (${jobs.length} of ${totalJobs})` : `AI Matched Jobs (${totalJobs})`)
                          : (jobs.length > 0 ? `AI Matched Jobs (${jobs.length})` : 'Recommended for You'))
                      : `All Available Opportunities (${jobs.length} of ${totalJobs})`}
                  </h2>
                  <div className="text-xs sm:text-sm font-semibold text-slate-500">
                    {isFilterActive ? 'Sorted by Match Score' : 'Select degree or search above to evaluate Match %'}
                  </div>
                </div>
              );
            })()}

            {isLoading ? (
              <div className="py-20 text-center">
                <Bot className="w-12 h-12 text-blue-400 mx-auto mb-4 animate-bounce" />
                <p className="text-lg font-semibold text-slate-600">{MESSAGES.LOADING}</p>
              </div>
            ) : jobs.length === 0 && !error ? (
              <div className="py-20 text-center bg-white rounded-3xl border border-slate-100 shadow-sm">
                <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FileWarning className="w-8 h-8 text-slate-400" />
                </div>
                <h3 className="text-xl font-bold text-slate-800 mb-2">{MESSAGES.NO_JOBS_TITLE}</h3>
                <p className="text-slate-500 font-medium">{MESSAGES.NO_JOBS_DESC}</p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 gap-6 mb-8">
                  {jobs.map(job => (
                    <JobCard 
                      key={job.id} 
                      job={job} 
                      onQuickSummary={setSelectedJob} 
                      onDirectApply={setRedirectJob}
                    />
                  ))}
                </div>
                
                {jobs.length < totalJobs && (
                  <div className="text-center">
                    <button 
                      onClick={() => loadJobs(false)}
                      disabled={isFetchingMore}
                      className="px-8 py-3 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-bold rounded-2xl transition-all shadow-sm disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                      {isFetchingMore ? 'Loading...' : 'Load More'}
                    </button>
                  </div>
                )}
              </>
            )}
          </section>

          {selectedJob && (
            <JobModal 
              job={selectedJob} 
              onClose={() => setSelectedJob(null)} 
              onDirectApply={(j) => {
                setSelectedJob(null);
                setRedirectJob(j);
              }}
            />
          )}

          {redirectJob && redirectJob.applyUrl && redirectJob.applyUrl !== '#' && (
            <ExternalRedirectModal 
              job={redirectJob} 
              onClose={() => setRedirectJob(null)} 
            />
          )}
          
        </main>
      </div>

      {/* Information Intermediary Safe Harbor Disclaimer Footer */}
      <footer className="border-t border-slate-200/80 bg-white/90 backdrop-blur-md py-10 px-4 mt-12">
        <div className="max-w-5xl mx-auto text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold rounded-full">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Information Technology Act, 2000 — Section 79 Safe Harbor Compliant</span>
          </div>
          <p className="text-xs text-slate-500 leading-relaxed max-w-3xl mx-auto">
            <span className="font-semibold text-slate-700">Information Intermediary Notice:</span> GovtTech AI acts strictly as an automated discovery engine indexing public job advertisements and gazettes under Section 79 of the Information Technology Act, 2000. GovtTech AI does not charge application fees, collect financial credentials, or provide employment guarantees. Candidates must verify all official notifications and payment gateways on authentic <span className="font-mono text-slate-700">.gov.in</span> or verified PSU portals before submitting applications.
          </p>
          <div className="flex items-center justify-center gap-2 text-xs text-slate-500 font-medium pt-1">
            <img src="/favicon.svg" alt="GovtTech AI" className="w-4 h-4 rounded" />
            <span>© {new Date().getFullYear()} GovtTech AI Engine. Zero-Trust Domain Validation & Anti-Phishing Guardrails Active.</span>
          </div>
        </div>
      </footer>

    </div>
  );
}

export default App;
