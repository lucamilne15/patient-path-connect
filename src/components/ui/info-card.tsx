import { cn } from '@/lib/utils';
import { cva, type VariantProps } from 'class-variance-authority';
import { Info, AlertTriangle, CheckCircle, XCircle, Shield } from 'lucide-react';

const infoCardVariants = cva(
  'rounded-xl border p-4 flex gap-4',
  {
    variants: {
      variant: {
        info: 'bg-primary/5 border-primary/20',
        success: 'bg-success/5 border-success/20',
        warning: 'bg-warning/5 border-warning/20',
        error: 'bg-destructive/5 border-destructive/20',
        shield: 'bg-primary/5 border-primary/20',
      },
    },
    defaultVariants: {
      variant: 'info',
    },
  }
);

const iconMap = {
  info: Info,
  success: CheckCircle,
  warning: AlertTriangle,
  error: XCircle,
  shield: Shield,
};

const iconColorMap = {
  info: 'text-primary',
  success: 'text-success',
  warning: 'text-warning',
  error: 'text-destructive',
  shield: 'text-primary',
};

interface InfoCardProps extends VariantProps<typeof infoCardVariants> {
  title: string;
  description?: string;
  children?: React.ReactNode;
  className?: string;
}

export function InfoCard({ variant = 'info', title, description, children, className }: InfoCardProps) {
  const Icon = iconMap[variant!];
  const iconColor = iconColorMap[variant!];

  return (
    <div className={cn(infoCardVariants({ variant }), className)}>
      <div className={cn('flex-shrink-0 mt-0.5', iconColor)}>
        <Icon className="w-5 h-5" />
      </div>
      <div className="flex-1 min-w-0">
        <h4 className="font-semibold text-foreground">{title}</h4>
        {description && (
          <p className="text-sm text-muted-foreground mt-1">{description}</p>
        )}
        {children && <div className="mt-3">{children}</div>}
      </div>
    </div>
  );
}
