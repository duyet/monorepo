import { Button } from "~/components/ui/button";

export const AGENT_SUGGESTIONS = [
  {
    label: "What is Duyet working on?",
    prompt: "What is Duyet working on right now?",
  },
  {
    label: "Recent blog posts",
    prompt: "Show me the most recent blog posts",
  },
  {
    label: "LLM Timeline",
    prompt: "Summarize the LLM Timeline project",
  },
  {
    label: "ClickHouse projects",
    prompt: "Which projects use ClickHouse?",
  },
];

export function Suggestions({
  onSelect,
  disabled = false,
}: {
  onSelect: (prompt: string) => void;
  disabled?: boolean;
}) {
  return (
    <div className="flex flex-wrap justify-center gap-2">
      {AGENT_SUGGESTIONS.map((suggestion) => (
        <Button
          key={suggestion.label}
          type="button"
          variant="outline"
          size="sm"
          disabled={disabled}
          onClick={() => onSelect(suggestion.prompt)}
        >
          {suggestion.label}
        </Button>
      ))}
    </div>
  );
}
