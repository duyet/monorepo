import { cn } from '@duyet/libs';

interface SectionProps {
  title: string;
  className?: string;
  children: React.ReactNode;
}

export function Section({ title, className, children }: SectionProps) {
  return (
    <section className={cn(className)}>
      <h2
        className="mb-4 text-2xl font-bold text-red-500"
        style={{ fontFamily: 'var(--font-bodoni)' }}
      >
        {title}
      </h2>
      {children}
    </section>
  );
}
