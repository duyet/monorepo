"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  ChevronRight,
  Loader2,
  CheckCircle2,
  XCircle,
  Code,
  Globe,
  MessageSquare,
  Settings,
  Search,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

export type ToolExecutionState = "running" | "done" | "error";

export interface ToolCallProps {
  name: string;
  parameters?: Record<string, unknown>;
  result?: unknown;
  state?: ToolExecutionState;
  error?: string;
  timestamp?: number;
  duration?: number;
}

// Tool icon mapping
const TOOL_ICONS: Record<string, LucideIcon> = {
  search: Search,
  mcp__sequential: Settings,
  mcp__web_reader: Globe,
  mcp__claude_ai: MessageSquare,
  mcp__plugin_playwright: Globe,
  default: Code,
};

// Tool name formatter
function formatToolName(name: string): string {
  return name
    .replace(/^mcp__|__|_/g, " ")
    .replace(/([A-Z])/g, " $1")
    .trim()
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

// Get tool icon
function getToolIcon(name: string): LucideIcon {
  const key = Object.keys(TOOL_ICONS).find((k) => name.includes(k));
  return TOOL_ICONS[key || "default"];
}

// State badge color
const STATE_STYLES: Record<
  ToolExecutionState,
  { bg: string; text: string; icon: typeof Loader2 }
> = {
  running: {
    bg: "bg-blue-50 dark:bg-blue-950/30",
    text: "text-blue-700 dark:text-blue-400",
    icon: Loader2,
  },
  done: {
    bg: "bg-green-50 dark:bg-green-950/30",
    text: "text-green-700 dark:text-green-400",
    icon: CheckCircle2,
  },
  error: {
    bg: "bg-red-50 dark:bg-red-950/30",
    text: "text-red-700 dark:text-red-400",
    icon: XCircle,
  },
};

export function ToolCall({
  name,
  parameters = {},
  result,
  state = "running",
  error,
  timestamp,
  duration,
}: ToolCallProps) {
  const [isExpanded, setIsExpanded] = useState(state !== "running");
  const StateIcon = STATE_STYLES[state].icon;

  // Format duration
  const formattedDuration =
    duration !== undefined ? `${duration.toFixed(0)}ms` : undefined;

  // Truncate long results
  const formatResult = (value: unknown): string => {
    if (value === null) return "null";
    if (value === undefined) return "undefined";
    if (typeof value === "string") {
      return value.length > 500 ? `${value.slice(0, 500)}...` : value;
    }
    if (typeof value === "object") {
      const str = JSON.stringify(value, null, 2);
      return str.length > 500 ? `${str.slice(0, 500)}\n...` : str;
    }
    return String(value);
  };

  const ToolIcon = getToolIcon(name);
  const displayName = formatToolName(name);
  const stateStyle = STATE_STYLES[state];

  return (
    <Card
      className={cn(
        "border-border/50 bg-muted/30 backdrop-blur-sm transition-all",
        state === "running" && "border-blue-200 dark:border-blue-900/50",
        state === "error" && "border-red-200 dark:border-red-900/50"
      )}
    >
      <Accordion
        type="single"
        value={isExpanded ? "details" : undefined}
        onValueChange={(v) => setIsExpanded(v === "details")}
      >
        <AccordionItem value="details" className="border-0">
          <AccordionTrigger className="px-4 py-3 hover:no-underline hover:bg-muted/50 rounded-t-lg [&[data-state=open]]:rounded-b-none [&[data-state=open]]:pb-0">
            <div className="flex items-center gap-3 flex-1 text-left">
              {/* Tool Icon */}
              <div
                className={cn(
                  "p-2 rounded-md",
                  state === "running" && "bg-blue-100 dark:bg-blue-900/50",
                  state === "done" && "bg-green-100 dark:bg-green-900/50",
                  state === "error" && "bg-red-100 dark:bg-red-900/50"
                )}
              >
                <ToolIcon className="h-4 w-4 text-muted-foreground" />
              </div>

              {/* Tool Name and State */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-sm truncate">
                    {displayName}
                  </span>
                  <Badge
                    variant="outline"
                    className={cn(
                      "shrink-0 gap-1",
                      stateStyle.bg,
                      stateStyle.text,
                      "border-0"
                    )}
                  >
                    <StateIcon
                      className={cn(
                        "h-3 w-3",
                        state === "running" && "animate-spin"
                      )}
                    />
                    <span className="text-xs capitalize">{state}</span>
                  </Badge>
                </div>

                {/* Metadata */}
                {(formattedDuration || timestamp) && (
                  <div className="flex items-center gap-2 mt-0.5 text-xs text-muted-foreground">
                    {formattedDuration && (
                      <span>{formattedDuration}</span>
                    )}
                    {formattedDuration && timestamp && (
                      <span>•</span>
                    )}
                    {timestamp && (
                      <span>{new Date(timestamp).toLocaleTimeString()}</span>
                    )}
                  </div>
                )}
              </div>

              {/* Chevron */}
              <ChevronRight
                className={cn(
                  "h-4 w-4 shrink-0 text-muted-foreground transition-transform",
                  isExpanded && "rotate-90"
                )}
              />
            </div>
          </AccordionTrigger>

          <AccordionContent className="px-4 pb-0">
            <CardContent className="pt-0 pb-3 space-y-3">
              {/* Parameters */}
              {Object.keys(parameters).length > 0 && (
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-2">
                    Parameters
                  </p>
                  <div className="bg-background rounded-md p-3 border">
                    <pre className="text-xs overflow-x-auto whitespace-pre-wrap break-words">
                      {formatResult(parameters)}
                    </pre>
                  </div>
                </div>
              )}

              {/* Result */}
              {state !== "running" && (result !== undefined || error) && (
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-2">
                    {error ? "Error" : "Result"}
                  </p>
                  <div
                    className={cn(
                      "rounded-md p-3 border",
                      error
                        ? "bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-900/50"
                        : "bg-background"
                    )}
                  >
                    <pre className="text-xs overflow-x-auto whitespace-pre-wrap break-words">
                      {error || formatResult(result)}
                    </pre>
                  </div>
                </div>
              )}

              {/* Running indicator */}
              {state === "running" && (
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <div className="flex gap-1">
                    <span className="w-1 h-1 bg-current rounded-full animate-pulse [animation-delay:0ms]" />
                    <span className="w-1 h-1 bg-current rounded-full animate-pulse [animation-delay:150ms]" />
                    <span className="w-1 h-1 bg-current rounded-full animate-pulse [animation-delay:300ms]" />
                  </div>
                  <span>Executing...</span>
                </div>
              )}
            </CardContent>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </Card>
  );
}

// Component for multiple tool calls
export interface ToolCallListProps {
  tools: ToolCallProps[];
  title?: string;
}

export function ToolCallList({ tools, title = "Tool Calls" }: ToolCallListProps) {
  if (tools.length === 0) return null;

  return (
    <div className="space-y-3">
      {title && (
        <h3 className="text-sm font-medium text-muted-foreground">{title}</h3>
      )}
      <div className="space-y-2">
        {tools.map((tool, index) => (
          <ToolCall key={`${tool.name}-${index}`} {...tool} />
        ))}
      </div>
    </div>
  );
}
