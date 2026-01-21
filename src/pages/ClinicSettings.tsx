import { useClinic } from '@/context/ClinicContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { StatusBadge } from '@/components/ui/status-badge';
import { InfoCard } from '@/components/ui/info-card';
import { Shield, Eye, EyeOff, Coins, TrendingUp, Lock, Unlock, Share2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { OptInMode, OriginVisibility } from '@/types/clinic';

const optInModes: { value: OptInMode; label: string; description: string; icon: typeof Lock; shares: string[] }[] = [
  {
    value: 'opt-out',
    label: 'Opted Out',
    description: 'Your clinic does not participate in the exchange. You cannot access or contribute patient histories.',
    icon: Lock,
    shares: []
  },
  {
    value: 'opt-in-basic',
    label: 'Basic Sharing',
    description: 'Share glance and summary-level data. Access others\' shared histories with credits.',
    icon: Unlock,
    shares: ['Last visit date', 'Specialty', 'Red flags & allergies', 'Diagnosis', 'Interventions']
  },
  {
    value: 'opt-in-full',
    label: 'Full Sharing',
    description: 'Share complete encounter data including outcomes. Earn maximum credits and build trust.',
    icon: Share2,
    shares: ['All Basic data', 'Outcome scores', 'Contraindications', 'Full treatment history']
  }
];

export default function ClinicSettings() {
  const { settings, updateOptInMode, updateOriginVisibility } = useClinic();

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Clinic Settings</h1>
        <p className="text-muted-foreground mt-2">
          Configure how your clinic participates in the Shared Patient History Exchange
        </p>
      </div>

      {/* Clinic Info Card */}
      <Card className="card-elevated">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl gradient-primary flex items-center justify-center">
                <Shield className="w-8 h-8 text-primary-foreground" />
              </div>
              <div>
                <CardTitle className="text-xl">{settings.name}</CardTitle>
                <CardDescription>Member of HistoryLink Exchange</CardDescription>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <div className="flex items-center gap-2 justify-end">
                  <Coins className="w-5 h-5 text-credit" />
                  <span className="text-2xl font-bold text-foreground">{settings.credits}</span>
                </div>
                <p className="text-sm text-muted-foreground">Continuity Credits</p>
              </div>
              <div className="w-px h-12 bg-border" />
              <div className="text-right">
                <div className="flex items-center gap-2 justify-end">
                  <TrendingUp className="w-5 h-5 text-primary" />
                  <span className="text-2xl font-bold text-foreground">{settings.trustScore}%</span>
                </div>
                <p className="text-sm text-muted-foreground">Trust Score</p>
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Opt-In Mode Selection */}
      <Card className="card-elevated">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-primary shield-icon" />
            Participation Mode
          </CardTitle>
          <CardDescription>
            Choose how your clinic participates in the exchange. Higher participation = more access.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <RadioGroup
            value={settings.optInMode}
            onValueChange={(value) => updateOptInMode(value as OptInMode)}
            className="space-y-4"
          >
            {optInModes.map((mode) => {
              const isSelected = settings.optInMode === mode.value;
              return (
                <label
                  key={mode.value}
                  className={cn(
                    'flex items-start gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all',
                    isSelected 
                      ? 'border-primary bg-primary/5' 
                      : 'border-border hover:border-primary/50 hover:bg-muted/50'
                  )}
                >
                  <RadioGroupItem value={mode.value} className="mt-1" />
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <mode.icon className={cn(
                        'w-5 h-5',
                        isSelected ? 'text-primary' : 'text-muted-foreground'
                      )} />
                      <span className="font-semibold text-foreground">{mode.label}</span>
                      {mode.value === 'opt-in-full' && (
                        <StatusBadge variant="credit">Recommended</StatusBadge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">{mode.description}</p>
                    {mode.shares.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {mode.shares.map((item) => (
                          <span 
                            key={item} 
                            className="px-2 py-1 bg-muted rounded-md text-xs text-muted-foreground"
                          >
                            {item}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </label>
              );
            })}
          </RadioGroup>
        </CardContent>
      </Card>

      {/* Origin Visibility */}
      <Card className="card-elevated">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="w-5 h-5 text-primary" />
            Origin Visibility
          </CardTitle>
          <CardDescription>
            Control whether other clinics can see your clinic name as the data source
          </CardDescription>
        </CardHeader>
        <CardContent>
          <RadioGroup
            value={settings.originVisibility}
            onValueChange={(value) => updateOriginVisibility(value as OriginVisibility)}
            className="space-y-4"
          >
            <label
              className={cn(
                'flex items-start gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all',
                settings.originVisibility === 'masked'
                  ? 'border-primary bg-primary/5'
                  : 'border-border hover:border-primary/50 hover:bg-muted/50'
              )}
            >
              <RadioGroupItem value="masked" className="mt-1" />
              <div className="flex-1">
                <div className="flex items-center gap-3">
                  <EyeOff className="w-5 h-5 text-masked" />
                  <span className="font-semibold text-foreground">Always Masked</span>
                  <StatusBadge variant="masked">Switching Shield</StatusBadge>
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  Your clinic name is never shown. Other clinics only see "Verified Provider".
                </p>
              </div>
            </label>

            <label
              className={cn(
                'flex items-start gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all',
                settings.originVisibility === 'visible-if-allowed'
                  ? 'border-primary bg-primary/5'
                  : 'border-border hover:border-primary/50 hover:bg-muted/50'
              )}
            >
              <RadioGroupItem value="visible-if-allowed" className="mt-1" />
              <div className="flex-1">
                <div className="flex items-center gap-3">
                  <Eye className="w-5 h-5 text-primary" />
                  <span className="font-semibold text-foreground">Visible if Patient Allows</span>
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  Show your clinic name only when the patient has explicitly consented to share origin.
                </p>
              </div>
            </label>
          </RadioGroup>
        </CardContent>
      </Card>

      {/* Shield Explanations */}
      <div className="grid grid-cols-2 gap-4">
        <InfoCard
          variant="shield"
          title="Switching Shield"
          description="Masking your clinic origin prevents patients from using history access to shop around. You contribute to care continuity without advertising to competitors."
        />
        <InfoCard
          variant="shield"
          title="Judgment Shield"
          description="Private clinician notes are never shared. Only structured, safety-focused data flows through the exchange - protecting your clinical reasoning."
        />
      </div>
    </div>
  );
}
