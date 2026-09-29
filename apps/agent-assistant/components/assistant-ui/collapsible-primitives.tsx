"use client";

import { useScrollLock } from "@assistant-ui/react";
import { useCallback, useRef, useState } from "react";

export const COLLAPSE_ANIMATION_DURATION = 200;

/** CSS custom property consumed by the shared collapse animation classes. */
export const collapseAnimationStyle = {
  "--animation-duration": `${COLLAPSE_ANIMATION_DURATION}ms`,
} as React.CSSProperties;

/**
 * Shared controlled/uncontrolled open state for the assistant-ui collapsibles
 * (reasoning, tool group, tool fallback). Locks scroll when a section closes
 * so the collapse animation stays anchored to the viewport.
 */
export function useCollapseState({
  defaultOpen = false,
  onOpenChange: controlledOnOpenChange,
  open: controlledOpen,
}: {
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  open?: boolean;
}) {
  const collapsibleRef = useRef<HTMLDivElement>(null);
  const [uncontrolledOpen, setUncontrolledOpen] = useState(defaultOpen);
  const lockScroll = useScrollLock(collapsibleRef, COLLAPSE_ANIMATION_DURATION);

  const isControlled = controlledOpen !== undefined;
  const isOpen = isControlled ? controlledOpen : uncontrolledOpen;

  const handleOpenChange = useCallback(
    (open: boolean) => {
      if (!open) {
        lockScroll();
      }
      if (!isControlled) {
        setUncontrolledOpen(open);
      }
      controlledOnOpenChange?.(open);
    },
    [lockScroll, isControlled, controlledOnOpenChange]
  );

  return { collapsibleRef, handleOpenChange, isOpen };
}

/**
 * Collapse animation classes shared by the assistant-ui collapsible contents
 * (reasoning, tool group, tool fallback). Each caller keeps its own leading
 * `aui-*-content ...` token so the emitted class string is unchanged.
 */
export const collapsibleContentClassName = [
  "group/collapsible-content ease-out",
  "data-[state=closed]:animate-collapsible-up",
  "data-[state=open]:animate-collapsible-down",
  "data-[state=closed]:fill-mode-forwards",
  "data-[state=closed]:pointer-events-none",
  "data-[state=open]:duration-(--animation-duration)",
  "data-[state=closed]:duration-(--animation-duration)",
];

/** Shared chevron classes for the collapsible triggers. */
export const collapsibleChevronClassName = [
  "transition-transform duration-(--animation-duration) ease-out",
  "group-data-[state=closed]/trigger:-rotate-90",
  "group-data-[state=open]/trigger:rotate-0",
];
