import { cn } from "@duyet/libs/utils";
import type { ReactNode } from "react";

interface BlogHeaderProps {
  eyebrow?: string;
  title: string;
  titleEmphasis?: string;
  intro: ReactNode;
  children?: ReactNode;
  className?: string;
}

export function BlogHeader({
  eyebrow = "Blog",
  title,
  titleEmphasis,
  intro,
  children,
  className,
}: BlogHeaderProps) {
  return (
    <header className={cn("masthead", className)}>
      <div className="eyebrow">{eyebrow}</div>
      <h1>
        {title}
        {titleEmphasis && <em> {titleEmphasis}</em>}
      </h1>
      <div className="intro">{intro}</div>
      {children}
    </header>
  );
}
