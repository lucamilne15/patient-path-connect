import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { 
  ClinicSettings, 
  Patient, 
  Encounter, 
  LogEntry, 
  OptInMode, 
  OriginVisibility,
  HistoryDepth,
  HistoryRequest,
  AccessResult
} from '@/types/clinic';

interface ClinicContextType {
  settings: ClinicSettings;
  patients: Patient[];
  encounters: Encounter[];
  logs: LogEntry[];
  walkthroughStep: number;
  isWalkthroughActive: boolean;
  
  // Settings actions
  updateOptInMode: (mode: OptInMode) => void;
  updateOriginVisibility: (visibility: OriginVisibility) => void;
  
  // Encounter actions
  publishEncounter: (encounter: Omit<Encounter, 'id' | 'isPublished'>) => void;
  
  // History request actions
  requestHistory: (request: HistoryRequest) => AccessResult;
  getVisibleEncounters: (patientId: string, depth: HistoryDepth) => Encounter[];
  
  // Walkthrough actions
  startWalkthrough: () => void;
  nextWalkthroughStep: () => void;
  resetWalkthrough: () => void;
  
  // Credit actions
  spendCredits: (amount: number) => boolean;
}

const initialSettings: ClinicSettings = {
  name: 'Wellness Physical Therapy',
  optInMode: 'opt-out',
  originVisibility: 'masked',
  credits: 0,
  trustScore: 50,
};

const initialPatients: Patient[] = [
  { 
    id: 'p1', 
    name: 'Sarah Johnson', 
    dateOfBirth: '1985-03-15',
    hasConsented: true, 
    allowedDepth: 'full',
    allowOriginVisible: false
  },
  { 
    id: 'p2', 
    name: 'Michael Chen', 
    dateOfBirth: '1978-08-22',
    hasConsented: true, 
    allowedDepth: 'summary',
    allowOriginVisible: true
  },
  { 
    id: 'p3', 
    name: 'Emily Rodriguez', 
    dateOfBirth: '1992-11-30',
    hasConsented: false, 
    allowedDepth: 'glance',
    allowOriginVisible: false
  },
];

const initialEncounters: Encounter[] = [
  {
    id: 'e1',
    patientId: 'p1',
    patientName: 'Sarah Johnson',
    date: '2024-01-15',
    diagnosis: 'Lumbar Disc Herniation',
    diagnosisCode: 'M51.16',
    bodyRegion: 'Lower Back',
    specialty: 'Orthopedic',
    interventions: ['Manual Therapy', 'Therapeutic Exercise', 'Patient Education'],
    outcomeScore: 75,
    contraindications: ['Avoid heavy lifting', 'No high-impact activities'],
    redFlags: [],
    allergies: ['Latex'],
    privateNote: 'Patient mentioned stress at work affecting recovery. Consider referral to counseling.',
    sourceClinic: 'Metro Spine Center',
    sourceClinicMasked: true,
    sharedDepth: 'full',
    isPublished: true
  },
  {
    id: 'e2',
    patientId: 'p2',
    patientName: 'Michael Chen',
    date: '2024-01-10',
    diagnosis: 'Rotator Cuff Tendinopathy',
    diagnosisCode: 'M75.10',
    bodyRegion: 'Shoulder',
    specialty: 'Sports Medicine',
    interventions: ['Ultrasound Therapy', 'Strengthening Exercises'],
    outcomeScore: 60,
    contraindications: ['Avoid overhead movements'],
    redFlags: ['Night pain - monitor for progression'],
    allergies: [],
    privateNote: 'Competing in local tennis league, very motivated.',
    sourceClinic: 'Athletic Recovery Clinic',
    sourceClinicMasked: false,
    sharedDepth: 'summary',
    isPublished: true
  }
];

const ClinicContext = createContext<ClinicContextType | undefined>(undefined);

export function ClinicProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<ClinicSettings>(initialSettings);
  const [patients] = useState<Patient[]>(initialPatients);
  const [encounters, setEncounters] = useState<Encounter[]>(initialEncounters);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [walkthroughStep, setWalkthroughStep] = useState(0);
  const [isWalkthroughActive, setIsWalkthroughActive] = useState(false);

  const addLog = useCallback((type: LogEntry['type'], message: string, credits?: number) => {
    const newLog: LogEntry = {
      id: `log-${Date.now()}`,
      timestamp: new Date().toISOString(),
      type,
      message,
      credits
    };
    setLogs(prev => [newLog, ...prev]);
  }, []);

  const updateOptInMode = useCallback((mode: OptInMode) => {
    setSettings(prev => ({ ...prev, optInMode: mode }));
    addLog('info', `Clinic changed to ${mode === 'opt-out' ? 'Opted Out' : mode === 'opt-in-basic' ? 'Basic Sharing' : 'Full Sharing'}`);
  }, [addLog]);

  const updateOriginVisibility = useCallback((visibility: OriginVisibility) => {
    setSettings(prev => ({ ...prev, originVisibility: visibility }));
    addLog('info', `Origin visibility set to ${visibility === 'masked' ? 'Masked' : 'Visible if patient allows'}`);
  }, [addLog]);

  const publishEncounter = useCallback((encounter: Omit<Encounter, 'id' | 'isPublished'>) => {
    const newEncounter: Encounter = {
      ...encounter,
      id: `e-${Date.now()}`,
      isPublished: true,
      sourceClinic: settings.name,
      sourceClinicMasked: settings.originVisibility === 'masked'
    };
    setEncounters(prev => [newEncounter, ...prev]);
    
    const creditsEarned = encounter.sharedDepth === 'full' ? 3 : encounter.sharedDepth === 'summary' ? 2 : 1;
    setSettings(prev => ({ 
      ...prev, 
      credits: prev.credits + creditsEarned,
      trustScore: Math.min(100, prev.trustScore + 2)
    }));
    addLog('earned', `Published encounter summary and earned ${creditsEarned} Continuity Credits`, creditsEarned);
  }, [settings.name, settings.originVisibility, addLog]);

  const spendCredits = useCallback((amount: number): boolean => {
    if (settings.credits >= amount) {
      setSettings(prev => ({ ...prev, credits: prev.credits - amount }));
      addLog('spent', `Spent ${amount} Continuity Credit${amount > 1 ? 's' : ''} to access patient history`, -amount);
      return true;
    }
    return false;
  }, [settings.credits, addLog]);

  const requestHistory = useCallback((request: HistoryRequest): AccessResult => {
    // Check if clinic is opted in
    if (settings.optInMode === 'opt-out') {
      addLog('denied', 'Access denied: Your clinic has not opted in to the exchange');
      return { allowed: false, reason: 'Your clinic must opt in to access shared histories' };
    }

    // Check if patient has consented
    if (!request.hasConsent) {
      addLog('denied', 'Access denied: Patient has not provided consent');
      return { allowed: false, reason: 'Patient consent is required to view history' };
    }

    // Check if booking exists
    if (!request.isBooked) {
      addLog('denied', 'Access denied: No active booking exists');
      return { allowed: false, reason: 'A confirmed booking is required to access history' };
    }

    // Check credits
    const requiredCredits = request.requestedDepth === 'full' ? 2 : request.requestedDepth === 'summary' ? 1 : 0;
    if (settings.credits < requiredCredits) {
      addLog('denied', `Access denied: Insufficient credits (need ${requiredCredits}, have ${settings.credits})`);
      return { allowed: false, reason: `You need ${requiredCredits} credits. Current balance: ${settings.credits}` };
    }

    // Calculate granted depth
    const patient = patients.find(p => p.id === request.patientId);
    const patientAllowedDepth = patient?.allowedDepth || 'glance';
    const clinicSharedDepth = settings.optInMode === 'opt-in-full' ? 'full' : 'summary';
    
    const depthOrder: HistoryDepth[] = ['glance', 'summary', 'full'];
    const grantedDepthIndex = Math.min(
      depthOrder.indexOf(request.requestedDepth),
      depthOrder.indexOf(patientAllowedDepth),
      depthOrder.indexOf(clinicSharedDepth)
    );
    const grantedDepth = depthOrder[grantedDepthIndex];

    // Spend credits if needed
    if (requiredCredits > 0) {
      spendCredits(requiredCredits);
    }

    addLog('info', `History access granted at ${grantedDepth} level`);
    return { allowed: true, grantedDepth };
  }, [settings, patients, addLog, spendCredits]);

  const getVisibleEncounters = useCallback((patientId: string, depth: HistoryDepth): Encounter[] => {
    return encounters.filter(e => e.patientId === patientId && e.isPublished);
  }, [encounters]);

  const startWalkthrough = useCallback(() => {
    setIsWalkthroughActive(true);
    setWalkthroughStep(1);
    // Reset to initial state for walkthrough
    setSettings({
      ...initialSettings,
      optInMode: 'opt-out',
      credits: 0
    });
    setLogs([]);
    addLog('info', 'Walkthrough started: Your clinic is currently opted out');
  }, [addLog]);

  const nextWalkthroughStep = useCallback(() => {
    setWalkthroughStep(prev => prev + 1);
  }, []);

  const resetWalkthrough = useCallback(() => {
    setIsWalkthroughActive(false);
    setWalkthroughStep(0);
    setSettings(initialSettings);
    setLogs([]);
  }, []);

  return (
    <ClinicContext.Provider value={{
      settings,
      patients,
      encounters,
      logs,
      walkthroughStep,
      isWalkthroughActive,
      updateOptInMode,
      updateOriginVisibility,
      publishEncounter,
      requestHistory,
      getVisibleEncounters,
      startWalkthrough,
      nextWalkthroughStep,
      resetWalkthrough,
      spendCredits
    }}>
      {children}
    </ClinicContext.Provider>
  );
}

export function useClinic() {
  const context = useContext(ClinicContext);
  if (context === undefined) {
    throw new Error('useClinic must be used within a ClinicProvider');
  }
  return context;
}
