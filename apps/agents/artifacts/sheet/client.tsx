/**
 * Sheet (spreadsheet) artifact client definition.
 *
 * Ported from vercel/ai-chatbot artifacts/sheet/client.tsx.
 * Adaptations:
 * - Uses lucide-react icons.
 * - Uses SpreadsheetEditor from @/components/chat/sheet-editor.
 */

import {
  Copy as CopyIcon,
  ChartLine as LineChartIcon,
  ArrowClockwise as RedoIcon,
  Sparkle as SparklesIcon,
  ArrowCounterClockwise as UndoIcon,
} from "@phosphor-icons/react";
import { parse, unparse } from "papaparse";
import { toast } from "sonner";
import { Artifact } from "@/components/chat/create-artifact";
import { SpreadsheetEditor } from "@/components/chat/sheet-editor";

type Metadata = any;

export const sheetArtifact = new Artifact<"sheet", Metadata>({
  kind: "sheet",
  description: "Useful for working with spreadsheets",

  initialize: () => null,

  onStreamPart: ({ setArtifact, streamPart }) => {
    if (streamPart.type === "data-sheetDelta") {
      setArtifact((draftArtifact) => ({
        ...draftArtifact,
        content: streamPart.data as string,
        isVisible: true,
        status: "streaming",
      }));
    }
  },

  content: ({ content, currentVersionIndex, onSaveContent, status }) => {
    return (
      <SpreadsheetEditor
        content={content}
        currentVersionIndex={currentVersionIndex}
        isCurrentVersion={true}
        saveContent={onSaveContent}
        status={status}
      />
    );
  },

  actions: [
    {
      icon: <UndoIcon size={18} />,
      description: "View previous version",
      onClick: ({ handleVersionChange }) => {
        handleVersionChange("prev");
      },
      isDisabled: ({ currentVersionIndex }) => {
        return currentVersionIndex === 0;
      },
    },
    {
      icon: <RedoIcon size={18} />,
      description: "View next version",
      onClick: ({ handleVersionChange }) => {
        handleVersionChange("next");
      },
      isDisabled: ({ isCurrentVersion }) => {
        return isCurrentVersion;
      },
    },
    {
      icon: <CopyIcon size={18} />,
      description: "Copy as .csv",
      onClick: ({ content }) => {
        const parsed = parse<string[]>(content, { skipEmptyLines: true });
        const nonEmptyRows = parsed.data.filter((row: string[]) =>
          row.some((cell: string) => cell.trim() !== "")
        );
        const cleanedCsv = unparse(nonEmptyRows);
        navigator.clipboard.writeText(cleanedCsv);
        toast.success("Copied CSV to clipboard!");
      },
    },
  ],

  toolbar: [
    {
      description: "Format and clean data",
      icon: <SparklesIcon size={18} />,
      onClick: ({ sendMessage }) => {
        sendMessage({
          role: "user",
          parts: [
            { type: "text", text: "Can you please format and clean the data?" },
          ],
        });
      },
    },
    {
      description: "Analyze and visualize data",
      icon: <LineChartIcon size={18} />,
      onClick: ({ sendMessage }) => {
        sendMessage({
          role: "user",
          parts: [
            {
              type: "text",
              text: "Can you please analyze and visualize the data by creating a new code artifact in Python?",
            },
          ],
        });
      },
    },
  ],
});
