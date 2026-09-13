import type { ReactNode } from "react";
import { tw } from "../lib/tw";

type LinkItem = {
  label: string;
  href?: string;
  onClick?: () => void;
};

export function SectionHead({
  eyebrow,
  title,
  links,
  children,
}: {
  eyebrow?: string;
  title: string;
  links?: LinkItem[];
  children?: ReactNode;
}) {
  return (
    <div className={tw.secHead}>
      <div className="min-w-0">
        {eyebrow ? <p className={tw.eyebrow}>{eyebrow}</p> : null}
        <h2 className={tw.secTitle}>{title}</h2>
        {children}
      </div>
      {links && links.length > 0 ? (
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
          {links.map((l) =>
            l.href ? (
              <a key={l.label} href={l.href} target="_blank" rel="noreferrer" className={tw.link}>
                {l.label}
                <span aria-hidden="true">→</span>
              </a>
            ) : (
              <button key={l.label} type="button" onClick={l.onClick} className={tw.link}>
                {l.label}
                <span aria-hidden="true">→</span>
              </button>
            )
          )}
        </div>
      ) : null}
    </div>
  );
}
