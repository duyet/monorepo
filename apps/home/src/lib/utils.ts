// Re-export cn from the shared libs package (shadcn-ui/cn)
export { cn } from "@duyet/libs/utils";

// Build time, injected at build by the `define` in vite.config.ts. The
// projects catalogue is hand-committed (no generated data), so the page says
// "Built", never "Snapshot" — issue #1542.
export const BUILT_AT: string = import.meta.env.VITE_BUILT_AT;

// Mirrors apps/ai-percentage's formatSnapshotTime: UTC-pinned so the same
// build renders the same string in every browser.
export function formatBuiltTime(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) {
    return "unknown";
  }
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: "UTC",
    timeZoneName: "short",
  }).format(date);
}
