import type { MDXComponents } from "mdx/types";
import { CardGrid } from "./blog/CardGrid";
import {
  ClaudeCard,
  ClaudeCardGrid,
  ClaudeCardNested,
} from "./blog/ClaudeCard";
import { LazyCodeBlock } from "./blog/LazyCodeBlock";
import { ComparisonList } from "./blog/ComparisonList";
import { InfoBox } from "./blog/InfoBox";
// Import components directly for RSC compatibility
import { PricingTable } from "./blog/PricingTable";
import { Step, Steps } from "./blog/Steps";
import { StepsList } from "./blog/StepsList";
import { Tabs } from "./blog/Tabs";

// Custom Image component for MDX
function Image({
  src,
  alt,
  ...props
}: {
  src?: string;
  alt?: string;
  [key: string]: unknown;
}) {
  // Handle Obsidian-style image references
  const imageSrc = src?.startsWith("[[")
    ? `/attachments/${src.replace(/^\[\[|\]\]$/g, "")}`
    : src;

  return (
    <span className="block my-4">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={imageSrc || ""}
        alt={alt || ""}
        className="rounded-xl border border-gray-200 dark:border-gray-700 max-w-full"
        loading="lazy"
        {...props}
      />
    </span>
  );
}

// MDX component mapping
export const mdxComponents: MDXComponents = {
  PricingTable,
  InfoBox,
  CardGrid,
  Tabs,
  StepsList,
  ComparisonList,
  Steps,
  Step,
  ClaudeCard,
  ClaudeCardGrid,
  ClaudeCardNested,
  pre: LazyCodeBlock,
  Image,
  img: Image, // Handle standard markdown image syntax ![alt](url)
};

export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    ...mdxComponents,
    ...components,
  };
}
