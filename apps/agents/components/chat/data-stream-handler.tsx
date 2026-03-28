/**
 * Data stream handler — processes UI data parts from the AI stream.
 *
 * Wires artifact-specific stream events (textDelta, codeDelta, sheetDelta,
 * id, title, kind, clear, finish) to the artifact SWR state.
 *
 * Adapted from vercel/ai-chatbot components/data-stream-handler.tsx.
 */

import { useEffect } from "react";
import { artifactDefinitions } from "./artifact";
import { useArtifact } from "@/hooks/use-artifact";
import { useDataStream } from "./data-stream-provider";

export function DataStreamHandler() {
  const { dataStream, setDataStream } = useDataStream();
  const { setArtifact, setMetadata } = useArtifact();

  useEffect(() => {
    if (!dataStream?.length) {
      return;
    }

    const newDeltas = dataStream.slice();
    setDataStream([]);

    for (const delta of newDeltas) {
      // Handle artifact identification events
      if (delta.type === "data-id") {
        setArtifact((current) => ({
          ...current,
          documentId: delta.data as string,
          isVisible: true,
        }));
        continue;
      }

      if (delta.type === "data-title") {
        setArtifact((current) => ({
          ...current,
          title: delta.data as string,
        }));
        continue;
      }

      if (delta.type === "data-kind") {
        setArtifact((current) => ({
          ...current,
          kind: delta.data as any,
        }));
        continue;
      }

      if (delta.type === "data-clear") {
        setArtifact((current) => ({
          ...current,
          content: "",
          status: "streaming",
        }));
        continue;
      }

      if (delta.type === "data-finish") {
        setArtifact((current) => ({
          ...current,
          status: "idle",
        }));
        continue;
      }

      if (delta.type === "data-chat-title") {
        // Future: trigger sidebar history refresh
        continue;
      }

      // Delegate content delta events to the matching artifact definition
      for (const definition of artifactDefinitions) {
        definition.onStreamPart({
          streamPart: delta as any,
          setArtifact: setArtifact as any,
          setMetadata: setMetadata as any,
        });
      }
    }
  }, [dataStream, setDataStream, setArtifact, setMetadata]);

  return null;
}
