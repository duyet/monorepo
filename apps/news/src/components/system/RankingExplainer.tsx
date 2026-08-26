import type { ModelChains } from "../../lib/system-queries";

interface RankingExplainerProps {
  models: ModelChains;
}

/** Surfaces the live ranking formula and model chains for operators. */
export function RankingExplainer({ models }: RankingExplainerProps) {
  return (
    <div className="space-y-3 text-sm">
      <p className="text-muted-foreground">
        rankScore = importance × qualityFactor × decay × engagement
      </p>
      <ul className="space-y-1 text-xs text-muted-foreground">
        <li>qualityFactor = 0.6 + 0.4 × (quality / 10)</li>
        <li>decay = exp(−ageHours / 36)</li>
        <li>
          engagement = 1 + log10(1 + points + 0.5 × comments)
        </li>
      </ul>
      <p className="text-xs text-muted-foreground">
        Full pipeline details:{" "}
        <a
          href="https://github.com/duyet/monorepo/blob/master/apps/news/ALGORITHM.md"
          className="text-accent underline underline-offset-2 hover:no-underline"
          target="_blank"
          rel="noopener noreferrer"
        >
          apps/news/ALGORITHM.md
        </a>
      </p>
      <div className="space-y-1 border-t border-border pt-2 text-xs">
        <div>
          scoring:{" "}
          <span className="font-mono text-foreground">
            {models.scoring.join(" → ") || "—"}
          </span>
        </div>
        <div>
          translation:{" "}
          <span className="font-mono text-foreground">
            {models.translation.join(" → ") || "—"}
          </span>
        </div>
        <div>
          tldr:{" "}
          <span className="font-mono text-foreground">
            {models.tldr.join(" → ") || "—"}
          </span>
        </div>
      </div>
    </div>
  );
}
