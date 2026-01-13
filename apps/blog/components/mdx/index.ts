/**
 * MDX Components Index
 *
 * Export all interactive components for use in MDX files.
 * These components can be used directly in MDX posts without imports.
 */

export { ToolComparison } from "./ToolComparison";
export { FeatureMatrix } from "./FeatureMatrix";
export { WakaTimeChart } from "./WakaTimeChart";
export { ToolTimeline } from "./ToolTimeline";
export { WorkflowDiagram } from "./WorkflowDiagram";
export { VersionDiff } from "./VersionDiff";
export { ToolList } from "./ToolList";

// Re-export for convenience
export * from "./ToolComparison";
export * from "./FeatureMatrix";
export * from "./WakaTimeChart";
export * from "./ToolTimeline";
export * from "./WorkflowDiagram";
export * from "./VersionDiff";
export * from "./ToolList";

/**
 * All MDX components bundle
 *
 * Use this object to pass to MDXRemote or MDX provider:
 *
 * ```tsx
 * import { mdxComponents } from "@/components/mdx";
 *
 * <MDXRemote source={mdxSource} components={mdxComponents} />
 * ```
 */
export const mdxComponents = {
  // Interactive components
  ToolComparison,
  FeatureMatrix,
  WakaTimeChart,
  ToolTimeline,
  WorkflowDiagram,
  VersionDiff,
  ToolList,

  // HTML elements customization (optional)
  h1: (props: any) => <h1 className="text-4xl font-bold mb-6 mt-8" {...props} />,
  h2: (props: any) => <h2 className="text-3xl font-bold mb-5 mt-6" {...props} />,
  h3: (props: any) => <h3 className="text-2xl font-bold mb-4 mt-4" {...props} />,
  h4: (props: any) => <h4 className="text-xl font-bold mb-3 mt-3" {...props} />,
  p: (props: any) => <p className="mb-4" {...props} />,
  ul: (props: any) => <ul className="list-disc ml-6 mb-4" {...props} />,
  ol: (props: any) => <ol className="list-decimal ml-6 mb-4" {...props} />,
  li: (props: any) => <li className="mb-1" {...props} />,
  code: (props: any) => (
    <code className="bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded font-mono text-sm" {...props} />
  ),
  pre: (props: any) => (
    <pre className="bg-gray-100 dark:bg-gray-800 p-4 rounded mb-4 overflow-x-auto" {...props} />
  ),
  blockquote: (props: any) => (
    <blockquote
      className="border-l-4 border-blue-500 pl-4 italic my-4 text-gray-600 dark:text-gray-400"
      {...props}
    />
  ),
  a: (props: any) => (
    <a
      className="text-blue-600 dark:text-blue-400 hover:underline"
      target="_blank"
      rel="noopener noreferrer"
      {...props}
    />
  ),
};
