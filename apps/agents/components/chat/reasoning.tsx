"use client";

import { useState, useEffect, useRef } from "react";
import { ChevronRight } from "lucide-react";
import { cn } from "@duyet/libs";

interface ReasoningProps {
  text: string;
  isStreaming?: boolean;
}

export function Reasoning({ text, isStreaming }: ReasoningProps) {
  const [open, setOpen] = useState(isStreaming ?? false);
  const startTime = useRef(Date.now());
  const [elapsed, setElapsed] = useState(0);

  // Auto-expand while streaming, collapse when done
  useEffect(() => {
    if (isStreaming) {
      setOpen(true);
    } else {
      setOpen(false);
    }
  }, [isStreaming]);

  // Track elapsed time while streaming
  useEffect(() => {
    if (!isStreaming) {
      setElapsed(Math.round((Date.now() - startTime.current) / 1000));
      return;
    }

    const interval = setInterval(() => {
      setElapsed(Math.round((Date.now() - startTime.current) / 1000));
    }, 1000);

    return () => clearInterval(interval);
  }, [isStreaming]);

  if (!text) return null;

  const label = isStreaming
    ? `Reasoning${elapsed > 0 ? ` (${elapsed}s)` : ""}...`
    : `Reasoned for ${elapsed}s`;

  return (
    <div className="my-1.5">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
      >
        <ChevronRight
          className={cn(
            "h-3 w-3 transition-transform duration-200",
            open && "rotate-90"
          )}
        />
        <span>{label}</span>
      </button>
      {open && (
        <div className="mt-1 border-l-2 border-muted-foreground/20 pl-3">
          <p className="whitespace-pre-wrap text-xs text-muted-foreground leading-relaxed">
            {text}
          </p>
        </div>
      )}
    </div>
  );
}
