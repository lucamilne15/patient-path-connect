export type OptInMode = 'opt-out' | 'opt-in-basic' | 'opt-in-full';
export type OriginVisibility = 'masked' | 'visible-if-allowed';
export type HistoryDepth = 'glance' | 'summary' | 'full';

export interface ClinicSettings {
  name: string;
  optInMode: OptInMode;
  originVisibility: OriginVisibility;
  credits: number;
  trustScore: number;
}

export interface Patient {
  id: string;
  name: string;
  dateOfBirth: string;
  hasConsented: boolean;
  allowedDepth: HistoryDepth;
  allowOriginVisible: boolean;
}

export interface Encounter {
  id: string;
  patientId: string;
  patientName: string;
  date: string;
  diagnosis: string;
  diagnosisCode: string;
  bodyRegion: string;
  specialty: string;
  interventions: string[];
  outcomeScore: number;
  contraindications: string[];
  redFlags: string[];
  allergies: string[];
  privateNote: string;
  sourceClinic: string;
  sourceClinicMasked: boolean;
  sharedDepth: HistoryDepth;
  isPublished: boolean;
}

export interface LogEntry {
  id: string;
  timestamp: string;
  type: 'earned' | 'spent' | 'denied' | 'info';
  message: string;
  credits?: number;
}

export interface HistoryRequest {
  patientId: string;
  isBooked: boolean;
  hasConsent: boolean;
  requestedDepth: HistoryDepth;
}

export interface AccessResult {
  allowed: boolean;
  reason?: string;
  grantedDepth?: HistoryDepth;
}
