import { StartClient } from "@tanstack/react-start/client";
import { hydrateRoot } from "react-dom/client";

(window as Window & { __CF_ENTRY_RAN__?: boolean }).__CF_ENTRY_RAN__ = true;

hydrateRoot(document, <StartClient />);
