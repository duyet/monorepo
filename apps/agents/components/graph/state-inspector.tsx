/**
 * State Inspector Panel (Unit 17)
 *
 * JSON viewer for AgentState with formatted/raw toggle.
 * Allows inspection of current conversation state.
 */

import {
  Warning as AlertCircle,
  Check,
  CaretDown as ChevronDown,
  CaretRight as ChevronRight,
  Code,
  Copy,
  FileText,
  History,
  Spinner as Loader2,
  ArrowClockwise as RefreshCw,
  ArrowCounterClockwise as RotateCcw,
  MagnifyingGlass as Search,
} from "@phosphor-icons/react";
import { useCallback, useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { AgentState } from "@/lib/graph";
import { useToggleSet } from "@/lib/hooks";
import { useCheckpoints } from "@/lib/hooks/use-graph-state";
import { cn } from "@/lib/utils";

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
  /** Show checkpoint controls (default: true) */
  showCheckpoints?: boolean;
  /** Conversation ID for checkpoint operations (required for checkpoints) */
  conversationId?: string;
  /** Returns a Clerk session token for authenticated checkpoint requests */
  getAuthToken?: () => Promise<string | null>;
  /** Callback when state is restored from a checkpoint */
  onRestore?: (state: AgentState) => void;
}

type ViewMode = "formatted" | "raw";

interface StateSection {
  key: string;
  label: string;
  value: unknown;
  type: "string" | "number" | "boolean" | "array" | "object" | "null";
  collapsed?: boolean;
}

/** Format timestamp to relative time */
function formatRelativeTime(timestamp: number): string {
  const now = Date.now();
  const diff = now - timestamp;

  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (seconds < 60) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  return `${days}d ago`;
}

/** Format checkpoint date for display */
function formatCheckpointDate(timestamp: number): string {
  const date = new Date(timestamp);
  return date.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/**
 * Format a value for display
 */
function formatValue(value: unknown, compact = false): string {
  if (value === null || value === undefined) {
    return "null";
  }
  if (typeof value === "string") {
    return compact && value.length > 50
      ? `"${value.substring(0, 50)}..."`
      : `"${value}"`;
  }
  if (typeof value === "number") {
    return value.toString();
  }
  if (typeof value === "boolean") {
    return value.toString();
  }
  if (Array.isArray(value)) {
    return `[Array(${value.length})]`;
  }
  if (typeof value === "object") {
    const keys = Object.keys(value);
    return `{Object(${keys.length})}`;
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
 * Props for StateSectionItem component
 */
interface StateSectionItemProps {
  section: StateSection;
  isExpanded: boolean;
  onToggle: () => void;
  showDiff?: boolean;
  diffValue?: unknown;
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
}: StateSectionItemProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(() => {
    const text =
      typeof section.value === "string"
        ? section.value
        : JSON.stringify(section.value, null, 2);
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [section.value]);

  const hasDiff =
    showDiff && diffValue !== undefined && diffValue !== section.value;

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
              <p className="text-xs text-muted-foreground mb-1">
                Previous value:
              </p>
              <pre className="text-xs text-muted-foreground/70 font-mono overflow-x-auto">
                {formatValue(diffValue, true)}
              </pre>
            </div>
          )}

          {/* Special handling for tool calls array */}
          {section.type === "array" && Array.isArray(section.value) && (
            <div className="mt-2 space-y-2">
              <p className="text-xs text-muted-foreground">
                {section.value.length} item
                {section.value.length !== 1 ? "s" : ""}
              </p>
              {section.value.slice(0, 10).map((item, idx) => (
                <details
                  key={idx}
                  className="pl-2 text-xs border-l-2 border-border"
                >
                  <summary className="cursor-pointer hover:text-foreground">
                    [{idx}]{" "}
                    {typeof item === "object" && item
                      ? (item as { toolName?: string }).toolName || "object"
                      : typeof item}
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
          {section.type === "object" &&
            typeof section.value === "object" &&
            section.value !== null && (
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
 * Checkpoint Controls Component
 *
 * Displays checkpoint list with restore functionality.
 */
interface CheckpointControlsProps {
  conversationId: string;
  getAuthToken?: () => Promise<string | null>;
  onRestore?: (state: AgentState) => void;
}

function CheckpointControls({
  conversationId,
  getAuthToken,
  onRestore,
}: CheckpointControlsProps) {
  const { checkpoints, isLoading, error, refresh, restore, clearError } =
    useCheckpoints({ conversationId, getAuthToken });

  const [isRestoring, setIsRestoring] = useState(false);
  const [selectedCheckpointId, setSelectedCheckpointId] = useState<
    string | null
  >(null);
  const [restoreSuccess, setRestoreSuccess] = useState(false);
  const [restoreError, setRestoreError] = useState<string | null>(null);

  const handleRestore = useCallback(
    async (checkpointId: string) => {
      setIsRestoring(true);
      setRestoreSuccess(false);
      setRestoreError(null);

      try {
        const restoredState = await restore(checkpointId);
        if (restoredState) {
          setRestoreSuccess(true);
          setSelectedCheckpointId(null);
          // Call parent callback if provided
          if (onRestore) {
            onRestore(restoredState);
          }
          // Clear success message after 3 seconds
          setTimeout(() => setRestoreSuccess(false), 3000);
        }
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Failed to restore checkpoint";
        setRestoreError(message);
        setTimeout(() => setRestoreError(null), 5000);
      } finally {
        setIsRestoring(false);
      }
    },
    [restore, onRestore]
  );

  const isCheckpointSelected = selectedCheckpointId !== null;

  return (
    <div className="flex flex-col gap-3">
      {/* Success message */}
      {restoreSuccess && (
        <div className="flex items-center gap-2 px-3 py-2 bg-green-500/10 border border-green-500/20 rounded-md">
          <Check className="h-4 w-4 text-green-600" />
          <span className="text-xs text-green-700 dark:text-green-400">
            State restored successfully
          </span>
        </div>
      )}

      {/* Error message */}
      {(error || restoreError) && (
        <div className="flex items-start gap-2 px-3 py-2 bg-destructive/10 border border-destructive/20 rounded-md">
          <AlertCircle className="h-4 w-4 text-destructive mt-0.5 flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-xs text-destructive">
              {restoreError || (error && "Failed to load checkpoints")}
            </p>
            {error && !restoreError && (
              <Button
                type="button"
                variant="link"
                className="h-auto p-0 text-xs text-destructive underline"
                onClick={() => {
                  clearError();
                  refresh();
                }}
              >
                Retry
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Checkpoint selector */}
      <div className="relative">
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="w-full justify-start text-left h-8 px-3 text-xs"
          onClick={() =>
            setSelectedCheckpointId(isCheckpointSelected ? null : "selector")
          }
        >
          <History className="h-3.5 w-3.5 mr-2 text-muted-foreground" />
          {isCheckpointSelected
            ? "Close history"
            : `View history (${checkpoints.length})`}
        </Button>

        {/* Checkpoint dropdown */}
        {isCheckpointSelected && (
          <div className="absolute z-50 w-full mt-1 border border-border rounded-md shadow-lg max-h-60 overflow-hidden">
            <div className="flex items-center justify-between px-3 py-2 border-b border-border bg-muted/30">
              <span className="text-xs font-medium text-muted-foreground">
                Version History
              </span>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-5 w-5"
                onClick={() => refresh()}
                disabled={isLoading}
              >
                <RefreshCw
                  className={cn(
                    "h-3 w-3 text-muted-foreground",
                    isLoading && "animate-spin"
                  )}
                />
              </Button>
            </div>

            <ScrollArea className="max-h-48">
              {isLoading && checkpoints.length === 0 ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-4 w-4 text-muted-foreground animate-spin" />
                </div>
              ) : checkpoints.length === 0 ? (
                <div className="py-8 text-center">
                  <History className="h-6 w-6 mx-auto mb-2 text-muted-foreground/50" />
                  <p className="text-xs text-muted-foreground">
                    No checkpoints available
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-border">
                  {checkpoints.map((checkpoint) => (
                    <div
                      key={checkpoint.id}
                      className="flex items-center justify-between px-3 py-2 hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <Badge
                            variant="outline"
                            className="text-[10px] px-1 py-0 font-mono"
                          >
                            v{checkpoint.version}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {formatRelativeTime(checkpoint.createdAt)}
                          </span>
                        </div>
                        <p className="text-[10px] text-muted-foreground/70 mt-0.5 truncate">
                          {formatCheckpointDate(checkpoint.createdAt)}
                        </p>
                        {checkpoint.currentNode && (
                          <p className="text-[10px] text-muted-foreground/60 mt-0.5">
                            Node: {checkpoint.currentNode}
                          </p>
                        )}
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 flex-shrink-0 ml-2"
                        onClick={() => handleRestore(checkpoint.id)}
                        disabled={isRestoring}
                        title="Restore to this checkpoint"
                      >
                        {isRestoring ? (
                          <Loader2 className="h-3.5 w-3.5 text-muted-foreground animate-spin" />
                        ) : (
                          <RotateCcw className="h-3.5 w-3.5 text-muted-foreground" />
                        )}
                        <span className="sr-only">Restore checkpoint</span>
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </div>
        )}
      </div>
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
  showCheckpoints = true,
  conversationId,
  getAuthToken,
  onRestore,
}: StateInspectorProps) {
  const [viewMode, setViewMode] = useState<ViewMode>("formatted");
  const [searchQuery, setSearchQuery] = useState("");
  const [collapsedSections, toggleSection] = useToggleSet<string>();

  const sections = useMemo(
    () => (state ? stateToSections(state) : []),
    [state]
  );

  // Filter sections by search query
  const filteredSections = useMemo(
    () =>
      searchQuery
        ? sections.filter(
            (s) =>
              s.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
              s.key.toLowerCase().includes(searchQuery.toLowerCase())
          )
        : sections,
    [sections, searchQuery]
  );

  // Memoize diff values from previous state
  const prevValues = useMemo(() => {
    if (!prevState) return {};
    return {
      toolCalls: prevState.toolCalls,
      metadata: prevState.metadata,
      userInput: prevState.userInput,
      response: prevState.response,
      route: prevState.route,
      error: prevState.error,
    };
  }, [prevState]);

  // Get diff value for a section key
  const getDiffValue = (key: string) => {
    return prevValues[key as keyof typeof prevValues];
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
        <p className="text-sm font-medium text-muted-foreground">
          No state available
        </p>
        <p className="text-xs text-muted-foreground/75 mt-1">
          State data will appear here once a conversation starts.
        </p>
      </div>
    );
  }

  return (
    <div className={cn("h-full flex flex-col", className)}>
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
              <span className="sr-only">Toggle view mode</span>
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
              "h-8 w-full pl-8 pr-3 text-xs rounded-md border border-input",
              "focus:outline-none focus:ring-1 focus:ring-ring"
            )}
          />
        </div>

        {/* Checkpoint controls */}
        {showCheckpoints && conversationId && (
          <div className="mt-3">
            <CheckpointControls
              conversationId={conversationId}
              getAuthToken={getAuthToken}
              onRestore={onRestore}
            />
          </div>
        )}
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
