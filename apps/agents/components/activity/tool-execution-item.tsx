import {
  Warning as AlertCircle,
  CheckCircle as CheckCircle2,
  Spinner as Loader2,
} from "@phosphor-icons/react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import type { ToolExecution } from "@/lib/types";
import { cn } from "@/lib/utils";

interface ToolExecutionItemProps {
  execution: ToolExecution;
}

export function ToolExecutionItem({ execution }: ToolExecutionItemProps) {
  const duration = execution.endTime
    ? execution.endTime - execution.startTime
    : Date.now() - execution.startTime;

  const statusConfig = {
    pending: {
      icon: Loader2,
      label: "Pending",
      variant: "secondary" as const,
      className: "animate-spin-slow",
      colorClass: "text-muted-foreground",
    },
    running: {
      icon: Loader2,
      label: "Running",
      variant: "default" as const,
      className: "animate-spin",
      colorClass: "text-primary",
    },
    complete: {
      icon: CheckCircle2,
      label: "Complete",
      variant: "outline" as const,
      className: "",
      colorClass: "text-green-600 dark:text-green-500",
    },
    error: {
      icon: AlertCircle,
      label: "Error",
      variant: "destructive" as const,
      className: "",
      colorClass: "text-destructive",
    },
  };

  const config = statusConfig[execution.status];
  const StatusIcon = config.icon;

  return (
    <Accordion type="single" collapsible>
      <AccordionItem
        value={execution.id}
        className={cn(
          "border rounded-lg overflow-hidden transition-all duration-200",
          execution.status === "running" && "border-primary/50",
          execution.status === "error" && "border-destructive/50"
        )}
      >
        <AccordionTrigger className="px-4 py-3 hover:no-underline hover:bg-muted/50 [&[data-state=open]]:bg-muted/30">
          <div className="flex items-center gap-3 flex-1">
            {/* Status icon */}
            <div className={cn("shrink-0", config.colorClass)}>
              <StatusIcon className={cn("h-4 w-4", config.className)} />
            </div>

            {/* Tool name and params preview */}
            <div className="flex-1 min-w-0 text-left">
              <div className="flex items-center gap-2">
                <span className="font-mono text-sm font-medium">
                  {execution.toolName}
                </span>
                <Badge variant={config.variant} className="text-xs">
                  {config.label}
                </Badge>
              </div>

              {/* Parameters preview (truncated) */}
              <p className="text-xs text-muted-foreground truncate mt-0.5">
                {Object.entries(execution.parameters)
                  .map(([key, value]) => {
                    const strValue =
                      typeof value === "string" ? value : JSON.stringify(value);
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
          </div>
        </AccordionTrigger>

        <AccordionContent className="pt-0 pb-4 px-4 border-t border-border bg-muted/20">
          <div className="pt-4 space-y-4">
            {/* Full parameters */}
            <div>
              <p className="text-xs font-medium text-muted-foreground mb-2">
                Parameters
              </p>
              <pre className="text-xs bg-muted/50 rounded-md p-3 overflow-x-auto font-mono">
                {JSON.stringify(execution.parameters, null, 2)}
              </pre>
            </div>

            {/* Result or error */}
            {execution.status === "complete" && execution.result != null && (
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-2">
                  Result
                </p>
                <pre className="text-xs bg-muted/50 rounded-md p-3 overflow-x-auto max-h-48 overflow-y-auto font-mono">
                  {JSON.stringify(execution.result, null, 2)}
                </pre>
              </div>
            )}

            {execution.status === "error" && execution.error && (
              <div>
                <p className="text-xs font-medium text-destructive mb-2">
                  Error
                </p>
                <p className="text-xs bg-destructive/10 text-destructive rounded-md p-3">
                  {execution.error}
                </p>
              </div>
            )}
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}
