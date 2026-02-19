"use client";

import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ToolExecutionItem } from "./tool-execution-item";
import { ThinkingSteps, ThinkingDots } from "./thinking-steps";
import { Activity, Clock, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { type ToolExecution } from "@/lib/types";
import { cn } from "@/lib/utils";

interface ActivityPanelProps {
  executions: ToolExecution[];
  thinkingSteps?: string[];
  isLoading?: boolean;
  className?: string;
}

export function ActivityPanel({
  executions,
  thinkingSteps = [],
  isLoading = false,
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
    <div className={cn("flex flex-col h-full bg-muted/30", className)}>
      {/* Header */}
      <div className="border-b border-border bg-card px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity className="h-4 w-4 text-muted-foreground" />
            <h2 className="text-sm font-semibold text-foreground">Activity</h2>
          </div>

          {/* Stats */}
          {hasActivity && (
            <div className="flex items-center gap-3">
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
        </div>
      </div>

      {/* Content */}
      <ScrollArea className="flex-1">
        <div className="p-4 space-y-4">
          {/* Thinking steps */}
          {(thinkingSteps.length > 0 || isLoading) && (
            <Card className="border-border">
              <div className="p-4">
                {thinkingSteps.length > 0 ? (
                  <ThinkingSteps steps={thinkingSteps} />
                ) : (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <ThinkingDots />
                    <span>Agent thinking...</span>
                  </div>
                )}
              </div>
            </Card>
          )}

          {/* Tool executions */}
          {executions.length === 0 && !isLoading ? (
            <Card className="border-border">
              <CardContent className="p-8 text-center">
                <Activity className="h-8 w-8 mx-auto text-muted-foreground/40 mb-3" />
                <p className="text-sm text-muted-foreground">
                  No tool executions yet.
                  <br />
                  Send a message to see the agent's work.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {executions.map((execution) => (
                <ToolExecutionItem key={execution.id} execution={execution} />
              ))}
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
