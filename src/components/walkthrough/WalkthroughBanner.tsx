import { useClinic } from '@/context/ClinicContext';
import { X, ChevronRight, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const walkthroughSteps = [
  { step: 1, title: 'Opted Out', description: 'Try to request history (you\'ll be blocked)' },
  { step: 2, title: 'Opt In', description: 'Change your sharing mode to Basic or Full' },
  { step: 3, title: 'No Credits', description: 'Try again (still blocked - no credits)' },
  { step: 4, title: 'Contribute', description: 'Document an encounter to earn credits' },
  { step: 5, title: 'Access Granted', description: 'Request history successfully' },
  { step: 6, title: 'Complete', description: 'See masked origin & no private notes' },
];

export function WalkthroughBanner() {
  const { isWalkthroughActive, walkthroughStep, resetWalkthrough, nextWalkthroughStep } = useClinic();

  if (!isWalkthroughActive) return null;

  const currentStepInfo = walkthroughSteps.find(s => s.step === walkthroughStep);

  return (
    <div className="bg-primary text-primary-foreground px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium opacity-80">Walkthrough</span>
            <span className="px-2 py-0.5 bg-primary-foreground/20 rounded-full text-xs font-bold">
              Step {walkthroughStep}/6
            </span>
          </div>
          
          <div className="flex items-center gap-2">
            {walkthroughSteps.map((step) => (
              <div
                key={step.step}
                className={cn(
                  "w-2 h-2 rounded-full transition-all",
                  step.step < walkthroughStep && "bg-primary-foreground",
                  step.step === walkthroughStep && "bg-primary-foreground w-4",
                  step.step > walkthroughStep && "bg-primary-foreground/30"
                )}
              />
            ))}
          </div>

          {currentStepInfo && (
            <div className="flex items-center gap-3">
              <span className="font-semibold">{currentStepInfo.title}:</span>
              <span className="opacity-80">{currentStepInfo.description}</span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-3">
          {walkthroughStep < 6 && (
            <Button
              variant="secondary"
              size="sm"
              onClick={nextWalkthroughStep}
              className="bg-primary-foreground/20 hover:bg-primary-foreground/30 text-primary-foreground border-0"
            >
              Next Step
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          )}
          {walkthroughStep === 6 && (
            <div className="flex items-center gap-2 text-sm">
              <CheckCircle2 className="w-5 h-5" />
              <span>Walkthrough Complete!</span>
            </div>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={resetWalkthrough}
            className="text-primary-foreground hover:bg-primary-foreground/20"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>
      </div>
    </div>
  );
}
