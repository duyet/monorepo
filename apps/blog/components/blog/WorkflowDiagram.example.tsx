/**
 * WorkflowDiagram Component Example
 *
 * This file demonstrates how to use the WorkflowDiagram component
 * with different configurations and use cases.
 */

import WorkflowDiagram from "./WorkflowDiagram";
import type { WorkflowNode } from "./types";

// Example 1: Basic workflow with 3 nodes
export const BasicWorkflowExample = () => {
  const nodes: WorkflowNode[] = [
    {
      id: "plan",
      icon: "Lightbulb",
      title: "Plan",
      description:
        "Define requirements, create specifications, and outline the project scope.",
    },
    {
      id: "develop",
      icon: "Code",
      title: "Develop",
      description:
        "Write clean, maintainable code following best practices and design patterns.",
    },
    {
      id: "deploy",
      icon: "Rocket",
      title: "Deploy",
      description:
        "Test thoroughly and deploy to production with monitoring and rollback plans.",
    },
  ];

  return <WorkflowDiagram nodes={nodes} />;
};

// Example 2: Data processing workflow
export const DataProcessingWorkflowExample = () => {
  const nodes: WorkflowNode[] = [
    {
      id: "ingest",
      icon: "Database",
      title: "Data Ingestion",
      description:
        "Collect data from various sources including APIs, databases, and file uploads.",
    },
    {
      id: "process",
      icon: "Zap",
      title: "Processing",
      description:
        "Transform and normalize data, handle missing values, and validate integrity.",
    },
    {
      id: "analyze",
      icon: "TrendingUp",
      title: "Analysis",
      description:
        "Generate insights, create visualizations, and build predictive models.",
    },
  ];

  return (
    <div className="w-full">
      <h2 className="mb-8 text-2xl font-bold text-gray-900 dark:text-white">
        Data Processing Pipeline
      </h2>
      <WorkflowDiagram nodes={nodes} className="mt-8" />
    </div>
  );
};

// Example 3: Machine learning workflow
export const MLWorkflowExample = () => {
  const nodes: WorkflowNode[] = [
    {
      id: "prepare",
      icon: "Database",
      title: "Data Preparation",
      description:
        "Collect, clean, and preprocess training data with feature engineering.",
    },
    {
      id: "train",
      icon: "Brain",
      title: "Model Training",
      description:
        "Train models, perform hyperparameter tuning, and validate performance.",
    },
    {
      id: "evaluate",
      icon: "BarChart3",
      title: "Evaluation",
      description:
        "Test on holdout datasets, measure metrics, and compare against baselines.",
    },
  ];

  return (
    <div className="w-full">
      <h2 className="mb-8 text-2xl font-bold text-gray-900 dark:text-white">
        Machine Learning Workflow
      </h2>
      <WorkflowDiagram nodes={nodes} />
    </div>
  );
};

// Example 4: Custom icon workflow (with fallback handling)
export const CustomIconWorkflowExample = () => {
  const nodes: WorkflowNode[] = [
    {
      id: "design",
      icon: "Palette", // Valid Lucide icon
      title: "Design",
      description:
        "Create mockups, wireframes, and design systems with accessibility in mind.",
    },
    {
      id: "develop",
      icon: "Code2", // Valid Lucide icon
      title: "Develop",
      description: "Build responsive components using React and Tailwind CSS.",
    },
    {
      id: "test",
      icon: "CheckCircle2", // Valid Lucide icon
      title: "Testing",
      description:
        "Write tests, perform QA, and ensure cross-browser compatibility.",
    },
  ];

  return (
    <div className="w-full">
      <h2 className="mb-8 text-2xl font-bold text-gray-900 dark:text-white">
        Frontend Development Workflow
      </h2>
      <WorkflowDiagram nodes={nodes} className="mt-8" />
      <p className="mt-4 text-sm text-gray-600 dark:text-gray-400">
        Note: Icons fallback to Circle if the specified Lucide icon doesn't
        exist
      </p>
    </div>
  );
};

// Example 5: Complex workflow with long descriptions
export const ComplexWorkflowExample = () => {
  const nodes: WorkflowNode[] = [
    {
      id: "research",
      icon: "Microscope",
      title: "Research",
      description:
        "Conduct market research, analyze competitors, identify user needs and pain points. " +
        "Document findings with data-driven insights and recommendations.",
    },
    {
      id: "strategy",
      icon: "Map",
      title: "Strategy",
      description:
        "Define business goals, create roadmaps, allocate resources, and establish success metrics. " +
        "Align stakeholders and secure buy-in from leadership.",
    },
    {
      id: "execute",
      icon: "Target",
      title: "Execution",
      description:
        "Implement solutions iteratively, measure results, gather feedback, and optimize continuously. " +
        "Monitor KPIs and adjust strategy as needed.",
    },
  ];

  return (
    <div className="w-full">
      <h2 className="mb-8 text-2xl font-bold text-gray-900 dark:text-white">
        Product Development Workflow
      </h2>
      <WorkflowDiagram nodes={nodes} className="mt-8" />
    </div>
  );
};

// Export all examples for demonstration
export const WorkflowExamples = {
  BasicWorkflow: BasicWorkflowExample,
  DataProcessing: DataProcessingWorkflowExample,
  MLWorkflow: MLWorkflowExample,
  CustomIcons: CustomIconWorkflowExample,
  Complex: ComplexWorkflowExample,
};
