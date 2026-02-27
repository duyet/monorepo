"use client";

import { useState } from "react";
import type { DynamicToolUIPart } from "ai";
import { cn } from "@duyet/libs";
import { Button } from "@duyet/components";
import {
  Loader2,
  CheckCircle2,
  XCircle,
  ShieldCheck,
  ShieldX,
  ChevronDown,
  ChevronRight,
  Code,
  Globe,
  Search,
  Settings,
  MessageSquare,
  type LucideIcon,
} from "lucide-react";

// Tool icon mapping (shared with tool-call.tsx)
const TOOL_ICONS: Record<string, LucideIcon> = {
  search: Search,
  getGitHub: Globe,
  getAnalytics: Settings,
  getBlogPost: MessageSquare,
  getCV: MessageSquare,
  getAbout: MessageSquare,
  default: Code,
};

function getToolIcon(name: string): LucideIcon {
  const key = Object.keys(TOOL_ICONS).find((k) => name.includes(k));
  return TOOL_ICONS[key || "default"];
}

function formatToolName(name: string): string {
  return name
    .replace(/^mcp__|__|_/g, " ")
    .replace(/([A-Z])/g, " $1")
    .trim()
    .split(" ")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

function formatResult(value: unknown): string {
  if (value === null) return "null";
  if (value === undefined) return "—";
  if (typeof value === "string") {
    return value.length > 400 ? `${value.slice(0, 400)}...` : value;
  }
  if (typeof value === "object") {
    const str = JSON.stringify(value, null, 2);
    return str.length > 400 ? `${str.slice(0, 400)}\n...` : str;
  }
  return String(value);
}

function formatParams(input: unknown): string {
  if (!input || typeof input !== "object") return "";
  const entries = Object.entries(input as Record<string, unknown>);
  if (entries.length === 0) return "";
  return entries
    .map(([k, v]) => `${k}: ${typeof v === "string" ? v : JSON.stringify(v)}`)
    .join(", ");
}

interface InlineToolCardProps {
  part: DynamicToolUIPart;
  onApprove?: (id: string) => void;
  onDeny?: (id: string, reason?: string) => void;
}

export function InlineToolCard({ part, onApprove, onDeny }: InlineToolCardProps) {
  const [expanded, setExpanded] = useState(false);
  const ToolIcon = getToolIcon(part.toolName);
  const displayName = formatToolName(part.toolName);
  const params = formatParams(part.input);

  // Streaming / preparing state — compact pill
  if (part.state === "input-streaming") {
    return (
      <div className="my-1.5 inline-flex items-center gap-2 rounded-full border border-neutral-200 bg-neutral-50 px-3 py-1.5 text-xs text-neutral-500 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-400">
        <Loader2 className="h-3 w-3 animate-spin" />
        <ToolIcon className="h-3 w-3" />
        <span>{displayName}</span>
        <span className="text-neutral-400 dark:text-neutral-500">Preparing...</span>
      </div>
    );
  }

  // Input ready — compact pill with params
  if (part.state === "input-available") {
    return (
      <div className="my-1.5 inline-flex items-center gap-2 rounded-full border border-neutral-200 bg-neutral-50 px-3 py-1.5 text-xs dark:border-neutral-700 dark:bg-neutral-800">
        <Loader2 className="h-3 w-3 animate-spin text-blue-500" />
        <ToolIcon className="h-3 w-3 text-neutral-500 dark:text-neutral-400" />
        <span className="font-medium text-neutral-700 dark:text-neutral-300">{displayName}</span>
        {params && (
          <span className="max-w-[200px] truncate text-neutral-400 dark:text-neutral-500">
            {params}
          </span>
        )}
      </div>
    );
  }

  // Approval requested — interactive card with approve/deny
  if (part.state === "approval-requested") {
    const approvalId = part.approval?.id;
    return (
      <div className="my-2 rounded-2xl border border-amber-200 bg-amber-50/50 p-4 dark:border-amber-800/50 dark:bg-amber-950/20">
        <div className="flex items-start gap-3">
          <div className="rounded-lg bg-amber-100 p-2 dark:bg-amber-900/40">
            <ShieldCheck className="h-4 w-4 text-amber-700 dark:text-amber-400" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-neutral-800 dark:text-neutral-200">
                {displayName}
              </span>
              <span className="rounded-full bg-amber-200/60 px-2 py-0.5 text-[10px] font-medium text-amber-800 dark:bg-amber-800/40 dark:text-amber-300">
                Approval needed
              </span>
            </div>
            {params && (
              <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
                {params}
              </p>
            )}
            <div className="mt-3 flex items-center gap-2">
              <Button
                size="sm"
                variant="outline"
                className="h-7 rounded-full border-red-200 px-3 text-xs text-red-600 hover:bg-red-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-950/30"
                onClick={() => approvalId && onDeny?.(approvalId)}
              >
                <ShieldX className="mr-1 h-3 w-3" />
                Deny
              </Button>
              <Button
                size="sm"
                className="h-7 rounded-full bg-emerald-600 px-3 text-xs text-white hover:bg-emerald-700 dark:bg-emerald-700 dark:hover:bg-emerald-600"
                onClick={() => approvalId && onApprove?.(approvalId)}
              >
                <ShieldCheck className="mr-1 h-3 w-3" />
                Approve
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Approval responded — waiting for execution
  if (part.state === "approval-responded") {
    const approved = part.approval?.approved;
    return (
      <div className={cn(
        "my-2 rounded-2xl border p-3",
        approved
          ? "border-emerald-200 bg-emerald-50/50 dark:border-emerald-800/50 dark:bg-emerald-950/20"
          : "border-red-200 bg-red-50/50 dark:border-red-800/50 dark:bg-red-950/20"
      )}>
        <div className="flex items-center gap-2">
          {approved ? (
            <>
              <Loader2 className="h-3.5 w-3.5 animate-spin text-emerald-600 dark:text-emerald-400" />
              <ToolIcon className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
              <span className="text-xs font-medium text-emerald-700 dark:text-emerald-300">
                {displayName}
              </span>
              <span className="rounded-full bg-emerald-200/60 px-2 py-0.5 text-[10px] font-medium text-emerald-800 dark:bg-emerald-800/40 dark:text-emerald-300">
                Approved — running
              </span>
            </>
          ) : (
            <>
              <ShieldX className="h-3.5 w-3.5 text-red-500 dark:text-red-400" />
              <span className="text-xs font-medium text-red-700 dark:text-red-300">
                {displayName}
              </span>
              <span className="rounded-full bg-red-200/60 px-2 py-0.5 text-[10px] font-medium text-red-800 dark:bg-red-800/40 dark:text-red-300">
                Denied
              </span>
            </>
          )}
        </div>
      </div>
    );
  }

  // Output available — collapsible result card
  if (part.state === "output-available") {
    return (
      <div className="my-2 rounded-2xl border border-neutral-200 bg-neutral-50/50 dark:border-neutral-700 dark:bg-neutral-800/50">
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="flex w-full items-center gap-2 px-3 py-2.5 text-left"
        >
          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
          <ToolIcon className="h-3.5 w-3.5 text-neutral-500 dark:text-neutral-400" />
          <span className="text-xs font-medium text-neutral-700 dark:text-neutral-300">
            {displayName}
          </span>
          {params && (
            <span className="max-w-[200px] truncate text-xs text-neutral-400 dark:text-neutral-500">
              {params}
            </span>
          )}
          <span className="ml-auto">
            {expanded ? (
              <ChevronDown className="h-3 w-3 text-neutral-400" />
            ) : (
              <ChevronRight className="h-3 w-3 text-neutral-400" />
            )}
          </span>
        </button>
        {expanded && (
          <div className="border-t border-neutral-200 px-3 pb-3 pt-2 dark:border-neutral-700">
            <pre className="overflow-x-auto whitespace-pre-wrap break-words text-xs text-neutral-600 dark:text-neutral-400 font-[family-name:var(--font-geist-mono)]">
              {formatResult(part.output)}
            </pre>
          </div>
        )}
      </div>
    );
  }

  // Output error
  if (part.state === "output-error") {
    return (
      <div className="my-2 rounded-2xl border border-red-200 bg-red-50/50 p-3 dark:border-red-800/50 dark:bg-red-950/20">
        <div className="flex items-center gap-2">
          <XCircle className="h-3.5 w-3.5 text-red-500" />
          <span className="text-xs font-medium text-red-700 dark:text-red-300">
            {displayName}
          </span>
          <span className="rounded-full bg-red-200/60 px-2 py-0.5 text-[10px] font-medium text-red-800 dark:bg-red-800/40 dark:text-red-300">
            Error
          </span>
        </div>
        {part.errorText && (
          <p className="mt-2 text-xs text-red-600 dark:text-red-400">
            {part.errorText}
          </p>
        )}
      </div>
    );
  }

  // Output denied
  if (part.state === "output-denied") {
    return (
      <div className="my-2 rounded-2xl border border-neutral-200 bg-neutral-50/50 p-3 dark:border-neutral-700 dark:bg-neutral-800/50">
        <div className="flex items-center gap-2">
          <ShieldX className="h-3.5 w-3.5 text-neutral-400" />
          <span className="text-xs font-medium text-neutral-500 dark:text-neutral-400">
            {displayName}
          </span>
          <span className="rounded-full bg-neutral-200/60 px-2 py-0.5 text-[10px] font-medium text-neutral-600 dark:bg-neutral-700/40 dark:text-neutral-400">
            Denied
          </span>
        </div>
      </div>
    );
  }

  // Fallback for unknown states
  return null;
}
