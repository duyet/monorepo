/**
 * Toolbar for the artifact panel.
 *
 * Adapted from vercel/ai-chatbot components/toolbar.tsx.
 * Simplified: renders artifact actions and a stop button during streaming.
 * No floating bubble UI — actions are rendered inline in the artifact header.
 */

import { memo } from "react";
import { artifactDefinitions, type ArtifactKind } from "./artifact";
import type { ArtifactToolbarContext } from "./create-artifact";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";
import { StopCircleIcon } from "lucide-react";

type ToolbarProps = {
  artifactActions: React.ReactNode;
  artifactKind: ArtifactKind;
  documentId: string;
  isToolbarVisible: boolean;
  onClose: () => void;
  sendMessage: ((...args: any[]) => any);
  setMessages: (messages: any[] | ((prev: any[]) => any[])) => void;
  status: "streaming" | "idle" | "submitted" | "error" | "ready";
  stop: () => void;
  setIsToolbarVisible: (visible: boolean) => void;
};

function PureToolbar({
  artifactActions,
  artifactKind,
  status,
  stop,
  setMessages,
  sendMessage,
}: ToolbarProps) {
  const artifactDefinition = artifactDefinitions.find(
    (d) => d.kind === artifactKind
  );

  if (!artifactDefinition) {
    return null;
  }

  return (
    <div className="absolute right-4 bottom-4 z-40 flex flex-col items-center gap-1">
      {/* Stop button during streaming */}
      {status === "streaming" && (
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              className="flex size-10 items-center justify-center rounded-full border bg-background text-foreground shadow-md transition-colors hover:bg-muted"
              onClick={() => {
                stop();
                setMessages((messages: any[]) => messages);
              }}
              type="button"
            >
              <StopCircleIcon size={18} />
            </button>
          </TooltipTrigger>
          <TooltipContent side="left">Stop generating</TooltipContent>
        </Tooltip>
      )}

      {/* Artifact-specific toolbar actions */}
      {status !== "streaming" &&
        artifactDefinition.toolbar.length > 0 &&
        artifactDefinition.toolbar.map((tool) => (
          <Tooltip key={tool.description}>
            <TooltipTrigger asChild>
              <button
                className="flex size-10 items-center justify-center rounded-full border bg-background text-foreground shadow-md transition-colors hover:bg-muted"
                onClick={() => {
                  const context = { sendMessage } as ArtifactToolbarContext;
                  tool.onClick(context);
                }}
                type="button"
              >
                {tool.icon}
              </button>
            </TooltipTrigger>
            <TooltipContent side="left">{tool.description}</TooltipContent>
          </Tooltip>
        ))}

      {/* Artifact version actions (undo/redo/copy/etc.) */}
      {artifactActions}
    </div>
  );
}

export const Toolbar = memo(PureToolbar, (prevProps, nextProps) => {
  if (prevProps.status !== nextProps.status) return false;
  if (prevProps.isToolbarVisible !== nextProps.isToolbarVisible) return false;
  if (prevProps.artifactKind !== nextProps.artifactKind) return false;
  return true;
});
