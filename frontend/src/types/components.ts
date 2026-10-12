import type { ReactNode, FormEvent } from 'react';
import type { Job } from './job';

// Dropdown UI types
export interface DropdownOption {
  value: string;
  label: string;
  icon?: ReactNode;
}

export interface DropdownProps {
  value: string;
  options: DropdownOption[];
  onChange: (value: string) => void;
  icon?: ReactNode;
  placeholder?: string;
}

// FilterForm feature types
export interface FilterFormProps {
  degree: string;
  setDegree: (val: string) => void;
  experience: string;
  setExperience: (val: string) => void;
  sector: string;
  setSector: (val: string) => void;
  searchQuery: string;
  setSearchQuery: (val: string) => void;
  onlyEligible: boolean;
  setOnlyEligible: (val: boolean) => void;
  onSearch: (e: FormEvent) => void;
  onReset?: () => void;
  isLoading: boolean;
}

// JobCard feature types
export interface JobCardProps {
  job: Job;
  onQuickSummary: (job: Job) => void;
  onDirectApply: (job: Job) => void;
}

// JobModal feature types
export interface JobModalProps {
  job: Job;
  onClose: () => void;
  onDirectApply?: (job: Job) => void;
}

// TagBadge feature types
export interface TagBadgeProps {
  tag: string;
  departmentContext?: string;
  className?: string;
}

// ExternalRedirectModal feature types
export interface ExternalRedirectModalProps {
  job: Job;
  onClose: () => void;
}
