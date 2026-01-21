import { useState } from 'react';
import { useClinic } from '@/context/ClinicContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Checkbox } from '@/components/ui/checkbox';
import { StatusBadge } from '@/components/ui/status-badge';
import { InfoCard } from '@/components/ui/info-card';
import { 
  FileText, 
  Lock, 
  Coins, 
  CheckCircle2, 
  AlertTriangle,
  Sparkles,
  Eye,
  EyeOff
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { HistoryDepth } from '@/types/clinic';

const diagnoses = [
  { code: 'M51.16', label: 'Lumbar Disc Herniation' },
  { code: 'M75.10', label: 'Rotator Cuff Tendinopathy' },
  { code: 'M54.5', label: 'Low Back Pain' },
  { code: 'M79.3', label: 'Panniculitis' },
  { code: 'S83.50', label: 'Knee Sprain' },
  { code: 'M25.51', label: 'Joint Pain - Shoulder' },
  { code: 'G56.0', label: 'Carpal Tunnel Syndrome' },
  { code: 'M62.81', label: 'Muscle Weakness' },
];

const bodyRegions = [
  'Cervical Spine', 'Thoracic Spine', 'Lumbar Spine', 'Shoulder', 
  'Elbow', 'Wrist/Hand', 'Hip', 'Knee', 'Ankle/Foot'
];

const specialties = [
  'Orthopedic', 'Sports Medicine', 'Neurological', 'Pediatric', 
  'Geriatric', 'Women\'s Health', 'Vestibular', 'Cardiopulmonary'
];

const interventionOptions = [
  'Manual Therapy', 'Therapeutic Exercise', 'Patient Education',
  'Ultrasound Therapy', 'Electrical Stimulation', 'Heat/Cold Therapy',
  'Gait Training', 'Balance Training', 'Strengthening Exercises',
  'Stretching', 'Dry Needling', 'Cupping Therapy'
];

const contraindictionOptions = [
  'Avoid heavy lifting', 'No high-impact activities', 'Avoid overhead movements',
  'No running', 'Limit sitting duration', 'Avoid prolonged standing',
  'No contact sports', 'Avoid extreme temperatures'
];

export default function EncounterDocumentation() {
  const { patients, settings, publishEncounter, nextWalkthroughStep, walkthroughStep } = useClinic();
  const [patientId, setPatientId] = useState('');
  const [diagnosis, setDiagnosis] = useState('');
  const [bodyRegion, setBodyRegion] = useState('');
  const [specialty, setSpecialty] = useState('');
  const [interventions, setInterventions] = useState<string[]>([]);
  const [outcomeScore, setOutcomeScore] = useState([65]);
  const [contraindications, setContraindications] = useState<string[]>([]);
  const [redFlags, setRedFlags] = useState('');
  const [allergies, setAllergies] = useState('');
  const [privateNote, setPrivateNote] = useState('');
  const [sharedDepth, setSharedDepth] = useState<HistoryDepth>('summary');
  const [isPublished, setIsPublished] = useState(false);
  const [showCreditAnimation, setShowCreditAnimation] = useState(false);

  const selectedPatient = patients.find(p => p.id === patientId);
  const selectedDiagnosis = diagnoses.find(d => d.code === diagnosis);
  
  const creditsToEarn = sharedDepth === 'full' ? 3 : sharedDepth === 'summary' ? 2 : 1;

  const toggleIntervention = (intervention: string) => {
    setInterventions(prev => 
      prev.includes(intervention) 
        ? prev.filter(i => i !== intervention)
        : [...prev, intervention]
    );
  };

  const toggleContraindication = (item: string) => {
    setContraindications(prev => 
      prev.includes(item) 
        ? prev.filter(i => i !== item)
        : [...prev, item]
    );
  };

  const handlePublish = () => {
    if (!patientId || !diagnosis || !bodyRegion || !specialty || interventions.length === 0) {
      return;
    }

    publishEncounter({
      patientId,
      patientName: selectedPatient?.name || '',
      date: new Date().toISOString().split('T')[0],
      diagnosis: selectedDiagnosis?.label || '',
      diagnosisCode: diagnosis,
      bodyRegion,
      specialty,
      interventions,
      outcomeScore: outcomeScore[0],
      contraindications,
      redFlags: redFlags.split(',').map(s => s.trim()).filter(Boolean),
      allergies: allergies.split(',').map(s => s.trim()).filter(Boolean),
      privateNote,
      sourceClinic: settings.name,
      sourceClinicMasked: settings.originVisibility === 'masked',
      sharedDepth
    });

    setIsPublished(true);
    setShowCreditAnimation(true);
    
    if (walkthroughStep === 4) {
      nextWalkthroughStep();
    }
    
    setTimeout(() => setShowCreditAnimation(false), 1500);
  };

  const resetForm = () => {
    setPatientId('');
    setDiagnosis('');
    setBodyRegion('');
    setSpecialty('');
    setInterventions([]);
    setOutcomeScore([65]);
    setContraindications([]);
    setRedFlags('');
    setAllergies('');
    setPrivateNote('');
    setIsPublished(false);
  };

  if (isPublished) {
    return (
      <div className="max-w-2xl mx-auto space-y-8 animate-fade-in">
        <Card className="card-elevated border-success/30">
          <CardContent className="pt-8 pb-8 text-center">
            <div className="w-20 h-20 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="w-10 h-10 text-success" />
            </div>
            <h2 className="text-2xl font-bold text-foreground mb-2">Encounter Published!</h2>
            <p className="text-muted-foreground mb-6">
              Your shareable summary has been added to the exchange.
            </p>
            <div className={cn(
              "inline-flex items-center gap-3 px-6 py-3 rounded-xl",
              "bg-gradient-to-r from-amber-100 to-yellow-100 border border-amber-200",
              showCreditAnimation && "animate-credit-pop"
            )}>
              <Coins className="w-6 h-6 text-amber-600" />
              <span className="text-xl font-bold text-amber-700">+{creditsToEarn} Credits Earned</span>
              <Sparkles className="w-5 h-5 text-amber-500" />
            </div>
            <div className="mt-8">
              <Button onClick={resetForm} size="lg">
                Document Another Encounter
              </Button>
            </div>
          </CardContent>
        </Card>

        <InfoCard
          variant="success"
          title="Contributing builds trust"
          description="Each encounter you publish increases your Trust Score and earns Continuity Credits. This allows you to access shared histories from other clinics."
        />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Document Encounter</h1>
        <p className="text-muted-foreground mt-2">
          Complete the visit documentation and publish a shareable summary to earn credits
        </p>
      </div>

      {/* Main Form */}
      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2 space-y-6">
          {/* Patient & Diagnosis */}
          <Card className="card-elevated">
            <CardHeader>
              <CardTitle className="text-lg">Patient & Diagnosis</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Patient</Label>
                  <Select value={patientId} onValueChange={setPatientId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select patient" />
                    </SelectTrigger>
                    <SelectContent>
                      {patients.map((patient) => (
                        <SelectItem key={patient.id} value={patient.id}>
                          {patient.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Diagnosis (ICD-10)</Label>
                  <Select value={diagnosis} onValueChange={setDiagnosis}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select diagnosis" />
                    </SelectTrigger>
                    <SelectContent>
                      {diagnoses.map((d) => (
                        <SelectItem key={d.code} value={d.code}>
                          {d.code} - {d.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Body Region</Label>
                  <Select value={bodyRegion} onValueChange={setBodyRegion}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select region" />
                    </SelectTrigger>
                    <SelectContent>
                      {bodyRegions.map((region) => (
                        <SelectItem key={region} value={region}>
                          {region}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Specialty</Label>
                  <Select value={specialty} onValueChange={setSpecialty}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select specialty" />
                    </SelectTrigger>
                    <SelectContent>
                      {specialties.map((s) => (
                        <SelectItem key={s} value={s}>
                          {s}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Interventions */}
          <Card className="card-elevated">
            <CardHeader>
              <CardTitle className="text-lg">Interventions</CardTitle>
              <CardDescription>Select all treatments performed</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-3">
                {interventionOptions.map((intervention) => (
                  <label
                    key={intervention}
                    className={cn(
                      "flex items-center gap-2 p-3 rounded-lg border cursor-pointer transition-all",
                      interventions.includes(intervention)
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/50"
                    )}
                  >
                    <Checkbox
                      checked={interventions.includes(intervention)}
                      onCheckedChange={() => toggleIntervention(intervention)}
                    />
                    <span className="text-sm">{intervention}</span>
                  </label>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Outcome & Contraindications */}
          <Card className="card-elevated">
            <CardHeader>
              <CardTitle className="text-lg">Outcome & Safety</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label>Outcome Score</Label>
                  <span className="text-2xl font-bold text-primary">{outcomeScore[0]}</span>
                </div>
                <Slider
                  value={outcomeScore}
                  onValueChange={setOutcomeScore}
                  max={100}
                  step={5}
                  className="py-4"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Poor</span>
                  <span>Moderate</span>
                  <span>Excellent</span>
                </div>
              </div>

              <div className="space-y-3">
                <Label>Contraindications</Label>
                <div className="grid grid-cols-2 gap-2">
                  {contraindictionOptions.map((item) => (
                    <label
                      key={item}
                      className={cn(
                        "flex items-center gap-2 p-2.5 rounded-lg border cursor-pointer transition-all text-sm",
                        contraindications.includes(item)
                          ? "border-warning bg-warning/5"
                          : "border-border hover:border-warning/50"
                      )}
                    >
                      <Checkbox
                        checked={contraindications.includes(item)}
                        onCheckedChange={() => toggleContraindication(item)}
                      />
                      <span>{item}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-destructive" />
                    Red Flags
                  </Label>
                  <Input
                    value={redFlags}
                    onChange={(e) => setRedFlags(e.target.value)}
                    placeholder="Comma-separated warnings"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Allergies</Label>
                  <Input
                    value={allergies}
                    onChange={(e) => setAllergies(e.target.value)}
                    placeholder="Comma-separated allergies"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Private Note */}
          <Card className="card-elevated border-2 border-dashed border-muted">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Lock className="w-5 h-5 text-muted-foreground" />
                Private Clinician Note
                <StatusBadge variant="neutral">
                  <EyeOff className="w-3 h-3" />
                  Never Shared
                </StatusBadge>
              </CardTitle>
              <CardDescription>
                This note stays with your clinic only. It is never included in shared summaries.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea
                value={privateNote}
                onChange={(e) => setPrivateNote(e.target.value)}
                placeholder="Your private clinical observations, reasoning, or notes..."
                className="min-h-[100px]"
              />
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Publish Panel */}
        <div className="space-y-6">
          <Card className="card-elevated sticky top-8">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <FileText className="w-5 h-5 text-primary" />
                Publish Summary
              </CardTitle>
              <CardDescription>
                Choose what level of detail to share
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                {(['glance', 'summary', 'full'] as HistoryDepth[]).map((depth) => {
                  const credits = depth === 'full' ? 3 : depth === 'summary' ? 2 : 1;
                  const labels = {
                    glance: { title: 'Glance', desc: 'Visit date, specialty, red flags only' },
                    summary: { title: 'Summary', desc: 'Add diagnosis & interventions' },
                    full: { title: 'Full', desc: 'Include outcomes & contraindications' }
                  };
                  
                  return (
                    <label
                      key={depth}
                      className={cn(
                        "block p-4 rounded-xl border-2 cursor-pointer transition-all",
                        sharedDepth === depth
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-primary/50"
                      )}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <input
                            type="radio"
                            name="depth"
                            value={depth}
                            checked={sharedDepth === depth}
                            onChange={() => setSharedDepth(depth)}
                            className="mt-0.5"
                          />
                          <div>
                            <p className="font-semibold">{labels[depth].title}</p>
                            <p className="text-xs text-muted-foreground">{labels[depth].desc}</p>
                          </div>
                        </div>
                        <StatusBadge variant="credit">
                          <Coins className="w-3 h-3" />
                          +{credits}
                        </StatusBadge>
                      </div>
                    </label>
                  );
                })}
              </div>

              <div className="pt-4 border-t">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm text-muted-foreground">Credits to earn</span>
                  <span className="text-xl font-bold text-credit">+{creditsToEarn}</span>
                </div>
                <Button
                  onClick={handlePublish}
                  disabled={!patientId || !diagnosis || !bodyRegion || !specialty || interventions.length === 0}
                  className="w-full gradient-primary text-primary-foreground"
                  size="lg"
                >
                  <Eye className="w-4 h-4 mr-2" />
                  Publish & Earn Credits
                </Button>
              </div>
            </CardContent>
          </Card>

          <InfoCard
            variant="info"
            title="What gets shared?"
            description="Only structured, coded data is shared. Your private notes and clinical reasoning stay with you."
          />
        </div>
      </div>
    </div>
  );
}
