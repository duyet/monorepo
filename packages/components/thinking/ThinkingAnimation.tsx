import { cn } from "@duyet/libs/utils";

interface ThinkingAnimationProps {
  className?: string;
}

export function ThinkingAnimation({ className }: ThinkingAnimationProps) {
  return (
    <div className={cn("animate-pulse", className)}>
      <span className="inline-flex items-center gap-0.5 text-sm font-medium text-neutral-600">
        Thinking
        <span
          className="inline-block h-1 w-1 rounded-full bg-neutral-400 animate-bounce [animation-delay:0ms]"
          aria-hidden="true"
        />
        <span
          className="inline-block h-1 w-1 rounded-full bg-neutral-400 animate-bounce [animation-delay:150ms]"
          aria-hidden="true"
        />
        <span
          className="inline-block h-1 w-1 rounded-full bg-neutral-400 animate-bounce [animation-delay:300ms]"
          aria-hidden="true"
        />
      </span>
    </div>
  );
}
