import React from 'react';
import { Search, MapPin, Briefcase, GraduationCap } from 'lucide-react';
import { 
  DEGREES, 
  SECTORS, 
  MESSAGES, 
  EXPERIENCE_OPTIONS, 
  checkIsFilterActive, 
  isAllSelection 
} from '../../constants';
import { Dropdown } from '../ui/Dropdown';

import type { FilterFormProps } from '../../types';

export type { FilterFormProps };

export const FilterForm: React.FC<FilterFormProps> = ({
  degree, setDegree,
  experience, setExperience,
  sector, setSector,
  searchQuery, setSearchQuery,
  onlyEligible, setOnlyEligible,
  onSearch,
  onReset,
  isLoading
}) => {
  const hasActiveFilters = checkIsFilterActive(degree, experience, sector, searchQuery);

  return (
    <div className="max-w-5xl mx-auto mb-12">
      <div className="bg-white p-5 md:p-7 rounded-3xl shadow-xl shadow-blue-900/5 border border-slate-100 backdrop-blur-xl">
        <form onSubmit={onSearch}>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-end mb-4">
            
            {/* Field 1: Search Keyword */}
            <div className="w-full">
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <Search className="w-3.5 h-3.5 text-blue-500" />
                <span>Job Keyword</span>
              </label>
              <div className="relative">
                <input 
                  type="text" 
                  placeholder={MESSAGES.SEARCH_PLACEHOLDER}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-4 pr-4 py-3 bg-slate-50 hover:bg-slate-100/70 border border-slate-200/60 rounded-2xl text-slate-700 font-medium text-sm focus:bg-white focus:ring-2 focus:ring-blue-500 transition-all outline-none"
                />
              </div>
            </div>

            {/* Field 2: Qualification / Degree */}
            <div className="w-full">
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <GraduationCap className="w-3.5 h-3.5 text-blue-500" />
                <span>Degree / Qualification</span>
              </label>
              <Dropdown
                value={degree}
                onChange={setDegree}
                icon={<GraduationCap className="w-4 h-4" />}
                options={DEGREES.map(deg => ({ value: deg, label: isAllSelection(deg) ? 'All Degrees' : deg }))}
              />
            </div>

            {/* Field 3: Experience */}
            <div className="w-full">
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <Briefcase className="w-3.5 h-3.5 text-blue-500" />
                <span>Your Experience</span>
              </label>
              <Dropdown
                value={experience}
                onChange={setExperience}
                icon={<Briefcase className="w-4 h-4" />}
                options={EXPERIENCE_OPTIONS}
              />
            </div>

            {/* Field 4: Sector */}
            <div className="w-full">
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-blue-500" />
                <span>Target Sector</span>
              </label>
              <Dropdown
                value={sector}
                onChange={setSector}
                icon={<MapPin className="w-4 h-4" />}
                options={SECTORS.map(sec => ({ value: sec, label: isAllSelection(sec) ? 'All Sectors' : sec }))}
              />
            </div>
          </div>

          {/* Bottom Controls Bar: Eligibility Toggle, Reset, and Submit */}
          <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-4">
              <label className="inline-flex items-center gap-2.5 cursor-pointer select-none">
                <input 
                  type="checkbox" 
                  checked={onlyEligible} 
                  onChange={(e) => setOnlyEligible(e.target.checked)}
                  className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500 transition-colors"
                />
                <span className="text-xs font-bold text-slate-700">Strict Eligibility Filter</span>
                <span className="text-[11px] font-medium text-slate-400 hidden md:inline">
                  (Only shows jobs matching your degree & experience)
                </span>
              </label>

              {hasActiveFilters && onReset && (
                <button
                  type="button"
                  onClick={onReset}
                  className="text-xs font-bold text-slate-400 hover:text-red-500 transition-colors underline"
                >
                  Clear Filters
                </button>
              )}
            </div>

            <button 
              type="submit"
              disabled={isLoading}
              className="w-full sm:w-auto px-7 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-xl transition-all shadow-md shadow-blue-600/20 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <Search className="w-4 h-4" />
              <span>{isLoading ? 'Scanning...' : 'Find Jobs'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
