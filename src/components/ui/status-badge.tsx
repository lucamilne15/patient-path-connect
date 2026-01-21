import { cn } from '@/lib/utils';
import { cva, type VariantProps } from 'class-variance-authority';

const statusBadgeVariants = cva(
  'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border transition-colors',
  {
    variants: {
      variant: {
        success: 'bg-success/10 text-success border-success/20',
        warning: 'bg-warning/10 text-warning border-warning/20',
        blocked: 'bg-destructive/10 text-destructive border-destructive/20',
        info: 'bg-primary/10 text-primary border-primary/20',
        neutral: 'bg-muted text-muted-foreground border-border',
        credit: 'bg-gradient-to-r from-amber-100 to-yellow-100 text-amber-700 border-amber-200',
        masked: 'bg-purple-100 text-purple-700 border-purple-200',
      },
    },
    defaultVariants: {
      variant: 'neutral',
    },
  }
);

interface StatusBadgeProps extends VariantProps<typeof statusBadgeVariants> {
  children: React.ReactNode;
  icon?: React.ReactNode;
  className?: string;
}

export function StatusBadge({ variant, children, icon, className }: StatusBadgeProps) {
  return (
    <span className={cn(statusBadgeVariants({ variant }), className)}>
      {icon}
      {children}
    </span>
  );
}
