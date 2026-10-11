import {
  type CSSProperties,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { countEm, fitCountPx, PROBE_PX } from "../lib/count";

interface AnimatedCounterProps {
  target: number;
  duration?: number;
}

function easeOutQuad(t: number): number {
  return t * (2 - t);
}

/**
 * `useLayoutEffect` warns when it renders on the server, and this app
 * prerenders. The fit only ever runs in a browser either way.
 */
const useBrowserLayoutEffect =
  typeof window === "undefined" ? useEffect : useLayoutEffect;

export function AnimatedCounter({
  target,
  duration = 700,
}: AnimatedCounterProps) {
  const [display, setDisplay] = useState("0");
  /** null means "use the CSS size", which is what the prerendered HTML has. */
  const [fittedPx, setFittedPx] = useState<number | null>(null);
  const started = useRef(false);
  const box = useRef<HTMLSpanElement>(null);
  const probe = useRef<HTMLSpanElement>(null);

  /**
   * Every value the animation passes through. Tabular digits and the commas
   * between them are the same width, so the final string is as wide as any of
   * them and the size never shifts mid-count.
   */
  const finalText = target.toLocaleString("en-US");

  useEffect(() => {
    if (started.current) return;
    started.current = true;

    const start = performance.now();
    let raf: number;

    const tick = (now: number) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = easeOutQuad(progress);
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

  useBrowserLayoutEffect(() => {
    const frame = box.current;
    const ruler = probe.current;
    if (!frame || !ruler) return;

    const fit = () => {
      const available = frame.clientWidth;
      const textWidth = ruler.getBoundingClientRect().width;
      setFittedPx((prev) => {
        const next = fitCountPx(available, textWidth);
        return prev === next ? prev : next;
      });
    };

    fit();
    // The hero box is the only thing whose width we fit against, so a width
    // change (rotation, split view, a rotated phone) re-fits on its own.
    const observer = new ResizeObserver(fit);
    observer.observe(frame);
    // Inter arrives after first paint and it is the font that has to fit, so
    // the measured size waits for it rather than trusting the fallback.
    let cancelled = false;
    void document.fonts.ready.then(() => {
      // The effect can already have been cleaned up (a target change unmounts
      // and remounts the count), and `frame`/`ruler` would be stale by then.
      if (!cancelled) fit();
    });
    return () => {
      cancelled = true;
      observer.disconnect();
    };
  }, [finalText]);

  return (
    <span
      className="burns-count-fit"
      style={{ "--count-em": countEm(finalText) } as CSSProperties}
    >
      <span
        className="burns-count"
        ref={box}
        style={fittedPx === null ? undefined : { fontSize: `${fittedPx}px` }}
      >
        {display}
      </span>
      {/*
        Measured, never painted: the same string at a fixed size, so the ratio
        between its width and the hero's is the count's fit ratio.
      */}
      <span
        className="burns-count-probe"
        ref={probe}
        aria-hidden="true"
        style={{ fontSize: PROBE_PX }}
      >
        {finalText}
      </span>
    </span>
  );
}
