export * from './filters';

export const MESSAGES = {
  SEARCH_PLACEHOLDER: "Search job title, skills, or keywords...",
  NO_JOBS_TITLE: "No AI Matches Found",
  NO_JOBS_DESC: "Try adjusting your AI filters to discover more opportunities.",
  API_ERROR: "Failed to connect to the AI engine. Ensure FastAPI backend is running.",
  LOADING: "AI is analyzing matching jobs..."
} as const;
