import { timeAgo } from "../lib/lang";
import type { Lang, TldrBullet } from "../lib/types";

export function TldrSection({
  bullets,
  lang,
  totalStories,
  updatedAt,
  lastFetchedAt,
}: {
  bullets: TldrBullet[];
  lang: Lang;
  totalStories: number;
  updatedAt: number;
  lastFetchedAt: number | null;
}) {
  if (bullets.length === 0) return null;
  const mid = Math.ceil(bullets.length / 2);
  const cols = [bullets.slice(0, mid), bullets.slice(mid)];

  return (
    <section className="border-y-2 border-brand py-4">
      <div className="mb-2.5 flex items-baseline gap-3">
        <h2 className="text-lg font-bold tracking-widest">TL;DR</h2>
        <span className="text-xs text-muted-foreground">
          {lang === "vi" ? "24 giờ qua" : "past 24 hours"}
        </span>
      </div>
      <div className="grid gap-x-10 md:grid-cols-2">
        {cols.map((col, ci) => (
          <ol
            key={col[0]?.text ?? ci}
            start={ci * mid + 1}
            className="list-decimal space-y-1.5 pl-6 leading-snug marker:text-muted-foreground"
          >
            {col.map((b) => (
              <li key={b.text}>
                {b.item_id ? (
                  <a
                    href={`#item-${b.item_id}`}
                    className="underline decoration-border underline-offset-2 hover:decoration-accent"
                  >
                    {b.text}
                  </a>
                ) : (
                  b.text
                )}
              </li>
            ))}
          </ol>
        ))}
      </div>
      <div className="mt-4 flex justify-between text-xs text-muted-foreground">
        <span>
          {totalStories} {lang === "vi" ? "tin" : "stories"}
        </span>
        <span>
          {lastFetchedAt
            ? `${lang === "vi" ? "Cập nhật" : "Updated"} ${timeAgo(
                lastFetchedAt,
                updatedAt,
                lang
              )}`
            : lang === "vi"
              ? "Cập nhật lúc"
              : "News as of"}
        </span>
      </div>
    </section>
  );
}
