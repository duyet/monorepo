import type { DynamicToolUIPart, ToolUIPart } from "ai";
import {
  CheckCircle as CheckCircle2Icon,
  CaretDown as ChevronDownIcon,
  Circle as CircleIcon,
  Clock as ClockIcon,
  Spinner as LoaderIcon,
  DotsThreeVertical as MoreVerticalIcon,
  Wrench as WrenchIcon,
  XCircle as XCircleIcon,
} from "@phosphor-icons/react";
import type { ComponentProps, ReactNode } from "react";
import { isValidElement, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

import { CodeBlock } from "./code-block";

export type ToolProps = ComponentProps<typeof Collapsible>;

export const Tool = ({ className, ...props }: ToolProps) => (
  <Collapsible
    className={cn(
      "group not-prose mb-3 w-full rounded-xl border bg-card",
      className
    )}
    {...props}
  />
);

export type ToolPart = ToolUIPart | DynamicToolUIPart;

export type ToolHeaderProps = {
  title?: string;
  className?: string;
} & (
  | { type: ToolUIPart["type"]; state: ToolUIPart["state"]; toolName?: never }
  | {
      type: DynamicToolUIPart["type"];
      state: DynamicToolUIPart["state"];
      toolName: string;
    }
);

const statusLabels: Record<ToolPart["state"], string> = {
  "approval-requested": "Awaiting Approval",
  "approval-responded": "Responded",
  "input-available": "Running",
  "input-streaming": "Processing",
  "output-available": "Completed",
  "output-denied": "Denied",
  "output-error": "Error",
};

const statusDescriptions: Record<ToolPart["state"], string> = {
  "approval-requested": "Waiting for your approval to proceed",
  "approval-responded": "You responded to this request",
  "input-available": "Tool is executing",
  "input-streaming": "Receiving data",
  "output-available": "Tool completed successfully",
  "output-denied": "Request was denied",
  "output-error": "Tool encountered an error",
};

const statusIcons: Record<ToolPart["state"], ReactNode> = {
  "approval-requested": <ClockIcon className="size-3.5 text-amber-600" />,
  "approval-responded": <CheckCircle2Icon className="size-3.5 text-blue-600" />,
  "input-available": <LoaderIcon className="size-3.5 animate-spin text-muted-foreground" />,
  "input-streaming": <CircleIcon className="size-3.5 animate-pulse text-muted-foreground" />,
  "output-available": <CheckCircle2Icon className="size-3.5 text-emerald-600" />,
  "output-denied": <XCircleIcon className="size-3.5 text-orange-600" />,
  "output-error": <XCircleIcon className="size-3.5 text-red-600" />,
};

const statusColors: Record<ToolPart["state"], string> = {
  "approval-requested": "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/30 dark:text-amber-400",
  "approval-responded": "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/30 dark:text-blue-400",
  "input-available": "bg-muted text-muted-foreground",
  "input-streaming": "bg-muted text-muted-foreground",
  "output-available": "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400",
  "output-denied": "bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-950/30 dark:text-orange-400",
  "output-error": "bg-red-50 text-red-700 border-red-200 dark:bg-red-950/30 dark:text-red-400",
};

export const getStatusBadge = (status: ToolPart["state"]) => (
  <Badge
    variant="outline"
    className={cn(
      "gap-1.5 rounded-md px-2 py-0.5 text-[11px] font-medium border",
      statusColors[status]
    )}
  >
    {statusIcons[status]}
    <span>{statusLabels[status]}</span>
  </Badge>
);

export const ToolHeader = ({
  className,
  title,
  type,
  state,
  toolName,
  ...props
}: ToolHeaderProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const derivedName =
    type === "dynamic-tool" ? toolName : type.split("-").slice(1).join("-");

  // Format tool name for display
  const formattedName = derivedName
    .replace(/([A-Z])/g, " $1")
    .replace(/^./, (str) => str.toUpperCase())
    .trim();

  return (
    <CollapsibleTrigger
      className={cn(
        "flex w-full items-center justify-between gap-3 px-4 py-3 hover:bg-muted/50 transition-colors",
        className
      )}
      onClick={() => setIsOpen(!isOpen)}
      {...props}
    >
      <div className="flex items-center gap-2.5 flex-1">
        <div className={cn(
          "flex size-7 items-center justify-center rounded-md",
          state === "input-available" || state === "input-streaming"
            ? "bg-primary/10 text-primary"
            : "bg-muted text-muted-foreground"
        )}>
          <WrenchIcon className="size-3.5" />
        </div>
        <div className="flex-1 text-left">
          <p className="text-sm font-medium">{title ?? formattedName}</p>
          <p className="text-[11px] text-muted-foreground mt-0.5">
            {statusDescriptions[state]}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        {getStatusBadge(state)}
        <ChevronDownIcon className={cn(
          "size-4 text-muted-foreground transition-transform duration-200",
          isOpen && "rotate-180"
        )} />
      </div>
    </CollapsibleTrigger>
  );
};

export type ToolContentProps = ComponentProps<typeof CollapsibleContent>;

export const ToolContent = ({ className, ...props }: ToolContentProps) => (
  <CollapsibleContent
    className={cn(
      "border-t px-4 py-3 space-y-3",
      className
    )}
    {...props}
  />
);

export type ToolInputProps = ComponentProps<"div"> & {
  input: ToolPart["input"];
};

export const ToolInput = ({ className, input, ...props }: ToolInputProps) => {
  const [isExpanded, setIsExpanded] = useState(true);

  return (
    <div className={cn("space-y-2", className)} {...props}>
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
      >
        <ChevronDownIcon className={cn(
          "size-3 transition-transform duration-200",
          !isExpanded && "-rotate-90"
        )} />
        <span>Parameters</span>
      </button>
      {isExpanded && (
        <div className="rounded-lg border bg-muted/50 p-3">
          <CodeBlock
            code={JSON.stringify(input, null, 2)}
            language="json"
            className="text-xs"
          />
        </div>
      )}
    </div>
  );
};

export type ToolOutputProps = ComponentProps<"div"> & {
  output: ToolPart["output"];
  errorText: ToolPart["errorText"];
  isStreaming?: boolean;
};

export const ToolOutput = ({
  className,
  output,
  errorText,
  isStreaming = false,
  ...props
}: ToolOutputProps) => {
  const [isExpanded, setIsExpanded] = useState(true);

  if (!(output || errorText)) {
    return null;
  }

  let Output: ReactNode;
  let outputString = "";

  if (typeof output === "object" && !isValidElement(output)) {
    outputString = JSON.stringify(output, null, 2);
    Output = (
      <CodeBlock
        code={outputString}
        language="json"
        className="text-xs"
      />
    );
  } else if (typeof output === "string") {
    outputString = output;
    Output = <CodeBlock code={output} language="markdown" className="text-xs whitespace-pre-wrap" />;
  } else {
    Output = <div>{output as ReactNode}</div>;
  }

  return (
    <div className={cn("space-y-2", className)} {...props}>
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
        >
          <ChevronDownIcon className={cn(
            "size-3 transition-transform duration-200",
            !isExpanded && "-rotate-90"
          )} />
          <span>{errorText ? "Error" : "Result"}</span>
        </button>
        {isStreaming && (
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <CircleIcon className="size-3 animate-pulse" />
            <span>Streaming</span>
          </div>
        )}
      </div>
      {isExpanded && (
        <div className={cn(
          "rounded-lg border p-3 text-xs",
          errorText
            ? "bg-destructive/10 text-destructive border-destructive/20"
            : "bg-muted/30"
        )}>
          {errorText && <div className="mb-2 text-destructive">{errorText}</div>}
          {Output}
        </div>
      )}
    </div>
  );
};
