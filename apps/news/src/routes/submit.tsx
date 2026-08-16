import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useClerkModule } from "../lib/clerk-user";
import { useLang } from "../lib/lang-context";
import {
  fetchMySubmissions,
  type Submission,
  submitStory,
} from "../lib/submit-fn";

export const Route = createFileRoute("/submit")({
  head: () => ({
    meta: [{ title: "Submit a story | AI News" }],
  }),
  component: SubmitPage,
});

function statusLabel(status: Submission["status"], lang: "en" | "vi") {
  if (lang === "vi") {
    return { pending: "Đang chờ", accepted: "Đã duyệt", rejected: "Từ chối" }[
      status
    ];
  }
  return { pending: "Pending", accepted: "Accepted", rejected: "Rejected" }[
    status
  ];
}

function SubmissionsList({
  userId,
  lang,
}: {
  userId: string;
  lang: "en" | "vi";
}) {
  const [items, setItems] = useState<Submission[] | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetchMySubmissions({ data: { user_id: userId } })
      .then((res) => {
        if (!cancelled) setItems(res);
      })
      .catch(() => {
        if (!cancelled) setItems([]);
      });
    return () => {
      cancelled = true;
    };
  }, [userId]);

  if (!items || items.length === 0) return null;

  return (
    <div className="mt-8 space-y-2">
      <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
        {lang === "vi" ? "Bài đã gửi" : "Your submissions"}
      </h2>
      {items.map((s) => (
        <div
          key={s.id}
          className="flex flex-wrap items-baseline gap-x-2 gap-y-1 border-b border-border py-2 text-sm"
        >
          <span
            className={`shrink-0 rounded-full border px-2 py-0 text-xs ${
              s.status === "accepted"
                ? "border-accent text-accent"
                : s.status === "rejected"
                  ? "border-border text-muted-foreground"
                  : "border-border text-muted-foreground"
            }`}
          >
            {statusLabel(s.status, lang)}
          </span>
          <span className="min-w-0 flex-1 truncate">{s.title}</span>
          {s.status === "rejected" && s.review_note && (
            <span className="w-full text-xs text-muted-foreground">
              {s.review_note}
            </span>
          )}
        </div>
      ))}
    </div>
  );
}

function SubmitForm({
  userId,
  userName,
}: {
  userId: string;
  userName: string;
}) {
  const lang = useLang();
  const [url, setUrl] = useState("");
  const [title, setTitle] = useState("");
  const [note, setNote] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">(
    "idle"
  );
  const [error, setError] = useState<string | null>(null);

  if (status === "sent") {
    return (
      <div className="space-y-2 rounded-md border border-border bg-muted/40 p-4 text-sm">
        <p>
          {lang === "vi"
            ? "Bài của bạn sẽ được AI thẩm định trước khi lên trang."
            : "Your story will be AI-reviewed before it appears on the site."}
        </p>
        <p className="text-muted-foreground">
          {lang === "vi"
            ? "Bài gửi sẽ được AI thẩm định và chấm điểm. Không phải bài nào cũng được đăng — chỉ những tin được đánh giá là liên quan và chất lượng mới xuất hiện trên trang."
            : "Submissions are reviewed and rated by AI. Not all submissions will be published — only stories judged relevant and high-quality appear in the feed."}
        </p>
      </div>
    );
  }

  return (
    <form
      className="space-y-3"
      onSubmit={async (e) => {
        e.preventDefault();
        setStatus("sending");
        setError(null);
        try {
          await submitStory({
            data: { url, title, note, user_id: userId, user_name: userName },
          });
          setStatus("sent");
        } catch (err) {
          setStatus("error");
          setError(err instanceof Error ? err.message : "Failed to submit");
        }
      }}
    >
      <label className="block text-sm">
        <span className="mb-1 block text-xs font-semibold text-muted-foreground">
          URL
        </span>
        <input
          type="url"
          required
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://..."
          className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
        />
      </label>
      <label className="block text-sm">
        <span className="mb-1 block text-xs font-semibold text-muted-foreground">
          {lang === "vi" ? "Tiêu đề" : "Title"}
        </span>
        <input
          type="text"
          required
          minLength={5}
          maxLength={300}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
        />
      </label>
      <label className="block text-sm">
        <span className="mb-1 block text-xs font-semibold text-muted-foreground">
          {lang === "vi" ? "Ghi chú (không bắt buộc)" : "Note (optional)"}
        </span>
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          rows={2}
          maxLength={1000}
          className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
        />
      </label>
      <p className="text-xs text-muted-foreground">
        {lang === "vi"
          ? "Bài gửi sẽ được AI thẩm định và chấm điểm. Không phải bài nào cũng được đăng — chỉ những tin được đánh giá là liên quan và chất lượng mới xuất hiện trên trang."
          : "Submissions are reviewed and rated by AI. Not all submissions will be published — only stories judged relevant and high-quality appear in the feed."}
      </p>
      <button
        type="submit"
        disabled={status === "sending"}
        className="rounded-md bg-accent px-4 py-2 text-sm font-semibold text-accent-foreground disabled:opacity-50"
      >
        {lang === "vi" ? "Gửi bài" : "Submit"}
      </button>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <SubmissionsList userId={userId} lang={lang} />
    </form>
  );
}

function SubmitGate({ useUser }: { useUser: any }) {
  const { user } = useUser();
  const lang = useLang();
  if (!user) {
    return (
      <p className="text-sm text-muted-foreground">
        {lang === "vi" ? "Đăng nhập để gửi bài." : "Sign in to submit a story."}
      </p>
    );
  }
  const userName = user.fullName ?? user.username ?? "user";
  return <SubmitForm userId={user.id} userName={userName} />;
}

function SubmitPage() {
  const lang = useLang();
  const { mod, publishableKey } = useClerkModule();

  return (
    <div className="py-6">
      <h1 className="text-xl font-bold">
        {lang === "vi" ? "Gửi bài viết" : "Submit a story"}
      </h1>
      <p className="mt-1 text-sm text-muted-foreground">
        {lang === "vi"
          ? "Chia sẻ một bài viết về AI. Bài của bạn sẽ được AI thẩm định trước khi lên trang."
          : "Share an AI story. It'll be AI-reviewed before it appears on the site."}
      </p>

      <div className="mt-6 max-w-lg">
        {!publishableKey || !mod ? (
          <p className="text-sm text-muted-foreground">
            {lang === "vi"
              ? "Đăng nhập để gửi bài."
              : "Sign in to submit a story."}
          </p>
        ) : (
          <mod.ClerkProvider publishableKey={publishableKey}>
            <mod.SignedOut>
              <p className="text-sm text-muted-foreground">
                {lang === "vi"
                  ? "Đăng nhập để gửi bài."
                  : "Sign in to submit a story."}
              </p>
            </mod.SignedOut>
            <mod.SignedIn>
              <SubmitGate useUser={mod.useUser} />
            </mod.SignedIn>
          </mod.ClerkProvider>
        )}
      </div>
    </div>
  );
}
