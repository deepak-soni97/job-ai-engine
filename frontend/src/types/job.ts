export interface PositionDetail {
  sNo?: number;
  postName: string;
  vacancies?: string | number;
  compensation?: string;
  minQualification?: string;
  experience?: string;
  age?: string;
  placeOfPosting?: string;
  selectionMode?: string;
  tenure?: string;
}

export interface Job {
  id: string;
  title: string;
  department: string;
  selectionMode: string;
  date: string;
  deadlineDate?: string;
  reqDegree: string;
  reqExp: string;
  sector: string;
  tags: string[];
  documents: string[];
  pdfUrl: string;
  matchScore?: number;
  feeText?: string;
  applyProcedure?: string;
  applyUrl?: string;
  isNew?: boolean;
  salary?: string;
  vacancies?: string;
  tenure?: string;
  ageLimit?: string;
  location?: string;
  positions?: PositionDetail[];
  isEligible?: boolean;
  eligibilityStatus?: string;
  degreeMatch?: boolean;
  experienceMatch?: boolean;
  verdictReason?: string;
  candidateDegree?: string;
  candidateExperience?: number;
  isVerifiedOfficial?: boolean;
  verifiedDomain?: string;
  isExpired?: boolean;
}

