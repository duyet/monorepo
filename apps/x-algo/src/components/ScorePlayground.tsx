import { Badge, Button, Card, CardContent } from "@duyet/components";
import { useMemo, useState } from "react";
import {
  type ActionProbs,
  type ScoreFlags,
  PRESETS,
  scorePost,
} from "../lib/scoring";

const SLIDERS: Array<{ id: string; label: string; max?: number }> = [
  { id: "share_via_copy_link", label: "Copy link" },
  { id: "reply", label: "Reply" },
  { id: "quote", label: "Quote" },
  { id: "share_via_dm", label: "DM share" },
  { id: "favorite", label: "Like" },
  { id: "report", label: "Report" },
  { id: "mute_author", label: "Mute" },
];

export function ScorePlayground() {
  const [presetId, setPresetId] = useState(PRESETS[0].id);
  const preset = PRESETS.find((p) => p.id === presetId) ?? PRESETS[0];
  const [probs, setProbs] = useState<ActionProbs>(preset.probs);
  const [flags, setFlags] = useState<ScoreFlags>(preset.flags);

  const result = useMemo(() => scorePost(probs, flags), [probs, flags]);

  function applyPreset(id: string) {
    const next = PRESETS.find((p) => p.id === id);
    if (!next) return;
    setPresetId(id);
    setProbs(next.probs);
    setFlags(next.flags);
  }

  return (
    <section id="score" className="scroll-mt-20">
      <p className="mb-3 font-mono text-xs uppercase tracking-widest text-muted-foreground">
        Live scorer
      </p>
      <h2 className="text-2xl font-semibold tracking-tight">
        Predict the actions. Watch the score.
      </h2>
      <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
        Phoenix outputs probabilities. This is the same weighted sum the mixer
        runs, plus author diversity and the out-of-network 0.75×.
      </p>

      <div className="mt-4 flex flex-wrap gap-2">
        {PRESETS.map((p) => (
          <Button
            key={p.id}
            size="sm"
            variant={presetId === p.id ? "default" : "outline"}
            onClick={() => applyPreset(p.id)}
          >
            {p.label}
          </Button>
        ))}
      </div>
      <p className="mt-2 text-sm text-muted-foreground">{preset.blurb}</p>

      <div className="mt-6 grid gap-5 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
        <Card>
          <CardContent className="space-y-5 p-4">
            <div className="grid gap-3 sm:grid-cols-2">
              <FlagToggle
                label="In-network"
                on={flags.inNetwork}
                onChange={(inNetwork) => setFlags((f) => ({ ...f, inNetwork }))}
              />
              <FlagToggle
                label="Reply"
                on={flags.isReply}
                onChange={(isReply) => setFlags((f) => ({ ...f, isReply }))}
              />
              <FlagToggle
                label="Repost"
                on={flags.isRetweet}
                onChange={(isRetweet) => setFlags((f) => ({ ...f, isRetweet }))}
              />
              <FlagToggle
                label="Mutual follow"
                on={flags.isMutualFollow}
                onChange={(isMutualFollow) =>
                  setFlags((f) => ({ ...f, isMutualFollow }))
                }
              />
            </div>

            <label className="block text-sm">
              <span className="mb-1 flex justify-between">
                <span>Same-author slot</span>
                <span className="font-mono text-xs">
                  k={flags.authorOccurrence} · ×
                  {result.diversity.toFixed(3)}
                </span>
              </span>
              <input
                type="range"
                min={0}
                max={4}
                step={1}
                value={flags.authorOccurrence}
                onChange={(e) =>
                  setFlags((f) => ({
                    ...f,
                    authorOccurrence: Number(e.target.value),
                  }))
                }
                className="w-full accent-foreground"
              />
            </label>

            {SLIDERS.map((s) => (
              <label key={s.id} className="block text-sm">
                <span className="mb-1 flex justify-between">
                  <span>{s.label}</span>
                  <span className="font-mono text-xs">
                    {((probs[s.id] ?? 0) * 100).toFixed(1)}%
                  </span>
                </span>
                <input
                  type="range"
                  min={0}
                  max={s.max ?? 50}
                  step={0.5}
                  value={(probs[s.id] ?? 0) * 100}
                  onChange={(e) =>
                    setProbs((prev) => ({
                      ...prev,
                      [s.id]: Number(e.target.value) / 100,
                    }))
                  }
                  className="w-full accent-foreground"
                />
              </label>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardContent className="space-y-4 p-4">
            <div>
              <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
                Final score
              </p>
              <p className="mt-1 font-mono text-5xl font-semibold tracking-tight">
                {result.final.toFixed(3)}
              </p>
            </div>
            <dl className="grid grid-cols-2 gap-3 text-sm">
              <Stat label="Σ P×w" value={result.combined.toFixed(3)} />
              <Stat label="After offset" value={result.weighted.toFixed(3)} />
              <Stat label="Diversity" value={`×${result.diversity.toFixed(3)}`} />
              <Stat
                label="OON / reply-RT"
                value={result.oon < 1 ? "×0.75" : "×1.00"}
              />
            </dl>
            <div className="flex flex-wrap gap-2">
              {result.oon < 1 ? (
                <Badge variant="outline">0.75× discount on</Badge>
              ) : (
                <Badge>full in-network original</Badge>
              )}
              {flags.isMutualFollow && !flags.isReply && !flags.isRetweet ? (
                <Badge variant="secondary">reply weight 20</Badge>
              ) : (
                <Badge variant="outline">reply weight 5</Badge>
              )}
            </div>
            <ul className="space-y-1 border-t border-border pt-3 font-mono text-xs text-muted-foreground">
              {result.terms
                .filter((t) => t.term !== 0)
                .sort((a, b) => Math.abs(b.term) - Math.abs(a.term))
                .slice(0, 6)
                .map((t) => (
                  <li key={t.id} className="flex justify-between gap-3">
                    <span>{t.label}</span>
                    <span>
                      {t.term >= 0 ? "+" : ""}
                      {t.term.toFixed(3)}
                    </span>
                  </li>
                ))}
            </ul>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}

function FlagToggle({
  label,
  on,
  onChange,
}: {
  label: string;
  on: boolean;
  onChange: (next: boolean) => void;
}) {
  return (
    <Button
      type="button"
      size="sm"
      variant={on ? "default" : "outline"}
      onClick={() => onChange(!on)}
    >
      {label}: {on ? "on" : "off"}
    </Button>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="font-mono text-base">{value}</dd>
    </div>
  );
}
