import type { ReactNode } from "react";
import { cn } from "../lib/utils";
import { tw } from "../lib/tw";

const TONES = ["plum", "pine", "slate"] as const;
export type SoftTone = (typeof TONES)[number];

const TONE_CLASS: Record<SoftTone, string> = {
  plum: tw.labelPlum,
  pine: tw.labelPine,
  slate: tw.labelSlate,
};

export function toneFrom(seed: string): SoftTone {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash + seed.charCodeAt(i) * (i + 1)) % 97;
  }
  return TONES[hash % TONES.length];
}

export function SoftLabel({
  children,
  tone = "slate",
  className,
}: {
  children: ReactNode;
  tone?: SoftTone;
  className?: string;
}) {
  return (
    <span className={cn(tw.label, TONE_CLASS[tone], className)}>
      {children}
    </span>
  );
}
