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
        className="mb-4 text-xl font-bold text-red-500"
        style={{ fontFamily: "var(--font-lora)" }}
      >
        {title}
      </h2>
      {children}
    </section>
  );
}
