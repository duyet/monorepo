
import { Button, Textarea } from "@duyet/components";
import { Paperclip, RefreshCw, Send, Settings, X } from "lucide-react";
import { Card } from "@/components/ui/card";

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
    <div className="absolute bottom-0 w-full pt-8 pb-[max(1.5rem,env(safe-area-inset-bottom))] px-3 sm:px-4 pointer-events-none">
      <div className="mx-auto max-w-3xl">
        <Card className="pointer-events-auto p-0 rounded-xl shadow-none">
          <form
            onSubmit={onSubmit}
            className="relative flex items-end gap-2 w-full rounded-xl border-0 transition-all focus-within:ring-2 focus-within:ring-ring p-2"
          >
            {/* Left Icons */}
            <div className="flex items-center gap-1 shrink-0">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                disabled
                title="Coming soon"
                aria-label="Attachments (coming soon)"
                className="h-9 w-9 rounded-full cursor-not-allowed opacity-50"
              >
                <Paperclip className="h-4 w-4" />
              </Button>
            </div>

            {/* Text Area */}
            <Textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={onKeyDown}
              placeholder="Ask me anything..."
              disabled={isLoading}
              rows={1}
              className="flex-1 min-h-[44px] max-h-[200px] w-full resize-none border-0 bg-transparent px-3 py-3 focus-visible:ring-0 focus-visible:ring-offset-0 shadow-none"
            />

            {/* Right Icons */}
            <div className="flex items-center gap-1.5 shrink-0">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                disabled
                title="Coming soon"
                aria-label="Settings (coming soon)"
                className="hidden sm:flex h-8 px-2 cursor-not-allowed opacity-50"
              >
                <Settings className="h-3.5 w-3.5 mr-1" />
                <span className="text-[11px] font-semibold tracking-wide">MAX</span>
              </Button>

              {isLoading ? (
                <Button
                  type="button"
                  onClick={stop}
                  size="icon"
                  variant="default"
                  className="h-9 w-9"
                >
                  <X className="h-4 w-4" />
                  <span className="sr-only">Stop</span>
                </Button>
              ) : (
                <>
                  {hasAssistantResponse && input.length === 0 && (
                    <Button
                      type="button"
                      onClick={() => reload()}
                      size="icon"
                      variant="ghost"
                      className="h-9 w-9"
                    >
                      <RefreshCw className="h-4 w-4" />
                      <span className="sr-only">Regenerate</span>
                    </Button>
                  )}
                  {(input.length > 0 || !hasAssistantResponse) && (
                    <Button
                      type="submit"
                      disabled={!canSubmit}
                      size="icon"
                      variant={canSubmit ? "default" : "secondary"}
                      className="h-9 w-9"
                    >
                      <Send className="h-4 w-4" />
                      <span className="sr-only">Send</span>
                    </Button>
                  )}
                </>
              )}
            </div>
          </form>
        </Card>
        {error && (
          <p className="mt-2 text-xs text-destructive text-center font-medium">
            {error.message}
          </p>
        )}
      </div>
    </div>
  );
}
