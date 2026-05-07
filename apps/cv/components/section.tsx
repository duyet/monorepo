import { cn } from "@duyet/libs";

interface SectionProps {
  title: string;
  className?: string;
  children: React.ReactNode;
}

export function Section({ title, className, children }: SectionProps) {
  return (
    <section className={cn("mt-5", className)}>
      <h2 className="border-b border-neutral-900 pb-1 font-[family-name:var(--font-serif)] text-[17px] font-bold uppercase tracking-[0.12em] text-neutral-900 dark:border-neutral-100 dark:text-neutral-100">
        {title}
      </h2>
      <div className="mt-2">{children}</div>
    </section>
  );
}
