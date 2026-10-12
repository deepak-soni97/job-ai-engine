import type { Job } from './job';

export interface SearchParams {
  degree: string;
  experience?: number;
  sector: string;
  searchQuery: string;
  skip?: number;
  limit?: number;
  onlyEligible?: boolean;
}

export interface PaginatedResponse {
  total: number;
  jobs: Job[];
  skip: number;
  limit: number;
}
