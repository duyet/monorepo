import type { MDXComponents } from "mdx/types";

// Import components directly for RSC compatibility
import { ToolComparison } from "./blog/ToolComparison";
import { FeatureMatrix } from "./blog/FeatureMatrix";
import { ToolTimeline } from "./blog/ToolTimeline";
import WorkflowDiagram from "./blog/WorkflowDiagram";
import { VersionDiff } from "./blog/VersionDiff";
import { ToolList } from "./blog/ToolList";
import { PricingTable } from "./blog/PricingTable";
import { InfoBox } from "./blog/InfoBox";
import { CardGrid } from "./blog/CardGrid";
import { Tabs } from "./blog/Tabs";
import { StepsList } from "./blog/StepsList";
import { ComparisonList } from "./blog/ComparisonList";

// MDX component mapping
export const mdxComponents: MDXComponents = {
  ToolComparison,
  FeatureMatrix,
  ToolTimeline,
  WorkflowDiagram,
  VersionDiff,
  ToolList,
  PricingTable,
  InfoBox,
  CardGrid,
  Tabs,
  StepsList,
  ComparisonList,
};

export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    ...mdxComponents,
    ...components,
  };
}
