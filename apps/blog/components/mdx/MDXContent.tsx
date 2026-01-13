"use client";

import { MDXProvider } from "@mdx-js/react";
import { ToolComparison } from "./ToolComparison";
import { FeatureMatrix } from "./FeatureMatrix";
import { WakaTimeChart } from "./WakaTimeChart";
import { ToolTimeline } from "./ToolTimeline";
import { WorkflowDiagram } from "./WorkflowDiagram";
import { VersionDiff } from "./VersionDiff";
import ToolList from "./ToolList";

const components = {
  ToolComparison,
  FeatureMatrix,
  WakaTimeChart,
  ToolTimeline,
  WorkflowDiagram,
  VersionDiff,
  ToolList,
};

export function MDXContent({ children }: { children: React.ReactNode }) {
  return (
    <MDXProvider components={components}>
      <div className="prose prose-lg max-w-none dark:prose-invert">
        {children}
      </div>
    </MDXProvider>
  );
}