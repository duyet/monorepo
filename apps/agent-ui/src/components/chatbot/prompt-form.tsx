import { ArrowUpIcon, SquareIcon } from "lucide-react";
import { useState } from "react";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupTextarea,
} from "~/components/ui/input-group";

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
      <InputGroup className="rounded-2xl bg-input/50 has-[>textarea]:h-auto">
        <InputGroupTextarea
          placeholder={placeholder}
          className="min-h-16 p-3.5"
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
        <InputGroupAddon align="block-end">
          <div className="flex min-w-0 items-center gap-1">{extra}</div>
          {isBusy && onStop ? (
            <InputGroupButton
              type="button"
              size="icon-sm"
              variant="outline"
              aria-label="Stop generating"
              className="ml-auto"
              onClick={onStop}
            >
              <SquareIcon />
            </InputGroupButton>
          ) : (
            <InputGroupButton
              type="submit"
              size="icon-sm"
              variant="default"
              aria-label="Send message"
              className="ml-auto"
              disabled={!input.trim() || disabled}
            >
              <ArrowUpIcon />
            </InputGroupButton>
          )}
        </InputGroupAddon>
      </InputGroup>
    </form>
  );
}
