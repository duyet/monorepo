import { AlertCircle, RefreshCw, Send, X } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
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

/** Extract a user-friendly message from an Error, handling JSON response bodies */
function getErrorMessage(error: Error): string {
  const msg = error.message.trim();
  // AI SDK sometimes passes the raw JSON response body as the error message
  try {
    const parsed = JSON.parse(msg);
    return parsed.message || parsed.error || "An error occurred";
  } catch {
    // not JSON, use as-is
  }
  return msg || "An error occurred. Please try again.";
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
    <div className="pointer-events-none absolute bottom-0 w-full px-3 pb-[max(1rem,env(safe-area-inset-bottom))] pt-6 sm:px-4">
      <div className="mx-auto max-w-3xl">
        <Card className="pointer-events-auto border-border/70 bg-background/95 shadow-sm backdrop-blur supports-[backdrop-filter]:bg-background/85">
          <CardContent className="p-3">
            <form onSubmit={onSubmit} className="flex items-end gap-2">
              <Textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={onKeyDown}
                placeholder="Ask anything"
                disabled={isLoading}
                rows={1}
                className="min-h-[52px] max-h-[200px] flex-1 resize-none rounded-xl border-0 bg-transparent px-3 py-3 text-[15px] shadow-none placeholder:text-muted-foreground/70 focus-visible:ring-0 focus-visible:ring-offset-0"
              />

              {isLoading ? (
                <Button
                  type="button"
                  onClick={stop}
                  size="icon"
                  variant="default"
                  className="h-10 w-10 rounded-xl"
                >
                  <X className="h-4 w-4" />
                  <span className="sr-only">Stop</span>
                </Button>
              ) : (
                <>
                  {hasAssistantResponse && input.length === 0 ? (
                    <Button
                      type="button"
                      onClick={() => reload()}
                      size="icon"
                      variant="ghost"
                      className="h-10 w-10 rounded-xl"
                    >
                      <RefreshCw className="h-4 w-4" />
                      <span className="sr-only">Regenerate</span>
                    </Button>
                  ) : null}
                  {(input.length > 0 || !hasAssistantResponse) && (
                    <Button
                      type="submit"
                      disabled={!canSubmit}
                      size="icon"
                      variant={canSubmit ? "default" : "secondary"}
                      className="h-10 w-10 rounded-xl"
                    >
                      <Send className="h-4 w-4" />
                      <span className="sr-only">Send</span>
                    </Button>
                  )}
                </>
              )}
            </form>
          </CardContent>
        </Card>
        {error && (
          <Alert
            variant="destructive"
            className="mt-2 animate-in fade-in slide-in-from-bottom-2 duration-200"
          >
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{getErrorMessage(error)}</AlertDescription>
          </Alert>
        )}
      </div>
    </div>
  );
}
