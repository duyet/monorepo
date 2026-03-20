
import { Card, CardContent } from "@/components/ui/card";
import { ChevronDown } from "lucide-react";
import type { ComponentProps, ReactNode } from "react";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { cn } from "@/lib/utils";

// ─── Scroll context ────────────────────────────────────────────────────────

interface ConversationScrollContext {
  scrollToBottom: (behavior?: ScrollBehavior) => void;
  isAtBottom: boolean;
}

const ScrollContext = createContext<ConversationScrollContext>({
  scrollToBottom: () => undefined,
  isAtBottom: true,
});

// ─── Conversation (root) ───────────────────────────────────────────────────

export interface ConversationProps extends ComponentProps<"div"> {
  /** When this value changes, auto-scroll to bottom (e.g. messages.length) */
  autoScrollTrigger?: unknown;
}

/**
 * Root container with built-in auto-scroll management.
 *
 * Uses an IntersectionObserver on a sentinel element at the bottom of the
 * scroll container to determine whether the user has scrolled up. Auto-scrolls
 * whenever `autoScrollTrigger` changes and the user is already at the bottom,
 * or on first mount.
 */
export function Conversation({
  className,
  children,
  autoScrollTrigger,
  ...props
}: ConversationProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const [isAtBottom, setIsAtBottom] = useState(true);
  // Track whether we should auto-scroll on next trigger change
  const shouldAutoScroll = useRef(true);

  const scrollToBottom = useCallback((behavior: ScrollBehavior = "smooth") => {
    const container = containerRef.current;
    if (!container) return;
    container.scrollTo({ top: container.scrollHeight, behavior });
  }, []);

  // Watch the sentinel to know if user is at the bottom
  useEffect(() => {
    const sentinel = sentinelRef.current;
    const container = containerRef.current;
    if (!sentinel || !container) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        const visible = entry.isIntersecting;
        setIsAtBottom(visible);
        shouldAutoScroll.current = visible;
      },
      { root: container, threshold: 0 }
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, []);

  // Auto-scroll when trigger changes (new messages, streaming content)
  useEffect(() => {
    if (shouldAutoScroll.current) {
      scrollToBottom("smooth");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoScrollTrigger, scrollToBottom]);

  return (
    <ScrollContext.Provider value={{ scrollToBottom, isAtBottom }}>
      <div
        ref={containerRef}
        className={cn("relative flex flex-col overflow-y-auto", className)}
        {...props}
      >
        {children}
        {/* Sentinel element at the very bottom — observed to detect scroll position */}
        <div ref={sentinelRef} aria-hidden="true" className="h-px shrink-0" />
      </div>
    </ScrollContext.Provider>
  );
}

// ─── ConversationContent ───────────────────────────────────────────────────

export interface ConversationContentProps extends ComponentProps<"div"> {}

/**
 * Inner container for message list with consistent spacing.
 */
export function ConversationContent({
  className,
  ...props
}: ConversationContentProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-4 px-3 py-6 sm:px-4 lg:px-6 xl:px-8",
        className
      )}
      {...props}
    />
  );
}

// ─── ConversationEmptyState ────────────────────────────────────────────────

export interface ConversationEmptyStateProps extends ComponentProps<"div"> {
  title?: string;
  description?: string;
  icon?: ReactNode;
}

/**
 * Shown when there are no messages. Thin wrapper that accepts an optional
 * title/description/icon, plus arbitrary children (e.g. WelcomeMessage).
 *
 * When title/description/icon are provided, a simple centered layout is
 * rendered using shadcn Card. Pass children to fully customise the empty state.
 */
export function ConversationEmptyState({
  className,
  title,
  description,
  icon,
  children,
  ...props
}: ConversationEmptyStateProps) {
  if (children) {
    return (
      <div className={cn("flex flex-1 flex-col", className)} {...props}>
        {children}
      </div>
    );
  }

  return (
    <div
      className={cn(
        "flex flex-1 flex-col items-center justify-center p-6",
        className
      )}
      {...props}
    >
      <Card className="max-w-sm">
        <CardContent className="flex flex-col items-center justify-center py-12 text-center">
          {icon && (
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted text-muted-foreground mb-4">
              {icon}
            </div>
          )}
          {title && (
            <h2 className="text-lg font-semibold mb-2">{title}</h2>
          )}
          {description && (
            <p className="text-sm text-muted-foreground">{description}</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// ─── ConversationScrollButton ──────────────────────────────────────────────

export interface ConversationScrollButtonProps
  extends ComponentProps<"button"> {}

/**
 * A floating button that appears when the user scrolls up in the conversation.
 * Clicking it scrolls smoothly back to the bottom.
 *
 * Must be rendered inside a `<Conversation>` to access the scroll context.
 */
export function ConversationScrollButton({
  className,
  onClick,
  ...props
}: ConversationScrollButtonProps) {
  const { isAtBottom, scrollToBottom } = useContext(ScrollContext);

  if (isAtBottom) return null;

  return (
    <button
      type="button"
      aria-label="Scroll to bottom"
      className={cn(
        "absolute bottom-4 left-1/2 -translate-x-1/2 z-10",
        "flex items-center gap-1.5 rounded-full border border-border",
        "px-3 py-1.5 text-xs font-medium text-foreground shadow-md",
        "transition-all duration-200 hover:bg-muted",
        "animate-in fade-in slide-in-from-bottom-2",
        className
      )}
      onClick={(e) => {
        scrollToBottom("smooth");
        onClick?.(e);
      }}
      {...props}
    >
      <ChevronDown className="h-3.5 w-3.5" />
      Scroll to bottom
    </button>
  );
}
