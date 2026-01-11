// Tool status and category types
export type ToolStatus = "active" | "testing" | "deprecated";
export type ToolCategory = "AI Coding" | "Framework" | "SDK" | "Other";
export type Rating = 1 | 2 | 3 | 4 | 5;

// Base Tool interface
export interface Tool {
  name: string;
  category: ToolCategory;
  status: ToolStatus;
  rating: Rating;
  dateAdded?: string;
  notes?: string;
}

// For ToolComparison component
export interface ToolComparisonProps {
  name: string;
  rating: Rating;
  pros: string[];
  cons: string[];
  winner?: boolean;
  description?: string;
  className?: string;
}

// For FeatureMatrix component
export type FeatureMatrixRating = 0 | 1 | 2 | 3 | 4 | 5;

export interface ToolScore {
  toolName: string;
  score: FeatureMatrixRating | null;
  explanation?: string;
}

export interface FeatureRow {
  featureName: string;
  scores: ToolScore[];
}

export interface FeatureMatrixProps {
  /** Array of tool names (columns) */
  tools: string[];
  /** Array of features with their scores for each tool */
  features: FeatureRow[];
  /** Optional class name for the wrapper */
  className?: string;
  /** Optional title for the matrix */
  title?: string;
  /** Optional description text */
  description?: string;
  /** Whether to show explanations on hover (default: true) */
  showTooltips?: boolean;
}

export type SortDirection = "asc" | "desc" | null;

export interface SortState {
  columnIndex: number | null;
  direction: SortDirection;
}

// Legacy types for backward compatibility
export interface FeatureScore {
  name: string;
  scores: Record<string, Rating | 0>; // 0 for missing
  explanations?: Record<string, string>;
}

// For WakaTimeChart component
export interface WakaTimeDataPoint {
  date: string;
  [language: string]: string | number; // language name -> hours
}

export interface WakaTimeChartProps {
  data: WakaTimeDataPoint[];
  title?: string;
  className?: string;
}

// For ToolTimeline component
export interface TimelineEvent {
  /** Unique identifier for the event */
  id: string;

  /** Tool or technology name */
  name: string;

  /** Date when this event occurred (YYYY-MM format recommended) */
  date: string | Date;

  /** Status of the tool at this point in time */
  status: "adopted" | "active" | "testing" | "deprecated";

  /** Full details/description of the event */
  details: string;

  /** Reason for the status change or key moment annotation */
  reason?: string;
}

export interface ToolTimelineProps {
  /** Array of timeline events to display */
  events: TimelineEvent[];

  /** Optional CSS class name for custom styling */
  className?: string;

  /** Optional callback when event is expanded */
  onEventExpand?: (event: TimelineEvent) => void;

  /** Optional callback when event is collapsed */
  onEventCollapse?: (event: TimelineEvent) => void;
}

// For WorkflowDiagram component
export interface WorkflowNode {
  id: string;
  title: string;
  description: string;
  icon?: string; // Lucide icon name
}

export interface WorkflowDiagramProps {
  nodes: WorkflowNode[];
  className?: string;
}

// For VersionDiff component
/**
 * Legacy Version interface for backward compatibility
 * @deprecated Use VersionDiffNew instead for new components
 */
export interface VersionLegacy {
  date: string; // YYYY-MM format
  content: string;
  label: string;
  isUpcoming?: boolean;
}

/**
 * Enhanced Version interface for modern VersionDiff component
 * Supports diff highlighting, git-style metadata, and future versions
 */
export interface Version {
  /** Unique identifier for the version */
  id: string;

  /** Version label or title (e.g., "v1.0.0", "Release 1") */
  label: string;

  /** Commit message or description */
  message: string;

  /** Date of the version */
  date: Date | string;

  /** Diff content with + and - prefixes for added/removed lines */
  diff: string;
}

/**
 * Props for modern VersionDiff component
 */
export interface VersionDiffProps {
  /** Array of versions to display */
  versions: Version[];

  /** Optional callback when version changes */
  onVersionChange?: (version: Version, index: number) => void;

  /** Optional CSS class name for custom styling */
  className?: string;

  /** Optional initial version index (default: last version) */
  initialIndex?: number;

  /** Show version metadata (default: true) */
  showMetadata?: boolean;

  /** Custom height for the diff content area (default: "600px") */
  diffHeight?: string;
}

/**
 * Legacy VersionDiffProps for backward compatibility
 * @deprecated Use VersionDiffProps instead
 */
export interface VersionDiffPropsLegacy {
  versions: VersionLegacy[];
  title?: string;
}

// For ToolList component
export interface ToolListProps {
  tools: Tool[];
  initialFilter?: ToolStatus | "all";
  pageSize?: number;
  className?: string;
}

// Error boundary fallback props
export interface ErrorFallbackProps {
  componentName: string;
  error?: Error;
}
