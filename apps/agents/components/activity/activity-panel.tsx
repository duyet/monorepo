"use client";

import { Badge, Button, Tabs, TabsList, TabsTrigger, TabsContent } from "@duyet/components";
import { cn } from "@duyet/libs";
import {
  Activity,
  AlertCircle,
  CheckCircle2,
  Clock,
  Loader2,
  X,
} from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { ActivityPanelProps } from "@/lib/types";
import { ThinkingDots, ThinkingSteps } from "./thinking-steps";
import { ToolExecutionItem } from "./tool-execution-item";

export function ActivityPanel({
  executions,
  thinkingSteps = [],
  isLoading = false,
  onClose,
  className,
}: ActivityPanelProps) {
  // Calculate stats
  const completeCount = executions.filter(
    (e) => e.status === "complete"
  ).length;
  const errorCount = executions.filter((e) => e.status === "error").length;
  const runningCount = executions.filter((e) => e.status === "running").length;

  // Calculate total duration
  const totalDuration = executions
    .filter((e) => e.endTime)
    .reduce((sum, e) => sum + (e.endTime || 0) - e.startTime, 0);

  const hasActivity =
    executions.length > 0 || thinkingSteps.length > 0 || isLoading;

  return (
    <Tabs 
      defaultValue="process" 
      className={cn(
        "flex flex-col h-full bg-background border-l border-border",
        className
      )}
    >
      {/* Header Tabs */}
      <div className="border-b border-border bg-muted/10 pt-2 px-2 flex items-center justify-between">
        <TabsList className="flex items-center gap-1.5 relative top-[1px] bg-transparent p-0">
          <TabsTrigger
            value="process"
            className="px-4 py-1.5 text-xs font-medium rounded-t-md rounded-b-none transition-colors data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:border data-[state=active]:border-b-0 data-[state=active]:border-border text-muted-foreground hover:text-foreground hover:bg-muted/50 data-[state=inactive]:border-transparent"
          >
            Current Process
          </TabsTrigger>
          <TabsTrigger
            value="files"
            className="px-4 py-1.5 text-xs font-medium rounded-t-md rounded-b-none transition-colors data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:border data-[state=active]:border-b-0 data-[state=active]:border-border text-muted-foreground hover:text-foreground hover:bg-muted/50 data-[state=inactive]:border-transparent"
          >
            Files
          </TabsTrigger>
        </TabsList>

        <div className="flex items-center gap-2 pb-1 pr-1">
          {onClose && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-6 w-6 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted"
              onClick={onClose}
            >
              <X className="h-3.5 w-3.5" />
              <span className="sr-only">Close panel</span>
            </Button>
          )}
        </div>
      </div>

      {/* Content */}
      <ScrollArea className="flex-1 bg-background relative z-10">
        <TabsContent value="process" className="p-4 space-y-4 m-0">
          {/* Top Stats */}
          {hasActivity && (
            <div className="flex items-center gap-2 pb-2">
              {runningCount > 0 && (
                <Badge variant="default" className="text-[10px] px-1.5 py-0">
                  <Loader2 className="h-2.5 w-2.5 mr-1 animate-spin" />
                  {runningCount}
                </Badge>
              )}
              {completeCount > 0 && (
                <Badge variant="outline" className="text-[10px] px-1.5 py-0 border-border">
                  <CheckCircle2 className="h-2.5 w-2.5 mr-1" />
                  {completeCount}
                </Badge>
              )}
              {errorCount > 0 && (
                <Badge variant="destructive" className="text-[10px] px-1.5 py-0">
                  <AlertCircle className="h-2.5 w-2.5 mr-1" />
                  {errorCount}
                </Badge>
              )}
              {totalDuration > 0 && (
                <div className="flex items-center gap-1 text-[10px] text-muted-foreground font-mono ml-auto">
                  <Clock className="h-2.5 w-2.5" />
                  <span>{totalDuration}ms</span>
                </div>
              )}
            </div>
          )}

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
          {executions.length > 0 && (
            <div className="space-y-2">
              {executions.map((execution) => (
                <ToolExecutionItem key={execution.id} execution={execution} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="files" className="p-8 flex flex-col items-center justify-center text-center text-muted-foreground h-full min-h-[300px] m-0">
          <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-3">
            <Activity className="h-5 w-5 text-muted-foreground/50" />
          </div>
          <p className="text-sm font-medium text-foreground">No files active</p>
          <p className="text-xs mt-1">Files related to this conversation will appear here.</p>
        </TabsContent>
      </ScrollArea>
    </Tabs>
  );
}
