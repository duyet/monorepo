/**
 * Shared redesign components for the 2026 duyet.net redesign.
 * Uses the `--rd-*` CSS token layer from styles.css.
 */
import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react"

// ---------------------------------------------------------------------------
// Eyebrow — uppercase mono section label
// ---------------------------------------------------------------------------
export function Eyebrow({
  children,
  num,
}: {
  children: ReactNode
  num?: string
}) {
  return (
    <div className="rd-eyebrow">
      {num && <span className="rd-num">{num}</span>}
      {children}
    </div>
  )
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
  eyebrow?: string
  num?: string
  title: string
  links?: Array<{ label: string; onClick?: () => void; href?: string }>
}) {
  return (
    <div className="rd-sechead">
      <div>
        {eyebrow && (
          <Eyebrow num={num}>{eyebrow}</Eyebrow>
        )}
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
              <button key={i} onClick={l.onClick} type="button" style={{ cursor: "pointer", background: "none", border: "none", padding: 0, font: "inherit", color: "inherit" }}>
                {l.label} <span style={{ color: "var(--rd-text-4)" }}>→</span>
              </button>
            ),
          )}
        </div>
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Reveal — fade-up on scroll with timeout fallback
// ---------------------------------------------------------------------------
export function Reveal({
  children,
  delay = 0,
  className = "",
  style,
}: {
  children: ReactNode
  delay?: number
  className?: string
  style?: CSSProperties
}) {
  const ref = useRef<HTMLDivElement>(null)
  const [on, setOn] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) {
      setOn(true)
      return
    }
    let done = false
    const show = () => {
      if (!done) {
        done = true
        setOn(true)
      }
    }
    const t = setTimeout(show, 700 + delay)
    if ("IntersectionObserver" in window) {
      const io = new IntersectionObserver(
        ([e]) => {
          if (e.isIntersecting) {
            show()
            io.disconnect()
          }
        },
        { threshold: 0.1, rootMargin: "0px 0px -6% 0px" },
      )
      io.observe(el)
      return () => {
        clearTimeout(t)
        io.disconnect()
      }
    }
    show()
    return () => clearTimeout(t)
  }, [delay])

  return (
    <div
      ref={ref}
      className={className}
      style={{
        ...style,
        opacity: on ? 1 : 0,
        transform: on ? "none" : "translateY(14px)",
        transition: `opacity .6s cubic-bezier(.2,.7,.2,1) ${delay}ms, transform .6s cubic-bezier(.2,.7,.2,1) ${delay}ms`,
      }}
    >
      {children}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Sparkline — tiny SVG sparkline chart
// ---------------------------------------------------------------------------
export function Sparkline({
  data,
  h = 38,
  stroke = "var(--rd-accent)",
  fill = true,
}: {
  data: number[]
  h?: number
  stroke?: string
  fill?: boolean
}) {
  if (data.length < 2) return <div style={{ height: h }} />
  const w = 120
  const max = Math.max(...data)
  const min = Math.min(...data)
  const rng = max - min || 1
  const step = w / (data.length - 1)
  const pts = data.map(
    (v, i) => [i * step, h - ((v - min) / rng) * (h - 4) - 2] as const,
  )
  const line = pts
    .map((p, i) => `${i ? "L" : "M"}${p[0].toFixed(1)} ${p[1].toFixed(1)}`)
    .join(" ")
  const area = `${line} L${w} ${h} L0 ${h} Z`
  const gid = `sg${Math.round(Math.random() * 1e6)}`

  return (
    <svg
      viewBox={`0 0 ${w} ${h}`}
      preserveAspectRatio="none"
      style={{ width: "100%", height: h, display: "block" }}
    >
      <defs>
        <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={stroke} stopOpacity="0.16" />
          <stop offset="1" stopColor={stroke} stopOpacity="0" />
        </linearGradient>
      </defs>
      {fill && <path d={area} fill={`url(#${gid})`} />}
      <path
        d={line}
        fill="none"
        stroke={stroke}
        strokeWidth={1.8}
        strokeLinecap="round"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  )
}

import * as SVGLogos from "@thesvg/react";

const NAME_LOGOS: Record<string, any> = {
  // Languages
  "typescript": SVGLogos.Typescript,
  "javascript": SVGLogos.Typescript,
  "python": SVGLogos.Python,
  "rust": SVGLogos.Rust,
  "go": SVGLogos.Go,
  "shell": SVGLogos.GnuBash,
  "bash": SVGLogos.GnuBash,
  "markdown": SVGLogos.Markdown,
  "css": SVGLogos.Css3,
  "html": SVGLogos.Html5,
  "sql": SVGLogos.Postgresql,
  "clickhouse": SVGLogos.Clickhouse,

  // Models / Vendors
  "claude 3.5 sonnet": SVGLogos.Claude,
  "claude": SVGLogos.Claude,
  "gpt-4o": SVGLogos.Openai,
  "gpt-4o-mini": SVGLogos.Openai,
  "openai": SVGLogos.Openai,
  "gemini": SVGLogos.GoogleGemini,
  "llama": SVGLogos.Metaai,
  "ollama": SVGLogos.Ollama,
  "deepseek": SVGLogos.Deepseek,
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
  rows: Array<{ name: string; pct: number }>
  color?: string
}) {
  const max = Math.max(...rows.map((r) => r.pct))
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
                  {Logo && <Logo size={12} className="shrink-0" />}
                  {r.name}
                </span>
                <span className="font-[var(--font-mono)] text-[var(--rd-text-3)]" style={{ fontSize: 12 }}>
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
  )
}
