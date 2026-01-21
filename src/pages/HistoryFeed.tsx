import { useLocation } from 'react-router-dom';
import { useClinic } from '@/context/ClinicContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { StatusBadge } from '@/components/ui/status-badge';
import { InfoCard } from '@/components/ui/info-card';
import { 
  History, 
  Calendar, 
  Stethoscope, 
  AlertTriangle, 
  Pill,
  Eye,
  EyeOff,
  Lock,
  Activity,
  FileWarning,
  Building2,
  CheckCircle2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { HistoryDepth } from '@/types/clinic';

export default function HistoryFeed() {
  const location = useLocation();
  const { encounters, patients, settings } = useClinic();
  
  const { patientId, depth } = (location.state as { patientId?: string; depth?: HistoryDepth }) || {};
  
  const currentDepth = depth || 'summary';
  const patient = patients.find(p => p.id === patientId);
  const patientEncounters = patientId 
    ? encounters.filter(e => e.patientId === patientId && e.isPublished)
    : encounters.filter(e => e.isPublished);

  const depthOrder: HistoryDepth[] = ['glance', 'summary', 'full'];
  const depthIndex = depthOrder.indexOf(currentDepth);

  const showSummary = depthIndex >= 1;
  const showFull = depthIndex >= 2;

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Patient History Feed</h1>
          <p className="text-muted-foreground mt-2">
            {patient ? `Viewing history for ${patient.name}` : 'Shared encounter records from the exchange'}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-muted-foreground">Viewing at:</span>
          <StatusBadge variant="info" className="text-sm">
            <Eye className="w-3 h-3" />
            {currentDepth.charAt(0).toUpperCase() + currentDepth.slice(1)} Level
          </StatusBadge>
        </div>
      </div>

      {/* Depth Legend */}
      <Card className="card-elevated">
        <CardContent className="py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <div className={cn(
                  "w-3 h-3 rounded-full",
                  depthIndex >= 0 ? "bg-success" : "bg-muted"
                )} />
                <span className="text-sm">Glance</span>
              </div>
              <div className="flex items-center gap-2">
                <div className={cn(
                  "w-3 h-3 rounded-full",
                  depthIndex >= 1 ? "bg-success" : "bg-muted"
                )} />
                <span className="text-sm">Summary</span>
              </div>
              <div className="flex items-center gap-2">
                <div className={cn(
                  "w-3 h-3 rounded-full",
                  depthIndex >= 2 ? "bg-success" : "bg-muted"
                )} />
                <span className="text-sm">Full</span>
              </div>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Lock className="w-4 h-4" />
              Private notes are never shown
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Encounter Cards */}
      <div className="space-y-6">
        {patientEncounters.length === 0 ? (
          <Card className="card-elevated">
            <CardContent className="py-12 text-center">
              <History className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">No History Available</h3>
              <p className="text-muted-foreground">
                No shared encounters found for this patient in the exchange.
              </p>
            </CardContent>
          </Card>
        ) : (
          patientEncounters.map((encounter, idx) => (
            <Card 
              key={encounter.id} 
              className="card-elevated animate-fade-in"
              style={{ animationDelay: `${idx * 100}ms` }}
            >
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                      <Stethoscope className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{encounter.specialty}</CardTitle>
                      <CardDescription className="flex items-center gap-2 mt-1">
                        <Calendar className="w-4 h-4" />
                        {new Date(encounter.date).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </CardDescription>
                    </div>
                  </div>
                  
                  {/* Origin Clinic */}
                  <div className="flex items-center gap-2">
                    {encounter.sourceClinicMasked || !patients.find(p => p.id === encounter.patientId)?.allowOriginVisible ? (
                      <StatusBadge variant="masked">
                        <EyeOff className="w-3 h-3" />
                        Verified Provider
                      </StatusBadge>
                    ) : (
                      <StatusBadge variant="info">
                        <Building2 className="w-3 h-3" />
                        {encounter.sourceClinic}
                      </StatusBadge>
                    )}
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-6">
                {/* Always Visible - Glance Level */}
                <div className="space-y-4">
                  {/* Red Flags */}
                  {encounter.redFlags.length > 0 && (
                    <div className="p-4 rounded-xl bg-destructive/5 border border-destructive/20">
                      <div className="flex items-center gap-2 text-destructive font-semibold mb-2">
                        <AlertTriangle className="w-5 h-5" />
                        Red Flags
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {encounter.redFlags.map((flag, i) => (
                          <StatusBadge key={i} variant="blocked">{flag}</StatusBadge>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Allergies */}
                  {encounter.allergies.length > 0 && (
                    <div className="flex items-center gap-3">
                      <Pill className="w-5 h-5 text-warning" />
                      <span className="font-medium">Allergies:</span>
                      <div className="flex flex-wrap gap-2">
                        {encounter.allergies.map((allergy, i) => (
                          <StatusBadge key={i} variant="warning">{allergy}</StatusBadge>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex items-center gap-3">
                    <Activity className="w-5 h-5 text-primary" />
                    <span className="font-medium">Body Region:</span>
                    <span className="text-muted-foreground">{encounter.bodyRegion}</span>
                  </div>
                </div>

                {/* Summary Level */}
                {showSummary ? (
                  <div className="pt-4 border-t space-y-4">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                      <CheckCircle2 className="w-4 h-4 text-success" />
                      Summary level unlocked
                    </div>
                    
                    <div>
                      <span className="font-semibold text-foreground">Diagnosis:</span>
                      <p className="text-muted-foreground mt-1">
                        {encounter.diagnosis} ({encounter.diagnosisCode})
                      </p>
                    </div>

                    <div>
                      <span className="font-semibold text-foreground">Interventions:</span>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {encounter.interventions.map((intervention, i) => (
                          <StatusBadge key={i} variant="info">{intervention}</StatusBadge>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="pt-4 border-t">
                    <div className="flex items-center gap-3 text-muted-foreground p-4 bg-muted/50 rounded-xl">
                      <Lock className="w-5 h-5" />
                      <span className="text-sm">
                        Diagnosis & interventions require <strong>Summary</strong> level access
                      </span>
                    </div>
                  </div>
                )}

                {/* Full Level */}
                {showFull ? (
                  <div className="pt-4 border-t space-y-4">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                      <CheckCircle2 className="w-4 h-4 text-success" />
                      Full level unlocked
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 rounded-xl bg-muted/50">
                        <span className="text-sm text-muted-foreground">Outcome Score</span>
                        <div className="flex items-baseline gap-2 mt-1">
                          <span className="text-3xl font-bold text-foreground">{encounter.outcomeScore}</span>
                          <span className="text-muted-foreground">/100</span>
                        </div>
                        <div className="w-full h-2 bg-muted rounded-full mt-2 overflow-hidden">
                          <div 
                            className="h-full bg-primary rounded-full transition-all"
                            style={{ width: `${encounter.outcomeScore}%` }}
                          />
                        </div>
                      </div>

                      <div className="p-4 rounded-xl bg-warning/5 border border-warning/20">
                        <div className="flex items-center gap-2 text-warning font-semibold mb-2">
                          <FileWarning className="w-4 h-4" />
                          Contraindications
                        </div>
                        {encounter.contraindications.length > 0 ? (
                          <ul className="text-sm space-y-1">
                            {encounter.contraindications.map((item, i) => (
                              <li key={i} className="text-muted-foreground">• {item}</li>
                            ))}
                          </ul>
                        ) : (
                          <p className="text-sm text-muted-foreground">None documented</p>
                        )}
                      </div>
                    </div>
                  </div>
                ) : showSummary ? (
                  <div className="pt-4 border-t">
                    <div className="flex items-center gap-3 text-muted-foreground p-4 bg-muted/50 rounded-xl">
                      <Lock className="w-5 h-5" />
                      <span className="text-sm">
                        Outcome scores & contraindications require <strong>Full</strong> level access
                      </span>
                    </div>
                  </div>
                ) : null}

                {/* Private Note - Never Shown */}
                <div className="pt-4 border-t">
                  <div className="flex items-center gap-3 p-4 bg-muted/30 rounded-xl border-2 border-dashed border-muted">
                    <Lock className="w-5 h-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium text-muted-foreground">Private Clinician Notes</p>
                      <p className="text-sm text-muted-foreground/70">
                        Never shared through the exchange — protected by Judgment Shield
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Info Cards */}
      <div className="grid grid-cols-2 gap-4">
        <InfoCard
          variant="shield"
          title="Switching Shield Active"
          description="Source clinic identities are masked by default, preventing patients from using this data to shop for providers."
        />
        <InfoCard
          variant="shield"
          title="Judgment Shield Active"
          description="Private clinical notes and reasoning are never shared. Only structured, safety-focused data flows through the exchange."
        />
      </div>
    </div>
  );
}
