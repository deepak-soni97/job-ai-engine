import type { DropdownOption } from '../types';

export const ALL_SELECTION = 'All' as const;
export const ALL_EXPERIENCE = 'all' as const;

export const DEFAULT_FILTERS = {
  DEGREE: ALL_SELECTION,
  EXPERIENCE: ALL_EXPERIENCE,
  SECTOR: ALL_SELECTION,
  SEARCH_QUERY: '',
  ONLY_ELIGIBLE: true,
  LIMIT: 10,
} as const;

export const DEGREES = [
  ALL_SELECTION,
  '10th Pass',
  '12th Pass',
  'ITI',
  'Diploma',
  'Graduate',
  'Post Graduate',
  'B.Tech CS',
  'BE',
  'Engineering',
  'MCA',
  'M.Sc IT',
  'BCA',
  'B.Sc',
  'MBA',
  'BBA',
  'B.Com',
  'M.Com',
  'Ph.D',
] as const;

export const SECTORS = [
  ALL_SELECTION,
  'Central Govt',
  'State (MP, etc.)',
  'Public Sector (PSU)',
  'Banking / RBI',
  'Defence / Police',
  'Railway',
] as const;

export const EXPERIENCE_OPTIONS: DropdownOption[] = [
  { value: ALL_EXPERIENCE, label: 'All Experience' },
  { value: '0', label: 'Fresher (0 Yrs)' },
  { value: '1', label: '1+ Years' },
  { value: '2', label: '2+ Years' },
  { value: '3', label: '3+ Years' },
  { value: '5', label: '5+ Years' },
];

/**
 * Checks if a given filter value represents "All" (case-insensitive or empty)
 */
export const isAllSelection = (value?: string): boolean => {
  if (!value) return true;
  return value.trim().toLowerCase() === 'all';
};

/**
 * Parses user experience filter input into a number or undefined if "all"
 */
export const parseExperienceValue = (exp?: string): number | undefined => {
  if (!exp || isAllSelection(exp)) {
    return undefined;
  }
  const parsed = parseFloat(exp);
  return isNaN(parsed) ? undefined : parsed;
};

/**
 * Determines whether any search/filter criteria is currently applied
 */
export const checkIsFilterActive = (
  degree?: string,
  experience?: string,
  sector?: string,
  searchQuery?: string
): boolean => {
  const hasQuery = Boolean(searchQuery && searchQuery.trim().length > 0);
  const hasDegree = Boolean(degree && !isAllSelection(degree));
  const hasExperience = Boolean(experience && !isAllSelection(experience));
  const hasSector = Boolean(sector && !isAllSelection(sector));
  return hasQuery || hasDegree || hasExperience || hasSector;
};
