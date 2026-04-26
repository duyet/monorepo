import { useCallback, useState } from "react";

export type VisibilityType = "private" | "public";

export function useChatVisibility({
  chatId,
  initialVisibilityType,
}: {
  chatId: string;
  initialVisibilityType: VisibilityType;
}) {
  const [visibilityType, setLocalVisibility] = useState<VisibilityType>(
    initialVisibilityType
  );

  const setVisibilityType = useCallback(
    (updatedVisibilityType: VisibilityType) => {
      setLocalVisibility(updatedVisibilityType);

      // Persist to API (fire and forget)
      fetch(`/api/conversations/${chatId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ visibility: updatedVisibilityType }),
      }).catch(() => {
        // Revert on failure
        setLocalVisibility(visibilityType);
      });
    },
    [chatId, visibilityType]
  );

  return { visibilityType, setVisibilityType };
}
