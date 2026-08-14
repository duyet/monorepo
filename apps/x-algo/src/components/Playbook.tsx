import { Badge, Card, CardContent } from "@duyet/components";
import { DROP_RULES, PLAYBOOK } from "../lib/scoring";

export function Playbook() {
  return (
    <section id="playbook" className="scroll-mt-20 space-y-8">
      <div>
        <p className="mb-3 font-mono text-xs uppercase tracking-widest text-muted-foreground">
          How to actually travel
        </p>
        <h2 className="text-2xl font-semibold tracking-tight">
          A post goes viral if it leaves Thunder
        </h2>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
          Followers see you via Thunder with no likes required. Non-followers
          only see originals that get at least one like, pass visibility, and
          outscore the rest of the slate.
        </p>
      </div>

      <ol className="grid gap-3 sm:grid-cols-2">
        {PLAYBOOK.map((item, i) => (
          <li key={item.title}>
            <Card>
              <CardContent className="p-4">
                <p className="font-mono text-xs text-muted-foreground">
                  {String(i + 1).padStart(2, "0")}
                </p>
                <h3 className="mt-1 text-base font-semibold">{item.title}</h3>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  {item.body}
                </p>
              </CardContent>
            </Card>
          </li>
        ))}
      </ol>

      <div>
        <h3 className="text-lg font-semibold tracking-tight">
          Labels that drop you
        </h3>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
          Ranking cannot save a dropped post. Check{" "}
          <a
            className="underline underline-offset-4"
            href="https://x.com/i/under_the_hood"
          >
            Under the Hood
          </a>{" "}
          if you think you are labeled.
        </p>
        <div className="mt-4 grid gap-3">
          {DROP_RULES.map((rule) => (
            <Card key={rule.label}>
              <CardContent className="flex flex-col gap-2 p-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="font-medium">{rule.label}</p>
                  <p className="text-sm text-muted-foreground">{rule.meaning}</p>
                </div>
                <Badge
                  variant={rule.scope === "everyone" ? "destructive" : "outline"}
                >
                  {rule.scope === "everyone" ? "followers too" : "OON only"}
                </Badge>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
