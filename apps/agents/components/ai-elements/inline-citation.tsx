"use client";

import * as HoverCard from "@radix-ui/react-hover-card";
import useEmblaCarousel from "embla-carousel-react";
import {
  BookOpenIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ExternalLinkIcon,
} from "lucide-react";
import {
  type ComponentProps,
  createContext,
  type Dispatch,
  type SetStateAction,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

// ─── InlineCitation (root) ───────────────────────────────────────────────────

export type InlineCitationProps = ComponentProps<"span">;

export const InlineCitation = ({
  className,
  ...props
}: InlineCitationProps) => (
  <span
    className={cn("inline-flex items-baseline gap-1", className)}
    {...props}
  />
);

// ─── InlineCitationText ──────────────────────────────────────────────────────

export type InlineCitationTextProps = ComponentProps<"span">;

export const InlineCitationText = ({
  className,
  ...props
}: InlineCitationTextProps) => (
  <span className={cn("text-inherit", className)} {...props} />
);

// ─── InlineCitationCard (HoverCard root) ─────────────────────────────────────

export type InlineCitationCardProps = ComponentProps<typeof HoverCard.Root>;

export const InlineCitationCard = ({
  openDelay = 300,
  closeDelay = 150,
  ...props
}: InlineCitationCardProps) => (
  <HoverCard.Root openDelay={openDelay} closeDelay={closeDelay} {...props} />
);

// ─── InlineCitationCardTrigger ───────────────────────────────────────────────

export type InlineCitationCardTriggerProps = ComponentProps<
  typeof HoverCard.Trigger
> & {
  sources: string[];
};

export const InlineCitationCardTrigger = ({
  className,
  sources,
  children,
  ...props
}: InlineCitationCardTriggerProps) => (
  <HoverCard.Trigger asChild {...props}>
    <button
      type="button"
      className={cn(
        "inline-flex cursor-pointer items-center align-baseline",
        "rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        className
      )}
    >
      {children ?? (
        <Badge
          variant="secondary"
          className="h-4 gap-0.5 rounded-full px-1.5 py-0 text-[10px] font-medium leading-none"
        >
          <BookOpenIcon className="size-2.5" />
          {sources.length}
        </Badge>
      )}
    </button>
  </HoverCard.Trigger>
);

// ─── InlineCitationCardBody (HoverCard content) ───────────────────────────────

export type InlineCitationCardBodyProps = ComponentProps<
  typeof HoverCard.Content
>;

export const InlineCitationCardBody = ({
  className,
  sideOffset = 6,
  align = "start",
  ...props
}: InlineCitationCardBodyProps) => (
  <HoverCard.Portal>
    <HoverCard.Content
      sideOffset={sideOffset}
      align={align}
      className={cn(
        "not-prose z-50 w-80 rounded-lg border bg-popover p-0 text-popover-foreground shadow-md outline-none",
        "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
        "data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
        "data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2",
        "data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
        "data-[state=closed]:animate-out data-[state=open]:animate-in",
        className
      )}
      {...props}
    />
  </HoverCard.Portal>
);

// ─── Carousel context ────────────────────────────────────────────────────────

type CarouselContextValue = {
  emblaRef: ReturnType<typeof useEmblaCarousel>[0];
  emblaApi: ReturnType<typeof useEmblaCarousel>[1];
  canScrollPrev: boolean;
  canScrollNext: boolean;
  scrollPrev: () => void;
  scrollNext: () => void;
  selectedIndex: number;
  itemCount: number;
  setItemCount: Dispatch<SetStateAction<number>>;
};

const CarouselContext = createContext<CarouselContextValue | null>(null);

function useCarousel() {
  const ctx = useContext(CarouselContext);
  if (!ctx)
    throw new Error("useCarousel must be used within InlineCitationCarousel");
  return ctx;
}

// ─── InlineCitationCarousel ───────────────────────────────────────────────────

export type InlineCitationCarouselProps = ComponentProps<"div">;

export const InlineCitationCarousel = ({
  className,
  children,
  ...props
}: InlineCitationCarouselProps) => {
  const [emblaRef, emblaApi] = useEmblaCarousel({ align: "start" });
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [itemCount, setItemCount] = useState(0);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setCanScrollPrev(emblaApi.canScrollPrev());
    setCanScrollNext(emblaApi.canScrollNext());
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    emblaApi.on("select", onSelect);
    emblaApi.on("reInit", onSelect);
    return () => {
      emblaApi.off("select", onSelect);
      emblaApi.off("reInit", onSelect);
    };
  }, [emblaApi, onSelect]);

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);

  return (
    <CarouselContext.Provider
      value={{
        emblaRef,
        emblaApi,
        canScrollPrev,
        canScrollNext,
        scrollPrev,
        scrollNext,
        selectedIndex,
        itemCount,
        setItemCount,
      }}
    >
      <div className={cn("relative flex flex-col", className)} {...props}>
        {children}
      </div>
    </CarouselContext.Provider>
  );
};

// ─── InlineCitationCarouselContent ───────────────────────────────────────────

export type InlineCitationCarouselContentProps = ComponentProps<"div">;

export const InlineCitationCarouselContent = ({
  className,
  ...props
}: InlineCitationCarouselContentProps) => {
  const { emblaRef } = useCarousel();
  return (
    <div ref={emblaRef} className="overflow-hidden">
      <div className={cn("flex", className)} {...props} />
    </div>
  );
};

// ─── InlineCitationCarouselItem ───────────────────────────────────────────────

export type InlineCitationCarouselItemProps = ComponentProps<"div">;

export const InlineCitationCarouselItem = ({
  className,
  ...props
}: InlineCitationCarouselItemProps) => {
  const { setItemCount } = useCarousel();

  useEffect(() => {
    setItemCount((n) => n + 1);
    return () => setItemCount((n) => n - 1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div
      className={cn("min-w-0 flex-[0_0_100%] px-4 pb-3", className)}
      {...props}
    />
  );
};

// ─── InlineCitationCarouselHeader ─────────────────────────────────────────────

export type InlineCitationCarouselHeaderProps = ComponentProps<"div">;

export const InlineCitationCarouselHeader = ({
  className,
  children,
  ...props
}: InlineCitationCarouselHeaderProps) => (
  <div
    className={cn(
      "flex items-center justify-between border-b px-4 py-2.5",
      className
    )}
    {...props}
  >
    {children}
  </div>
);

// ─── InlineCitationCarouselIndex ──────────────────────────────────────────────

export type InlineCitationCarouselIndexProps = ComponentProps<"span">;

export const InlineCitationCarouselIndex = ({
  className,
  ...props
}: InlineCitationCarouselIndexProps) => {
  const { selectedIndex, itemCount } = useCarousel();
  return (
    <span
      className={cn("text-muted-foreground text-xs tabular-nums", className)}
      {...props}
    >
      {selectedIndex + 1} / {itemCount}
    </span>
  );
};

// ─── InlineCitationCarouselPrev ───────────────────────────────────────────────

export type InlineCitationCarouselPrevProps = ComponentProps<"button">;

export const InlineCitationCarouselPrev = ({
  className,
  children,
  ...props
}: InlineCitationCarouselPrevProps) => {
  const { scrollPrev, canScrollPrev } = useCarousel();
  return (
    <button
      type="button"
      onClick={scrollPrev}
      disabled={!canScrollPrev}
      aria-label="Previous source"
      className={cn(
        "inline-flex h-6 w-6 items-center justify-center rounded hover:bg-muted",
        "disabled:cursor-not-allowed disabled:opacity-40",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        className
      )}
      {...props}
    >
      {children ?? <ChevronLeftIcon className="size-3.5" />}
    </button>
  );
};

// ─── InlineCitationCarouselNext ───────────────────────────────────────────────

export type InlineCitationCarouselNextProps = ComponentProps<"button">;

export const InlineCitationCarouselNext = ({
  className,
  children,
  ...props
}: InlineCitationCarouselNextProps) => {
  const { scrollNext, canScrollNext } = useCarousel();
  return (
    <button
      type="button"
      onClick={scrollNext}
      disabled={!canScrollNext}
      aria-label="Next source"
      className={cn(
        "inline-flex h-6 w-6 items-center justify-center rounded hover:bg-muted",
        "disabled:cursor-not-allowed disabled:opacity-40",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        className
      )}
      {...props}
    >
      {children ?? <ChevronRightIcon className="size-3.5" />}
    </button>
  );
};

// ─── InlineCitationSource ────────────────────────────────────────────────────

export type InlineCitationSourceProps = ComponentProps<"div"> & {
  title: string;
  url?: string;
  description?: string;
};

export const InlineCitationSource = ({
  className,
  title,
  url,
  description,
  ...props
}: InlineCitationSourceProps) => (
  <div className={cn("space-y-1 pt-2.5", className)} {...props}>
    {url ? (
      <a
        href={url}
        target="_blank"
        rel="noreferrer"
        className="group flex items-start gap-1.5 font-medium text-sm leading-snug text-primary hover:underline"
      >
        <span className="flex-1">{title}</span>
        <ExternalLinkIcon className="mt-0.5 size-3 shrink-0 opacity-60 transition-opacity group-hover:opacity-100" />
      </a>
    ) : (
      <p className="font-medium text-sm leading-snug">{title}</p>
    )}
    {url && <p className="truncate text-[11px] text-muted-foreground">{url}</p>}
    {description && (
      <p className="line-clamp-3 text-xs text-muted-foreground">
        {description}
      </p>
    )}
  </div>
);

// ─── InlineCitationQuote ─────────────────────────────────────────────────────

export type InlineCitationQuoteProps = ComponentProps<"blockquote">;

export const InlineCitationQuote = ({
  className,
  ...props
}: InlineCitationQuoteProps) => (
  <blockquote
    className={cn(
      "mt-2 border-l-2 border-primary/40 pl-2.5 text-xs italic text-muted-foreground",
      className
    )}
    {...props}
  />
);
