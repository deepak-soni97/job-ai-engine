import type { SearchParams, PaginatedResponse } from '../types';
import { isAllSelection } from '../constants';

export type { SearchParams, PaginatedResponse };

const getApiBaseUrl = (): string => {
  if (import.meta.env.VITE_API_BASE_URL) {
    return import.meta.env.VITE_API_BASE_URL.replace(/\/+$/, '');
  }
  const host = typeof window !== 'undefined' && window.location.hostname ? window.location.hostname : 'localhost';
  return `http://${host}:8000`;
};

export const fetchJobs = async (params: SearchParams): Promise<PaginatedResponse> => {
  const query = new URLSearchParams();
  if (!isAllSelection(params.degree)) query.append('degree', params.degree);
  if (params.experience !== undefined && !isNaN(params.experience)) {
    query.append('experience', params.experience.toString());
  }
  if (!isAllSelection(params.sector)) query.append('sector', params.sector);
  if (params.searchQuery.trim()) query.append('query', params.searchQuery.trim());
  if (params.onlyEligible !== undefined) query.append('only_eligible', params.onlyEligible.toString());
  query.append('skip', (params.skip || 0).toString());
  query.append('limit', (params.limit || 10).toString());

  const baseUrl = getApiBaseUrl();
  const response = await fetch(`${baseUrl}/api/jobs/search?${query.toString()}`);
  if (!response.ok) {
    throw new Error('Failed to fetch jobs');
  }
  return response.json();
};
