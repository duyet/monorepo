import { cn } from "@duyet/libs";

interface SectionProps {
  title: string;
  className?: string;
  children: React.ReactNode;
}

export function Section({ title, className, children }: SectionProps) {
  return (
    <section className={cn(className)}>
      <h2
        className="mb-4 font-[family-name:var(--font-serif)] text-xl font-bold text-neutral-500 dark:text-neutral-400"
      >
        {title}
      </h2>
      {children}
    </section>
  );
}
