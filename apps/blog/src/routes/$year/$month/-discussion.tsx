import { distanceToNow } from "@duyet/libs/date";
import { type ReactNode, useEffect, useState } from "react";
import {
  fetchHnThread,
  type HnComment,
  type HnThread,
  hnItemId,
} from "@/lib/hn-thread";

const ALLOWED = new Set(["P", "A", "I", "EM", "B", "STRONG", "PRE", "CODE"]);

/**
 * HN comment HTML is third-party input. Rebuild it as React elements from an
 * allowlist of tags, so nothing is ever injected as markup. Unknown tags
 * keep their text, drop the element.
 */
function toNodes(parent: Node): ReactNode[] {
  return Array.from(parent.childNodes).map((node, i) => {
    if (node.nodeType === Node.TEXT_NODE) return node.textContent;
    if (node.nodeType !== Node.ELEMENT_NODE) return null;
    const el = node as Element;
    const kids = toNodes(el);
    if (!ALLOWED.has(el.tagName)) return <span key={i}>{kids}</span>;
    switch (el.tagName) {
      case "P":
        return <p key={i}>{kids}</p>;
      case "A": {
        const href = el.getAttribute("href") ?? "";
        return /^https?:\/\//i.test(href) ? (
          <a key={i} href={href} target="_blank" rel="nofollow noopener noreferrer">
            {kids}
          </a>
        ) : (
          <span key={i}>{kids}</span>
        );
      }
      case "I":
      case "EM":
        return <em key={i}>{kids}</em>;
      case "B":
      case "STRONG":
        return <strong key={i}>{kids}</strong>;
      case "PRE":
        return <pre key={i}>{kids}</pre>;
      default:
        return <code key={i}>{kids}</code>;
    }
  });
}

function CommentBody({ html }: { html: string }) {
  const doc = new DOMParser().parseFromString(html, "text/html");
  return <div className="hn-text">{toNodes(doc.body)}</div>;
}

function descendants(comment: HnComment): number {
  return comment.children.reduce((n, c) => n + 1 + descendants(c), 0);
}

function Comment({ comment }: { comment: HnComment }) {
  const [open, setOpen] = useState(true);
  const hidden = descendants(comment);
  return (
    <li className="mt-3">
      <div className="flex items-baseline gap-1.5 text-[12px] text-[var(--rd-text-3)]">
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-label={open ? "Collapse comment" : "Expand comment"}
          className="font-[var(--font-mono)] hover:text-[var(--rd-text)]"
        >
          [{open ? "–" : "+"}]
        </button>
        <a
          href={`https://news.ycombinator.com/user?id=${encodeURIComponent(comment.author)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="font-medium text-[var(--rd-text-2)] no-underline hover:underline"
        >
          {comment.author}
        </a>
        <a
          href={`https://news.ycombinator.com/item?id=${comment.id}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-inherit no-underline hover:underline"
        >
          {distanceToNow(comment.createdAt * 1000)}
        </a>
        {!open && hidden > 0 && (
          <span>
            ({hidden} {hidden === 1 ? "child" : "children"})
          </span>
        )}
      </div>
      {open && (
        <>
          <div className="mt-1 text-[13.5px] leading-relaxed text-[var(--rd-text-2)] [&_a]:text-[var(--rd-accent)] [&_p]:mt-2 [&_pre]:mt-2 [&_pre]:overflow-x-auto [&_pre]:text-[12px] [&_code]:font-[var(--font-mono)]">
            <CommentBody html={comment.html} />
          </div>
          {comment.children.length > 0 && (
            <ul className="ml-[6px] border-l border-[var(--rd-border)] pl-4">
              {comment.children.map((child) => (
                <Comment key={child.id} comment={child} />
              ))}
            </ul>
          )}
        </>
      )}
    </li>
  );
}

type State =
  | { status: "loading" }
  | { status: "error" }
  | { status: "ready"; thread: HnThread };

function HnComments({ url }: { url: string }) {
  const [state, setState] = useState<State>({ status: "loading" });
  const id = hnItemId(url);

  useEffect(() => {
    if (!id) {
      setState({ status: "error" });
      return;
    }
    const controller = new AbortController();
    fetchHnThread(id, controller.signal).then(
      (thread) => setState({ status: "ready", thread }),
      () => {
        if (!controller.signal.aborted) setState({ status: "error" });
      }
    );
    return () => controller.abort();
  }, [id]);

  if (state.status === "loading") {
    return <p className="text-[13px] text-[var(--rd-text-3)]">Loading comments…</p>;
  }
  if (state.status === "error") {
    return (
      <p className="text-[13px] text-[var(--rd-text-3)]">
        Could not load comments.{" "}
        <a href={url} className="text-[var(--rd-accent)]">
          Read them on Hacker News
        </a>
        .
      </p>
    );
  }
  if (state.thread.comments.length === 0) {
    return <p className="text-[13px] text-[var(--rd-text-3)]">No comments yet.</p>;
  }
  return (
    <ul>
      {state.thread.comments.map((c) => (
        <Comment key={c.id} comment={c} />
      ))}
    </ul>
  );
}

/**
 * Discussion venues linked from frontmatter. Collapsed on first paint and
 * fetched only on expand. X has no API a browser can read, so it is a link.
 */
export function Discussion({
  hackerNews,
  x,
}: {
  hackerNews?: string;
  x?: string;
}) {
  const [open, setOpen] = useState(false);
  if (!hackerNews && !x) return null;

  return (
    <section id="discussion" className="mt-16 border-t border-[var(--rd-border)] pt-6">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls="discussion-panel"
        className="flex w-full items-center justify-between font-[var(--font-mono)] text-xl font-semibold tracking-tight text-[var(--rd-text)]"
      >
        <span>Discussion</span>
        <span className="text-[13px] font-normal text-[var(--rd-text-3)]">
          {open ? "Hide" : "Show"}
        </span>
      </button>
      {open && (
        <div id="discussion-panel" className="mt-4">
          {x && (
            <p className="mb-4 text-[13px] text-[var(--rd-text-3)]">
              Replies on{" "}
              <a href={x} className="text-[var(--rd-accent)]" target="_blank" rel="noopener noreferrer">
                X
              </a>
            </p>
          )}
          {hackerNews && <HnComments url={hackerNews} />}
        </div>
      )}
    </section>
  );
}
