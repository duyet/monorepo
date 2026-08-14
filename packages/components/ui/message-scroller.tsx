"use client";

import { cn } from "@duyet/libs/utils";
import { ArrowDownIcon } from "lucide-react";
import {
  createContext,
  useCallback,
  useContext,
  useRef,
  type ComponentProps,
  type RefObject,
} from "react";
import { Button } from "./button";

interface MessageScrollerContextValue {
  viewportRef: RefObject<HTMLDivElement | null>;
  scrollToEnd: () => void;
}

const MessageScrollerContext = createContext<MessageScrollerContextValue | null>(
  null,
);

function MessageScrollerProvider({
  children,
  ...props
}: ComponentProps<"div">) {
  const viewportRef = useRef<HTMLDivElement | null>(null);
  const scrollToEnd = useCallback(() => {
    const viewport = viewportRef.current;
    if (!viewport) return;
    viewport.scrollTo({ top: viewport.scrollHeight, behavior: "smooth" });
  }, []);

  return (
    <MessageScrollerContext.Provider value={{ viewportRef, scrollToEnd }}>
      <div data-slot="message-scroller-provider" className="contents" {...props}>
        {children}
      </div>
    </MessageScrollerContext.Provider>
  );
}

function MessageScroller({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      data-slot="message-scroller"
      className={cn(
        "group/message-scroller relative flex size-full min-h-0 flex-col overflow-hidden",
        className,
      )}
      {...props}
    />
  );
}

function MessageScrollerViewport({
  className,
  ref,
  ...props
}: ComponentProps<"div">) {
  const ctx = useContext(MessageScrollerContext);

  return (
    <div
      ref={(node) => {
        if (ctx) ctx.viewportRef.current = node;
        if (typeof ref === "function") ref(node);
        else if (ref) ref.current = node;
      }}
      data-slot="message-scroller-viewport"
      className={cn(
        "size-full min-h-0 min-w-0 overflow-y-auto overscroll-contain",
        className,
      )}
      {...props}
    />
  );
}

function MessageScrollerContent({
  className,
  ...props
}: ComponentProps<"div">) {
  return (
    <div
      data-slot="message-scroller-content"
      className={cn("flex h-max min-h-full flex-col gap-8", className)}
      {...props}
    />
  );
}

function MessageScrollerItem({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      data-slot="message-scroller-item"
      className={cn("min-w-0 shrink-0", className)}
      {...props}
    />
  );
}

function MessageScrollerButton({
  className,
  children,
  onClick,
  ...props
}: ComponentProps<typeof Button>) {
  const ctx = useContext(MessageScrollerContext);

  return (
    <Button
      data-slot="message-scroller-button"
      type="button"
      variant="secondary"
      size="icon"
      className={cn("absolute bottom-4 left-1/2 -translate-x-1/2", className)}
      {...props}
      onClick={(event) => {
        ctx?.scrollToEnd();
        onClick?.(event);
      }}
    >
      {children ?? (
        <>
          <ArrowDownIcon />
          <span className="sr-only">Scroll to end</span>
        </>
      )}
    </Button>
  );
}

export {
  MessageScrollerProvider,
  MessageScroller,
  MessageScrollerViewport,
  MessageScrollerContent,
  MessageScrollerItem,
  MessageScrollerButton,
};
