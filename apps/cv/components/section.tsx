import { cn } from "@duyet/libs";

interface SectionProps {
  title: string;
  className?: string;
  children: React.ReactNode;
}

export function Section({ title, className, children }: SectionProps) {
  return (
    <section className={cn(className)}>
      <h2 className="mb-4 text-3xl font-semibold tracking-tight text-neutral-950 dark:text-foreground print:mb-1 print:text-[8pt]">
        {title}
      </h2>
      {children}
    </section>
  );
}
