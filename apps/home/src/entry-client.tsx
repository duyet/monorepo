import { StartClient } from "@tanstack/react-start/client";
import { hydrateRoot } from "react-dom/client";

const w = window as Window & { __CF_ENTRY_RAN__?: boolean };
if (w.__CF_ENTRY_RAN__) {
  // Cloudflare retry script may re-import this module; do not hydrate twice.
} else {
  w.__CF_ENTRY_RAN__ = true;
  hydrateRoot(document, <StartClient />);
}
