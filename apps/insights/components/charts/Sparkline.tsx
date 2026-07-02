import { useId } from "react";

interface SparklineProps {
  /** Time-series values, oldest to newest. */
  data: number[];
  /** Rendered height in pixels. */
  h?: number;
  /** Line/area color; accepts any CSS color incl. theme vars. */
  stroke?: string;
  /** Render the soft gradient fill beneath the line. */
  fill?: boolean;
  /** Accessible description of the trend for screen readers. */
  label?: string;
  className?: string;
}

/**
 * Tiny, dependency-free SVG sparkline.
 *
 * Pure inline SVG so it stays theme-aware via CSS variables and adds no
 * runtime cost. Unlike the shared redesign sparkline, this variant exposes an
 * accessible `label` (role="img" + aria-label) for the KPI tiles.
 */
export function Sparkline({
  data,
  h = 34,
  stroke = "var(--rd-accent)",
  fill = true,
  label,
  className,
}: SparklineProps) {
  // Stable id across SSR + client so the gradient ref never mismatches.
  const reactId = useId();

  // Ignore non-finite values (NaN/Infinity) so they never reach the SVG path
  // and silently blank the chart. Fewer than two points cannot form a line.
  const finite = data.filter(Number.isFinite);
  if (finite.length < 2) {
    return <div aria-hidden="true" className={className} style={{ height: h }} />;
  }

  const w = 120;
  const max = Math.max(...finite);
  const min = Math.min(...finite);
  const rng = max - min || 1;
  const step = w / (finite.length - 1);
  const pts = finite.map(
    (v, i) => [i * step, h - ((v - min) / rng) * (h - 4) - 2] as const,
  );
  const line = pts
    .map((p, i) => `${i ? "L" : "M"}${p[0].toFixed(1)} ${p[1].toFixed(1)}`)
    .join(" ");
  const area = `${line} L${w} ${h} L0 ${h} Z`;
  const gid = `spark-${reactId.replace(/:/g, "")}`;

  return (
    <svg
      aria-hidden={label ? undefined : "true"}
      aria-label={label}
      className={className}
      preserveAspectRatio="none"
      role={label ? "img" : undefined}
      style={{ width: "100%", height: h, display: "block" }}
      viewBox={`0 0 ${w} ${h}`}
    >
      <defs>
        <linearGradient id={gid} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor={stroke} stopOpacity="0.16" />
          <stop offset="1" stopColor={stroke} stopOpacity="0" />
        </linearGradient>
      </defs>
      {fill && <path d={area} fill={`url(#${gid})`} />}
      <path
        d={line}
        fill="none"
        stroke={stroke}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.8}
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}
