import { cn } from "@duyet/libs";

export function InlineLink({
  links,
  className,
}: {
  links: (string | React.ReactNode)[];
  className?: string;
}) {
  return (
    <div className={cn("mt-2 inline-flex w-full flex-wrap gap-2.5", className)}>
      {links}
    </div>
  );
}
