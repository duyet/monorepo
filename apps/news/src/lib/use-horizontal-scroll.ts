import { useEffect, useRef } from "react";

/**
 * Attach to any horizontally-scrollable element (chip rows, the /about
 * pipeline diagram, the runs table) so mouse WHEEL scrolling moves it
 * sideways instead of doing nothing. React's onWheel is passive, so
 * preventDefault() inside it is silently ignored — the listener has to be
 * attached manually with { passive: false }.
 *
 * Pair with the `.edge-fade-x` class (styles.css) for the left/right fade
 * affordance indicating there's more to scroll.
 */
export function useHorizontalScroll<
  T extends HTMLElement = HTMLDivElement,
>(): React.RefObject<T | null> {
  const ref = useRef<T | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const onWheel = (e: WheelEvent) => {
      if (e.deltaY && !e.deltaX) {
        el.scrollLeft += e.deltaY;
        e.preventDefault();
      }
    };

    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, []);

  return ref;
}
