import { cn } from "@duyet/libs/utils";
import type { MDXComponents } from "mdx/types";
import { AnnotatedDiff, SideBySideDiff } from "./blog/AnnotatedDiff";
import { Callout } from "./blog/Callout";
import { CardGrid } from "./blog/CardGrid";
import { ChartGrid, StatGrid } from "./blog/ChartGrid";
import {
  ClaudeCard,
  ClaudeCardGrid,
  ClaudeCardNested,
} from "./blog/ClaudeCard";
import { Collapsible } from "./blog/Collapsible";
import { ComparisonList } from "./blog/ComparisonList";
import { ColorPalette, DesignSwatches } from "./blog/DesignSwatches";
import { InfoBox } from "./blog/InfoBox";
import { LazyCodeBlock } from "./blog/LazyCodeBlock";
import { InlineNote, MarginBlock, MarginNote } from "./blog/MarginNotes";
import { Mermaid } from "./blog/Mermaid";
// Import components directly for RSC compatibility
import { PricingTable } from "./blog/PricingTable";
import { Step, Steps } from "./blog/Steps";
import { StepsList } from "./blog/StepsList";
import { Tabs } from "./blog/Tabs";
import { StatusBadge, Timeline } from "./blog/Timeline";

// Custom Image component for MDX.
//
// Images break out to the full content width by default. Width is tuned
// per-image through the markdown title — the quoted string after the URL:
// `![alt](/img.png "narrow")`.
//   (no title)         → full content width (default)
//   "narrow" / "text"  → stay in the body-text column
//   "wide"             → full-bleed but capped (~900px), centered
//   a number (px)      → full-bleed capped at that width, centered (e.g. "640")
function Image({
  src,
  alt,
  title,
  ...props
}: {
  src?: string;
  alt?: string;
  title?: string;
  [key: string]: unknown;
}) {
  // Handle Obsidian-style image references
  const imageSrc = src?.startsWith("[[")
    ? `/attachments/${src.replace(/^\[\[|\]\]$/g, "")}`
    : src;

  // Interpret the title as a width directive; default is full breakout.
  const directive = title?.trim().toLowerCase();
  const inColumn =
    directive === "narrow" || directive === "text" || directive === "inline";
  const customPx =
    directive && /^\d+$/.test(directive) ? Number(directive) : undefined;
  const capPx = directive === "wide" ? 900 : customPx;

  return (
    <span
      className={cn("block my-2", !inColumn && "full-bleed")}
      style={capPx ? { maxWidth: `${capPx}px`, marginInline: "auto" } : undefined}
    >
      <img
        src={imageSrc || ""}
        alt={alt || ""}
        className="rounded-xl max-w-full"
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
  Collapsible,
  DesignSwatches,
  ColorPalette,
  MarginNote,
  MarginBlock,
  InlineNote,
  Timeline,
  StatusBadge,
  AnnotatedDiff,
  SideBySideDiff,
  Callout,
  ChartGrid,
  StatGrid,
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
