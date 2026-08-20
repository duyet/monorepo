const DEFAULT_RAMP = [
  "var(--rd-surface-2, #eee)",
  "color-mix(in srgb, var(--rd-accent, #c45c26) 26%, var(--rd-surface-2, #eee))",
  "color-mix(in srgb, var(--rd-accent, #c45c26) 50%, var(--rd-surface-2, #eee))",
  "color-mix(in srgb, var(--rd-accent, #c45c26) 74%, var(--rd-surface-2, #eee))",
  "var(--rd-accent, #c45c26)",
];

export interface HeatmapCell {
  /** 0–1 intensity, or any finite number scaled against the series max. */
  value: number;
  title?: string;
}

export interface HeatmapProps {
  /** Columns of rows (e.g. GitHub weeks × 7 days). */
  data: HeatmapCell[][];
  ariaLabel: string;
  cell?: number;
  gap?: number;
  radius?: number;
  colorRamp?: string[];
  /** When set, intensity is scaled against this instead of the series max
   * (GitHub-style 0–4 levels stay absolute even in a quiet year). */
  maxValue?: number;
  className?: string;
}

function levelIndex(value: number, max: number, steps: number): number {
  if (!Number.isFinite(value) || value <= 0 || max <= 0) return 0;
  const t = Math.min(1, value / max);
  return Math.min(steps - 1, 1 + Math.floor(t * (steps - 2)));
}

/**
 * Accessible SVG contribution-style heatmap. Pure SVG, CSS-var theming.
 */
export function Heatmap({
  data,
  ariaLabel,
  cell = 11,
  gap = 2.5,
  radius = 2.5,
  colorRamp = DEFAULT_RAMP,
  maxValue,
  className,
}: HeatmapProps) {
  const cols = data.length;
  const rows = data.reduce((max, col) => Math.max(max, col.length), 0);
  if (cols === 0 || rows === 0) {
    return <div aria-hidden="true" className={className} />;
  }

  const pitch = cell + gap;
  const width = Math.max(0, cols * pitch - gap);
  const height = Math.max(0, rows * pitch - gap);
  const computedMax =
    maxValue ??
    Math.max(
      0,
      ...data.flatMap((col) => col.map((c) => c.value).filter(Number.isFinite))
    );

  return (
    <svg
      aria-label={ariaLabel}
      className={className}
      preserveAspectRatio="xMidYMid meet"
      role="img"
      style={{ display: "block", width: "100%", height: "auto" }}
      viewBox={`0 0 ${width} ${height}`}
    >
      {data.flatMap((col, x) =>
        col.map((entry, y) => (
          <rect
            fill={colorRamp[levelIndex(entry.value, computedMax, colorRamp.length)]}
            height={cell}
            key={`${x}-${y}`}
            rx={radius}
            ry={radius}
            width={cell}
            x={x * pitch}
            y={y * pitch}
          >
            {entry.title ? <title>{entry.title}</title> : null}
          </rect>
        ))
      )}
    </svg>
  );
}
