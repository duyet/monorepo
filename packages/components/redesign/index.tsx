/**
 * Shared redesign components for the 2026 duyet.net redesign.
 * Uses the `--rd-*` CSS token layer from styles.css.
 */
import * as SVGLogos from "@thesvg/react";
import type { CSSProperties, ReactNode } from "react";

export { Sparkline } from "../charts/Sparkline";

// ---------------------------------------------------------------------------
// Eyebrow — uppercase mono section label
// ---------------------------------------------------------------------------
export function Eyebrow({
  children,
  num,
}: {
  children: ReactNode;
  num?: string;
}) {
  return (
    <div className="rd-eyebrow">
      {num && <span className="rd-num">{num}</span>}
      {children}
    </div>
  );
}

// ---------------------------------------------------------------------------
// SecHead — section header with eyebrow, title, and action links
// ---------------------------------------------------------------------------
export function SecHead({
  eyebrow,
  num,
  title,
  links,
}: {
  eyebrow?: string;
  num?: string;
  title: string;
  links?: Array<{ label: string; onClick?: () => void; href?: string }>;
}) {
  return (
    <div className="rd-sechead">
      <div>
        {eyebrow && <Eyebrow num={num}>{eyebrow}</Eyebrow>}
        <h2 className="rd-h-sec" style={{ marginTop: 12 }}>
          {title}
        </h2>
      </div>
      {links && (
        <div className="rd-links">
          {links.map((l, i) =>
            l.href ? (
              <a key={i} href={l.href} target="_blank" rel="noreferrer">
                {l.label} <span style={{ color: "var(--rd-text-4)" }}>→</span>
              </a>
            ) : (
              <button
                key={i}
                onClick={l.onClick}
                type="button"
                style={{
                  cursor: "pointer",
                  background: "none",
                  border: "none",
                  padding: 0,
                  font: "inherit",
                  color: "inherit",
                }}
              >
                {l.label} <span style={{ color: "var(--rd-text-4)" }}>→</span>
              </button>
            )
          )}
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Reveal — visible wrapper (scroll hide-then-fade is optional and would
// hide already-prerendered HTML, so first paint stays opacity 1).
// ---------------------------------------------------------------------------
export function Reveal({
  children,
  delay = 0,
  className = "",
  style,
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
  style?: CSSProperties;
}) {
  // Always visible: SSR, first paint, hydration, and prefers-reduced-motion.
  // Starting hidden (opacity:0) made duyet.net paint header/footer first.
  return (
    <div
      className={className}
      style={{
        ...style,
        opacity: 1,
        transform: "none",
        transition: `opacity .6s cubic-bezier(.2,.7,.2,1) ${delay}ms, transform .6s cubic-bezier(.2,.7,.2,1) ${delay}ms`,
      }}
    >
      {children}
    </div>
  );
}

const NAME_LOGOS: Record<string, any> = {
  // Languages
  typescript: SVGLogos.Typescript,
  javascript: SVGLogos.Typescript,
  python: SVGLogos.Python,
  rust: SVGLogos.Rust,
  go: SVGLogos.Go,
  shell: SVGLogos.GnuBash,
  bash: SVGLogos.GnuBash,
  markdown: SVGLogos.Markdown,
  css: SVGLogos.Css3,
  html: SVGLogos.Html5,
  sql: SVGLogos.Postgresql,
  clickhouse: SVGLogos.Clickhouse,

  // Models / Vendors
  "claude 3.5 sonnet": SVGLogos.Claude,
  claude: SVGLogos.Claude,
  "gpt-4o": SVGLogos.Openai,
  "gpt-4o-mini": SVGLogos.Openai,
  openai: SVGLogos.Openai,
  gemini: SVGLogos.GoogleGemini,
  llama: SVGLogos.Metaai,
  ollama: SVGLogos.Ollama,
  deepseek: SVGLogos.Deepseek,
};

function getLogo(name: string) {
  const norm = name.toLowerCase().trim();
  for (const k of Object.keys(NAME_LOGOS)) {
    if (norm.includes(k) || k.includes(norm)) {
      return NAME_LOGOS[k];
    }
  }
  return null;
}

// ---------------------------------------------------------------------------
// DistRows — horizontal labelled distribution bars
// ---------------------------------------------------------------------------
export function DistRows({
  rows,
  color = "var(--rd-accent)",
}: {
  rows: Array<{ name: string; pct: number }>;
  color?: string;
}) {
  const max = Math.max(...rows.map((r) => r.pct));
  return (
    <div style={{ display: "grid", gap: 11 }}>
      {rows.map((r, i) => {
        const Logo = getLogo(r.name);
        return (
          <div
            key={i}
            style={{
              display: "grid",
              gridTemplateColumns: "1fr auto",
              gap: 12,
              alignItems: "center",
            }}
          >
            <div style={{ minWidth: 0 }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  fontSize: 13,
                  marginBottom: 5,
                }}
              >
                <span
                  className="font-[var(--font-mono)] inline-flex items-center gap-1.5"
                  style={{
                    color: "var(--rd-text-2)",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {Logo && <Logo width={12} height={12} className="shrink-0" />}
                  {r.name}
                </span>
                <span
                  className="font-[var(--font-mono)] text-[var(--rd-text-3)]"
                  style={{ fontSize: 12 }}
                >
                  {r.pct}%
                </span>
              </div>
              <div className="rd-meter">
                <i
                  style={{
                    width: `${(r.pct / max) * 100}%`,
                    background: i === 0 ? color : "var(--rd-text-3)",
                    opacity: i === 0 ? 1 : 0.55,
                  }}
                />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
