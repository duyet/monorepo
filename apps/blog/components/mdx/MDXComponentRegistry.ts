import { ToolComparison } from './ToolComparison';
import { FeatureMatrix } from './FeatureMatrix';
import { WakaTimeChart } from './WakaTimeChart';
import { ToolTimeline } from './ToolTimeline';
import { WorkflowDiagram } from './WorkflowDiagram';
import { VersionDiff } from './VersionDiff';
import { ToolList } from './ToolList';

/**
 * Registry of available MDX components
 * Maps component names to their React components
 */
export const MDX_COMPONENTS = {
  ToolComparison,
  FeatureMatrix,
  WakaTimeChart,
  ToolTimeline,
  WorkflowDiagram,
  VersionDiff,
  ToolList,
};

/**
 * Type for component names in the registry
 */
export type MDXComponentName = keyof typeof MDX_COMPONENTS;

/**
 * Helper to check if a component name is registered
 */
export function isMDXComponent(name: string): name is MDXComponentName {
  return name in MDX_COMPONENTS;
}

/**
 * Get a component from the registry
 */
export function getMDXComponent(name: string) {
  return MDX_COMPONENTS[name as MDXComponentName];
}