import { ErrorBoundary } from "@duyet/components";
import { useEffect, useState } from "react";
import { useClerkModule } from "../lib/clerk-user";
import type { SuggestionSummary } from "../lib/suggest-fn";
import { fetchSuggestions, submitSuggestion } from "../lib/suggest-fn";
import type { Lang } from "../lib/types";

function SuggestForm({
  itemId,
  field,
  lang,
  userId,
  userName,
  initialText,
  onInitialTextConsumed,
}: {
  itemId: string;
  field: "title" | "summary";
  lang: Lang;
  userId: string;
  userName: string;
  /** Set by the selection-to-suggest floating button — opens the form
   * pre-filled with the selected text as quoted context. */
  initialText?: string;
  onInitialTextConsumed?: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">(
    "idle"
  );
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!initialText) return;
    setOpen(true);
    setText(`"${initialText}" → `);
    onInitialTextConsumed?.();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialText]);

  if (status === "sent") {
    return (
      <span className="text-xs text-muted-foreground">
        {lang === "vi"
          ? "Đã gửi — đang chờ duyệt"
          : "Submitted — pending review"}
      </span>
    );
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="text-xs text-accent underline underline-offset-2 hover:no-underline"
      >
        {lang === "vi" ? "Góp ý bản dịch" : "Suggest better translation"}
      </button>
    );
  }

  return (
    <form
      className="mt-2 w-full max-w-full space-y-2"
      onSubmit={async (e) => {
        e.preventDefault();
        if (!text.trim()) return;
        setStatus("sending");
        setError(null);
        try {
          await submitSuggestion({
            data: {
              item_id: itemId,
              field,
              suggestion: text,
              user_id: userId,
              user_name: userName,
            },
          });
          setStatus("sent");
        } catch (err) {
          setStatus("error");
          setError(err instanceof Error ? err.message : null);
        }
      }}
    >
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={3}
        maxLength={2000}
        placeholder={
          lang === "vi"
            ? "Đề xuất bản dịch tốt hơn..."
            : "Suggest a better translation..."
        }
        className="min-h-16 w-full max-w-full resize-y rounded-md border border-border bg-background p-2 text-sm"
      />
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="submit"
          disabled={status === "sending" || !text.trim()}
          className="rounded-md bg-accent px-2 py-1 text-xs font-semibold text-accent-foreground disabled:opacity-50"
        >
          {lang === "vi" ? "Gửi" : "Submit"}
        </button>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="rounded-md px-2 py-1 text-xs text-muted-foreground hover:text-foreground"
        >
          {lang === "vi" ? "Huỷ" : "Cancel"}
        </button>
        {status === "error" && (
          <span className="text-xs text-red-600">
            {error ?? (lang === "vi" ? "Lỗi, thử lại." : "Failed, try again.")}
          </span>
        )}
      </div>
    </form>
  );
}

export function SuggestTranslation(props: {
  itemId: string;
  field: "title" | "summary";
  lang: Lang;
  initialText?: string;
  onInitialTextConsumed?: () => void;
}) {
  // Any Clerk failure degrades to nothing rendered — never the router's
  // full-page error screen.
  return (
    <ErrorBoundary fallback={null}>
      <SuggestTranslationInner {...props} />
    </ErrorBoundary>
  );
}

function SuggestTranslationInner({
  itemId,
  field,
  lang,
  initialText,
  onInitialTextConsumed,
}: {
  itemId: string;
  field: "title" | "summary";
  lang: Lang;
  initialText?: string;
  onInitialTextConsumed?: () => void;
}) {
  const { mod, publishableKey } = useClerkModule();

  const signInHint = (
    <span className="text-xs text-muted-foreground">
      {lang === "vi"
        ? "Đăng nhập để góp ý, chỉnh sửa"
        : "Sign in to suggest edits"}
    </span>
  );

  if (!publishableKey || !mod) return signInHint;

  const { SignedIn, SignedOut, useUser } = mod;

  // No own <ClerkProvider> here — __root.tsx mounts the single app-wide
  // one; a second provider crashes the whole page.
  return (
    <>
      <SignedOut>{signInHint}</SignedOut>
      <SignedIn>
        <SuggestFormGate
          itemId={itemId}
          field={field}
          lang={lang}
          useUser={useUser}
          initialText={initialText}
          onInitialTextConsumed={onInitialTextConsumed}
        />
      </SignedIn>
    </>
  );
}

function SuggestFormGate({
  itemId,
  field,
  lang,
  useUser,
  initialText,
  onInitialTextConsumed,
}: {
  itemId: string;
  field: "title" | "summary";
  lang: Lang;
  useUser: any;
  initialText?: string;
  onInitialTextConsumed?: () => void;
}) {
  const { user } = useUser();
  if (!user) return null;
  const userName = user.fullName ?? user.username ?? "user";
  return (
    <SuggestForm
      itemId={itemId}
      field={field}
      lang={lang}
      userId={user.id}
      userName={userName}
      initialText={initialText}
      onInitialTextConsumed={onInitialTextConsumed}
    />
  );
}

export function SuggestionBadge({
  itemId,
  expanded,
  lang,
}: {
  itemId: string;
  expanded: boolean;
  lang: Lang;
}) {
  const [suggestions, setSuggestions] = useState<SuggestionSummary[] | null>(
    null
  );

  useEffect(() => {
    if (!expanded || suggestions !== null) return;
    let cancelled = false;
    fetchSuggestions({ data: { item_id: itemId } })
      .then((res) => {
        if (!cancelled) setSuggestions(res);
      })
      .catch(() => {
        if (!cancelled) setSuggestions([]);
      });
    return () => {
      cancelled = true;
    };
  }, [expanded, itemId, suggestions]);

  if (!expanded || !suggestions || suggestions.length === 0) return null;

  const names = [...new Set(suggestions.map((s) => s.user_name))].slice(0, 3);
  return (
    <span className="text-xs text-muted-foreground">
      {suggestions.length}{" "}
      {lang === "vi"
        ? "góp ý"
        : suggestions.length === 1
          ? "suggestion"
          : "suggestions"}
      {names.length > 0 && <> · {names.join(", ")}</>}
    </span>
  );
}
