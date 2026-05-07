import type { MDXComponents } from "mdx/types";
import { CardGrid } from "./blog/CardGrid";
import {
  ClaudeCard,
  ClaudeCardGrid,
  ClaudeCardNested,
} from "./blog/ClaudeCard";
import { ComparisonList } from "./blog/ComparisonList";
import { InfoBox } from "./blog/InfoBox";
import { LazyCodeBlock } from "./blog/LazyCodeBlock";
import { Mermaid } from "./blog/Mermaid";
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
      <img
        src={imageSrc || ""}
        alt={alt || ""}
        className="rounded-xl border border-[#1a1a1a]/10 dark:border-white/10 max-w-full"
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
  Mermaid,
  pre: LazyCodeBlock,
  Image,
  img: Image,
  table: ({ children, ...props }) => (
    <div className="my-6 overflow-x-auto">
      <table
        {...props}
        className="text-sm [&_th]:whitespace-nowrap [&_td]:whitespace-nowrap"
      >
        {children}
      </table>
    </div>
  ),
};

export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    ...mdxComponents,
    ...components,
  };
}
