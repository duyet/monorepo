import { Card, CardContent } from "@duyet/components";
import { PIPELINE } from "../lib/scoring";

export function Pipeline() {
  return (
    <section id="pipeline" className="scroll-mt-20">
      <p className="mb-3 font-mono text-xs uppercase tracking-widest text-muted-foreground">
        Request path
      </p>
      <h2 className="text-2xl font-semibold tracking-tight">
        How a post enters For You
      </h2>
      <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
        Ranking sets the order. Visibility filtering decides whether the post
        can appear at all. Different services, different inputs.
      </p>
      <ol className="mt-6 grid gap-3 sm:grid-cols-2">
        {PIPELINE.map((step) => (
          <li key={step.n}>
            <Card>
              <CardContent className="p-4">
                <p className="font-mono text-xs text-muted-foreground">
                  {step.n}
                </p>
                <h3 className="mt-1 text-base font-semibold">{step.title}</h3>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  {step.body}
                </p>
              </CardContent>
            </Card>
          </li>
        ))}
      </ol>
    </section>
  );
}
