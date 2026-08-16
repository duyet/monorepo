import { useEffect, useRef } from "react";

/**
 * Attach to any horizontally-scrollable element (chip rows, the /about
 * pipeline diagram, the runs table) so mouse WHEEL scrolling moves it
 * sideways instead of doing nothing. React's onWheel is passive, so
 * preventDefault() inside it is silently ignored — the listener has to be
 * attached manually with { passive: false }.
 *
 * Also drives the `.edge-fade-x` class (styles.css): sets the `--fade-l`
 * and `--fade-r` CSS custom properties to 24px only on the side(s) that
 * still have content to scroll to, so the mask never fades an edge that's
 * already fully visible.
 */
export function useHorizontalScroll<
  T extends HTMLElement = HTMLDivElement,
>(): React.RefObject<T | null> {
  const ref = useRef<T | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const update = () => {
      const canScrollLeft = el.scrollLeft > 0;
      const canScrollRight =
        el.scrollLeft + el.clientWidth < el.scrollWidth - 1;
      el.style.setProperty("--fade-l", canScrollLeft ? "24px" : "0px");
      el.style.setProperty("--fade-r", canScrollRight ? "24px" : "0px");
    };

    const onWheel = (e: WheelEvent) => {
      if (e.deltaY && !e.deltaX) {
        el.scrollLeft += e.deltaY;
        e.preventDefault();
      }
    };

    update();
    el.addEventListener("wheel", onWheel, { passive: false });
    el.addEventListener("scroll", update, { passive: true });
    const resizeObserver = new ResizeObserver(update);
    resizeObserver.observe(el);

    return () => {
      el.removeEventListener("wheel", onWheel);
      el.removeEventListener("scroll", update);
      resizeObserver.disconnect();
    };
  }, []);

  return ref;
}
