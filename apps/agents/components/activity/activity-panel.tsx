"use client";

import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ToolExecutionItem } from "./tool-execution-item";
import { ThinkingSteps, ThinkingDots } from "./thinking-steps";
import { Activity, Clock, CheckCircle2, AlertCircle, Loader2, Minimize2, Maximize2 } from "lucide-react";
import type { ToolExecution } from "@/lib/types";
import { cn } from "@/lib/utils";

interface ActivityPanelProps {
  executions: ToolExecution[];
  thinkingSteps?: string[];
  isLoading?: boolean;
  isMinimized?: boolean;
  onToggleMinimize?: () => void;
  className?: string;
}

export function ActivityPanel({
  executions,
  thinkingSteps = [],
  isLoading = false,
  isMinimized = false,
  onToggleMinimize,
  className,
}: ActivityPanelProps) {
  // Calculate stats
  const completeCount = executions.filter((e) => e.status === "complete").length;
  const errorCount = executions.filter((e) => e.status === "error").length;
  const runningCount = executions.filter((e) => e.status === "running").length;

  // Calculate total duration
  const totalDuration = executions
    .filter((e) => e.endTime)
    .reduce((sum, e) => sum + (e.endTime || 0) - e.startTime, 0);

  const hasActivity = executions.length > 0 || thinkingSteps.length > 0 || isLoading;

  return (
    <div className={cn("flex flex-col h-full bg-background border-l", className)}>
      {/* Header */}
      <div className="border-b border-border bg-card px-4 py-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity className="h-3.5 w-3.5 text-muted-foreground" />
            <h2 className="text-sm font-semibold text-foreground">Activity</h2>
          </div>

          <div className="flex items-center gap-2">
            {/* Stats */}
            {hasActivity && (
              <div className="flex items-center gap-2">
                {runningCount > 0 && (
                  <Badge variant="default" className="text-xs">
                    <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                    {runningCount}
                  </Badge>
                )}
                {completeCount > 0 && (
                  <Badge variant="outline" className="text-xs border-border">
                    <CheckCircle2 className="h-3 w-3 mr-1" />
                    {completeCount}
                  </Badge>
                )}
                {errorCount > 0 && (
                  <Badge variant="destructive" className="text-xs">
                    <AlertCircle className="h-3 w-3 mr-1" />
                    {errorCount}
                  </Badge>
                )}
                {totalDuration > 0 && (
                  <div className="flex items-center gap-1 text-xs text-muted-foreground font-mono">
                    <Clock className="h-3 w-3" />
                    <span>{totalDuration}ms</span>
                  </div>
                )}
              </div>
            )}

            {/* Minimize toggle */}
            {onToggleMinimize && (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={onToggleMinimize}
              >
                {isMinimized ? (
                  <Maximize2 className="h-3.5 w-3.5" />
                ) : (
                  <Minimize2 className="h-3.5 w-3.5" />
                )}
                <span className="sr-only">{isMinimized ? "Expand" : "Minimize"}</span>
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Content — hidden when minimized */}
      {isMinimized ? (
        <div className="flex-1 flex items-center justify-center">
          <p className="text-xs text-muted-foreground">Panel minimized</p>
        </div>
      ) : (
      <ScrollArea className="flex-1">
        <div className="p-3 space-y-3">
          {/* Thinking steps */}
          {(thinkingSteps.length > 0 || isLoading) && (
            <div className="rounded-md border border-border bg-muted/30 p-3">
              {thinkingSteps.length > 0 ? (
                <ThinkingSteps steps={thinkingSteps} />
              ) : (
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <ThinkingDots />
                  <span>Thinking...</span>
                </div>
              )}
            </div>
          )}

          {/* Tool executions */}
          {executions.length === 0 && !isLoading ? (
            <div className="flex flex-col items-center justify-center py-12 gap-1.5">
              <p className="text-xs font-medium text-muted-foreground">No executions yet</p>
              <p className="text-[11px] text-muted-foreground/50">
                Send a message to see tool activity
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {executions.map((execution) => (
                <ToolExecutionItem key={execution.id} execution={execution} />
              ))}
            </div>
          )}
        </div>
      </ScrollArea>
      )}
    </div>
  );
}
