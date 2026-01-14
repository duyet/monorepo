"use client";

import { useCallback, useEffect } from "react";

/**
 * Custom hooks for keyboard and touch navigation
 */

export interface KeyboardNavigationOptions {
  isEnabled: boolean;
  onEscape?: () => void;
  onArrowLeft?: () => void;
  onArrowRight?: () => void;
  onArrowUp?: () => void;
  onArrowDown?: () => void;
  onSpace?: () => void;
  onEnter?: () => void;
  onKeyPress?: (key: string, event: KeyboardEvent) => void;
  // Custom key mappings
  customKeys?: {
    [key: string]: () => void;
  };
}

export function useKeyboardNavigation(options: KeyboardNavigationOptions) {
  const {
    isEnabled,
    onEscape,
    onArrowLeft,
    onArrowRight,
    onArrowUp,
    onArrowDown,
    onSpace,
    onEnter,
    onKeyPress,
    customKeys,
  } = options;

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (!isEnabled) return;

      // Prevent default behavior for handled keys
      const handledKeys = [
        "Escape",
        "ArrowLeft",
        "ArrowRight",
        "ArrowUp",
        "ArrowDown",
        "Space",
        "Enter",
        ...(customKeys ? Object.keys(customKeys) : []),
      ];

      const key = event.code === "Space" ? "Space" : event.key;

      if (handledKeys.includes(key)) {
        event.preventDefault();
      }

      // Call custom handler first if provided
      onKeyPress?.(key, event);

      // Handle standard navigation keys
      switch (key) {
        case "Escape":
          onEscape?.();
          break;
        case "ArrowLeft":
          onArrowLeft?.();
          break;
        case "ArrowRight":
          onArrowRight?.();
          break;
        case "ArrowUp":
          onArrowUp?.();
          break;
        case "ArrowDown":
          onArrowDown?.();
          break;
        case "Space":
          onSpace?.();
          break;
        case "Enter":
          onEnter?.();
          break;
        default:
          // Handle custom key mappings
          if (customKeys && key in customKeys) {
            customKeys[key]();
          }
          break;
      }
    },
    [
      isEnabled,
      onEscape,
      onArrowLeft,
      onArrowRight,
      onArrowUp,
      onArrowDown,
      onSpace,
      onEnter,
      onKeyPress,
      customKeys,
    ]
  );

  useEffect(() => {
    if (!isEnabled) return;

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isEnabled, handleKeyDown]);
}

export interface TouchGestureOptions {
  isEnabled?: boolean;
  onSwipeLeft?: (direction: "left" | "right") => void;
  onSwipeRight?: (direction: "left" | "right") => void;
  onSwipeUp?: (direction: "up" | "down") => void;
  onSwipeDown?: (direction: "up" | "down") => void;
  minimumSwipeDistance?: number;
  touchThreshold?: number;
}

export function useTouchGestures(options: TouchGestureOptions) {
  const {
    isEnabled,
    onSwipeLeft,
    onSwipeRight,
    onSwipeUp,
    onSwipeDown,
    minimumSwipeDistance = 50,
    touchThreshold = 10,
  } = options;

  const handleTouchStart = useCallback(
    (event: React.TouchEvent) => {
      if (!isEnabled) return;

      const touch = event.touches[0];
      const touchData = {
        startX: touch.clientX,
        startY: touch.clientY,
        startTime: Date.now(),
      };

      // Store touch data on the target element
      (event.currentTarget as any).__touchData = touchData;
    },
    [isEnabled]
  );

  const handleTouchMove = useCallback(
    (event: React.TouchEvent) => {
      if (!isEnabled) return;

      const touch = event.touches[0];
      const touchData = (event.currentTarget as any).__touchData;

      if (!touchData) return;

      // Update current position
      touchData.currentX = touch.clientX;
      touchData.currentY = touch.clientY;
    },
    [isEnabled]
  );

  const handleTouchEnd = useCallback(
    (event: React.TouchEvent) => {
      if (!isEnabled) return;

      const touchData = (event.currentTarget as any).__touchData;
      if (!touchData) return;

      const { startX, startY, currentX, currentY } = touchData;

      if (currentX === undefined || currentY === undefined) return;

      const deltaX = currentX - startX;
      const deltaY = currentY - startY;
      const absDeltaX = Math.abs(deltaX);
      const absDeltaY = Math.abs(deltaY);

      // Check if movement is significant enough
      if (absDeltaX < touchThreshold && absDeltaY < touchThreshold) {
        return;
      }

      // Determine dominant direction
      if (absDeltaX > absDeltaY) {
        // Horizontal swipe
        if (absDeltaX > minimumSwipeDistance) {
          if (deltaX > 0) {
            onSwipeRight?.();
          } else {
            onSwipeLeft?.();
          }
        }
      } else {
        // Vertical swipe
        if (absDeltaY > minimumSwipeDistance) {
          if (deltaY > 0) {
            onSwipeDown?.();
          } else {
            onSwipeUp?.();
          }
        }
      }

      // Clean up touch data
      (event.currentTarget as any).__touchData = undefined;
    },
    [
      isEnabled,
      onSwipeLeft,
      onSwipeRight,
      onSwipeUp,
      onSwipeDown,
      minimumSwipeDistance,
      touchThreshold,
    ]
  );

  return {
    onTouchStart: handleTouchStart,
    onTouchMove: handleTouchMove,
    onTouchEnd: handleTouchEnd,
  };
}

export interface LightboxNavigationOptions {
  isOpen: boolean;
  canGoNext: boolean;
  canGoPrevious: boolean;
  onClose: () => void;
  onNext?: () => void;
  onPrevious?: () => void;
  onToggleFullscreen?: () => void;
  onToggleInfo?: () => void;
}

export function useLightboxNavigation(options: LightboxNavigationOptions) {
  const {
    isOpen,
    canGoNext,
    canGoPrevious,
    onClose,
    onNext,
    onPrevious,
    onToggleFullscreen,
    onToggleInfo,
  } = options;

  // Keyboard navigation
  useKeyboardNavigation({
    isEnabled: isOpen,
    onEscape: onClose,
    onArrowLeft: canGoPrevious ? onPrevious : undefined,
    onArrowRight: canGoNext ? onNext : undefined,
    customKeys: {
      ...(onToggleFullscreen && {
        f: onToggleFullscreen,
        F: onToggleFullscreen,
      }),
      ...(onToggleInfo && { i: onToggleInfo, I: onToggleInfo }),
    },
  });

  // Touch navigation
  const touchHandlers = useTouchGestures({
    isEnabled: isOpen,
    onSwipeLeft: canGoNext ? onNext : undefined,
    onSwipeRight: canGoPrevious ? onPrevious : undefined,
    minimumSwipeDistance: 50,
  });

  return touchHandlers;
}
