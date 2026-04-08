import { RefreshCw, Send, Square } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";

interface ChatInputProps {
  input: string;
  setInput: (value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  onKeyDown: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void;
  isLoading: boolean;
  canSubmit: boolean;
  hasAssistantResponse: boolean;
  stop: () => void;
  reload: () => void;
  error: Error | null;
  textareaRef: React.Ref<HTMLTextAreaElement>;
}

export function ChatInput({
  input,
  setInput,
  onSubmit,
  onKeyDown,
  isLoading,
  canSubmit,
  hasAssistantResponse,
  stop,
  reload,
  error,
  textareaRef,
}: ChatInputProps) {
  return (
    <div className="border-t bg-background/95 px-3 py-3 backdrop-blur supports-[backdrop-filter]:bg-background/80 sm:px-4">
      <div className="mx-auto max-w-4xl">
        <Card className="border-border/70 bg-background shadow-sm">
          <CardContent className="p-3 sm:p-4">
            <form onSubmit={onSubmit} className="flex items-end gap-3">
              <Textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={onKeyDown}
                placeholder="Ask a question or start a task..."
                disabled={isLoading}
                rows={1}
                className="min-h-12 max-h-[220px] flex-1 resize-none border-0 bg-transparent px-1 py-3 text-[15px] shadow-none placeholder:text-muted-foreground/70 focus-visible:ring-0 focus-visible:ring-offset-0"
              />

              <div className="flex items-center gap-2">
                {isLoading ? (
                  <Button
                    type="button"
                    onClick={stop}
                    size="icon"
                    variant="default"
                    className="size-10 rounded-xl"
                  >
                    <Square />
                    <span className="sr-only">Stop generation</span>
                  </Button>
                ) : (
                  <>
                    {hasAssistantResponse && input.length === 0 ? (
                      <Button
                        type="button"
                        onClick={() => reload()}
                        size="icon"
                        variant="outline"
                        className="size-10 rounded-xl"
                      >
                        <RefreshCw />
                        <span className="sr-only">Regenerate</span>
                      </Button>
                    ) : null}

                    {(input.length > 0 || !hasAssistantResponse) && (
                      <Button
                        type="submit"
                        disabled={!canSubmit}
                        size="icon"
                        variant={canSubmit ? "default" : "secondary"}
                        className="size-10 rounded-xl"
                      >
                        <Send />
                        <span className="sr-only">Send</span>
                      </Button>
                    )}
                  </>
                )}
              </div>
            </form>
          </CardContent>
        </Card>
        {error ? (
          <p className="mt-2 text-center text-xs text-destructive">
            {error.message}
          </p>
        ) : (
          <p className="mt-2 text-center text-xs text-muted-foreground">
            Enter to send, Shift+Enter for a new line.
          </p>
        )}
      </div>
    </div>
  );
}
