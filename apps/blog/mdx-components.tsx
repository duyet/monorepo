import type { MDXComponents } from 'mdx/types'
import * as React from 'react'

// Import all MDX components
import {
  ToolComparison,
  FeatureMatrix,
  WakaTimeChart,
  ToolTimeline,
  WorkflowDiagram,
  VersionDiff,
  ToolList,
} from './components/mdx'

// This file is required to use MDX in `app` directory
export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    // Custom components available in MDX files
    ToolComparison,
    FeatureMatrix,
    WakaTimeChart,
    ToolTimeline,
    WorkflowDiagram,
    VersionDiff,
    ToolList,
    // Use default components for all other components unless overridden
    ...components,
  }
}