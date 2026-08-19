import { Progress } from "@duyet/components/ui/progress";
import { cn } from "@duyet/libs/utils";

function MeterBar({
  value,
  warn = 55,
  danger = 75,
}: {
  value: number;
  warn?: number;
  danger?: number;
}) {
  const tone =
    value > danger
      ? "[&>[data-slot=progress-indicator]]:bg-destructive"
      : value > warn
        ? "[&>[data-slot=progress-indicator]]:bg-[var(--rd-warn)]"
        : "[&>[data-slot=progress-indicator]]:bg-[var(--rd-ok)]";

  return (
    <Progress
      value={Math.min(value, 100)}
      className={cn("h-1.5 bg-muted", tone)}
    />
  );
}

export { MeterBar };
