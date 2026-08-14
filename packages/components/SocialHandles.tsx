import { cn } from "@duyet/libs/utils";
import { Github, Twitter } from "./Icons";

const HANDLES = [
  {
    href: "https://github.com/duyet",
    label: "github",
    Logo: Github,
  },
  {
    href: "https://x.com/_duyet",
    label: "x.com/_duyet",
    Logo: Twitter,
  },
] as const;

export function SocialHandles({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "inline-flex items-center gap-2 font-[var(--font-mono)] text-[12.5px] text-[var(--rd-text-3)]",
        className
      )}
    >
      {HANDLES.map(({ href, label, Logo }, i) => (
        <span key={href} className="inline-flex items-center gap-2">
          {i > 0 && <span aria-hidden="true">|</span>}
          <a
            href={href}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 text-inherit no-underline transition-colors hover:text-[var(--rd-accent-ink)]"
          >
            <Logo className="h-3.5 w-3.5 shrink-0" />
            {label}
          </a>
        </span>
      ))}
    </div>
  );
}

export default SocialHandles;
