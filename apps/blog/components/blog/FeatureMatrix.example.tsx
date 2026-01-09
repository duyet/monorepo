/**
 * Example usage of the FeatureMatrix component
 *
 * This file demonstrates how to structure and use the FeatureMatrix component
 * to create responsive, sortable comparison tables with accessibility features.
 */

import { FeatureMatrix } from "./FeatureMatrix";
import type { FeatureRow } from "./types";

export function FeatureMatrixExample() {
  // Define the tools/products to compare
  const tools = ["React", "Vue", "Angular", "Svelte"];

  // Define the features and their ratings for each tool
  const features: FeatureRow[] = [
    {
      featureName: "Learning Curve",
      scores: [
        {
          toolName: "React",
          score: 3,
          explanation: "Moderate - requires understanding of JSX",
        },
        {
          toolName: "Vue",
          score: 4,
          explanation: "Gentle - good documentation and examples",
        },
        {
          toolName: "Angular",
          score: 1,
          explanation: "Steep - complex framework with many concepts",
        },
        {
          toolName: "Svelte",
          score: 5,
          explanation: "Easy - intuitive syntax very similar to HTML",
        },
      ],
    },
    {
      featureName: "Performance",
      scores: [
        {
          toolName: "React",
          score: 4,
          explanation: "Fast - virtual DOM optimization",
        },
        {
          toolName: "Vue",
          score: 4,
          explanation: "Fast - efficient reactivity system",
        },
        {
          toolName: "Angular",
          score: 3,
          explanation: "Good - but heavier initial bundle",
        },
        {
          toolName: "Svelte",
          score: 5,
          explanation: "Excellent - compiler approach with minimal overhead",
        },
      ],
    },
    {
      featureName: "Community Size",
      scores: [
        {
          toolName: "React",
          score: 5,
          explanation: "Largest ecosystem and community",
        },
        {
          toolName: "Vue",
          score: 4,
          explanation: "Growing community, excellent support",
        },
        {
          toolName: "Angular",
          score: 4,
          explanation: "Strong corporate backing and community",
        },
        {
          toolName: "Svelte",
          score: 2,
          explanation: "Smaller but rapidly growing community",
        },
      ],
    },
    {
      featureName: "Bundle Size",
      scores: [
        { toolName: "React", score: 3, explanation: "Medium - ~40kb gzipped" },
        { toolName: "Vue", score: 4, explanation: "Small - ~34kb gzipped" },
        {
          toolName: "Angular",
          score: 1,
          explanation: "Large - ~130kb gzipped",
        },
        {
          toolName: "Svelte",
          score: 5,
          explanation: "Tiny - ~3-8kb per component",
        },
      ],
    },
    {
      featureName: "IDE Support",
      scores: [
        {
          toolName: "React",
          score: 5,
          explanation: "Excellent tooling and extensions available",
        },
        {
          toolName: "Vue",
          score: 4,
          explanation: "Very good - Volar extension for VS Code",
        },
        {
          toolName: "Angular",
          score: 5,
          explanation: "Excellent - tight integration with Angular CLI",
        },
        {
          toolName: "Svelte",
          score: 3,
          explanation: "Good - basic support, improving rapidly",
        },
      ],
    },
  ];

  return (
    <div className="space-y-8">
      <FeatureMatrix
        tools={tools}
        features={features}
        title="JavaScript Framework Comparison"
        description="A detailed comparison of popular JavaScript frameworks across key metrics."
        className="mb-8"
      />

      {/* Another example with null/missing scores */}
      <FeatureMatrix
        tools={["Tool A", "Tool B", "Tool C"]}
        features={[
          {
            featureName: "Feature 1",
            scores: [
              { toolName: "Tool A", score: 5, explanation: "Fully supported" },
              { toolName: "Tool B", score: 3 },
              {
                toolName: "Tool C",
                score: null,
                explanation: "Not applicable",
              },
            ],
          },
          {
            featureName: "Feature 2",
            scores: [
              { toolName: "Tool A", score: 2 },
              { toolName: "Tool B", score: 5 },
              { toolName: "Tool C", score: 4 },
            ],
          },
        ]}
        title="Tool Comparison with Missing Data"
      />
    </div>
  );
}
