"use client";

/**
 * State Inspector Panel (Unit 17)
 *
 * JSON viewer for AgentState with formatted/raw toggle.
 * Allows inspection of current conversation state.
 */

import { useState, useCallback } from "react";
import { Button } from "@duyet/components";
import { cn } from "@duyet/libs";
import {
  ChevronDown,
  ChevronRight,
  Code,
  FileText,
  Search,
  Copy,
  Check,
  RefreshCw,
} from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@duyet/components";
import type { AgentState } from "@/lib/graph";

export interface StateInspectorProps {
  /** Current agent state to inspect */
  state: AgentState | null;
  /** Previous state for comparison */
  prevState?: AgentState | null;
  /** Additional CSS class name */
  className?: string;
  /** Callback when state is manually refreshed */
  onRefresh?: () => void;
  /** Show refresh button */
  showRefresh?: boolean;
  /** Read-only mode (no manual edits) */
  readOnly?: boolean;
}

type ViewMode = "formatted" | "raw";

interface StateSection {
  key: string;
  label: string;
  value: unknown;
  type: "string" | "number" | "boolean" | "array" | "object" | "null";
  collapsed?: boolean;
}

/**
 * Format a value for display
 */
function formatValue(value: unknown, compact = false): string {
  if (value === null || value === undefined) {
    return "null";
  }
  if (typeof value === "string") {
    return compact && value.length > 50 ? `"${value.substring(0, 50)}..."` : `"${value}"`;
  }
  if (typeof value === "number") {
    return value.toString();
  }
  if (typeof value === "boolean") {
    return value.toString();
  }
  if (Array.isArray(value)) {
    return `[Array(${value.length})]${compact ? "" : ` ${JSON.stringify(value).substring(0, 100)}`}`;
  }
  if (typeof value === "object") {
    const keys = Object.keys(value);
    return `{Object(${keys.length})${compact ? "" : ` ${JSON.stringify(value).substring(0, 100)}`}`;
  }
  return String(value);
}

/**
 * Convert state to hierarchical sections for display
 */
function stateToSections(state: AgentState): StateSection[] {
  const sections: StateSection[] = [];

  // Core fields
  sections.push({
    key: "conversationId",
    label: "Conversation ID",
    value: state.conversationId,
    type: "string",
  });

  sections.push({
    key: "userInput",
    label: "User Input",
    value: state.userInput,
    type: "string",
  });

  sections.push({
    key: "response",
    label: "Response",
    value: state.response,
    type: "string",
  });

  sections.push({
    key: "route",
    label: "Current Route",
    value: state.route || "(none)",
    type: "string",
  });

  // Error
  if (state.error) {
    sections.push({
      key: "error",
      label: "Error",
      value: state.error,
      type: "string",
    });
  }

  // Tool calls
  sections.push({
    key: "toolCalls",
    label: "Tool Calls",
    value: state.toolCalls,
    type: "array",
    collapsed: true,
  });

  // Metadata
  sections.push({
    key: "metadata",
    label: "Metadata",
    value: state.metadata,
    type: "object",
    collapsed: true,
  });

  return sections;
}

/**
 * Component for displaying a single state section
 */
function StateSectionItem({
  section,
  isExpanded,
  onToggle,
  showDiff,
  diffValue,
}: {
  section: StateSection;
  isExpanded: boolean;
  onToggle: () => void;
  showDiff?: boolean;
  diffValue?: unknown;
}) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(() => {
    const text = typeof section.value === "string"
      ? section.value
      : JSON.stringify(section.value, null, 2);
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [section.value]);

  const hasDiff = showDiff && diffValue !== undefined && diffValue !== section.value;

  return (
    <div className="border-b border-border last:border-0">
      <button
        type="button"
        onClick={onToggle}
        className={cn(
          "w-full text-left px-4 py-2 hover:bg-muted/50 transition-colors flex items-center gap-2"
        )}
      >
        <span className="text-xs font-mono text-muted-foreground">
          {isExpanded ? (
            <ChevronDown className="h-3.5 w-3.5" />
          ) : (
            <ChevronRight className="h-3.5 w-3.5" />
          )}
        </span>

        <span className="text-xs font-medium text-muted-foreground">
          {section.label}
        </span>

        <div className="ml-auto flex items-center gap-2">
          {hasDiff && (
            <Badge variant="outline" className="text-[10px] px-1 py-0">
              Changed
            </Badge>
          )}

          {section.type !== "string" && section.type !== "null" && (
            <Badge variant="outline" className="text-[10px] px-1 py-0">
              {section.type}
            </Badge>
          )}
        </div>
      </button>

      {isExpanded && (
        <div className="px-4 pb-3 bg-muted/10">
          <div className="flex items-center justify-between mb-2">
            <pre className="text-xs text-muted-foreground font-mono overflow-x-auto">
              {formatValue(section.value, true)}
            </pre>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={handleCopy}
            >
              {copied ? (
                <Check className="h-3 w-3 text-green-600" />
              ) : (
                <Copy className="h-3 w-3 text-muted-foreground" />
              )}
              <span className="sr-only">Copy</span>
            </Button>
          </div>

          {hasDiff && (
            <div className="mt-2 pt-2 border-t border-border/50">
              <p className="text-xs text-muted-foreground mb-1">Previous value:</p>
              <pre className="text-xs text-muted-foreground/70 font-mono overflow-x-auto">
                {formatValue(diffValue, true)}
              </pre>
            </div>
          )}

          {/* Special handling for tool calls array */}
          {section.type === "array" && Array.isArray(section.value) && (
            <div className="mt-2 space-y-2">
              <p className="text-xs text-muted-foreground">
                {section.value.length} item{section.value.length !== 1 ? "s" : ""}
              </p>
              {section.value.slice(0, 10).map((item, idx) => (
                <details
                  key={idx}
                  className="pl-2 text-xs border-l-2 border-border"
                >
                  <summary className="cursor-pointer hover:text-foreground">
                    [{idx}] {typeof item === "object" && item ? (item as { toolName?: string }).toolName || "object" : typeof item}
                  </summary>
                  <pre className="mt-1 text-xs text-muted-foreground/70 font-mono">
                    {JSON.stringify(item, null, 2)}
                  </pre>
                </details>
              ))}
              {section.value.length > 10 && (
                <p className="text-xs text-muted-foreground italic">
                  ... and {section.value.length - 10} more
                </p>
              )}
            </div>
          )}

          {/* Special handling for metadata object */}
          {section.type === "object" && typeof section.value === "object" && section.value !== null && (
            <div className="mt-2 space-y-1">
              {Object.entries(section.value).map(([key, val]) => (
                <div key={key} className="flex gap-2 text-xs">
                  <span className="font-mono text-muted-foreground w-32 flex-shrink-0">
                    {key}:
                  </span>
                  <span className="font-mono text-foreground break-all">
                    {formatValue(val, false)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/**
 * State Inspector Panel
 *
 * Displays AgentState in a structured, inspectable format.
 * Shows field values, types, and diffs from previous state.
 */
export function StateInspector({
  state,
  prevState,
  className,
  onRefresh,
  showRefresh = false,
  readOnly = true,
}: StateInspectorProps) {
  const [viewMode, setViewMode] = useState<ViewMode>("formatted");
  const [searchQuery, setSearchQuery] = useState("");
  const [collapsedSections, setCollapsedSections] = useState<Set<string>>(new Set());

  const toggleSection = useCallback((key: string) => {
    setCollapsedSections((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(key)) {
        newSet.delete(key);
      } else {
        newSet.add(key);
      }
      return newSet;
    });
  }, []);

  const sections = state ? stateToSections(state) : [];

  // Filter sections by search query
  const filteredSections = searchQuery
    ? sections.filter(
        (s) =>
          s.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
          s.key.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : sections;

  // Calculate diff for each section
  const getDiffValue = (key: string) => {
    if (!prevState) return undefined;
    switch (key) {
      case "toolCalls":
        return prevState.toolCalls;
      case "metadata":
        return prevState.metadata;
      default:
        return (prevState as unknown as Record<string, unknown>)[key];
    }
  };

  if (!state) {
    return (
      <div
        className={cn(
          "flex items-center justify-center h-full bg-muted/20 rounded-lg border border-dashed border-muted-foreground/25 text-center p-6",
          className
        )}
      >
        <FileText className="h-8 w-8 mx-auto mb-2 text-muted-foreground/50" />
        <p className="text-sm font-medium text-muted-foreground">No state available</p>
        <p className="text-xs text-muted-foreground/75 mt-1">
          State data will appear here once a conversation starts.
        </p>
      </div>
    );
  }

  return (
    <div className={cn("h-full flex flex-col bg-background", className)}>
      {/* Header */}
      <div className="px-4 py-2 border-b border-border bg-muted/30">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-muted-foreground">
              State Inspector
            </span>
            <Badge variant="outline" className="text-[10px] px-1.5 py-0">
              {viewMode === "raw" ? "JSON" : "Formatted"}
            </Badge>
          </div>

          <div className="flex items-center gap-1">
            {showRefresh && onRefresh && (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={onRefresh}
              >
                <RefreshCw className="h-3 w-3 text-muted-foreground" />
                <span className="sr-only">Refresh</span>
              </Button>
            )}

            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={() =>
                setViewMode((prev) =>
                  prev === "formatted" ? "raw" : "formatted"
                )
              }
            >
              {viewMode === "raw" ? (
                <Code className="h-3 w-3 text-muted-foreground" />
              ) : (
                <FileText className="h-3 w-3 text-muted-foreground" />
              )}
              <span className="sr-only">
                Toggle view mode
              </span>
            </Button>
          </div>
        </div>

        {/* Search bar */}
        <div className="mt-2 relative">
          <Search className="absolute left-2.5 top-2 h-3.5 w-3.5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search fields..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={cn(
              "h-8 w-full pl-8 pr-3 text-xs rounded-md border border-input bg-background",
              "focus:outline-none focus:ring-1 focus:ring-ring"
            )}
          />
        </div>
      </div>

      {/* State sections */}
      <ScrollArea className="flex-1">
        {viewMode === "formatted" ? (
          <div className="divide-y divide-border">
            {filteredSections.map((section) => (
              <StateSectionItem
                key={section.key}
                section={section}
                isExpanded={!collapsedSections.has(section.key)}
                onToggle={() => toggleSection(section.key)}
                showDiff={!!prevState}
                diffValue={getDiffValue(section.key)}
              />
            ))}
          </div>
        ) : (
          <div className="p-4">
            <pre className="text-xs text-muted-foreground font-mono overflow-x-auto bg-muted/20 p-3 rounded border border-border">
              {JSON.stringify(state, null, 2)}
            </pre>
          </div>
        )}
      </ScrollArea>
    </div>
  );
}
