import { cn } from "@duyet/libs";

export function Snippet({
  html,
  className,
}: {
  html: string;
  className?: string;
}) {
  if (!html) {
    return null;
  }

  return (
    <div
      className={cn(className)}
      dangerouslySetInnerHTML={{ __html: html }}
      suppressHydrationWarning
    />
  );
}
