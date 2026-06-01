function StatusDot({ status }: { status: string }) {
  const cls =
    status === "online"
      ? "rd-dot rd-ok rd-pulse"
      : status === "degraded"
        ? "rd-dot rd-warn"
        : "rd-dot rd-down";
  return <span className={cls} />;
}

export { StatusDot };
