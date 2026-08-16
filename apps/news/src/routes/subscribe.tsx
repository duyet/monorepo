import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useLang } from "../lib/lang-context";
import type { Lang } from "../lib/types";

export const Route = createFileRoute("/subscribe")({
  validateSearch: (
    search: Record<string, unknown>
  ): { unsubscribe?: string } =>
    typeof search.unsubscribe === "string"
      ? { unsubscribe: search.unsubscribe }
      : {},
  component: SubscribePage,
});

function UnsubscribeView({ token, lang }: { token: string; lang: Lang }) {
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">(
    "idle"
  );

  const doUnsubscribe = async () => {
    setStatus("loading");
    try {
      const res = await fetch(
        `/api/subscribe?token=${encodeURIComponent(token)}`,
        { method: "DELETE" }
      );
      setStatus(res.ok ? "done" : "error");
    } catch {
      setStatus("error");
    }
  };

  if (status === "idle") {
    void doUnsubscribe();
  }

  return (
    <div className="mx-auto max-w-md py-16 text-center">
      <h1 className="text-2xl font-bold tracking-tight">
        {lang === "vi" ? "Hủy đăng ký" : "Unsubscribe"}
      </h1>
      <p className="mt-3 text-sm text-muted-foreground">
        {status === "loading" &&
          (lang === "vi" ? "Đang xử lý…" : "Processing…")}
        {status === "done" &&
          (lang === "vi"
            ? "Bạn đã hủy đăng ký thành công."
            : "You have been unsubscribed.")}
        {status === "error" &&
          (lang === "vi"
            ? "Có lỗi xảy ra, vui lòng thử lại."
            : "Something went wrong, please try again.")}
      </p>
    </div>
  );
}

function SubscribePage() {
  const lang = useLang();
  const { unsubscribe } = Route.useSearch();

  const [email, setEmail] = useState("");
  const [prefLang, setPrefLang] = useState<Lang>(lang);
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">(
    "idle"
  );

  if (unsubscribe) {
    return <UnsubscribeView token={unsubscribe} lang={lang} />;
  }

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    try {
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, lang: prefLang }),
      });
      setStatus(res.ok ? "done" : "error");
    } catch {
      setStatus("error");
    }
  };

  return (
    <div className="mx-auto max-w-md py-12">
      <h1 className="text-2xl font-bold tracking-tight">
        {lang === "vi" ? "Nhận bản tin hằng ngày" : "Daily AI News Digest"}
      </h1>
      <p className="mt-3 text-sm text-muted-foreground">
        {lang === "vi"
          ? "Tối đa 5 tin nổi bật nhất mỗi ngày, gửi thẳng vào hộp thư của bạn."
          : "Top 5 stories a day, delivered straight to your inbox."}
      </p>

      {status === "done" ? (
        <p className="mt-6 rounded-md border border-border bg-muted p-4 text-sm">
          {lang === "vi"
            ? "Đăng ký thành công! Bạn sẽ nhận bản tin vào ngày mai."
            : "Subscribed! You'll get your first digest tomorrow."}
        </p>
      ) : (
        <form onSubmit={onSubmit} className="mt-6 space-y-4">
          <div>
            <label htmlFor="email" className="mb-1 block text-sm font-medium">
              Email
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:border-accent"
            />
          </div>

          <fieldset className="flex gap-4 text-sm">
            <legend className="mb-1 block font-medium">
              {lang === "vi" ? "Ngôn ngữ" : "Language"}
            </legend>
            <label className="flex items-center gap-1.5">
              <input
                type="radio"
                name="lang"
                checked={prefLang === "vi"}
                onChange={() => setPrefLang("vi")}
              />
              Tiếng Việt
            </label>
            <label className="flex items-center gap-1.5">
              <input
                type="radio"
                name="lang"
                checked={prefLang === "en"}
                onChange={() => setPrefLang("en")}
              />
              English
            </label>
          </fieldset>

          <button
            type="submit"
            disabled={status === "loading"}
            className="rounded-md bg-accent px-4 py-2 text-sm font-semibold text-accent-foreground disabled:opacity-50"
          >
            {status === "loading"
              ? lang === "vi"
                ? "Đang gửi…"
                : "Submitting…"
              : lang === "vi"
                ? "Đăng ký"
                : "Subscribe"}
          </button>

          {status === "error" && (
            <p className="text-sm text-destructive">
              {lang === "vi"
                ? "Có lỗi xảy ra, vui lòng thử lại."
                : "Something went wrong, please try again."}
            </p>
          )}
        </form>
      )}
    </div>
  );
}
