function MeterBar({
  value,
  warn = 55,
  danger = 75,
}: {
  value: number;
  warn?: number;
  danger?: number;
}) {
  const bg =
    value > danger
      ? "var(--rd-down)"
      : value > warn
        ? "var(--rd-warn)"
        : "var(--rd-ok)";
  return (
    <div className="rd-meter mt-[6px]">
      <i style={{ width: `${Math.min(value, 100)}%`, background: bg }} />
    </div>
  );
}

export { MeterBar };
