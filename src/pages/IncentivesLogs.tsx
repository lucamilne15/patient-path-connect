import { useClinic } from '@/context/ClinicContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { StatusBadge } from '@/components/ui/status-badge';
import { InfoCard } from '@/components/ui/info-card';
import { 
  Award, 
  Coins, 
  TrendingUp, 
  TrendingDown,
  ArrowUpCircle,
  ArrowDownCircle,
  XCircle,
  Info,
  Shield,
  RefreshCw,
  Clock
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { LogEntry } from '@/types/clinic';

const formatTimestamp = (timestamp: string) => {
  // Defensive: rendering this page should never hard-crash due to a bad timestamp.
  // `toLocaleTimeString()` throws RangeError("Invalid time value") for invalid Dates.
  try {
  const date = new Date(timestamp);
    if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
      second: '2-digit',
  });
  } catch {
    return '—';
  }
};

const getLogIcon = (type: LogEntry['type']) => {
  switch (type) {
    case 'earned':
      return ArrowUpCircle;
    case 'spent':
      return ArrowDownCircle;
    case 'denied':
      return XCircle;
    default:
      return Info;
  }
};

const getLogColor = (type: LogEntry['type']) => {
  switch (type) {
    case 'earned':
      return 'text-success';
    case 'spent':
      return 'text-warning';
    case 'denied':
      return 'text-destructive';
    default:
      return 'text-primary';
  }
};

const getLogBadgeVariant = (type: LogEntry['type']): 'success' | 'warning' | 'blocked' | 'info' => {
  switch (type) {
    case 'earned':
      return 'success';
    case 'spent':
      return 'warning';
    case 'denied':
      return 'blocked';
    default:
      return 'info';
  }
};

export default function IncentivesLogs() {
  const { settings, logs } = useClinic();

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Incentives & Activity</h1>
        <p className="text-muted-foreground mt-2">
          Track your credits, trust score, and exchange activity
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 gap-6">
        <Card className="card-elevated overflow-hidden">
          <div className="absolute inset-0 gradient-gold opacity-10" />
          <CardContent className="relative pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Continuity Credits</p>
                <div className="flex items-baseline gap-2 mt-2">
                  <span className="text-5xl font-bold text-foreground">{settings.credits}</span>
                  <span className="text-lg text-muted-foreground">credits</span>
                </div>
              </div>
              <div className="w-16 h-16 rounded-2xl gradient-gold flex items-center justify-center glow-gold">
                <Coins className="w-8 h-8 text-amber-800" />
              </div>
            </div>
            <p className="text-sm text-muted-foreground mt-4">
              Earn by contributing • Spend to access histories
            </p>
          </CardContent>
        </Card>

        <Card className="card-elevated overflow-hidden">
          <div className="absolute inset-0 gradient-primary opacity-10" />
          <CardContent className="relative pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Trust Score</p>
                <div className="flex items-baseline gap-2 mt-2">
                  <span className="text-5xl font-bold text-foreground">{settings.trustScore}</span>
                  <span className="text-lg text-muted-foreground">%</span>
                </div>
              </div>
              <div className="w-16 h-16 rounded-2xl gradient-primary flex items-center justify-center glow-teal">
                <Shield className="w-8 h-8 text-primary-foreground" />
              </div>
            </div>
            <div className="mt-4">
              <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                <div 
                  className="h-full bg-primary rounded-full transition-all duration-500"
                  style={{ width: `${settings.trustScore}%` }}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* How It Works */}
      <Card className="card-elevated">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <RefreshCw className="w-5 h-5 text-primary" />
            How the Exchange Works
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-3">
                <TrendingUp className="w-6 h-6 text-success" />
              </div>
              <h4 className="font-semibold mb-2">Contribute</h4>
              <p className="text-sm text-muted-foreground">
                Publish encounter summaries to earn credits. Full depth = more credits.
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-warning/10 flex items-center justify-center mx-auto mb-3">
                <TrendingDown className="w-6 h-6 text-warning" />
              </div>
              <h4 className="font-semibold mb-2">Consume</h4>
              <p className="text-sm text-muted-foreground">
                Request patient histories using your credits. Deeper access costs more.
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
                <Award className="w-6 h-6 text-primary" />
              </div>
              <h4 className="font-semibold mb-2">Build Trust</h4>
              <p className="text-sm text-muted-foreground">
                Consistent participation increases your trust score and access privileges.
              </p>
            </div>
          </div>

          <div className="mt-6 p-4 bg-muted/50 rounded-xl">
            <h4 className="font-semibold mb-3">Credit Costs</h4>
            <div className="grid grid-cols-3 gap-4">
              <div className="flex items-center justify-between p-3 bg-background rounded-lg">
                <span className="text-sm">Glance Access</span>
                <StatusBadge variant="success">Free</StatusBadge>
              </div>
              <div className="flex items-center justify-between p-3 bg-background rounded-lg">
                <span className="text-sm">Summary Access</span>
                <StatusBadge variant="credit">1 credit</StatusBadge>
              </div>
              <div className="flex items-center justify-between p-3 bg-background rounded-lg">
                <span className="text-sm">Full Access</span>
                <StatusBadge variant="credit">2 credits</StatusBadge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Activity Log */}
      <Card className="card-elevated">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-primary" />
            Activity Log
          </CardTitle>
          <CardDescription>
            Recent exchange events and transactions
          </CardDescription>
        </CardHeader>
        <CardContent>
          {logs.length === 0 ? (
            <div className="text-center py-12">
              <Clock className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">No Activity Yet</h3>
              <p className="text-muted-foreground">
                Your exchange activity will appear here as you contribute and request histories.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {logs.map((log, idx) => {
                const Icon = getLogIcon(log.type);
                const colorClass = getLogColor(log.type);
                const badgeVariant = getLogBadgeVariant(log.type);
                
                return (
                  <div
                    key={log.id}
                    className={cn(
                      "flex items-center gap-4 p-4 rounded-xl border transition-all",
                      "animate-fade-in bg-card hover:bg-muted/50"
                    )}
                    style={{ animationDelay: `${idx * 50}ms` }}
                  >
                    <div className={cn(
                      "w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0",
                      log.type === 'earned' && "bg-success/10",
                      log.type === 'spent' && "bg-warning/10",
                      log.type === 'denied' && "bg-destructive/10",
                      log.type === 'info' && "bg-primary/10"
                    )}>
                      <Icon className={cn("w-5 h-5", colorClass)} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-foreground">{log.message}</p>
                      <p className="text-sm text-muted-foreground">
                        {formatTimestamp(log.timestamp)}
                      </p>
                    </div>
                    {log.credits !== undefined && (
                      <StatusBadge variant={badgeVariant}>
                        {log.credits > 0 ? '+' : ''}{log.credits} credit{Math.abs(log.credits) !== 1 ? 's' : ''}
                      </StatusBadge>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Info Cards */}
      <div className="grid grid-cols-2 gap-4">
        <InfoCard
          variant="success"
          title="Fair Trade Principle"
          description="The exchange ensures mutual benefit. Clinics must contribute to the network before they can consume from it, creating a sustainable ecosystem."
        />
        <InfoCard
          variant="info"
          title="Trust Score Impact"
          description="A higher trust score unlocks premium features and may reduce credit costs in future updates. Consistent participation is rewarded."
        />
      </div>
    </div>
  );
}
