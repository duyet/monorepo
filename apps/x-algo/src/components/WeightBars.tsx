import { Badge, Card, CardContent } from "@duyet/components";
import { likesEquivalent, WEIGHTS } from "../lib/scoring";

export function WeightBars() {
  const positives = WEIGHTS.filter((w) => w.group === "positive");
  const negatives = WEIGHTS.filter((w) => w.group === "negative");
  const maxPos = Math.max(...positives.map((w) => w.weight));
  const maxNeg = Math.max(...negatives.map((w) => Math.abs(w.weight)));

  return (
    <section id="weights" className="scroll-mt-20">
      <p className="mb-3 font-mono text-xs uppercase tracking-widest text-muted-foreground">
        Production weights · 2026-08-12
      </p>
      <h2 className="text-2xl font-semibold tracking-tight">
        What Phoenix is paid to predict
      </h2>
      <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
        Final score is a weighted sum of action probabilities. Weights mix how
        valuable an action is with how rare it is. Copy-link is huge because
        almost nobody does it.
      </p>

      <div className="mt-6 grid gap-5 lg:grid-cols-2">
        <Card>
          <CardContent className="space-y-3 p-4">
            <h3 className="text-sm font-semibold">Positive</h3>
            {positives.map((w) => (
              <WeightRow
                key={w.id}
                label={w.label}
                weight={w.weight}
                note={w.note}
                width={(w.weight / maxPos) * 100}
                tone="pos"
              />
            ))}
          </CardContent>
        </Card>
        <Card>
          <CardContent className="space-y-3 p-4">
            <h3 className="text-sm font-semibold">Negative</h3>
            {negatives.map((w) => (
              <WeightRow
                key={w.id}
                label={w.label}
                weight={w.weight}
                note={
                  w.id === "report"
                    ? `${likesEquivalent(Math.abs(w.weight)).toFixed(0)} likes`
                    : w.note
                }
                width={(Math.abs(w.weight) / maxNeg) * 100}
                tone="neg"
              />
            ))}
          </CardContent>
        </Card>
      </div>
    </section>
  );
}

function WeightRow({
  label,
  weight,
  note,
  width,
  tone,
}: {
  label: string;
  weight: number;
  note?: string;
  width: number;
  tone: "pos" | "neg";
}) {
  return (
    <div>
      <div className="mb-1 flex items-baseline justify-between gap-3">
        <span className="text-sm">{label}</span>
        <span className="flex items-center gap-2 font-mono text-xs">
          {note ? (
            <Badge variant="outline" className="font-normal">
              {note}
            </Badge>
          ) : null}
          {weight > 0 ? "+" : ""}
          {weight}
        </span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-secondary">
        <div
          className={
            tone === "neg" ? "h-full bg-destructive" : "h-full bg-foreground"
          }
          style={{ width: `${Math.max(width, weight === 0 ? 0 : 2)}%` }}
        />
      </div>
    </div>
  );
}
