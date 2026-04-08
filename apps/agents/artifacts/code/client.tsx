/**
 * Code artifact client definition.
 *
 * Ported from vercel/ai-chatbot artifacts/code/client.tsx.
 * Adaptations:
 * - Uses lucide-react icons.
 * - Code execution (Pyodide) kept as-is from the template.
 * - Uses CodeEditor from @/components/chat/code-editor.
 */

import {
  Copy as CopyIcon,
  ChatCircle as MessageSquareIcon,
  Play as PlayIcon,
  ArrowClockwise as RedoIcon,
  Terminal as TerminalIcon,
  ArrowCounterClockwise as UndoIcon,
} from "@phosphor-icons/react";
import { toast } from "sonner";
import { Artifact } from "@/components/chat/create-artifact";
import { CodeEditor } from "@/components/chat/code-editor";
import { generateUUID } from "@/lib/utils";

// ---------------------------------------------------------------------------
// Console output types for code execution
// ---------------------------------------------------------------------------

export type ConsoleOutputContent = {
  type: "text" | "image";
  value: string;
};

export type ConsoleOutput = {
  id: string;
  contents: ConsoleOutputContent[];
  status: "in_progress" | "loading_packages" | "completed" | "failed";
};

// ---------------------------------------------------------------------------
// Output handlers for Python code execution
// ---------------------------------------------------------------------------

const OUTPUT_HANDLERS = {
  matplotlib: `
    import io
    import base64
    from matplotlib import pyplot as plt

    plt.clf()
    plt.close('all')
    plt.switch_backend('agg')

    def setup_matplotlib_output():
        def custom_show():
            if plt.gcf().get_size_inches().prod() * plt.gcf().dpi ** 2 > 25_000_000:
                print("Warning: Plot size too large, reducing quality")
                plt.gcf().set_dpi(100)

            png_buf = io.BytesIO()
            plt.savefig(png_buf, format='png')
            png_buf.seek(0)
            png_base64 = base64.b64encode(png_buf.read()).decode('utf-8')
            print(f'data:image/png;base64,{png_base64}')
            png_buf.close()
            plt.clf()
            plt.close('all')

        plt.show = custom_show
  `,
  basic: `
    # Basic output capture setup
  `,
};

function detectRequiredHandlers(code: string): string[] {
  const handlers: string[] = ["basic"];
  if (code.includes("matplotlib") || code.includes("plt.")) {
    handlers.push("matplotlib");
  }
  return handlers;
}

// ---------------------------------------------------------------------------
// Artifact definition
// ---------------------------------------------------------------------------

type Metadata = {
  outputs: ConsoleOutput[];
};

export const codeArtifact = new Artifact<"code", Metadata>({
  kind: "code",
  description:
    "Useful for code generation; code execution is only available for Python code.",

  initialize: ({ setMetadata }) => {
    setMetadata({ outputs: [] });
  },

  onStreamPart: ({ streamPart, setArtifact }) => {
    if (streamPart.type === "data-codeDelta") {
      setArtifact((draftArtifact) => ({
        ...draftArtifact,
        content: streamPart.data as string,
        isVisible:
          draftArtifact.status === "streaming" &&
          draftArtifact.content.length > 300 &&
          draftArtifact.content.length < 310
            ? true
            : draftArtifact.isVisible,
        status: "streaming",
      }));
    }
  },

  content: ({ metadata, setMetadata, ...props }) => {
    return (
      <>
        <div className="px-1">
          <CodeEditor {...props} />
        </div>

        {metadata?.outputs && metadata.outputs.length > 0 && (
          <div className="border-t border-border/50">
            <div className="flex items-center justify-between px-3 py-2">
              <span className="text-xs font-medium text-muted-foreground">
                Console Output
              </span>
              <button
                className="text-xs text-muted-foreground hover:text-foreground"
                onClick={() => {
                  setMetadata({ ...metadata, outputs: [] });
                }}
                type="button"
              >
                Clear
              </button>
            </div>
            <div className="max-h-60 overflow-y-auto bg-muted/50 px-3 py-2">
              {metadata.outputs.map((output) => (
                <div key={output.id} className="mb-2 last:mb-0">
                  {output.status === "in_progress" && (
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <div className="animate-spin">●</div>
                      Executing...
                    </div>
                  )}
                  {output.status === "loading_packages" && (
                    <div className="text-xs text-muted-foreground">
                      Loading packages...
                    </div>
                  )}
                  {output.contents.map((content, idx) => (
                    <div key={idx}>
                      {content.type === "text" ? (
                        <pre className="whitespace-pre-wrap text-xs text-foreground">
                          {content.value}
                        </pre>
                      ) : (
                        <img
                          alt="Plot output"
                          className="max-w-full"
                          src={content.value}
                        />
                      )}
                    </div>
                  ))}
                  {output.status === "failed" && (
                    <span className="text-xs text-red-500">Failed</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </>
    );
  },

  actions: [
    {
      icon: <PlayIcon size={18} />,
      label: "Run",
      description: "Execute code",
      onClick: async ({ content, setMetadata }) => {
        const runId = generateUUID();
        const outputContent: ConsoleOutputContent[] = [];

        setMetadata((metadata) => ({
          ...metadata,
          outputs: [
            ...metadata.outputs,
            { id: runId, contents: [], status: "in_progress" },
          ],
        }));

        try {
          // @ts-expect-error - loadPyodide is loaded via CDN script tag
          const currentPyodideInstance = await globalThis.loadPyodide({
            indexURL: "https://cdn.jsdelivr.net/pyodide/v0.23.4/full/",
          });

          currentPyodideInstance.setStdout({
            batched: (output: string) => {
              outputContent.push({
                type: output.startsWith("data:image/png;base64")
                  ? "image"
                  : "text",
                value: output,
              });
            },
          });

          await currentPyodideInstance.loadPackagesFromImports(content, {
            messageCallback: (message: string) => {
              setMetadata((metadata) => ({
                ...metadata,
                outputs: [
                  ...metadata.outputs.filter((o) => o.id !== runId),
                  {
                    id: runId,
                    contents: [{ type: "text", value: message }],
                    status: "loading_packages",
                  },
                ],
              }));
            },
          });

          const requiredHandlers = detectRequiredHandlers(content);
          for (const handler of requiredHandlers) {
            const handlerCode =
              OUTPUT_HANDLERS[handler as keyof typeof OUTPUT_HANDLERS];
            if (handlerCode) {
              await currentPyodideInstance.runPythonAsync(handlerCode);
              if (handler === "matplotlib") {
                await currentPyodideInstance.runPythonAsync(
                  "setup_matplotlib_output()"
                );
              }
            }
          }

          await currentPyodideInstance.runPythonAsync(content);

          setMetadata((metadata) => ({
            ...metadata,
            outputs: [
              ...metadata.outputs.filter((o) => o.id !== runId),
              { id: runId, contents: outputContent, status: "completed" },
            ],
          }));
        } catch (error: any) {
          setMetadata((metadata) => ({
            ...metadata,
            outputs: [
              ...metadata.outputs.filter((o) => o.id !== runId),
              {
                id: runId,
                contents: [{ type: "text", value: error.message }],
                status: "failed",
              },
            ],
          }));
        }
      },
    },
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
      description: "Copy code to clipboard",
      onClick: ({ content }) => {
        navigator.clipboard.writeText(content);
        toast.success("Copied to clipboard!");
      },
    },
  ],

  toolbar: [
    {
      icon: <MessageSquareIcon size={18} />,
      description: "Add comments",
      onClick: ({ sendMessage }) => {
        sendMessage({
          role: "user",
          parts: [
            {
              type: "text",
              text: "Add comments to the code snippet for understanding",
            },
          ],
        });
      },
    },
    {
      icon: <TerminalIcon size={18} />,
      description: "Add logs",
      onClick: ({ sendMessage }) => {
        sendMessage({
          role: "user",
          parts: [
            {
              type: "text",
              text: "Add logs to the code snippet for debugging",
            },
          ],
        });
      },
    },
  ],
});
