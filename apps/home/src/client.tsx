import { StartClient } from "@tanstack/react-start/client";
import { StrictMode, startTransition } from "react";
import { hydrateRoot } from "react-dom/client";

/**
 * Mark the entry as executed immediately, then hydrate after first paint.
 * `__CF_ENTRY_RAN__` means the module ran (not that hydrateRoot finished) so
 * the 800ms Cloudflare retry does not import a second copy and blank the page.
 */
function afterFirstPaint(fn: () => void) {
  const run = () => {
    if (typeof requestIdleCallback === "function") {
      requestIdleCallback(() => fn(), { timeout: 1500 });
      return;
    }
    setTimeout(fn, 0);
  };
  if (document.readyState === "complete") run();
  else window.addEventListener("load", run, { once: true });
}

const w = window as Window & { __CF_ENTRY_RAN__?: boolean };
if (w.__CF_ENTRY_RAN__) {
  // Cloudflare retry may re-import this file with ?cf_retry= (a new ESM
  // instance). Skip so hydrateRoot does not run twice and blank the page.
} else {
  w.__CF_ENTRY_RAN__ = true;
  afterFirstPaint(() => {
    startTransition(() => {
      hydrateRoot(
        document,
        <StrictMode>
          <StartClient />
        </StrictMode>,
      );
    });
  });
}
