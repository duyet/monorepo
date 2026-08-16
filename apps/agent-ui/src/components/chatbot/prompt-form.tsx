import { ArrowUpIcon, SquareIcon } from "lucide-react";
import { useState } from "react";
import { Button } from "~/components/ui/button";
import { Textarea } from "~/components/ui/textarea";

export function PromptForm({
  isBusy,
  disabled = false,
  placeholder = "Send a message…",
  extra,
  onSubmit,
  onStop,
}: {
  isBusy: boolean;
  disabled?: boolean;
  placeholder?: string;
  extra?: React.ReactNode;
  onSubmit: (text: string) => void;
  onStop?: () => void;
}) {
  const [input, setInput] = useState("");

  function handleSubmit(event?: React.FormEvent) {
    event?.preventDefault();
    const text = input.trim();
    if (!text || isBusy || disabled) return;
    onSubmit(text);
    setInput("");
  }

  return (
    <form onSubmit={handleSubmit}>
      <div
        data-slot="input-group"
        className="relative flex w-full min-w-0 flex-col rounded-2xl border bg-input/50"
      >
        <Textarea
          data-slot="input-group-control"
          placeholder={placeholder}
          className="min-h-16 resize-none rounded-none border-0 bg-transparent p-3.5 shadow-none focus-visible:ring-0"
          value={input}
          disabled={disabled}
          onChange={(event) => setInput(event.target.value)}
          onKeyDown={(event) => {
            if (
              event.key === "Enter" &&
              !event.shiftKey &&
              !event.nativeEvent.isComposing
            ) {
              event.preventDefault();
              handleSubmit();
            }
          }}
        />
        <div className="flex items-center justify-between gap-2 px-2.5 pb-2">
          <div className="flex min-w-0 items-center gap-1">{extra}</div>
          {isBusy && onStop ? (
            <Button
              type="button"
              size="icon-sm"
              variant="outline"
              aria-label="Stop generating"
              onClick={onStop}
            >
              <SquareIcon />
            </Button>
          ) : (
            <Button
              type="submit"
              size="icon-sm"
              variant="default"
              aria-label="Send message"
              disabled={!input.trim() || disabled}
            >
              <ArrowUpIcon />
            </Button>
          )}
        </div>
      </div>
    </form>
  );
}
