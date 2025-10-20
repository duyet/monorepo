/**
 * Custom hook for managing ChatKit session creation and lifecycle
 *
 * This hook encapsulates all session management logic including:
 * - Client secret retrieval from the API
 * - Session initialization state tracking
 * - Error handling and retry logic
 * - Workflow configuration validation
 *
 * @module hooks/useChatKitSession
 */

"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { extractErrorDetail, getErrorMessage } from "@/lib/errors";
import type { ErrorState } from "@/lib/errors";

/**
 * Configuration options for the session hook
 *
 * @property workflowId - ChatKit workflow ID from Agent Builder
 * @property endpoint - API endpoint for session creation
 * @property onErrorUpdate - Callback to update error state
 * @property isWorkflowConfigured - Whether the workflow is properly configured
 */
export type SessionConfig = {
  workflowId: string;
  endpoint: string;
  onErrorUpdate: (updates: Partial<ErrorState>) => void;
  isWorkflowConfigured: boolean;
};

/**
 * Return type for the useChatKitSession hook
 *
 * @property isInitializing - Whether session is currently being initialized
 * @property getClientSecret - Function to request a new client secret
 */
export type UseChatKitSessionResult = {
  isInitializing: boolean;
  getClientSecret: (currentSecret: string | null) => Promise<string>;
};

const isDev =
  typeof process !== "undefined" && process.env.NODE_ENV !== "production";

/**
 * Custom hook for managing ChatKit session creation and state
 *
 * Handles the complete session lifecycle including initialization,
 * error handling, and client secret retrieval.
 *
 * @param config - Session configuration options
 * @returns Session state and management functions
 *
 * @example
 * ```tsx
 * const { isInitializing, getClientSecret } = useChatKitSession({
 *   workflowId: 'wf_123',
 *   endpoint: '/api/create-session',
 *   onErrorUpdate: setErrorState,
 *   isWorkflowConfigured: true,
 * })
 *
 * // Use in ChatKit configuration
 * const chatkit = useChatKit({
 *   api: { getClientSecret },
 *   // ... other config
 * })
 * ```
 */
export function useChatKitSession(
  config: SessionConfig,
): UseChatKitSessionResult {
  const { workflowId, endpoint, onErrorUpdate, isWorkflowConfigured } = config;

  const [isInitializing, setIsInitializing] = useState(true);
  const isMountedRef = useRef(true);

  // Track component mount status
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  // Validate workflow configuration on mount
  useEffect(() => {
    if (!isWorkflowConfigured && isMountedRef.current) {
      onErrorUpdate({
        session: "Set NEXT_PUBLIC_CHATKIT_WORKFLOW_ID in your .env.local file.",
        retryable: false,
      });
      setIsInitializing(false);
    }
  }, [isWorkflowConfigured, onErrorUpdate]);

  /**
   * Requests a new client secret from the session API
   *
   * This function is called by ChatKit when it needs a new session.
   * It handles the HTTP request, response parsing, and error handling.
   *
   * @param currentSecret - Current secret (null if first request)
   * @returns Promise resolving to the new client secret
   * @throws Error if session creation fails
   */
  const getClientSecret = useCallback(
    async (currentSecret: string | null): Promise<string> => {
      if (isDev) {
        console.info("[useChatKitSession] getClientSecret invoked", {
          currentSecretPresent: Boolean(currentSecret),
          workflowId,
          endpoint,
        });
      }

      // Validate workflow configuration
      if (!isWorkflowConfigured) {
        const detail =
          "Set NEXT_PUBLIC_CHATKIT_WORKFLOW_ID in your .env.local file.";
        if (isMountedRef.current) {
          onErrorUpdate({ session: detail, retryable: false });
          setIsInitializing(false);
        }
        throw new Error(detail);
      }

      // Update initialization state
      if (isMountedRef.current) {
        if (!currentSecret) {
          setIsInitializing(true);
        }
        onErrorUpdate({ session: null, integration: null, retryable: false });
      }

      try {
        // Make API request
        const response = await fetch(endpoint, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            workflow: { id: workflowId },
          }),
        });

        const raw = await response.text();

        if (isDev) {
          console.info("[useChatKitSession] createSession response", {
            status: response.status,
            ok: response.ok,
            bodyPreview: raw.slice(0, 1600),
          });
        }

        // Parse response
        let data: Record<string, unknown> = {};
        if (raw) {
          try {
            data = JSON.parse(raw) as Record<string, unknown>;
          } catch (parseError) {
            console.error(
              "[useChatKitSession] Failed to parse response",
              parseError,
            );
          }
        }

        // Handle error responses
        if (!response.ok) {
          const detail = extractErrorDetail(data, response.statusText);
          console.error("[useChatKitSession] Create session failed", {
            status: response.status,
            body: data,
          });
          throw new Error(detail);
        }

        // Extract client secret
        const clientSecret = data?.client_secret as string | undefined;
        if (!clientSecret) {
          throw new Error("Missing client_secret in response");
        }

        // Clear errors on success
        if (isMountedRef.current) {
          onErrorUpdate({ session: null, integration: null });
        }

        return clientSecret;
      } catch (error) {
        console.error("[useChatKitSession] Failed to create session", error);

        const detail = getErrorMessage(
          error,
          "Unable to start ChatKit session.",
        );

        if (isMountedRef.current) {
          onErrorUpdate({ session: detail, retryable: false });
        }

        throw error instanceof Error ? error : new Error(detail);
      } finally {
        // Clear initialization state after first request
        if (isMountedRef.current && !currentSecret) {
          setIsInitializing(false);
        }
      }
    },
    [workflowId, endpoint, isWorkflowConfigured, onErrorUpdate],
  );

  return {
    isInitializing,
    getClientSecret,
  };
}
