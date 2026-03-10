/**
 * Hook for exporting conversations in various formats
 */

import { useCallback, useState } from "react";

type ExportFormat = "json" | "md" | "txt";

export interface ExportConversationOptions {
  conversationId: string;
  format: ExportFormat;
}

export function useExportConversation() {
  const [isExporting, setIsExporting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const exportConversation = useCallback(
    async ({ conversationId, format }: ExportConversationOptions) => {
      setIsExporting(true);
      setError(null);

      try {
        // Build URL with query parameters
        const url = new URL("/api/export", window.location.origin);
        url.searchParams.set("conversationId", conversationId);
        url.searchParams.set("format", format);

        // Fetch the export data
        const response = await fetch(url.toString());

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({
            error: "Unknown error",
          }));
          throw new Error(errorData.error || "Failed to export conversation");
        }

        // Get filename from Content-Disposition header
        const contentDisposition = response.headers.get("Content-Disposition");
        let filename = `conversation.${format}`;

        if (contentDisposition) {
          const filenameMatch = /filename="([^"]+)"/.exec(contentDisposition);
          if (filenameMatch?.[1]) {
            filename = filenameMatch[1];
          }
        }

        // Get content as blob and create download link
        const blob = await response.blob();
        const blobUrl = URL.createObjectURL(blob);

        // Create temporary anchor element to trigger download
        const a = document.createElement("a");
        a.href = blobUrl;
        a.download = filename;
        document.body.appendChild(a);
        a.click();

        // Cleanup
        document.body.removeChild(a);
        URL.revokeObjectURL(blobUrl);
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Failed to export conversation";
        setError(message);
        throw err;
      } finally {
        setIsExporting(false);
      }
    },
    []
  );

  return {
    exportConversation,
    isExporting,
    error,
  };
}
