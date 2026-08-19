export interface DonutSlice {
  name: string;
  value: number;
  color?: string;
}

export interface DonutProps {
  data: DonutSlice[];
  ariaLabel: string;
  size?: number;
  thickness?: number;
  className?: string;
}

const FALLBACK_COLORS = [
  "var(--rd-accent, #c45c26)",
  "color-mix(in srgb, var(--rd-accent, #c45c26) 70%, #6b8cae)",
  "color-mix(in srgb, var(--rd-accent, #c45c26) 40%, #3d8b6e)",
  "color-mix(in srgb, var(--rd-text, #1a1a1a) 35%, transparent)",
  "color-mix(in srgb, var(--rd-accent, #c45c26) 25%, #c45c26)",
];

function polar(cx: number, cy: number, r: number, angle: number) {
  const rad = ((angle - 90) * Math.PI) / 180;
  return [cx + r * Math.cos(rad), cy + r * Math.sin(rad)] as const;
}

function arcPath(
  cx: number,
  cy: number,
  r: number,
  start: number,
  end: number
): string {
  const sweep = end - start;
  if (sweep >= 359.999) {
    const [x1, y1] = polar(cx, cy, r, 0);
    const [x2, y2] = polar(cx, cy, r, 180);
    return `M ${x1} ${y1} A ${r} ${r} 0 1 1 ${x2} ${y2} A ${r} ${r} 0 1 1 ${x1} ${y1}`;
  }
  const [x1, y1] = polar(cx, cy, r, start);
  const [x2, y2] = polar(cx, cy, r, end);
  const large = sweep > 180 ? 1 : 0;
  return `M ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2}`;
}

/**
 * Lightweight SVG donut. No recharts. Theme-aware stroke colors.
 */
export function Donut({
  data,
  ariaLabel,
  size = 160,
  thickness = 18,
  className,
}: DonutProps) {
  const total = data.reduce(
    (sum, slice) => sum + (Number.isFinite(slice.value) ? slice.value : 0),
    0
  );
  if (total <= 0) {
    return (
      <div
        aria-label={ariaLabel}
        className={className}
        role="img"
        style={{ height: size }}
      />
    );
  }

  const cx = size / 2;
  const cy = size / 2;
  const r = size / 2 - thickness / 2 - 2;
  let angle = 0;
  const slices = data
    .filter((slice) => Number.isFinite(slice.value) && slice.value > 0)
    .map((slice, i) => {
      const sweep = (slice.value / total) * 360;
      const start = angle;
      const end = angle + sweep;
      angle = end;
      return {
        ...slice,
        start,
        end,
        color: slice.color ?? FALLBACK_COLORS[i % FALLBACK_COLORS.length],
      };
    });

  return (
    <svg
      aria-label={ariaLabel}
      className={className}
      height={size}
      role="img"
      viewBox={`0 0 ${size} ${size}`}
      width={size}
    >
      {slices.map((slice) => (
        <path
          d={arcPath(cx, cy, r, slice.start, slice.end)}
          fill="none"
          key={slice.name}
          stroke={slice.color}
          strokeLinecap="butt"
          strokeWidth={thickness}
        >
          <title>{`${slice.name}: ${slice.value}`}</title>
        </path>
      ))}
    </svg>
  );
}
