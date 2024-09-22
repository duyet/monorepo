import { cn } from '@duyet/libs';

interface Props {
  major: string;
  university: string;
  period: string;
  note: string;
  className?: string;
}

export function Education({
  major,
  university,
  period,
  note,
  className,
}: Props) {
  return (
    <div className={cn(className)}>
      <h3
        className="text-lg font-bold"
        style={{ fontFamily: 'var(--font-bodoni)' }}
      >
        {major}
        <span className="px-2">-</span>
        <span className="font-normal">{university}</span>
      </h3>
      <p className="uppercase text-gray-600">{period}</p>
      <div className="mt-2 list-disc">{note}</div>
    </div>
  );
}
