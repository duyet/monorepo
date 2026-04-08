import { Brain } from "@phosphor-icons/react";
import { ChainOfThoughtStep } from "@/components/ai-elements/chain-of-thought";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface ThinkingStepsProps {
  steps: string[];
  className?: string;
}

export function ThinkingSteps({ steps, className }: ThinkingStepsProps) {
  if (steps.length === 0) return null;

  return (
    <div className={cn("space-y-3", className)}>
      {/* Header with badge */}
      <div className="flex items-center gap-2">
        <Badge variant="secondary" className="text-xs">
          <Brain className="h-3 w-3 mr-1" />
          Thinking
        </Badge>
      </div>

      {/* Steps */}
      <div className="space-y-1">
        {steps.map((step, i) => (
          <ChainOfThoughtStep key={i} label={step} status="active" />
        ))}
      </div>
    </div>
  );
}

/**
 * Simple pulsing dots for loading state
 */
export function ThinkingDots() {
  return (
    <div className="flex items-center gap-1">
      <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground animate-pulse [animation-delay:0ms]" />
      <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground animate-pulse [animation-delay:150ms]" />
      <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground animate-pulse [animation-delay:300ms]" />
    </div>
  );
}
