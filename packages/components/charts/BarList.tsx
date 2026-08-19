export interface BarListItem {
  name: string;
  value: number;
  href?: string;
}

export interface ChartBarListProps {
  data: BarListItem[];
  ariaLabel: string;
  className?: string;
  formatValue?: (value: number) => string;
}

/**
 * Horizontal labelled magnitude bars. Pure CSS/SVG, no chart library.
 */
export function BarList({
  data,
  ariaLabel,
  className,
  formatValue = (value) => value.toLocaleString(),
}: ChartBarListProps) {
  const max = Math.max(0, ...data.map((item) => item.value));
  return (
    <ul
      aria-label={ariaLabel}
      className={className}
      style={{
        display: "grid",
        gap: 11,
        listStyle: "none",
        margin: 0,
        padding: 0,
      }}
    >
      {data.map((item) => {
        const width =
          max > 0 && Number.isFinite(item.value) && item.value > 0
            ? Math.max((item.value / max) * 100, 2)
            : 0;
        const label = (
          <>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                gap: 12,
                fontSize: 13,
                marginBottom: 5,
              }}
            >
              <span
                style={{
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                  minWidth: 0,
                }}
              >
                {item.name}
              </span>
              <span style={{ fontVariantNumeric: "tabular-nums" }}>
                {formatValue(item.value)}
              </span>
            </div>
            <div
              aria-hidden="true"
              style={{
                height: 6,
                borderRadius: 99,
                background: "var(--rd-surface-2, #eee)",
                overflow: "hidden",
              }}
            >
              <i
                style={{
                  display: "block",
                  height: "100%",
                  width: `${width}%`,
                  background: "var(--rd-accent, currentColor)",
                  borderRadius: 99,
                }}
              />
            </div>
          </>
        );
        return (
          <li key={item.name}>
            {item.href ? (
              <a
                href={item.href}
                rel="noreferrer"
                style={{ color: "inherit", textDecoration: "none" }}
                target="_blank"
              >
                {label}
              </a>
            ) : (
              label
            )}
          </li>
        );
      })}
    </ul>
  );
}
