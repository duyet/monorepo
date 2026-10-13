import { useEffect, useState } from "react";

interface AnimatedCounterProps {
  target: number;
  duration?: number;
}

function easeOutQuart(t: number): number {
  return 1 - (1 - t) ** 4;
}

/**
 * The exact total, counted up from 0. Prerender and first paint both show 0, so
 * hydration matches; the final value is always in the DOM for screen readers.
 */
export function AnimatedCounter({
  target,
  duration = 900,
}: AnimatedCounterProps) {
  const [value, setValue] = useState(0);
  const finalText = target.toLocaleString("en-US");

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setValue(target);
      return;
    }

    const start = performance.now();
    let raf = 0;
    const tick = (now: number) => {
      const progress = Math.min((now - start) / duration, 1);
      setValue(Math.round(target * easeOutQuart(progress)));
      if (progress < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, duration]);

  return (
    <div className="burns-count">
      <span aria-hidden="true">{value.toLocaleString("en-US")}</span>
      {/* Screen readers get the final value, not every frame of the count. */}
      <span className="burns-sr-only">{finalText}</span>
    </div>
  );
}
