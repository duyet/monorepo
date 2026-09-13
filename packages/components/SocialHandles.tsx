import { cn } from "@duyet/libs/utils";
import { Github, LinkedIn, Twitter } from "./Icons";

const HANDLES = [
  {
    href: "https://github.com/duyet",
    label: "GitHub",
    Logo: Github,
  },
  {
    href: "https://x.com/_duyet",
    label: "X",
    Logo: Twitter,
  },
  {
    href: "https://linkedin.com/in/duyet",
    label: "LinkedIn",
    Logo: LinkedIn,
  },
] as const;

export function SocialHandles({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "inline-flex items-center gap-3 text-[var(--rd-text-3)]",
        className
      )}
    >
      {HANDLES.map(({ href, label, Logo }) => (
        <a
          key={href}
          href={href}
          target="_blank"
          rel="noreferrer"
          aria-label={label}
          className="inline-flex items-center text-inherit no-underline transition-colors hover:text-[var(--rd-accent-ink)]"
        >
          <Logo className="h-3.5 w-3.5 shrink-0" />
        </a>
      ))}
    </div>
  );
}

export default SocialHandles;
