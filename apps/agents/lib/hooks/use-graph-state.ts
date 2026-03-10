/**
 * React State Hooks (Unit 13)
 *
 * Hooks for exposing graph state to UI components.
 *
 * Provides:
 * - useGraphState: Access current conversation state with checkpoint controls
 * - useCheckpoints: Manage checkpoints (list, restore, delete)
 */

import { useCallback, useEffect, useState } from "react";
import type { AgentState, CheckpointInfo } from "../graph/types";
import { getAuthHeaders } from "../utils";

const CHECKPOINT_API_BASE = "/checkpoint";

/**
 * useGraphState Hook
 *
 * Exposes graph state to UI components with checkpoint controls.
 * Provides access to current state and ability to restore from checkpoints.
 *
 * @param conversationId - The conversation ID to manage state for
 * @param getAuthToken - Optional auth token getter for authenticated requests
 */
export interface UseGraphStateOptions {
  /** Conversation ID to manage state for */
  conversationId?: string;

  /** Returns a Clerk session token for authenticated requests */
  getAuthToken?: () => Promise<string | null>;

  /** Poll for latest checkpoint interval in ms (default: 5000) */
  pollInterval?: number;
}

export interface UseGraphStateReturn {
  /** Current graph state */
  state: AgentState | null;

  /** Whether state is loading */
  isLoading: boolean;

  /** Error from last operation */
  error: string | null;

  /** Restore to a specific checkpoint ID */
  restoreCheckpoint: (checkpointId: string) => Promise<AgentState | null>;

  /** Restore to a specific version number */
  restoreToVersion: (version: number) => Promise<AgentState | null>;

  /** Clear current error */
  clearError: () => void;
}

export function useGraphState(
  options: UseGraphStateOptions = {}
): UseGraphStateReturn {
  const { conversationId, getAuthToken, pollInterval = 5000 } = options;

  const [state, setState] = useState<AgentState | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  /**
   * Load the latest checkpoint for a conversation
   */
  const loadLatestState = useCallback(async () => {
    if (!conversationId) return;

    setIsLoading(true);
    setError(null);

    try {
      const headers = await getAuthHeaders(getAuthToken);
      const url = `${CHECKPOINT_API_BASE}?id=${encodeURIComponent(conversationId)}&limit=1`;
      const response = await fetch(url, { headers });

      if (!response.ok) {
        throw new Error(`Failed to load state: ${response.status}`);
      }

      const data = await response.json();

      if (data.checkpoints && data.checkpoints.length > 0) {
        // Get the full checkpoint with state
        const checkpointId = data.checkpoints[0].id;
        const checkpointResponse = await fetch(
          `${CHECKPOINT_API_BASE}?checkpointId=${encodeURIComponent(checkpointId)}`,
          { headers: await getAuthHeaders(getAuthToken) }
        );

        if (checkpointResponse.ok) {
          const checkpointData = await checkpointResponse.json();
          setState(checkpointData.checkpoint.state);
        }
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error";
      setError(message);
      console.error("[useGraphState] Failed to load state:", err);
    } finally {
      setIsLoading(false);
    }
  }, [conversationId, getAuthToken]);

  /**
   * Restore to a specific checkpoint
   */
  const restoreCheckpoint = useCallback(async (
    checkpointId: string
  ): Promise<AgentState | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const headers = await getAuthHeaders(getAuthToken);
      const response = await fetch("/checkpoint/restore", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...headers,
        },
        body: JSON.stringify({ checkpointId }),
      });

      if (!response.ok) {
        throw new Error(`Failed to restore: ${response.status}`);
      }

      const data = await response.json();

      if (data.success) {
        setState(data.state);
        return data.state;
      }

      throw new Error(data.message || "Restore failed");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error";
      setError(message);
      console.error("[useGraphState] Failed to restore checkpoint:", err);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [getAuthToken]);

  /**
   * Restore to a specific version number
   */
  const restoreToVersion = useCallback(async (
    version: number
  ): Promise<AgentState | null> => {
    if (!conversationId) {
      setError("Conversation ID is required for version restore");
      return null;
    }

    setIsLoading(true);
    setError(null);

    try {
      const headers = await getAuthHeaders(getAuthToken);
      const response = await fetch("/checkpoint/restore", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...headers,
        },
        body: JSON.stringify({ conversationId, version }),
      });

      if (!response.ok) {
        throw new Error(`Failed to restore: ${response.status}`);
      }

      const data = await response.json();

      if (data.success) {
        setState(data.state);
        return data.state;
      }

      throw new Error(data.message || "Restore failed");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error";
      setError(message);
      console.error("[useGraphState] Failed to restore version:", err);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [conversationId, getAuthToken]);

  // Load latest state on mount and when conversationId changes
  useEffect(() => {
    loadLatestState();
  }, [loadLatestState]);

  return {
    state,
    isLoading,
    error,
    restoreCheckpoint,
    restoreToVersion,
    clearError,
  };
}

/**
 * useCheckpoints Hook
 *
 * Manage checkpoints for a conversation.
 * Provides list, restore, and delete operations.
 *
 * @param conversationId - The conversation ID to manage checkpoints for
 * @param getAuthToken - Optional auth token getter for authenticated requests
 */
export interface UseCheckpointsOptions {
  /** Conversation ID to manage checkpoints for */
  conversationId?: string;

  /** Returns a Clerk session token for authenticated requests */
  getAuthToken?: () => Promise<string | null>;

  /** Maximum checkpoints to fetch (default: 50) */
  limit?: number;
}

export interface UseCheckpointsReturn {
  /** List of checkpoints */
  checkpoints: CheckpointInfo[];

  /** Whether checkpoints are loading */
  isLoading: boolean;

  /** Error from last operation */
  error: string | null;

  /** Refresh the checkpoint list */
  refresh: () => Promise<void>;

  /** Restore to a specific checkpoint */
  restore: (checkpointId: string) => Promise<AgentState | null>;

  /** Delete a checkpoint */
  delete: (checkpointId: string) => Promise<boolean>;

  /** Clear current error */
  clearError: () => void;
}

export function useCheckpoints(
  options: UseCheckpointsOptions = {}
): UseCheckpointsReturn {
  const { conversationId, getAuthToken, limit = 50 } = options;

  const [checkpoints, setCheckpoints] = useState<CheckpointInfo[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Load checkpoints for the conversation
   */
  const refresh = useCallback(async () => {
    if (!conversationId) return;

    setIsLoading(true);
    setError(null);

    try {
      const headers = await getAuthHeaders(getAuthToken);
      const url = `${CHECKPOINT_API_BASE}?id=${encodeURIComponent(conversationId)}&limit=${limit}`;
      const response = await fetch(url, { headers });

      if (!response.ok) {
        throw new Error(`Failed to load checkpoints: ${response.status}`);
      }

      const data = await response.json();
      setCheckpoints(data.checkpoints || []);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error";
      setError(message);
      console.error("[useCheckpoints] Failed to load checkpoints:", err);
    } finally {
      setIsLoading(false);
    }
  }, [conversationId, getAuthToken, limit]);

  /**
   * Restore to a specific checkpoint
   */
  const restore = useCallback(async (
    checkpointId: string
  ): Promise<AgentState | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const headers = await getAuthHeaders(getAuthToken);
      const response = await fetch("/checkpoint/restore", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...headers,
        },
        body: JSON.stringify({ checkpointId }),
      });

      if (!response.ok) {
        throw new Error(`Failed to restore: ${response.status}`);
      }

      const data = await response.json();

      if (data.success) {
        return data.state;
      }

      throw new Error(data.message || "Restore failed");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error";
      setError(message);
      console.error("[useCheckpoints] Failed to restore:", err);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [getAuthToken]);

  /**
   * Delete a checkpoint
   */
  const delete_ = useCallback(async (
    checkpointId: string
  ): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      const headers = await getAuthHeaders(getAuthToken);
      const response = await fetch(
        `/checkpoint/${encodeURIComponent(checkpointId)}`,
        {
          method: "DELETE",
          headers,
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to delete: ${response.status}`);
      }

      // Refresh the list after successful delete
      await refresh();
      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error";
      setError(message);
      console.error("[useCheckpoints] Failed to delete checkpoint:", err);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [getAuthToken, refresh]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Load checkpoints on mount and when conversationId changes
  useEffect(() => {
    refresh();
  }, [refresh]);

  return {
    checkpoints,
    isLoading,
    error,
    refresh,
    restore,
    delete: delete_,
    clearError,
  };
}
