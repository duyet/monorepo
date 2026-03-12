"use client";

/**
 * Node Trace Timeline Component (Unit 18)
 *
 * Timeline view of executed nodes with outcomes and expandable details.
 */

import { Badge } from "@duyet/components";
import { cn, formatDuration } from "@duyet/libs";
import {
  AlertCircle,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Clock,
  Loader2,
} from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { NodeTrace } from "@/lib/graph";
import { useToggleSet } from "@/lib/hooks";

export interface NodeTraceTimelineProps {
  /** Node execution traces in chronological order */
  traces: NodeTrace[];
  /** Additional CSS class name */
  className?: string;
}

interface TraceItemProps {
  trace: NodeTrace;
  isExpanded: boolean;
  onToggle: () => void;
}

function TraceItem({ trace, isExpanded, onToggle }: TraceItemProps) {
  const statusConfig = {
    pending: {
      icon: Loader2,
      iconClassName: "animate-spin",
      color: "bg-gray-100 text-gray-600 border-gray-300",
      badgeVariant: "outline" as const,
    },
    running: {
      icon: Loader2,
      iconClassName: "animate-spin",
      color: "bg-blue-50 text-blue-600 border-blue-300",
      badgeVariant: "default" as const,
    },
    success: {
      icon: CheckCircle2,
      iconClassName: "",
      color: "bg-green-50 text-green-600 border-green-300",
      badgeVariant: "outline" as const,
    },
    error: {
      icon: AlertCircle,
      iconClassName: "",
      color: "bg-red-50 text-red-600 border-red-300",
      badgeVariant: "destructive" as const,
    },
  };

  const config = statusConfig[trace.outcome] || statusConfig.pending;
  const StatusIcon = config.icon;

  return (
    <div className="border-b border-border last:border-0">
      <button
        type="button"
        onClick={onToggle}
        className={cn(
          "w-full text-left px-4 py-3 hover:bg-muted/50 transition-colors flex items-start gap-3"
        )}
      >
        {/* Expand/collapse icon */}
        <div className="flex items-center mt-0.5">
          {isExpanded ? (
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          ) : (
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          )}
        </div>

        {/* Status icon */}
        <div className={cn("p-1 rounded-full border", config.color)}>
          <StatusIcon className={cn("h-3.5 w-3.5", config.iconClassName)} />
        </div>

        {/* Node info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <span className="text-sm font-medium truncate">
              {trace.nodeName}
            </span>
            <Badge
              variant={config.badgeVariant}
              className="text-[10px] px-1.5 py-0"
            >
              {trace.nodeId}
            </Badge>
          </div>
          {trace.error && (
            <p className="text-xs text-destructive mt-1">{trace.error}</p>
          )}
        </div>

        {/* Duration */}
        <div className="flex items-center gap-1 text-xs text-muted-foreground font-mono tabular-nums">
          <Clock className="h-3 w-3" />
          <span>{formatDuration(trace.duration)}</span>
        </div>
      </button>

      {/* Expanded details */}
      {isExpanded && (
        <div className="px-4 pb-4 pl-14 bg-muted/20">
          <div className="space-y-3 text-xs">
            {/* Timing info */}
            {trace.startTime && (
              <div>
                <span className="font-medium text-muted-foreground">
                  Timing:
                </span>{" "}
                <span className="font-mono">
                  {new Date(trace.startTime).toISOString()}{" "}
                  {trace.endTime &&
                    `→ ${new Date(trace.endTime).toISOString()}`}
                </span>
              </div>
            )}

            {/* State diff summary */}
            {trace.stateDiff &&
              (() => {
                const addedCount = trace.stateDiff.added
                  ? Object.keys(trace.stateDiff.added).length
                  : 0;
                const modifiedCount = trace.stateDiff.modified
                  ? Object.keys(trace.stateDiff.modified).length
                  : 0;
                const deletedCount = trace.stateDiff.deleted
                  ? Object.keys(trace.stateDiff.deleted).length
                  : 0;
                const hasChanges =
                  addedCount > 0 || modifiedCount > 0 || deletedCount > 0;

                if (!hasChanges) return null;

                const parts: string[] = [];
                if (addedCount > 0) parts.push(`+${addedCount} added`);
                if (modifiedCount > 0) parts.push(`~${modifiedCount} modified`);
                if (deletedCount > 0) parts.push(`-${deletedCount} deleted`);

                return (
                  <div>
                    <span className="font-medium text-muted-foreground">
                      State Changes:
                    </span>{" "}
                    <div className="mt-1 p-2 rounded border border-border font-mono">
                      {parts.join(", ") || "(no changes)"}
                    </div>
                  </div>
                );
              })()}

            {/* Metadata */}
            {trace.metadata && Object.keys(trace.metadata).length > 0 && (
              <div>
                <span className="font-medium text-muted-foreground">
                  Metadata:
                </span>{" "}
                <span className="font-mono">
                  {JSON.stringify(trace.metadata, null, 2)}
                </span>
              </div>
            )}

            {/* Input state preview */}
            {trace.inputState && (
              <div>
                <span className="font-medium text-muted-foreground">
                  Input:
                </span>{" "}
                <span className="font-mono line-clamp-2">
                  {JSON.stringify({
                    conversationId: trace.inputState.conversationId,
                    userInput: trace.inputState.userInput?.substring(0, 50),
                    route: trace.inputState.route,
                  })}
                </span>
              </div>
            )}

            {/* Output state preview */}
            {trace.outputState && (
              <div>
                <span className="font-medium text-muted-foreground">
                  Output:
                </span>{" "}
                <span className="font-mono line-clamp-2">
                  {JSON.stringify({
                    response: trace.outputState.response?.substring(0, 50),
                    route: trace.outputState.route,
                    toolCallsCount: trace.outputState.toolCalls?.length,
                  })}
                </span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Node Trace Timeline Component
 *
 * Displays a chronological timeline of executed nodes with expandable details.
 */
export function NodeTraceTimeline({
  traces,
  className,
}: NodeTraceTimelineProps) {
  const [expandedIndices, toggleExpanded] = useToggleSet<number>();

  if (traces.length === 0) {
    return (
      <div
        className={cn(
          "flex items-center justify-center py-8 text-center",
          className
        )}
      >
        <div>
          <Loader2 className="h-8 w-8 mx-auto mb-2 text-muted-foreground/50 animate-spin" />
          <p className="text-sm text-muted-foreground">
            Waiting for execution...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("h-full flex flex-col", className)}>
      {/* Header with summary */}
      <div className="px-4 py-2 border-b border-border bg-muted/30">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-muted-foreground">
            Execution Timeline
          </span>
          <span className="text-xs text-muted-foreground tabular-nums">
            {traces.length} node{traces.length !== 1 ? "s" : ""}
          </span>
        </div>
      </div>

      {/* Timeline items */}
      <ScrollArea className="flex-1">
        <div className="divide-y divide-border">
          {traces.map((trace, index) => (
            <TraceItem
              key={`${trace.nodeId}-${index}`}
              trace={trace}
              isExpanded={expandedIndices.has(index)}
              onToggle={() => toggleExpanded(index)}
            />
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
