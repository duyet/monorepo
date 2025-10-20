/**
 * Custom hook for managing ChatKit script loading and availability detection
 *
 * This hook handles the lifecycle of the ChatKit web component script including:
 * - Script loading detection with timeout
 * - Custom event handling for load/error events
 * - Web component availability checking
 * - Error state management
 *
 * @module hooks/useChatKitScript
 */

"use client";

import { useEffect, useState, useRef } from "react";
import type { ErrorState } from "@/lib/errors";

/**
 * Script loading status values
 */
export type ScriptStatus = "pending" | "ready" | "error";

/**
 * Configuration options for the script loading hook
 *
 * @property onErrorUpdate - Callback to update error state
 * @property loadTimeout - Milliseconds to wait before timing out (default: 5000)
 */
export type ScriptConfig = {
  onErrorUpdate: (updates: Partial<ErrorState>) => void;
  loadTimeout?: number;
};

/**
 * Return type for the useChatKitScript hook
 *
 * @property status - Current script loading status
 * @property isReady - Whether the script is loaded and ready
 */
export type UseChatKitScriptResult = {
  status: ScriptStatus;
  isReady: boolean;
};

const isBrowser = typeof window !== "undefined";
const CHATKIT_ELEMENT_TAG = "openai-chatkit";
const DEFAULT_TIMEOUT = 5000;

/**
 * Checks if the ChatKit web component is available
 *
 * @returns True if the custom element is registered
 */
function isChatKitAvailable(): boolean {
  return (
    isBrowser &&
    typeof window.customElements !== "undefined" &&
    Boolean(window.customElements.get(CHATKIT_ELEMENT_TAG))
  );
}

/**
 * Custom hook for managing ChatKit web component script loading
 *
 * Monitors the ChatKit script loading process and provides status updates.
 * Handles both successful loads and error cases with timeout protection.
 *
 * @param config - Script loading configuration
 * @returns Script status and ready state
 *
 * @example
 * ```tsx
 * const { status, isReady } = useChatKitScript({
 *   onErrorUpdate: setErrorState,
 *   loadTimeout: 5000,
 * })
 *
 * if (!isReady) {
 *   return <LoadingSpinner />
 * }
 *
 * return <ChatKit control={control} />
 * ```
 */
export function useChatKitScript(config: ScriptConfig): UseChatKitScriptResult {
  const { onErrorUpdate, loadTimeout = DEFAULT_TIMEOUT } = config;

  const [status, setStatus] = useState<ScriptStatus>(() =>
    isChatKitAvailable() ? "ready" : "pending",
  );

  const isMountedRef = useRef(true);

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    if (!isBrowser) {
      return;
    }

    let timeoutId: number | undefined;

    /**
     * Handler for successful script load
     */
    const handleLoaded = () => {
      if (!isMountedRef.current) {
        return;
      }
      setStatus("ready");
      onErrorUpdate({ script: null });
    };

    /**
     * Handler for script loading errors
     *
     * @param event - Error event with optional detail
     */
    const handleError = (event: Event) => {
      console.error("[useChatKitScript] Failed to load chatkit.js", event);

      if (!isMountedRef.current) {
        return;
      }

      setStatus("error");

      const detail =
        (event as CustomEvent<unknown>)?.detail ?? "Unknown script error";

      onErrorUpdate({
        script: `Script loading failed: ${detail}`,
        retryable: false,
      });
    };

    // Register event listeners
    window.addEventListener("chatkit-script-loaded", handleLoaded);
    window.addEventListener(
      "chatkit-script-error",
      handleError as EventListener,
    );

    // Check if already loaded
    if (isChatKitAvailable()) {
      handleLoaded();
    } else if (status === "pending") {
      // Set timeout for script loading
      timeoutId = window.setTimeout(() => {
        if (!isChatKitAvailable()) {
          handleError(
            new CustomEvent("chatkit-script-error", {
              detail:
                "ChatKit web component is unavailable. Verify that the script URL is reachable.",
            }),
          );
        }
      }, loadTimeout);
    }

    // Cleanup
    return () => {
      window.removeEventListener("chatkit-script-loaded", handleLoaded);
      window.removeEventListener(
        "chatkit-script-error",
        handleError as EventListener,
      );
      if (timeoutId) {
        window.clearTimeout(timeoutId);
      }
    };
  }, [status, onErrorUpdate, loadTimeout]);

  return {
    status,
    isReady: status === "ready",
  };
}
