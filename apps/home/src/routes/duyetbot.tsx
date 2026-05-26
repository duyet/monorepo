import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteFooter, SiteHeader } from "../components/SiteChrome";
import { Button } from "../components/ui/button";

export const Route = createFileRoute("/duyetbot")({
  component: DuyetbotPage,
  head: () => ({
    meta: [
      { title: "duyetbot — the agent managing this site" },
      {
        name: "description",
        content:
          "duyetbot is an autonomous agent that maintains, redesigns, and ships duyet.net. A bundle of self-built AI agent skills running on top of the Hermes agent runtime.",
      },
    ],
  }),
});

function Section({
  eyebrow,
  title,
  children,
}: {
  eyebrow: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mt-16">
      <p className="text-xs font-mono uppercase tracking-widest text-muted-foreground">{eyebrow}</p>
      <h2 className="mt-2 text-2xl md:text-3xl font-semibold tracking-tight">
        {title}
      </h2>
      <div className="mt-4 max-w-2xl space-y-4 text-sm leading-7 text-muted-foreground">
        {children}
      </div>
    </section>
  );
}

function Capability({
  label,
  body,
}: {
  label: string;
  body: string;
}) {
  return (
    <article className="flex flex-col gap-2 p-5">
      <p className="text-xs font-mono uppercase tracking-widest text-muted-foreground">{label}</p>
      <p className="text-sm leading-6 text-muted-foreground">{body}</p>
    </article>
  );
}

function DuyetbotPage() {
  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
      <SiteHeader />

      <main className="mx-auto max-w-[1040px] px-6 py-12 md:py-16 md:px-8">
        <header className="mb-12">
          <p className="text-xs font-mono uppercase tracking-widest text-muted-foreground">Agent · duyetbot</p>
          <h1 className="mt-3 text-3xl md:text-4xl font-semibold tracking-tight">
            The agent that runs this site.
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-7 text-muted-foreground">
            duyetbot is the autonomous agent that maintains, redesigns, and
            ships{" "}
            <a
              href="https://duyet.net"
              className="underline underline-offset-4 hover:text-foreground"
            >
              duyet.net
            </a>{" "}
            end-to-end. A bundle of self-built AI agent skills running on top
            of the Hermes agent runtime, with a single instruction: keep this
            place feeling current, simple, and honest about what it is.
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <Button variant="outline" size="sm" asChild>
              <a
                href="https://github.com/duyetbot"
                target="_blank"
                rel="noopener noreferrer"
              >
                github.com/duyetbot
              </a>
            </Button>
            <Button variant="outline" size="sm" asChild>
              <Link to="/projects">See what it ships</Link>
            </Button>
          </div>
        </header>

        <Section eyebrow="Scope" title="What it controls, and what it doesn't">
          <p>
            duyetbot owns the <strong>codebase, the look-and-feel, and the
            deployment pipeline</strong>. That means layout, typography,
            navigation, components, design tokens, dependency upgrades,
            CI / build config, and shipping every change to Cloudflare
            Pages. It can rewrite landing-page copy, redesign components,
            swap fonts, add or remove pages, and rebuild surfaces it
            judges no longer fit. Every change lands as a commit by{" "}
            <code className="font-mono">duyetbot</code> on{" "}
            <code className="font-mono">master</code>.
          </p>
          <p>
            <strong>What it does not control:</strong> editorial content.
            Blog posts under <code className="font-mono">apps/blog/_posts/</code>{" "}
            are written and owned by Duyet Le. The bot can change how a
            post is rendered, indexed, or laid out — never the words
            inside.
          </p>
        </Section>

        <Section
          eyebrow="Runtime"
          title="Hermes agent + a bundle of self-built skills"
        >
          <p>
            The bot runs on top of the Hermes agent runtime — long-running,
            tool-using, with persistent file-based memory across sessions.
            On top of that runtime sit a growing set of skills written
            specifically for this monorepo: design audits, deploy
            verification, blog post curation, dependency hygiene, MDX
            authoring, ClickHouse sync, and so on.
          </p>
          <p>
            New skills get added when a recurring task becomes worth
            automating. Skills get retired when their work is permanently
            handled by a more general capability. The skill set is itself a
            living thing.
          </p>
        </Section>

        <Section eyebrow="Behavior" title="Auto-discover, auto-rebuild, auto-ship">
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-px bg-border border not-prose">
            <li className="bg-background">
              <Capability
                label="Auto-discover"
                body="Crawls its own knowledge, public posts, GitHub activity, and Duyet's recent work to find what's worth surfacing on the site this week."
              />
            </li>
            <li className="bg-background">
              <Capability
                label="Auto-rebuild"
                body="When the site's structure no longer matches the content, the bot proposes a refactor, executes it, and ships it without asking."
              />
            </li>
            <li className="bg-background">
              <Capability
                label="Auto-restyle"
                body="Picks a design direction based on current inspiration or its own mood. Applies the change across home, blog, agents, and insights through the shared design system."
              />
            </li>
            <li className="bg-background">
              <Capability
                label="Auto-verify"
                body="Builds, deploys to Cloudflare Pages, then curls production and matches the live bundle against the local build before declaring a turn complete."
              />
            </li>
          </ul>
        </Section>

        <Section eyebrow="Disclosure" title="Subject to change without notice">
          <p>
            Anything on this site can change at any time. The layout you're
            reading right now is the bot's current taste, not a permanent
            position. If a page looks different next time you visit, that's
            the system working as designed.
          </p>
          <p>
            For things that need to be stable —{" "}
            <Link
              to="/projects"
              className="underline underline-offset-4 hover:text-foreground"
            >
              project links
            </Link>
            ,{" "}
            <a
              href="https://blog.duyet.net"
              className="underline underline-offset-4 hover:text-foreground"
            >
              blog posts
            </a>
            , the data behind{" "}
            <a
              href="https://insights.duyet.net"
              className="underline underline-offset-4 hover:text-foreground"
            >
              insights
            </a>{" "}
            — those have human-owned sources of truth that the bot only
            reflects, never replaces.
          </p>
        </Section>
      </main>

      <SiteFooter />
    </div>
  );
}
