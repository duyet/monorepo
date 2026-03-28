import { useEffect } from "react";
import { useDataStream } from "./data-stream-provider";

export function DataStreamHandler() {
  const { dataStream, setDataStream } = useDataStream();

  useEffect(() => {
    if (!dataStream?.length) {
      return;
    }

    const newDeltas = dataStream.slice();
    setDataStream([]);

    for (const delta of newDeltas) {
      // Handle chat title updates
      if (delta.type === "data-chat-title") {
        // Future: trigger sidebar history refresh
        continue;
      }

      // Handle artifact data events (future expansion)
      switch (delta.type) {
        case "data-id":
        case "data-title":
        case "data-kind":
        case "data-clear":
        case "data-finish":
          // Artifact stream events - will be wired when artifact
          // support is added
          break;
        default:
          break;
      }
    }
  }, [dataStream, setDataStream]);

  return null;
}
