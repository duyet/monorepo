import type { ReactNode } from "react";

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
    <div className="home-sechead">
      <div className="min-w-0">
        {eyebrow ? <p className="home-eyebrow">{eyebrow}</p> : null}
        <h2 className="home-sec-title">{title}</h2>
        {children}
      </div>
      {links && links.length > 0 ? (
        <div className="home-sec-links">
          {links.map((l) =>
            l.href ? (
              <a key={l.label} href={l.href} target="_blank" rel="noreferrer">
                {l.label}
                <span aria-hidden="true">→</span>
              </a>
            ) : (
              <button key={l.label} type="button" onClick={l.onClick}>
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
