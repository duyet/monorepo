/**
 * The "where the hours went" / "where the tokens went" pair: WakaTime
 * languages beside AI model share.
 *
 * Both cards are unguarded — with no languages or no models they still render
 * an empty `DistRows`, which is the page's existing behaviour and is pinned by
 * the empty-window case in `src/routes/index.render.test.tsx`.
 */
import { DistRows, Eyebrow } from "@duyet/components";
import { formatCompact } from "./helpers";

/** The two-card row shared by the language and model share cards. */
function ShareCard({
  id,
  eyebrow,
  title,
  badge,
  rows,
}: {
  id: string;
  eyebrow: string;
  title: string;
  badge: string;
  rows: Array<{ name: string; pct: number }>;
}) {
  return (
    <div id={id} className="rd-card p-[clamp(18px,2.2vw,26px)] p-[clamp(22px,2.6vw,30px)]">
      <div className="flex justify-between items-center mb-5">
        <div>
          <Eyebrow>{eyebrow}</Eyebrow>
          <h3 className="text-[1.35rem] mt-[10px] tracking-[-0.03em]">
            {title}
          </h3>
        </div>
        <span className="rd-chip font-[var(--font-mono)] text-[11px]">
          {badge}
        </span>
      </div>
      <DistRows rows={rows} />
    </div>
  );
}

function CodingAndAiSplit({
  languageShare,
  modelShare,
  totalTokens,
}: {
  languageShare: Array<{ name: string; pct: number }>;
  modelShare: Array<{ name: string; pct: number }>;
  totalTokens: number;
}) {
  return (
    <div className="rd-g2 mt-3">
      {/* Languages */}
      <ShareCard
        id="ins-coding"
        eyebrow="Coding · WakaTime"
        title="Where the hours went"
        badge="30d"
        rows={languageShare}
      />

      {/* Models */}
      <ShareCard
        id="ins-models"
        eyebrow="AI · model share"
        title="Where the tokens went"
        badge={formatCompact(totalTokens)}
        rows={modelShare}
      />
    </div>
  );
}

export { CodingAndAiSplit };
export { ShareCard };
