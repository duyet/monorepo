"use client";

import { useEffect, useState } from "react";

/**
 * Generate prompt based on card type
 */
function getPromptForCardType(cardType: "blog" | "featured"): string {
  if (cardType === "blog") {
    return "Generate a witty description for the blog card that would make someone want to click.";
  }
  return "Generate an engaging description for the featured posts card that highlights the best articles.";
}

/**
 * Get API base URL from environment variables
 * Falls back to NEXT_PUBLIC_API_BASE_URL for backwards compatibility
 */
function getApiBaseUrl(): string {
  const importMetaEnv =
    typeof import.meta !== "undefined"
      ? ((import.meta as unknown as Record<string, unknown>).env as
          | Record<string, string>
          | undefined)
      : undefined;
  return (
    importMetaEnv?.VITE_DUYET_API_URL ||
    importMetaEnv?.VITE_API_BASE_URL ||
    "https://api.duyet.net"
  );
}

export interface UseCardDescriptionOptions {
  cardType: "blog" | "featured";
  fallbackDescription?: string;
}

export interface UseCardDescriptionReturn {
  description: string | undefined;
  isLoading: boolean;
  error: Error | undefined;
}

/**
 * Hook for fetching AI card descriptions
 *
 * Fetches AI-generated descriptions from the server.
 * Shows thinking animation while loading.
 *
 * @example
 * const { description, isLoading, error } = useCardDescription({
 *   cardType: "blog",
 *   fallbackDescription: "Default description...",
 * });
 */
export function useCardDescription({
  cardType,
  fallbackDescription,
}: UseCardDescriptionOptions): UseCardDescriptionReturn {
  const [description, setDescription] = useState<string | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | undefined>(undefined);

  useEffect(() => {
    const controller = new AbortController();

    // Debounce: skip rapid re-fetches for same cardType
    if (description && !error) return;

    async function fetchDescription() {
      try {
        setIsLoading(true);
        setError(undefined);

        const response = await fetch(`${getApiBaseUrl()}/api/llm/generate`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            prompt: getPromptForCardType(cardType),
          }),
          signal: controller.signal,
        });

        if (controller.signal.aborted) return;

        if (!response.ok) {
          throw new Error(`API error: ${response.status}`);
        }

        const data = await response.json();

        if (controller.signal.aborted) return;

        setDescription(data.description || fallbackDescription);
      } catch (err) {
        if (controller.signal.aborted) return;
        setError(err as Error);
        setDescription(fallbackDescription);
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      }
    }

    fetchDescription();

    return () => controller.abort();
  }, [cardType, fallbackDescription]);

  return {
    description,
    isLoading,
    error,
  };
}
