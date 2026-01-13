"use client";

import { MDXComponents } from "mdx/types";
import {
  ToolComparison,
  FeatureMatrix,
  WakaTimeChart,
  ToolTimeline,
  WorkflowDiagram,
  VersionDiff,
  ToolList,
} from ".";

// Map component names to React components
const componentMap = {
  ToolComparison,
  FeatureMatrix,
  WakaTimeChart,
  ToolTimeline,
  WorkflowDiagram,
  VersionDiff,
  ToolList,
};

export const MDXComponents: MDXComponents = {
  // Map all our MDX components to their implementation
  ToolComparison: ToolComparison,
  FeatureMatrix: FeatureMatrix,
  WakaTimeChart: WakaTimeChart,
  ToolTimeline: ToolTimeline,
  WorkflowDiagram: WorkflowDiagram,
  VersionDiff: VersionDiff,
  ToolList: ToolList,

  // Default components with custom styling
  h1: (props) => <h1 className="text-4xl font-bold mt-8 mb-4" {...props} />,
  h2: (props) => <h2 className="text-3xl font-semibold mt-6 mb-3" {...props} />,
  h3: (props) => <h3 className="text-2xl font-semibold mt-5 mb-2" {...props} />,
  h4: (props) => <h4 className="text-xl font-semibold mt-4 mb-2" {...props} />,
  p: (props) => <p className="mb-4 leading-relaxed" {...props} />,
  a: (props) => (
    <a className="text-primary hover:underline" {...props} />
  ),
  ul: (props) => (
    <ul className="mb-4 ml-6 list-disc space-y-2" {...props} />
  ),
  ol: (props) => (
    <ol className="mb-4 ml-6 list-decimal space-y-2" {...props} />
  ),
  li: (props) => <li className="mb-1" {...props} />,
  blockquote: (props) => (
    <blockquote className="border-l-4 border-gray-300 pl-4 my-4 italic" {...props} />
  ),
  code: (props) => (
    <code className="bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded text-sm font-mono" {...props} />
  ),
  pre: (props) => (
    <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto my-4" {...props} />
  ),
  hr: (props) => (
    <hr className="my-8 border-gray-200 dark:border-gray-700" {...props} />
  ),
  img: (props) => (
    <img
      className="max-w-full h-auto rounded-lg my-4"
      {...props}
      loading="lazy"
    />
  ),
  table: (props) => (
    <div className="overflow-x-auto my-4">
      <table className="min-w-full border-collapse border border-gray-300" {...props} />
    </div>
  ),
  th: (props) => (
    <th className="border border-gray-300 px-4 py-2 bg-gray-50 font-semibold text-left" {...props} />
  ),
  td: (props) => (
    <td className="border border-gray-300 px-4 py-2" {...props} />
  ),
};