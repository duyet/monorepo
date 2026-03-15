"use client";

import { Badge } from "@duyet/components";
import { Brain, Loader2 } from "lucide-react";
import { ChainOfThoughtStep } from "@/components/ai-elements/chain-of-thought";
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
          <ChainOfThoughtStep
            key={i}
            label={step}
            status="active"
          />
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

/**
 * Tool call indicator
 */
interface ToolCallIndicatorProps {
  toolName: string;
  params?: Record<string, unknown>;
}

export function ToolCallIndicator({
  toolName,
  params,
}: ToolCallIndicatorProps) {
  return (
    <div className="flex items-start gap-2 text-sm animate-in fade-in slide-in-from-top-2 duration-300">
      <div className="shrink-0 mt-0.5">
        <Loader2 className="h-3 w-3 animate-spin text-primary" />
      </div>
      <div>
        <p className="text-muted-foreground">
          Calling <span className="font-mono font-medium">{toolName}</span>
          {params && (
            <span className="text-muted-foreground/70">
              {" "}
              with {Object.keys(params).length} param
              {Object.keys(params).length !== 1 ? "s" : ""}
            </span>
          )}
          ...
        </p>
      </div>
    </div>
  );
}
