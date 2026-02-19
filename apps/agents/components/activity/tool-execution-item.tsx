"use client";

import { useState } from "react";
import { ChevronDown, ChevronRight, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { type ToolExecution } from "@/lib/types";
import { cn } from "@/lib/utils";

interface ToolExecutionItemProps {
  execution: ToolExecution;
}

export function ToolExecutionItem({ execution }: ToolExecutionItemProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const duration = execution.endTime
    ? execution.endTime - execution.startTime
    : Date.now() - execution.startTime;

  const statusConfig = {
    pending: {
      icon: Loader2,
      label: "Pending",
      variant: "secondary" as const,
      className: "animate-spin-slow",
    },
    running: {
      icon: Loader2,
      label: "Running",
      variant: "default" as const,
      className: "animate-spin",
    },
    complete: {
      icon: CheckCircle2,
      label: "Complete",
      variant: "outline" as const,
      className: "",
    },
    error: {
      icon: AlertCircle,
      label: "Error",
      variant: "destructive" as const,
      className: "",
    },
  };

  const config = statusConfig[execution.status];
  const StatusIcon = config.icon;

  return (
    <Card
      className={cn(
        "overflow-hidden transition-all duration-200",
        execution.status === "running" && "border-primary/50",
        execution.status === "error" && "border-destructive/50"
      )}
    >
      <CardContent className="p-0">
        {/* Header - always visible */}
        <button
          type="button"
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full text-left hover:bg-muted/50 transition-colors"
        >
          <div className="flex items-center gap-3 p-4">
            {/* Status icon */}
            <div
              className={cn(
                "shrink-0",
                execution.status === "running" && "text-primary",
                execution.status === "complete" && "text-green-600 dark:text-green-500",
                execution.status === "error" && "text-destructive"
              )}
            >
              <StatusIcon className={cn("h-4 w-4", config.className)} />
            </div>

            {/* Tool name and params preview */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-mono text-sm font-medium">
                  {execution.toolName}
                </span>
                <Badge variant={config.variant} className="text-xs">
                  {config.label}
                </Badge>
              </div>

              {/* Parameters preview (truncated) */}
              <p className="text-xs text-muted-foreground truncate mt-1">
                {Object.entries(execution.parameters)
                  .map(([key, value]) => {
                    const strValue =
                      typeof value === "string"
                        ? value
                        : JSON.stringify(value);
                    return `${key}=${strValue.slice(0, 30)}${
                      strValue.length > 30 ? "..." : ""
                    }`;
                  })
                  .join(", ")}
              </p>
            </div>

            {/* Duration */}
            {execution.endTime && (
              <div className="shrink-0 text-xs text-muted-foreground font-mono">
                {duration}ms
              </div>
            )}

            {/* Expand/collapse icon */}
            <div className="shrink-0">
              {isExpanded ? (
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              ) : (
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              )}
            </div>
          </div>
        </button>

        {/* Expanded details */}
        {isExpanded && (
          <div className="border-t bg-muted/30 p-4 space-y-3">
            {/* Full parameters */}
            <div>
              <p className="text-xs font-medium text-muted-foreground mb-2">
                Parameters
              </p>
              <pre className="text-xs bg-background rounded p-3 overflow-x-auto">
                {JSON.stringify(execution.parameters, null, 2)}
              </pre>
            </div>

            {/* Result or error */}
            {execution.status === "complete" && execution.result != null && (
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-2">
                  Result
                </p>
                <pre className="text-xs bg-background rounded p-3 overflow-x-auto max-h-48 overflow-y-auto">
                  {JSON.stringify(execution.result, null, 2)}
                </pre>
              </div>
            )}

            {execution.status === "error" && execution.error && (
              <div>
                <p className="text-xs font-medium text-destructive mb-2">Error</p>
                <p className="text-xs bg-destructive/10 text-destructive rounded p-3">
                  {execution.error}
                </p>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
