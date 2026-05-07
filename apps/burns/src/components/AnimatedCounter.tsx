import { useEffect, useRef, useState } from "react";

interface AnimatedCounterProps {
  target: number;
  duration?: number;
}

function easeOutExponential(t: number): number {
  return t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
}

export function AnimatedCounter({ target, duration = 2000 }: AnimatedCounterProps) {
  const [display, setDisplay] = useState("0");
  const started = useRef(false);

  useEffect(() => {
    if (started.current) return;
    started.current = true;

    const start = performance.now();
    let raf: number;

    const tick = (now: number) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = easeOutExponential(progress);
      const current = Math.floor(eased * target);
      setDisplay(current.toLocaleString("en-US"));

      if (progress < 1) {
        raf = requestAnimationFrame(tick);
      } else {
        setDisplay(target.toLocaleString("en-US"));
      }
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, duration]);

  return (
    <span
      style={{
        display: "block",
        textAlign: "center",
        fontFamily: "var(--serif)",
        fontWeight: 400,
        letterSpacing: "-0.03em",
        lineHeight: 1.05,
        fontVariantNumeric: "tabular-nums",
        fontSize: "clamp(2.5rem, 12vw, 9rem)",
        color: "var(--ink)",
      }}
    >
      {display}
    </span>
  );
}
