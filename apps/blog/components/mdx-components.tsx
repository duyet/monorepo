import type { MDXComponents } from "mdx/types";

// Import components directly for RSC compatibility
import { ToolComparison } from "./blog/ToolComparison";
import { FeatureMatrix } from "./blog/FeatureMatrix";
import { WakaTimeChart } from "./blog/WakaTimeChart";
import { ToolTimeline } from "./blog/ToolTimeline";
import WorkflowDiagram from "./blog/WorkflowDiagram";
import { VersionDiff } from "./blog/VersionDiff";
import { ToolList } from "./blog/ToolList";

// MDX component mapping
export const mdxComponents: MDXComponents = {
  ToolComparison,
  FeatureMatrix,
  WakaTimeChart,
  ToolTimeline,
  WorkflowDiagram,
  VersionDiff,
  ToolList,
};

export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    ...mdxComponents,
    ...components,
  };
}
