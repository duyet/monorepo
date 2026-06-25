export function CornerDecoration() {
  const corners = [
    { left: '-7px', top: '-7px' },
    { right: '-7px', top: '-7px' },
    { left: '-7px', bottom: '-7px' },
    { right: '-7px', bottom: '-7px' },
  ]

  return (
    <>
      {corners.map((position, i) => (
        <div
          key={i}
          className="pointer-events-none absolute z-30 bg-[var(--rd-bg)] rd-bento-corner"
          style={{
            width: '14px',
            height: '14px',
            border: '1px solid var(--rd-border)',
            borderRadius: '3px',
            ...position,
          }}
          aria-hidden="true"
        />
      ))}
    </>
  )
}
