import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { StatusBadge } from '@/components/ui/status-badge';
import { 
  Inbox,
  FileText,
  Send,
  Eye,
  EyeOff,
  Lock,
  Building2,
  Stethoscope,
  Tag,
  Home,
  AlertTriangle,
  ClipboardList,
  Shield,
  ArrowRight,
  Clock,
  CheckCircle2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from '@/hooks/use-toast';

// Mock incoming requests
const mockRequests = [
  {
    id: 'req1',
    patientName: 'Sarah Johnson',
    requestingClinic: 'Wellness Physical Therapy',
    requestingRegion: 'Northern Suburbs',
    requestedAt: '2024-01-20T10:30:00',
    status: 'pending',
  },
];

// Diagnosis codes
const diagnosisCodes = [
  { code: 'M25.56', label: 'Pain in knee' },
  { code: 'M54.5', label: 'Low back pain' },
  { code: 'M75.10', label: 'Rotator cuff tendinopathy' },
  { code: 'M79.3', label: 'Panniculitis' },
  { code: 'S83.50', label: 'Knee sprain' },
];

// Intervention tags
const interventionTags = [
  'Strengthening',
  'Load management',
  'Manual therapy',
  'Dry needling',
  'Taping',
  'Education',
  'Graded exposure',
  'Motor control',
  'Stretching',
  'Proprioception',
];

// Home program tags
const homeProgramTags = [
  'Hip stability',
  'Hamstring eccentrics',
  'Quad strengthening',
  'Core activation',
  'Glute bridges',
  'Calf raises',
  'Balance work',
  'Walking program',
  'Foam rolling',
  'Self-massage',
];

// Contraindication options
const contraindicationOptions = [
  'No deep flexion',
  'Monitor swelling',
  'Avoid impact',
  'No running',
  'Limit stairs',
  'Avoid prolonged sitting',
  'No heavy lifting',
  'Avoid twisting',
];

// Care context tags
const careContextTags = [
  { id: 'attended', label: 'Attended 2/6 sessions' },
  { id: 'self-discharged', label: 'Self-discharged' },
  { id: 'paused', label: 'Paused due to travel' },
  { id: 'symptoms-variable', label: 'Symptoms variable' },
  { id: 'good-compliance', label: 'Good home exercise compliance' },
  { id: 'poor-compliance', label: 'Poor home exercise compliance' },
  { id: 'work-related', label: 'Work-related factors' },
  { id: 'completed', label: 'Completed full episode' },
];

export default function HistoryFeed() {
  const [selectedRequest, setSelectedRequest] = useState<string | null>(null);
  const [isSending, setIsSending] = useState(false);
  const [isSent, setIsSent] = useState(false);
  
  // Form state - structured fields only
  const [diagnosis, setDiagnosis] = useState('');
  const [selectedInterventions, setSelectedInterventions] = useState<string[]>([]);
  const [selectedHomeProgram, setSelectedHomeProgram] = useState<string[]>([]);
  const [selectedContraindications, setSelectedContraindications] = useState<string[]>([]);
  const [selectedCareContext, setSelectedCareContext] = useState<string[]>([]);

  const currentRequest = mockRequests.find(r => r.id === selectedRequest);

  const toggleTag = (tag: string, selected: string[], setSelected: (tags: string[]) => void) => {
    if (selected.includes(tag)) {
      setSelected(selected.filter(t => t !== tag));
    } else {
      setSelected([...selected, tag]);
    }
  };

  const handleSend = () => {
    if (!diagnosis) {
      toast({
        title: 'Missing Information',
        description: 'Please select a diagnosis code.',
        variant: 'destructive',
      });
      return;
    }

    setIsSending(true);
    
    setTimeout(() => {
      setIsSending(false);
      setIsSent(true);
      toast({
        title: 'Summary Sent',
        description: 'Continuity summary has been shared securely.',
      });
    }, 1500);
  };

  const resetForm = () => {
    setSelectedRequest(null);
    setIsSent(false);
    setDiagnosis('');
    setSelectedInterventions([]);
    setSelectedHomeProgram([]);
    setSelectedContraindications([]);
    setSelectedCareContext([]);
  };

  // Success state after sending
  if (isSent) {
    return (
      <div className="max-w-2xl mx-auto space-y-8 animate-fade-in">
        <Card className="card-elevated border-success/30">
          <CardContent className="pt-8 pb-8 text-center">
            <div className="w-20 h-20 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="w-10 h-10 text-success" />
            </div>
            <h2 className="text-2xl font-bold text-foreground mb-2">Summary Shared!</h2>
            <p className="text-muted-foreground mb-6">
              The continuity summary for {currentRequest?.patientName} has been securely sent to {currentRequest?.requestingClinic}.
            </p>
            <div className="p-4 rounded-xl bg-muted/50 text-left mb-6">
              <p className="text-sm text-muted-foreground mb-2">What was shared:</p>
              <ul className="text-sm space-y-1">
                <li>• Diagnosis code (structured)</li>
                <li>• Intervention tags</li>
                <li>• Home program tags</li>
                <li>• Precautions</li>
                <li>• Care context</li>
              </ul>
              <p className="text-sm text-muted-foreground mt-4 flex items-center gap-2">
                <Lock className="w-4 h-4" />
                Internal notes were NOT shared
              </p>
            </div>
            <Button onClick={resetForm} size="lg">
              Back to Request Queue
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Inbox view
  if (!selectedRequest) {
    return (
      <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-foreground">History Requests</h1>
          <p className="text-muted-foreground mt-2">
            Incoming requests for patient continuity summaries
          </p>
        </div>

        {/* Request Queue */}
        <Card className="card-elevated">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Inbox className="w-5 h-5 text-primary" />
              Request Queue
            </CardTitle>
            <CardDescription>
              Review and respond to history requests from other clinics
            </CardDescription>
          </CardHeader>
          <CardContent>
            {mockRequests.length === 0 ? (
              <div className="text-center py-12">
                <Inbox className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-2">No Pending Requests</h3>
                <p className="text-muted-foreground">
                  History requests will appear here when other clinics request access.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {mockRequests.map((request) => (
                  <div
                    key={request.id}
                    className="flex items-center justify-between p-4 rounded-xl border bg-card hover:bg-muted/50 transition-all"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-warning/10 flex items-center justify-center">
                        <FileText className="w-6 h-6 text-warning" />
                      </div>
                      <div>
                        <p className="font-semibold text-foreground">
                          History request: {request.patientName}
                        </p>
                        <p className="text-sm text-muted-foreground flex items-center gap-2 mt-1">
                          <Building2 className="w-4 h-4" />
                          Booked at {request.requestingClinic} ({request.requestingRegion})
                        </p>
                        <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                          <Clock className="w-3 h-3" />
                          {new Date(request.requestedAt).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <StatusBadge variant="warning">Pending</StatusBadge>
                      <Button onClick={() => setSelectedRequest(request.id)}>
                        Share Summary
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Info Card */}
        <Card className="bg-primary/5 border-primary/20">
          <CardContent className="py-4">
            <div className="flex items-start gap-4">
              <Shield className="w-6 h-6 text-primary flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-semibold text-foreground">Judgment Shield Active</h4>
                <p className="text-sm text-muted-foreground mt-1">
                  When you share a summary, only structured tags are sent. Your internal notes, 
                  clinical reasoning, and free-text assessments are never included.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Share Pack Composer
  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Share Continuity Summary</h1>
          <p className="text-muted-foreground mt-2">
            Compose structured handover for {currentRequest?.patientName}
          </p>
        </div>
        <Button variant="outline" onClick={() => setSelectedRequest(null)}>
          Back to Queue
        </Button>
      </div>

      {/* Request Info */}
      <Card className="card-elevated border-warning/20">
        <CardContent className="py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-warning/10 flex items-center justify-center">
                <FileText className="w-5 h-5 text-warning" />
              </div>
              <div>
                <p className="font-semibold">Request from: {currentRequest?.requestingClinic}</p>
                <p className="text-sm text-muted-foreground">
                  Patient has booked an appointment and consented to history sharing
                </p>
              </div>
            </div>
            <StatusBadge variant="info">
              <Building2 className="w-3 h-3" />
              Your identity will be masked
            </StatusBadge>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-3 gap-6">
        {/* Composer Form */}
        <div className="col-span-2 space-y-6">
          {/* Diagnosis */}
          <Card className="card-elevated">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Stethoscope className="w-5 h-5 text-primary" />
                Diagnosis
              </CardTitle>
              <CardDescription>
                Select the primary diagnosis code
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Select value={diagnosis} onValueChange={setDiagnosis}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select diagnosis code" />
                </SelectTrigger>
                <SelectContent>
                  {diagnosisCodes.map((d) => (
                    <SelectItem key={d.code} value={d.code}>
                      {d.code} — {d.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          {/* Interventions */}
          <Card className="card-elevated">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Tag className="w-5 h-5 text-primary" />
                Interventions
              </CardTitle>
              <CardDescription>
                Select treatment approaches used
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {interventionTags.map((tag) => (
                  <button
                    key={tag}
                    onClick={() => toggleTag(tag, selectedInterventions, setSelectedInterventions)}
                    className={cn(
                      "px-3 py-2 rounded-lg text-sm font-medium border transition-all",
                      selectedInterventions.includes(tag)
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-muted/50 text-foreground border-border hover:border-primary/50"
                    )}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Home Program */}
          <Card className="card-elevated">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Home className="w-5 h-5 text-primary" />
                Home Program
              </CardTitle>
              <CardDescription>
                Select prescribed home exercises
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {homeProgramTags.map((tag) => (
                  <button
                    key={tag}
                    onClick={() => toggleTag(tag, selectedHomeProgram, setSelectedHomeProgram)}
                    className={cn(
                      "px-3 py-2 rounded-lg text-sm font-medium border transition-all",
                      selectedHomeProgram.includes(tag)
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-muted/50 text-foreground border-border hover:border-primary/50"
                    )}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Contraindications */}
          <Card className="card-elevated">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <AlertTriangle className="w-5 h-5 text-warning" />
                Precautions
              </CardTitle>
              <CardDescription>
                Select any contraindications or precautions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3">
                {contraindicationOptions.map((item) => (
                  <label
                    key={item}
                    className={cn(
                      "flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all",
                      selectedContraindications.includes(item)
                        ? "bg-warning/10 border-warning/30"
                        : "bg-muted/30 border-border hover:border-warning/30"
                    )}
                  >
                    <Checkbox
                      checked={selectedContraindications.includes(item)}
                      onCheckedChange={() => toggleTag(item, selectedContraindications, setSelectedContraindications)}
                    />
                    <span className="text-sm">{item}</span>
                  </label>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Care Context */}
          <Card className="card-elevated">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <ClipboardList className="w-5 h-5 text-primary" />
                Care Context
              </CardTitle>
              <CardDescription>
                Select relevant care context tags
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3">
                {careContextTags.map((item) => (
                  <label
                    key={item.id}
                    className={cn(
                      "flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all",
                      selectedCareContext.includes(item.id)
                        ? "bg-primary/10 border-primary/30"
                        : "bg-muted/30 border-border hover:border-primary/30"
                    )}
                  >
                    <Checkbox
                      checked={selectedCareContext.includes(item.id)}
                      onCheckedChange={() => toggleTag(item.id, selectedCareContext, setSelectedCareContext)}
                    />
                    <span className="text-sm">{item.label}</span>
                  </label>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Internal Notes - NOT SHARED */}
          <Card className="card-elevated border-2 border-dashed border-muted">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg text-muted-foreground">
                <Lock className="w-5 h-5" />
                Internal Notes
                <StatusBadge variant="neutral">
                  <EyeOff className="w-3 h-3" />
                  Never Shared
                </StatusBadge>
              </CardTitle>
              <CardDescription>
                Your private clinical notes remain with you. This section is display-only.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="p-4 rounded-xl bg-muted/30 border border-dashed">
                <p className="text-sm text-muted-foreground italic">
                  "Patient mentioned work stress. Concerned about compliance. May benefit from 
                  psych referral. Rapport building needed — seemed frustrated with previous care."
                </p>
              </div>
              <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
                <Shield className="w-4 h-4" />
                <span>This note is protected by Judgment Shield and will not be shared.</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Preview Panel */}
        <div className="space-y-6">
          <Card className="card-elevated sticky top-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Eye className="w-5 h-5 text-primary" />
                Preview
              </CardTitle>
              <CardDescription>
                Exactly what the receiving clinic will see
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Provider Masking */}
              <div className="p-3 rounded-lg bg-muted/50">
                <p className="text-xs text-muted-foreground">Source</p>
                <p className="font-medium text-sm mt-1">
                  Previous provider (Sports Physio, Eastern Suburbs)
                </p>
              </div>

              {/* Diagnosis */}
              {diagnosis && (
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Diagnosis</p>
                  <StatusBadge variant="info">
                    {diagnosisCodes.find(d => d.code === diagnosis)?.label || diagnosis}
                  </StatusBadge>
                </div>
              )}

              {/* Interventions */}
              {selectedInterventions.length > 0 && (
                <div>
                  <p className="text-xs text-muted-foreground mb-2">What's been tried</p>
                  <div className="flex flex-wrap gap-1">
                    {selectedInterventions.map((tag) => (
                      <StatusBadge key={tag} variant="neutral" className="text-xs">
                        {tag}
                      </StatusBadge>
                    ))}
                  </div>
                </div>
              )}

              {/* Home Program */}
              {selectedHomeProgram.length > 0 && (
                <div>
                  <p className="text-xs text-muted-foreground mb-2">Home program</p>
                  <div className="flex flex-wrap gap-1">
                    {selectedHomeProgram.map((tag) => (
                      <StatusBadge key={tag} variant="neutral" className="text-xs">
                        {tag}
                      </StatusBadge>
                    ))}
                  </div>
                </div>
              )}

              {/* Precautions */}
              {selectedContraindications.length > 0 && (
                <div>
                  <p className="text-xs text-muted-foreground mb-2">Precautions</p>
                  <div className="flex flex-wrap gap-1">
                    {selectedContraindications.map((tag) => (
                      <StatusBadge key={tag} variant="warning" className="text-xs">
                        {tag}
                      </StatusBadge>
                    ))}
                  </div>
                </div>
              )}

              {/* Care Context */}
              {selectedCareContext.length > 0 && (
                <div>
                  <p className="text-xs text-muted-foreground mb-2">Care context</p>
                  <div className="flex flex-wrap gap-1">
                    {selectedCareContext.map((id) => (
                      <StatusBadge key={id} variant="neutral" className="text-xs">
                        {careContextTags.find(t => t.id === id)?.label}
                      </StatusBadge>
                    ))}
                  </div>
                </div>
              )}

              {/* Empty State */}
              {!diagnosis && selectedInterventions.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">
                  Select fields to see preview
                </p>
              )}

              <div className="pt-4 border-t">
                <Button 
                  onClick={handleSend}
                  disabled={!diagnosis || isSending}
                  className="w-full gradient-primary text-primary-foreground"
                  size="lg"
                >
                  {isSending ? (
                    <>Sending...</>
                  ) : (
                    <>
                      <Send className="w-4 h-4 mr-2" />
                      Send Summary
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* No Free-text Callout */}
          <Card className="bg-destructive/5 border-destructive/20">
            <CardContent className="py-4">
              <div className="flex items-start gap-3">
                <Lock className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-sm text-foreground">No free-text fields</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    This form intentionally has no text boxes. Only structured, 
                    coded data can be shared — protecting you from liability and 
                    the patient from judgment.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
