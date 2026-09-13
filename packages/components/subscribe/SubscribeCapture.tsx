import {
  type CSSProperties,
  type FormEvent,
  type JSX,
  useEffect,
  useState,
} from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";

function dither(svg: string): string {
  return `url("data:image/svg+xml,${encodeURIComponent(svg)}")`;
}

const SUBSCRIBE_DITHER = dither(
  `<svg xmlns="http://www.w3.org/2000/svg" width="7" height="7"><circle cx="1.2" cy="2" r=".7" fill="#c45a2d"/><circle cx="5" cy="5.2" r=".55" fill="#c45a2d" opacity=".7"/><circle cx="4.5" cy="1.2" r=".45" fill="#c45a2d" opacity=".5"/></svg>`
);

export const SUBSCRIBE_STORAGE_KEY = "duyet.newsletter.subscribed";

export type SubscribeSource = "blog" | "news" | "home";

export interface SubscribeCaptureProps {
  /** blog (default), news, or home — stored with the subscriber. */
  source?: SubscribeSource;
  endpoint?: string;
  variant?: "button" | "inline";
  className?: string;
  /** Fired after a successful subscribe (and when already subscribed on mount is not). */
  onSubscribed?: () => void;
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
}): JSX.Element {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<Status>("idle");

  async function onSubmit(event: FormEvent): Promise<void> {
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
      <p className="text-[13px] text-[var(--rd-text-2)]">
        You&apos;re on the list.
      </p>
    );
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-2">
      <input
        aria-label="Email address"
        type="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="you@example.com"
        className="h-9 w-full rounded-[8px] border border-[var(--rd-border)] bg-[var(--rd-bg)] px-3 text-[13px] text-[var(--rd-text)] outline-none focus:border-[var(--rd-text)]"
      />
      <button
        type="submit"
        disabled={status === "loading"}
        className="h-9 rounded-[8px] bg-[var(--rd-text)] px-3 text-[13px] font-medium text-[var(--rd-bg)] disabled:opacity-50"
      >
        {status === "loading" ? "Subscribing…" : "Subscribe"}
      </button>
      {status === "error" && (
        <p className="text-[12px] text-[var(--rd-down,#b91c1c)]">
          Couldn&apos;t subscribe. Try again.
        </p>
      )}
    </form>
  );
}

function SubscribeDitherPanel(): JSX.Element {
  return (
    <div
      aria-hidden
      className="relative max-sm:hidden min-h-full self-stretch overflow-hidden bg-[color-mix(in_srgb,var(--rd-accent,#c45a2d)_18%,var(--rd-accent-bg,#fbeee7))] before:pointer-events-none before:absolute before:inset-0 before:bg-[radial-gradient(120%_90%_at_12%_8%,color-mix(in_srgb,var(--rd-accent,#c45a2d)_40%,transparent),transparent_72%)] after:pointer-events-none after:absolute after:inset-0 after:bg-repeat after:opacity-25 after:[background-image:var(--subscribe-dither)] after:[mask-image:linear-gradient(to_top,transparent_18%,black_70%)]"
      style={{ "--subscribe-dither": SUBSCRIBE_DITHER } as CSSProperties}
    >
      <div className="relative z-10 mt-auto flex min-h-[13.5rem] flex-col justify-end gap-1 bg-[linear-gradient(to_top,color-mix(in_srgb,var(--rd-accent-bg,#fbeee7)_92%,transparent)_0%,transparent_58%)] p-5">
        <p className="font-[family-name:var(--font-display)] text-[11px] tracking-[0.16em] text-[var(--rd-accent-ink,#b54a1f)] uppercase">
          duyet.net
        </p>
        <p className="font-[family-name:var(--font-display)] text-[1.35rem] leading-[1.05] tracking-[-0.03em] text-[var(--rd-accent-ink,#b54a1f)]">
          Get updates
        </p>
      </div>
    </div>
  );
}

/**
 * Small subscribe control. Research: auto-open modals bounce readers;
 * a quiet button + optional inline block converts with less friction.
 */
export function SubscribeCapture({
  source = "blog",
  endpoint = "https://aidr.today/api/subscribe",
  variant = "button",
  className,
  onSubscribed,
}: SubscribeCaptureProps) {
  const [subscribed, setSubscribed] = useState(false);
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setSubscribed(readSubscribed());
    setMounted(true);
  }, []);

  function markSubscribed(): void {
    setSubscribed(true);
    onSubscribed?.();
  }

  if (subscribed && variant === "button") return null;

  const triggerClass = `rounded-[8px] border border-[var(--rd-border)] bg-[var(--rd-bg)] px-2.5 py-1 text-[12px] font-medium text-[var(--rd-text)] hover:border-[color-mix(in_srgb,var(--rd-text)_40%,var(--rd-border))] ${className ?? ""}`;

  // Radix Dialog crashes SSR here (useRef of null) and Start then paints
  // an empty <main>. Same markup on server and first client paint.
  if (variant === "button" && !mounted) {
    return (
      <button type="button" className={triggerClass}>
        Subscribe
      </button>
    );
  }

  if (variant === "inline") {
    if (subscribed) return null;

    return (
      <div className={className}>
        <p className="font-[var(--font-mono)] text-xl font-semibold tracking-tight text-[var(--rd-text,#1a1a1a)] mb-4">
          Get updates
        </p>
        <p className="mb-3 max-w-sm text-[13.5px] leading-snug text-[var(--rd-text-2,#525252)]">
          A note when I publish something worth reading. No dump.
        </p>
        <div className="max-w-xs">
          <SubscribeForm
            source={source}
            endpoint={endpoint}
            onDone={markSubscribed}
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
          className={triggerClass}
        >
          Subscribe
        </button>
      </DialogTrigger>
      <DialogContent
        className="grid w-[min(540px,calc(100vw-2rem))] gap-0 overflow-hidden rounded-[8px] border border-[var(--rd-border)] bg-[var(--rd-bg)] p-0 shadow-none sm:max-w-[540px] sm:grid-cols-[minmax(140px,0.42fr)_1fr]"
        showCloseButton
      >
        <SubscribeDitherPanel />
        <div className="flex flex-col gap-3 p-5 sm:p-6">
          <DialogTitle className="pr-8 text-[15px] font-medium tracking-tight text-[var(--rd-text)]">
            Get updates
          </DialogTitle>
          <DialogDescription className="text-[13px] leading-5 text-[var(--rd-text-2)]">
            Occasional notes when I publish something worth reading.
          </DialogDescription>
          <SubscribeForm
            source={source}
            endpoint={endpoint}
            onDone={() => {
              markSubscribed();
              setOpen(false);
            }}
          />
          <p className="text-[11px] text-[var(--rd-text-3)]">
            Unsubscribe anytime.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
