import { ExternalIcon } from "./icons";
import type { UrlEntry } from "./types";

export function UrlRow({ path, target, desc }: UrlEntry) {
  const isExternal = target.startsWith("http");
  return (
    <a
      href={target}
      target={isExternal ? "_blank" : undefined}
      rel={isExternal ? "noopener noreferrer" : undefined}
      className="flex flex-col gap-2 border-t py-4 text-foreground no-underline transition-colors first:border-t-0 hover:text-muted-foreground"
    >
      <div className="flex items-center justify-between">
        <code className="font-mono text-[15px] font-semibold">
          {path}
        </code>
        {isExternal && <ExternalIcon className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />}
      </div>
      {desc ? (
        <p className="m-0 text-[13px] leading-snug text-muted-foreground">{desc}</p>
      ) : (
        <p className="m-0 text-[13px] text-muted-foreground">&mdash;</p>
      )}
      <p className="m-0 truncate font-mono text-[11px] text-muted-foreground">
        {target}
      </p>
    </a>
  );
}
