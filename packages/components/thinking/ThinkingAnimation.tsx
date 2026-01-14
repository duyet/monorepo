"use client";

import { cn } from "@duyet/libs/utils";
import { useEffect, useState } from "react";

interface ThinkingAnimationProps {
  className?: string;
}

export function ThinkingAnimation({ className }: ThinkingAnimationProps) {
  const [dotCount, setDotCount] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setDotCount((prev) => (prev + 1) % 4);
    }, 500);

    return () => clearInterval(interval);
  }, []);

  const dots = ".".repeat(dotCount);

  return (
    <div className={cn("animate-pulse", className)}>
      <span className="inline-flex items-center text-sm font-medium text-neutral-600">
        Thinking{dots}
        <span className="ml-1 inline-block h-1 w-1 animate-bounce rounded-full bg-neutral-400" />
      </span>
    </div>
  );
}
