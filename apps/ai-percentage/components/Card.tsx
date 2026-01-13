import { cn } from "@duyet/libs";

function Card({
  children,
  className,
}: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn("rounded-lg border bg-card p-6", className)}>
      {children}
    </div>
  );
}

export { Card };
