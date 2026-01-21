import { useMemo, useState } from 'react';
import { useClinic } from '@/context/ClinicContext';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { StatusBadge } from '@/components/ui/status-badge';
import { InfoCard } from '@/components/ui/info-card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { 
  Search, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  Shield,
  Lock,
  Unlock,
  Eye,
  CalendarCheck,
  UserCheck,
  Coins,
  ArrowRight,
  ExternalLink,
  Info
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { HistoryDepth, AccessResult } from '@/types/clinic';

type BookingStatus = 'confirmed' | 'pending' | 'cancelled';
type Booking = {
  id: string;
  patientId: string;
  startAt: string; // ISO
  reason: string;
  status: BookingStatus;
};

const formatBookingDateTime = (iso: string) => {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export default function PatientLookup() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { 
    patients, 
    settings, 
    requestHistory, 
    walkthroughStep, 
    nextWalkthroughStep,
    isWalkthroughActive
  } = useClinic();
  
  const [patientId, setPatientId] = useState('');
  const [isBooked, setIsBooked] = useState(false);
  const [hasConsent, setHasConsent] = useState(false);
  const [requestedDepth, setRequestedDepth] = useState<HistoryDepth>('summary');
  const [accessResult, setAccessResult] = useState<AccessResult | null>(null);
  const [showResult, setShowResult] = useState(false);

  // Fake bookings for prototype UX (local-only, no backend yet).
  const bookings: Booking[] = useMemo(() => {
    const now = Date.now();
    const pick = (idx: number) => patients[idx % Math.max(1, patients.length)]?.id ?? '';
    return [
      {
        id: 'b-1001',
        patientId: pick(0),
        startAt: new Date(now + 2 * 60 * 60 * 1000).toISOString(),
        reason: 'Initial evaluation',
        status: 'confirmed',
      },
      {
        id: 'b-1002',
        patientId: pick(1),
        startAt: new Date(now + 26 * 60 * 60 * 1000).toISOString(),
        reason: 'Follow-up visit',
        status: 'pending',
      },
      {
        id: 'b-1003',
        patientId: pick(2),
        startAt: new Date(now - 22 * 60 * 60 * 1000).toISOString(),
        reason: 'Re-assessment',
        status: 'confirmed',
      },
      {
        id: 'b-1004',
        patientId: pick(0),
        startAt: new Date(now + 5 * 24 * 60 * 60 * 1000).toISOString(),
        reason: 'Discharge planning',
        status: 'cancelled',
      },
    ].filter(b => b.patientId);
  }, [patients]);

  const [openBookingId, setOpenBookingId] = useState<string | null>(null);
  const openBooking = bookings.find(b => b.id === openBookingId) ?? null;
  const openBookingPatient = patients.find(p => p.id === openBooking?.patientId);
  const [bookingRequestedDepth, setBookingRequestedDepth] = useState<HistoryDepth>('summary');
  const [bookingAccessResult, setBookingAccessResult] = useState<AccessResult | null>(null);

  const selectedPatient = patients.find(p => p.id === patientId);
  const requiredCredits = requestedDepth === 'full' ? 2 : requestedDepth === 'summary' ? 1 : 0;

  const gatingChecks = [
    {
      label: 'Clinic Opted In',
      passed: settings.optInMode !== 'opt-out',
      icon: settings.optInMode !== 'opt-out' ? Unlock : Lock,
      detail: settings.optInMode === 'opt-out' ? 'Your clinic must opt in' : `Mode: ${settings.optInMode === 'opt-in-basic' ? 'Basic' : 'Full'}`
    },
    {
      label: 'Patient Booked',
      passed: isBooked,
      icon: CalendarCheck,
      detail: isBooked ? 'Confirmed appointment' : 'Booking required'
    },
    {
      label: 'Patient Consent',
      passed: hasConsent,
      icon: UserCheck,
      detail: hasConsent ? 'Consent obtained' : 'Patient must consent'
    },
    {
      label: 'Sufficient Credits',
      passed: settings.credits >= requiredCredits,
      icon: Coins,
      detail: `Need ${requiredCredits}, have ${settings.credits}`
    },
  ];

  const allChecksPassed = gatingChecks.every(check => check.passed);

  const handleRequest = () => {
    const result = requestHistory({
      patientId,
      isBooked,
      hasConsent,
      requestedDepth
    });
    
    setAccessResult(result);
    setShowResult(true);

    // Walkthrough progression
    if (isWalkthroughActive) {
      if (walkthroughStep === 1 && !result.allowed) {
        nextWalkthroughStep();
      } else if (walkthroughStep === 3 && !result.allowed) {
        nextWalkthroughStep();
      } else if (walkthroughStep === 5 && result.allowed) {
        nextWalkthroughStep();
      }
    }
  };

  const handleViewHistory = () => {
    navigate('/history', { state: { patientId, depth: accessResult?.grantedDepth } });
  };

  const handleOpenBooking = (booking: Booking) => {
    setOpenBookingId(booking.id);
    setBookingRequestedDepth('summary');
    setBookingAccessResult(null);
  };

  const handleBookingRequestHistory = () => {
    if (!openBooking) return;
    const patient = openBookingPatient;
    const result = requestHistory({
      patientId: openBooking.patientId,
      isBooked: openBooking.status === 'confirmed',
      hasConsent: patient?.hasConsented ?? false,
      requestedDepth: bookingRequestedDepth,
    });
    setBookingAccessResult(result);

    if (!result.allowed) {
      toast({
        title: 'Access denied',
        description: result.reason ?? 'Unable to access patient history.',
        variant: 'destructive',
      });
      return;
    }

    toast({
      title: 'Access granted',
      description: `History available at ${result.grantedDepth} level.`,
    });
    setOpenBookingId(null);
    navigate('/history', { state: { patientId: openBooking.patientId, depth: result.grantedDepth } });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Patient Lookup</h1>
        <p className="text-muted-foreground mt-2">
          Request access to a patient's shared history from other clinics
        </p>
      </div>

      {/* Bookings */}
      <Card className="card-elevated">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarCheck className="w-5 h-5 text-primary" />
            Bookings
          </CardTitle>
          <CardDescription>
            Fake appointments for prototype flow — open a booking to request history.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Booking</TableHead>
                <TableHead>Patient</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {bookings.map((b) => {
                const patient = patients.find(p => p.id === b.patientId);
                return (
                  <TableRow key={b.id}>
                    <TableCell className="font-medium">{b.id}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span>{patient?.name ?? 'Unknown'}</span>
                        {patient?.hasConsented ? (
                          <StatusBadge variant="success" className="text-[11px]">Consent</StatusBadge>
                        ) : (
                          <StatusBadge variant="blocked" className="text-[11px]">No consent</StatusBadge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{formatBookingDateTime(b.startAt)}</TableCell>
                    <TableCell>
                      <StatusBadge
                        variant={b.status === 'confirmed' ? 'success' : b.status === 'pending' ? 'warning' : 'blocked'}
                      >
                        {b.status}
                      </StatusBadge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="secondary" size="sm" onClick={() => handleOpenBooking(b)}>
                        Open
                        <ExternalLink className="w-4 h-4 ml-2" />
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Booking details + request history */}
      <Dialog open={!!openBookingId} onOpenChange={(open) => setOpenBookingId(open ? openBookingId : null)}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>Booking details</DialogTitle>
            <DialogDescription>
              Open a booking, then request history for the patient.
            </DialogDescription>
          </DialogHeader>

          {openBooking && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-xl border bg-muted/30">
                  <p className="text-xs text-muted-foreground">Patient</p>
                  <p className="font-semibold">{openBookingPatient?.name ?? 'Unknown'}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    DOB: {openBookingPatient?.dateOfBirth ?? '—'}
                  </p>
                </div>
                <div className="p-4 rounded-xl border bg-muted/30">
                  <p className="text-xs text-muted-foreground">Appointment</p>
                  <p className="font-semibold">{formatBookingDateTime(openBooking.startAt)}</p>
                  <p className="text-xs text-muted-foreground mt-1">{openBooking.reason}</p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="p-4 rounded-xl border bg-muted/30">
                  <p className="text-xs text-muted-foreground">Booking</p>
                  <StatusBadge
                    variant={openBooking.status === 'confirmed' ? 'success' : openBooking.status === 'pending' ? 'warning' : 'blocked'}
                    className="mt-2"
                  >
                    {openBooking.status}
                  </StatusBadge>
                </div>
                <div className="p-4 rounded-xl border bg-muted/30">
                  <p className="text-xs text-muted-foreground">Consent</p>
                  <StatusBadge
                    variant={openBookingPatient?.hasConsented ? 'success' : 'blocked'}
                    className="mt-2"
                  >
                    {openBookingPatient?.hasConsented ? 'on file' : 'missing'}
                  </StatusBadge>
                </div>
                <div className="p-4 rounded-xl border bg-muted/30">
                  <p className="text-xs text-muted-foreground">Credits</p>
                  <p className="font-semibold mt-2">{settings.credits}</p>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Requested history depth</Label>
                <Select value={bookingRequestedDepth} onValueChange={(v) => setBookingRequestedDepth(v as HistoryDepth)}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select depth" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="glance">Glance (free)</SelectItem>
                    <SelectItem value="summary">Summary (1 credit)</SelectItem>
                    <SelectItem value="full">Full (2 credits)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {bookingAccessResult && (
                <div className={cn(
                  "p-4 rounded-xl border",
                  bookingAccessResult.allowed ? "border-success/30 bg-success/5" : "border-destructive/30 bg-destructive/5"
                )}>
                  <p className="font-medium">
                    {bookingAccessResult.allowed ? 'Access granted' : 'Access denied'}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {bookingAccessResult.allowed
                      ? `Granted depth: ${bookingAccessResult.grantedDepth}`
                      : (bookingAccessResult.reason ?? 'Unable to access patient history.')}
                  </p>
                </div>
              )}
            </div>
          )}

          <DialogFooter>
            <Button variant="secondary" onClick={() => setOpenBookingId(null)}>
              Close
            </Button>
            <Button
              onClick={handleBookingRequestHistory}
              className="gradient-primary text-primary-foreground"
              disabled={!openBooking}
            >
              Request history
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="grid grid-cols-3 gap-6">
        {/* Request Form */}
        <div className="col-span-2 space-y-6">
          <Card className="card-elevated">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Search className="w-5 h-5 text-primary" />
                History Request
              </CardTitle>
              <CardDescription>
                Select a patient and verify requirements before requesting their history
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Patient Selection */}
              <div className="space-y-2">
                <Label>Select Patient</Label>
                <Select value={patientId} onValueChange={setPatientId}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Choose a patient" />
                  </SelectTrigger>
                  <SelectContent>
                    {patients.map((patient) => (
                      <SelectItem key={patient.id} value={patient.id}>
                        <div className="flex items-center gap-3">
                          <span>{patient.name}</span>
                          <span className="text-muted-foreground text-sm">
                            DOB: {patient.dateOfBirth}
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Booking & Consent Toggles */}
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center justify-between p-4 rounded-xl border bg-muted/30">
                  <div className="flex items-center gap-3">
                    <CalendarCheck className={cn(
                      "w-5 h-5",
                      isBooked ? "text-success" : "text-muted-foreground"
                    )} />
                    <div>
                      <Label htmlFor="booking" className="cursor-pointer">Booking Exists</Label>
                      <p className="text-xs text-muted-foreground">Confirmed appointment</p>
                    </div>
                  </div>
                  <Switch
                    id="booking"
                    checked={isBooked}
                    onCheckedChange={setIsBooked}
                  />
                </div>

                <div className="flex items-center justify-between p-4 rounded-xl border bg-muted/30">
                  <div className="flex items-center gap-3">
                    <UserCheck className={cn(
                      "w-5 h-5",
                      hasConsent ? "text-success" : "text-muted-foreground"
                    )} />
                    <div>
                      <Label htmlFor="consent" className="cursor-pointer">Patient Consent</Label>
                      <p className="text-xs text-muted-foreground">Explicit permission</p>
                    </div>
                  </div>
                  <Switch
                    id="consent"
                    checked={hasConsent}
                    onCheckedChange={setHasConsent}
                  />
                </div>
              </div>

              {/* Depth Selection */}
              <div className="space-y-3">
                <Label>Requested History Depth</Label>
                <div className="grid grid-cols-3 gap-3">
                  {(['glance', 'summary', 'full'] as HistoryDepth[]).map((depth) => {
                    const credits = depth === 'full' ? 2 : depth === 'summary' ? 1 : 0;
                    const info = {
                      glance: { title: 'Glance', items: ['Visit date', 'Specialty', 'Red flags'] },
                      summary: { title: 'Summary', items: ['+ Diagnosis', '+ Interventions'] },
                      full: { title: 'Full', items: ['+ Outcomes', '+ Contraindications'] }
                    };
                    
                    return (
                      <button
                        key={depth}
                        onClick={() => setRequestedDepth(depth)}
                        className={cn(
                          "p-4 rounded-xl border-2 text-left transition-all",
                          requestedDepth === depth
                            ? "border-primary bg-primary/5"
                            : "border-border hover:border-primary/50"
                        )}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-semibold">{info[depth].title}</span>
                          {credits > 0 ? (
                            <StatusBadge variant="credit" className="text-xs">
                              {credits} credit{credits > 1 ? 's' : ''}
                            </StatusBadge>
                          ) : (
                            <StatusBadge variant="success" className="text-xs">Free</StatusBadge>
                          )}
                        </div>
                        <ul className="text-xs text-muted-foreground space-y-1">
                          {info[depth].items.map((item) => (
                            <li key={item}>{item}</li>
                          ))}
                        </ul>
                      </button>
                    );
                  })}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Result Card */}
          {showResult && accessResult && (
            <Card className={cn(
              "card-elevated animate-slide-in-right",
              accessResult.allowed ? "border-success/30" : "border-destructive/30"
            )}>
              <CardContent className="pt-6">
                {accessResult.allowed ? (
                  <div className="text-center">
                    <div className="w-16 h-16 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-4">
                      <CheckCircle2 className="w-8 h-8 text-success" />
                    </div>
                    <h3 className="text-xl font-bold text-foreground mb-2">Access Granted</h3>
                    <p className="text-muted-foreground mb-4">
                      History available at <strong>{accessResult.grantedDepth}</strong> level
                    </p>
                    <Button onClick={handleViewHistory} size="lg" className="gradient-primary text-primary-foreground">
                      View Patient History
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </div>
                ) : (
                  <div className="text-center">
                    <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-4">
                      <XCircle className="w-8 h-8 text-destructive" />
                    </div>
                    <h3 className="text-xl font-bold text-foreground mb-2">Access Denied</h3>
                    <p className="text-muted-foreground">{accessResult.reason}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Gating Status Panel */}
        <div className="space-y-6">
          <Card className="card-elevated sticky top-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Shield className="w-5 h-5 text-primary shield-icon" />
                Access Requirements
              </CardTitle>
              <CardDescription>
                All conditions must be met
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {gatingChecks.map((check, idx) => (
                <div
                  key={idx}
                  className={cn(
                    "flex items-center gap-3 p-3 rounded-lg border transition-all",
                    check.passed 
                      ? "bg-success/5 border-success/20" 
                      : "bg-muted/50 border-border"
                  )}
                >
                  <check.icon className={cn(
                    "w-5 h-5",
                    check.passed ? "text-success" : "text-muted-foreground"
                  )} />
                  <div className="flex-1 min-w-0">
                    <p className={cn(
                      "font-medium text-sm",
                      check.passed ? "text-foreground" : "text-muted-foreground"
                    )}>
                      {check.label}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {check.detail}
                    </p>
                  </div>
                  {check.passed ? (
                    <CheckCircle2 className="w-5 h-5 text-success flex-shrink-0" />
                  ) : (
                    <AlertTriangle className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                  )}
                </div>
              ))}

              <div className="pt-4 border-t">
                <Button
                  onClick={handleRequest}
                  disabled={!patientId}
                  className={cn(
                    "w-full",
                    allChecksPassed 
                      ? "gradient-primary text-primary-foreground" 
                      : ""
                  )}
                  variant={allChecksPassed ? "default" : "secondary"}
                  size="lg"
                >
                  <Eye className="w-4 h-4 mr-2" />
                  Request History
                </Button>
              </div>
            </CardContent>
          </Card>

          <InfoCard
            variant="info"
            title="Why these checks?"
            description="The exchange protects patient privacy and ensures fair participation. Each check prevents misuse while enabling continuity of care."
          />
        </div>
      </div>
    </div>
  );
}
