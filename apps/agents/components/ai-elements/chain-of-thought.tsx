
import { useControllableState } from "@radix-ui/react-use-controllable-state";
import { cjk } from "@streamdown/cjk";
import { code } from "@streamdown/code";
import { math } from "@streamdown/math";
import { mermaid } from "@streamdown/mermaid";
import type { LucideIcon } from "lucide-react";
import {
  BrainCircuitIcon,
  CheckCircle2Icon,
  ChevronDownIcon,
  CircleDotIcon,
  CircleIcon,
} from "lucide-react";
import type { ComponentProps, ReactNode } from "react";
import {
  createContext,
  memo,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Badge } from "@/components/ui/badge";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";
import { MessageResponse } from "./message";

import { Shimmer } from "./shimmer";

// ─── Context ─────────────────────────────────────────────────────────────────

interface ChainOfThoughtContextValue {
  isStreaming: boolean;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  duration: number | undefined;
}

const ChainOfThoughtContext = createContext<ChainOfThoughtContextValue | null>(
  null
);

export const useChainOfThought = () => {
  const context = useContext(ChainOfThoughtContext);
  if (!context) {
    throw new Error(
      "ChainOfThought components must be used within ChainOfThought"
    );
  }
  return context;
};

// ─── Constants ───────────────────────────────────────────────────────────────

const AUTO_CLOSE_DELAY = 1000;
const MS_IN_S = 1000;

const _streamdownPlugins = { cjk, code, math, mermaid };

// ─── ChainOfThought (root) ────────────────────────────────────────────────────

export type ChainOfThoughtProps = ComponentProps<typeof Collapsible> & {
  isStreaming?: boolean;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  duration?: number;
};

export const ChainOfThought = memo(
  ({
    className,
    isStreaming = false,
    open,
    defaultOpen,
    onOpenChange,
    duration: durationProp,
    children,
    ...props
  }: ChainOfThoughtProps) => {
    const resolvedDefaultOpen = defaultOpen ?? isStreaming;
    // Track if defaultOpen was explicitly set to false (to prevent auto-open)
    const isExplicitlyClosed = defaultOpen === false;

    const [isOpen, setIsOpen] = useControllableState<boolean>({
      defaultProp: resolvedDefaultOpen,
      onChange: onOpenChange,
      prop: open,
    });
    const [duration, setDuration] = useControllableState<number | undefined>({
      defaultProp: undefined,
      prop: durationProp,
    });

    const hasEverStreamedRef = useRef(isStreaming);
    const [hasAutoClosed, setHasAutoClosed] = useState(false);
    const startTimeRef = useRef<number | null>(null);

    // Track when streaming starts and compute duration
    useEffect(() => {
      if (isStreaming) {
        hasEverStreamedRef.current = true;
        if (startTimeRef.current === null) {
          startTimeRef.current = Date.now();
        }
      } else if (startTimeRef.current !== null) {
        setDuration(Math.ceil((Date.now() - startTimeRef.current) / MS_IN_S));
        startTimeRef.current = null;
      }
    }, [isStreaming, setDuration]);

    // Auto-open when streaming starts (unless explicitly closed)
    useEffect(() => {
      if (isStreaming && !isOpen && !isExplicitlyClosed) {
        setIsOpen(true);
      }
    }, [isStreaming, isOpen, setIsOpen, isExplicitlyClosed]);

    // Auto-close when streaming ends (once only, and only if it ever streamed)
    useEffect(() => {
      if (
        hasEverStreamedRef.current &&
        !isStreaming &&
        isOpen &&
        !hasAutoClosed
      ) {
        const timer = setTimeout(() => {
          setIsOpen(false);
          setHasAutoClosed(true);
        }, AUTO_CLOSE_DELAY);

        return () => clearTimeout(timer);
      }
    }, [isStreaming, isOpen, setIsOpen, hasAutoClosed]);

    const handleOpenChange = useCallback(
      (newOpen: boolean) => {
        setIsOpen(newOpen);
      },
      [setIsOpen]
    );

    const contextValue = useMemo(
      () => ({ duration, isOpen: isOpen ?? false, isStreaming, setIsOpen }),
      [duration, isOpen, isStreaming, setIsOpen]
    );

    return (
      <ChainOfThoughtContext.Provider value={contextValue}>
        <Collapsible
          className={cn(
            "not-prose mb-4 rounded-2xl border border-border/60 bg-muted/40 p-4",
            className
          )}
          onOpenChange={handleOpenChange}
          open={isOpen}
          {...props}
        >
          {children}
        </Collapsible>
      </ChainOfThoughtContext.Provider>
    );
  }
);

// ─── ChainOfThoughtHeader ─────────────────────────────────────────────────────

export type ChainOfThoughtHeaderProps = ComponentProps<
  typeof CollapsibleTrigger
> & {
  getThinkingMessage?: (isStreaming: boolean, duration?: number) => ReactNode;
};

const defaultGetThinkingMessage = (
  isStreaming: boolean,
  duration?: number
): ReactNode => {
  if (isStreaming || duration === 0) {
    return <Shimmer duration={1}>Thinking...</Shimmer>;
  }
  if (duration === undefined) {
    return <p>Thought for a few seconds</p>;
  }
  return <p>Thought for {duration} seconds</p>;
};

export const ChainOfThoughtHeader = memo(
  ({
    className,
    children,
    getThinkingMessage = defaultGetThinkingMessage,
    ...props
  }: ChainOfThoughtHeaderProps) => {
    const { isStreaming, isOpen, duration } = useChainOfThought();

    return (
      <CollapsibleTrigger
        className={cn(
          "flex w-full items-center gap-2 text-muted-foreground text-sm transition-colors hover:text-foreground",
          className
        )}
        {...props}
      >
        {children ?? (
          <>
            <BrainCircuitIcon className="size-4" />
            {getThinkingMessage(isStreaming, duration)}
            <ChevronDownIcon
              className={cn(
                "size-4 transition-transform",
                isOpen ? "rotate-180" : "rotate-0"
              )}
            />
          </>
        )}
      </CollapsibleTrigger>
    );
  }
);

// ─── ChainOfThoughtStep ───────────────────────────────────────────────────────

export type ChainOfThoughtStepStatus = "complete" | "active" | "pending";

export type ChainOfThoughtStepProps = ComponentProps<"div"> & {
  icon?: LucideIcon;
  label: string;
  description?: string;
  status?: ChainOfThoughtStepStatus;
};

const StatusIcon = ({ status }: { status: ChainOfThoughtStepStatus }) => {
  if (status === "complete") {
    return (
      <CheckCircle2Icon className="size-4 shrink-0 text-green-500 dark:text-green-400" />
    );
  }
  if (status === "active") {
    return (
      <CircleDotIcon className="size-4 shrink-0 animate-pulse text-blue-500 dark:text-blue-400" />
    );
  }
  return <CircleIcon className="size-4 shrink-0 text-muted-foreground/40" />;
};

export const ChainOfThoughtStep = memo(
  ({
    className,
    icon: Icon,
    label,
    description,
    status = "pending",
    ...props
  }: ChainOfThoughtStepProps) => (
    <div className={cn("flex items-start gap-3 py-1.5", className)} {...props}>
      <div className="mt-0.5 flex items-center gap-1.5">
        <StatusIcon status={status} />
        {Icon && (
          <Icon
            className={cn(
              "size-4 shrink-0",
              status === "pending"
                ? "text-muted-foreground/40"
                : "text-muted-foreground"
            )}
          />
        )}
      </div>
      <div className="min-w-0 flex-1">
        <p
          className={cn(
            "text-sm font-medium leading-tight",
            status === "pending"
              ? "text-muted-foreground/60"
              : status === "active"
                ? "text-foreground"
                : "text-muted-foreground"
          )}
        >
          {label}
        </p>
        {description && (
          <p className="mt-0.5 text-xs text-muted-foreground/60">
            {description}
          </p>
        )}
      </div>
    </div>
  )
);

// ─── ChainOfThoughtSearchResults ──────────────────────────────────────────────

export type ChainOfThoughtSearchResultsProps = ComponentProps<"div">;

export const ChainOfThoughtSearchResults = memo(
  ({ className, children, ...props }: ChainOfThoughtSearchResultsProps) => (
    <div className={cn("mt-2 flex flex-wrap gap-1.5", className)} {...props}>
      {children}
    </div>
  )
);

// ─── ChainOfThoughtSearchResult ───────────────────────────────────────────────

export type ChainOfThoughtSearchResultProps = ComponentProps<"a"> & {
  title: string;
  href?: string;
};

export const ChainOfThoughtSearchResult = memo(
  ({
    className,
    title,
    href,
    children,
    ...props
  }: ChainOfThoughtSearchResultProps) => {
    const badge = (
      <Badge
        className={cn(
          "max-w-[200px] cursor-pointer truncate font-normal",
          className
        )}
        variant="secondary"
      >
        {children ?? title}
      </Badge>
    );

    if (href) {
      return (
        <a
          href={href}
          rel="noreferrer"
          target="_blank"
          title={title}
          {...props}
        >
          {badge}
        </a>
      );
    }

    return (
      <span title={title} {...(props as ComponentProps<"span">)}>
        {badge}
      </span>
    );
  }
);

// ─── ChainOfThoughtContent ────────────────────────────────────────────────────

export type ChainOfThoughtContentProps = ComponentProps<
  typeof CollapsibleContent
> & {
  children: string;
};

export const ChainOfThoughtContent = memo(
  ({ className, children, ...props }: ChainOfThoughtContentProps) => (
    <CollapsibleContent
      className={cn(
        "mt-3 pt-3 border-t border-border/40 text-sm text-muted-foreground",
        "max-h-[500px] overflow-y-auto pr-2",
        "data-[state=closed]:fade-out-0 data-[state=closed]:slide-out-to-top-2 data-[state=open]:slide-in-from-top-2 outline-none data-[state=closed]:animate-out data-[state=open]:animate-in",
        className
      )}
      {...props}
    >
      <MessageResponse
        className="text-sm opacity-90 [&_h1]:text-lg [&_h2]:text-base [&_h3]:text-sm"
        parseIncompleteMarkdown
      >
        {children}
      </MessageResponse>
    </CollapsibleContent>
  )
);

// ─── ChainOfThoughtImage ──────────────────────────────────────────────────────

export type ChainOfThoughtImageProps = ComponentProps<"figure"> & {
  src: string;
  alt?: string;
  caption?: string;
  width?: number;
  height?: number;
};

export const ChainOfThoughtImage = memo(
  ({
    className,
    src,
    alt = "",
    caption,
    width,
    height,
    ...props
  }: ChainOfThoughtImageProps) => (
    <figure className={cn("mt-3", className)} {...props}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        alt={alt}
        className="rounded-md"
        height={height}
        src={src}
        width={width}
      />
      {caption && (
        <figcaption className="mt-1.5 text-center text-xs text-muted-foreground">
          {caption}
        </figcaption>
      )}
    </figure>
  )
);

// ─── Display Names ────────────────────────────────────────────────────────────

ChainOfThought.displayName = "ChainOfThought";
ChainOfThoughtHeader.displayName = "ChainOfThoughtHeader";
ChainOfThoughtStep.displayName = "ChainOfThoughtStep";
ChainOfThoughtSearchResults.displayName = "ChainOfThoughtSearchResults";
ChainOfThoughtSearchResult.displayName = "ChainOfThoughtSearchResult";
ChainOfThoughtContent.displayName = "ChainOfThoughtContent";
ChainOfThoughtImage.displayName = "ChainOfThoughtImage";
