import type { MDXComponents } from "mdx/types";

// Import components directly for RSC compatibility
import { PricingTable } from "./blog/PricingTable";
import { InfoBox } from "./blog/InfoBox";
import { CardGrid } from "./blog/CardGrid";
import { Tabs } from "./blog/Tabs";
import { StepsList } from "./blog/StepsList";
import { ComparisonList } from "./blog/ComparisonList";
import { CodeBlock } from "./blog/CodeBlock";
import { Steps, Step } from "./blog/Steps";
import { ClaudeCard } from "./blog/ClaudeCard";

// Custom Image component for MDX
function Image({ src, alt, ...props }: { src?: string; alt?: string; [key: string]: unknown }) {
  // Handle Obsidian-style image references
  const imageSrc = src?.startsWith("[[") ? `/attachments/${src.replace(/^\[\[|\]\]$/g, "")}` : src;

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
  pre: CodeBlock,
  Image,
  img: Image, // Handle standard markdown image syntax ![alt](url)
};

export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    ...mdxComponents,
    ...components,
  };
}
