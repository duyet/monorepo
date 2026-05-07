import type { MDXComponents } from "mdx/types";
import { cn } from "@duyet/libs/utils";
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
    <div className="my-8 overflow-x-auto sm:-mx-4 sm:-mx-8 lg:-mx-16 xl:-mx-24">
      <table
        {...props}
        className={cn(
          "text-sm leading-7 w-full table-auto text-left",
          "[&_thead_tr]:border-b [&_thead_tr]:border-[#1a1a1a]/15 dark:[&_thead_tr]:border-white/15",
          "[&_th]:py-3 [&_th]:pr-4 [&_th]:font-semibold [&_th]:text-[#1a1a1a] dark:[&_th]:text-[#f8f8f2] [&_th]:align-bottom",
          "[&_td]:py-3 [&_td]:pr-4 [&_td]:text-[#1a1a1a] dark:[&_td]:text-[#f8f8f2] [&_td]:align-baseline",
          "[&_th:last-child]:pr-0 [&_td:last-child]:pr-0"
        )}
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
