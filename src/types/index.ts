export interface Voter {
  id: string;
  nisn: string;
  name: string;
  class: string;
  hasVoted: boolean;
  votedAt: string | null;
}

export interface Candidate {
  number: string;
  chairmanName: string;
  viceChairmanName: string;
  photoUrl: string;
  vision: string;
  mission: string[];
  programs?: string[];
}

export interface ElectionSettings {
  schoolName: string;
  schoolLogoUrl?: string;
  electionYear: string;
  startDate: string;
  endDate: string;
  votingStatus: 'DIBUKA' | 'DITUTUP';
  publicResultStatus: 'DITAMPILKAN' | 'DISEMBUNYIKAN';
  adminPin: string;
}

export interface Vote {
  voteId: string;
  candidateNumber: string;
  createdAt: string;
  maskedNisn?: string;
  token?: string;
}

export type ActivePage = 
  | 'home' 
  | 'login' 
  | 'voting' 
  | 'success' 
  | 'public-results' 
  | 'admin-login' 
  | 'admin-dashboard';

export type AdminTab = 
  | 'overview' 
  | 'voters' 
  | 'candidate' 
  | 'realcount' 
  | 'settings';
