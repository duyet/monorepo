import { Button } from "@duyet/components";
import { useState } from "react";
import {
  DEFAULT_SHARE_TEXT,
  shareIntentUrl,
  SITE_URL,
} from "../lib/scoring";

export function ShareBar() {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(SITE_URL);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      setCopied(false);
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Button asChild size="sm">
        <a
          href={shareIntentUrl(DEFAULT_SHARE_TEXT)}
          target="_blank"
          rel="noreferrer"
        >
          Post on X
        </a>
      </Button>
      <Button size="sm" type="button" variant="outline" onClick={copy}>
        {copied ? "Copied" : "Copy link"}
      </Button>
    </div>
  );
}
