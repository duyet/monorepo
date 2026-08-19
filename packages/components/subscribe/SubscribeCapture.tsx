import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { useEffect, useState, type FormEvent } from "react";

export const SUBSCRIBE_STORAGE_KEY = "duyet.newsletter.subscribed";

export type SubscribeSource = "blog" | "news" | "home";

export interface SubscribeCaptureProps {
  /** blog (default), news, or home — stored with the subscriber. */
  source?: SubscribeSource;
  endpoint?: string;
  variant?: "button" | "inline";
  className?: string;
}

type Status = "idle" | "loading" | "done" | "error";

function timezone(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone;
  } catch {
    return "Asia/Ho_Chi_Minh";
  }
}

export function readSubscribed(): boolean {
  try {
    return localStorage.getItem(SUBSCRIBE_STORAGE_KEY) === "1";
  } catch {
    return false;
  }
}

export function writeSubscribed(): void {
  try {
    localStorage.setItem(SUBSCRIBE_STORAGE_KEY, "1");
  } catch {
    // ignore quota / private mode
  }
}

function SubscribeForm({
  source,
  endpoint,
  onDone,
}: {
  source: SubscribeSource;
  endpoint: string;
  onDone: () => void;
}) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<Status>("idle");

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setStatus("loading");
    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          lang: "en",
          timezone: timezone(),
          source,
        }),
      });
      if (!res.ok) {
        setStatus("error");
        return;
      }
      writeSubscribed();
      setStatus("done");
      onDone();
    } catch {
      setStatus("error");
    }
  }

  if (status === "done") {
    return (
      <p className="text-[13px] text-neutral-600">You&apos;re on the list.</p>
    );
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-2">
      <input
        type="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="you@example.com"
        className="h-9 w-full rounded-[8px] border border-black/15 bg-white px-3 text-[13px] text-[#1a1a1a] outline-none focus:border-black"
      />
      <button
        type="submit"
        disabled={status === "loading"}
        className="h-9 rounded-[8px] bg-[#1a1a1a] px-3 text-[13px] font-medium text-white disabled:opacity-50"
      >
        {status === "loading" ? "Subscribing…" : "Subscribe"}
      </button>
      {status === "error" && (
        <p className="text-[12px] text-red-700">
          Couldn&apos;t subscribe. Try again.
        </p>
      )}
    </form>
  );
}

/**
 * Small subscribe control. Research: auto-open modals bounce readers;
 * a quiet button + optional inline block converts with less friction.
 */
export function SubscribeCapture({
  source = "blog",
  endpoint = "https://news.duyet.net/api/subscribe",
  variant = "button",
  className,
}: SubscribeCaptureProps) {
  const [subscribed, setSubscribed] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setSubscribed(readSubscribed());
  }, []);

  if (subscribed && variant === "button") return null;

  if (variant === "inline") {
    if (subscribed) {
      return (
        <p className={`text-[13px] text-neutral-500 ${className ?? ""}`}>
          You&apos;re subscribed for updates.
        </p>
      );
    }
    return (
      <div className={`my-10 border-t border-black/10 pt-8 ${className ?? ""}`}>
        <p className="text-[13px] font-medium tracking-tight text-[#1a1a1a]">
          Get updates
        </p>
        <p className="mt-1 mb-3 max-w-sm text-[13px] leading-5 text-neutral-600">
          A note when I publish something worth reading. No dump.
        </p>
        <div className="max-w-xs">
          <SubscribeForm
            source={source}
            endpoint={endpoint}
            onDone={() => setSubscribed(true)}
          />
        </div>
      </div>
    );
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button
          type="button"
          className={`rounded-[8px] border border-black/15 bg-white px-2.5 py-1 text-[12px] font-medium text-[#1a1a1a] hover:border-black/40 ${className ?? ""}`}
        >
          Subscribe
        </button>
      </DialogTrigger>
      <DialogContent
        className="w-[min(360px,calc(100vw-2rem))] gap-3 rounded-[8px] border border-black/10 bg-white p-5 shadow-none sm:max-w-[360px]"
        showCloseButton
      >
        <DialogTitle className="text-[15px] font-medium tracking-tight text-[#1a1a1a]">
          Get updates
        </DialogTitle>
        <DialogDescription className="text-[13px] leading-5 text-neutral-600">
          Occasional notes when I publish something worth reading.
        </DialogDescription>
        <SubscribeForm
          source={source}
          endpoint={endpoint}
          onDone={() => {
            setSubscribed(true);
            setOpen(false);
          }}
        />
        <p className="text-[11px] text-neutral-400">Unsubscribe anytime.</p>
      </DialogContent>
    </Dialog>
  );
}
