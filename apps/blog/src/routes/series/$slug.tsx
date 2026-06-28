import type { Post, Series } from "@duyet/interfaces";
import { dateFormat } from "@duyet/libs/date";
import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import {
  ArrowRightLeft,
  Blocks,
  Boxes,
  Bot,
  Code2,
  FileCog,
  type LucideIcon,
  MessagesSquare,
  Network,
  Palette,
  ListChecks,
  Repeat,
  Sparkles,
  Terminal,
  Workflow,
} from "lucide-react";
import type { CSSProperties, ReactElement } from "react";
import { getAllSeries, getSeries } from "@/lib/posts";

// ── Color + icon system ───────────────────────────────────────────────────────
// The blog's design tokens are intentionally grayscale; series cards layer a
// curated accent palette on top so each post reads as its own tile. Accents are
// assigned deterministically by index so SSR and client hydration agree.
type Accent = {
  chip: string; // icon chip background + text
  num: string; // index number color
  bar: string; // left accent bar
  hover: string; // border color on hover
};

const ACCENTS: Accent[] = [
  { chip: "bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-300", num: "text-blue-600 dark:text-blue-400", bar: "bg-blue-500/70", hover: "hover:border-blue-300 dark:hover:border-blue-500/40" },
  { chip: "bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300", num: "text-amber-600 dark:text-amber-400", bar: "bg-amber-500/70", hover: "hover:border-amber-300 dark:hover:border-amber-500/40" },
  { chip: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300", num: "text-emerald-600 dark:text-emerald-400", bar: "bg-emerald-500/70", hover: "hover:border-emerald-300 dark:hover:border-emerald-500/40" },
  { chip: "bg-violet-100 text-violet-700 dark:bg-violet-500/15 dark:text-violet-300", num: "text-violet-600 dark:text-violet-400", bar: "bg-violet-500/70", hover: "hover:border-violet-300 dark:hover:border-violet-500/40" },
  { chip: "bg-rose-100 text-rose-700 dark:bg-rose-500/15 dark:text-rose-300", num: "text-rose-600 dark:text-rose-400", bar: "bg-rose-500/70", hover: "hover:border-rose-300 dark:hover:border-rose-500/40" },
  { chip: "bg-cyan-100 text-cyan-700 dark:bg-cyan-500/15 dark:text-cyan-300", num: "text-cyan-600 dark:text-cyan-400", bar: "bg-cyan-500/70", hover: "hover:border-cyan-300 dark:hover:border-cyan-500/40" },
];

const ICON_RULES: [RegExp, LucideIcon][] = [
  [/design|ui|css/i, Palette],
  [/plan|interview/i, ListChecks],
  [/code|opencode/i, Code2],
  [/claude|agent|bot|claws/i, Bot],
  [/setup|config|md\b|\.md/i, FileCog],
  [/loop|long-running|workflow|cowork/i, Workflow],
  [/plugin/i, Blocks],
  [/parallel|sub-agent|router/i, Network],
  [/migrate|tanstack/i, ArrowRightLeft],
  [/sandbox|kubernetes|k8s|cloud/i, Boxes],
  [/terminal|cli/i, Terminal],
  [/message|chat|talk/i, MessagesSquare],
  [/repeat|again/i, Repeat],
];

function pickIcon(title: string): LucideIcon {
  for (const [re, icon] of ICON_RULES) if (re.test(title)) return icon;
  return Sparkles;
}

function accentFor(i: number): Accent {
  return ACCENTS[i % ACCENTS.length];
}

export const Route = createFileRoute("/series/$slug")({
  head: ({ params }) => ({
    meta: [{ title: `${params.slug} Series | Tôi là Duyệt` }],
  }),
  loader: async ({ params }) => {
    const [allSeries, series] = await Promise.all([
      getAllSeries(),
      getSeries({ slug: params.slug }),
    ]);
    const found = allSeries.some((s) => s.slug === params.slug);
    if (!found) throw notFound();
    return { series };
  },
  component: SeriesDetailPage,
});

function postParams(post: Post) {
  const [, year, month, slug] = post.slug.split("/");
  return { year, month, slug };
}

function childParams(post: Post) {
  const segments = post.slug.replace(/^\//, "").split("/");
  return { year: segments[0], month: segments[1], slug: segments[2], child: segments[3] };
}

type TreeNode = {
  post: Post;
  children: Post[];
};

function buildTree(posts: Post[]): TreeNode[] {
  const childrenByParent = new Map<string, Post[]>();
  const parents: Post[] = [];

  for (const post of posts) {
    const segments = post.slug.split("/").filter(Boolean);
    if (segments.length >= 4) {
      const parentSlug = `/${segments.slice(0, 3).join("/")}`;
      if (!childrenByParent.has(parentSlug)) {
        childrenByParent.set(parentSlug, []);
      }
      childrenByParent.get(parentSlug)!.push(post);
    } else {
      parents.push(post);
    }
  }

  parents.sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  return parents.map((post) => ({
    post,
    children: childrenByParent.get(post.slug) ?? [],
  }));
}

function SeriesDetailPage(): ReactElement {
  const { series } = Route.useLoaderData() as { series: Series | null };

  if (!series) {
    return (
      <div className="px-6 md:px-8">
        <header className="pt-24 md:pt-28 pb-10 mx-auto">
          <span className="inline-block text-[0.6875rem] font-medium tracking-[0.16em] uppercase text-muted-foreground mb-3.5">
            Series
          </span>
          <h1 className="text-[clamp(2.25rem,4.5vw,3.25rem)] font-semibold leading-[1.08] tracking-[-0.018em] text-foreground m-0">
            Not found
          </h1>
          <p className="mt-4 text-base leading-[1.6] text-muted-foreground max-w-xl">
            This series doesn't exist (yet).
          </p>
        </header>
      </div>
    );
  }

  const tree = buildTree(series.posts);
  const childCount = tree.reduce((sum, n) => sum + n.children.length, 0);

  return (
    <div className="px-6 md:px-8">
      <header className="pt-24 md:pt-28 pb-10 max-w-5xl mx-auto">
        <span className="inline-flex items-center gap-2 text-[0.6875rem] font-semibold tracking-[0.16em] uppercase mb-3.5">
          <span className="inline-block size-1.5 rounded-full bg-orange-500" />
          <Link
            to="/series/"
            className="text-orange-600 dark:text-orange-400 transition-colors hover:text-orange-700 dark:hover:text-orange-300"
          >
            Series
          </Link>
        </span>
        <h1 className="text-[clamp(2.25rem,4.5vw,3.25rem)] font-semibold leading-[1.08] tracking-[-0.018em] m-0 bg-gradient-to-br from-foreground via-foreground to-foreground/55 bg-clip-text text-transparent">
          {series.name}
        </h1>
        <div className="mt-5 flex flex-wrap items-center gap-2 text-xs">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-muted px-2.5 py-1 font-medium text-foreground/80 tabular-nums">
            {tree.length} {tree.length === 1 ? "post" : "posts"}
          </span>
          {childCount > 0 && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-orange-100 dark:bg-orange-500/15 px-2.5 py-1 font-medium text-orange-700 dark:text-orange-300 tabular-nums">
              +{childCount} {childCount === 1 ? "child" : "children"}
            </span>
          )}
        </div>
      </header>

      <section
        className="max-w-5xl mx-auto grid grid-cols-1 sm:grid-cols-2 gap-4 pb-16"
        aria-label="Series posts"
      >
        {tree.map((node, i) => {
          const accent = accentFor(i);
          const Icon = pickIcon(node.post.title);
          const hasChildren = node.children.length > 0;
          const style: CSSProperties = {
            animationDelay: `${Math.min(i, 8) * 40}ms`,
          };
          return (
            <div
              key={node.post.slug}
              className={`group relative flex flex-col bg-card border border-border rounded-[var(--radius)] overflow-hidden editorial-enter transition-colors ${accent.hover} ${hasChildren ? "sm:col-span-2" : ""}`}
              style={style}
            >
              <span
                className={`absolute left-0 top-0 h-full w-[3px] ${accent.bar}`}
                aria-hidden
              />
              {/* Parent post */}
              <Link
                to="/$year/$month/$slug/"
                params={postParams(node.post)}
                className="block px-5 py-5 pl-6 no-underline text-inherit transition-colors hover:bg-muted/60 focus-visible:outline-none focus-visible:bg-muted/60"
              >
                <div className="flex items-start gap-3.5">
                  <span
                    className={`grid place-items-center size-9 shrink-0 rounded-lg ${accent.chip}`}
                  >
                    <Icon className="size-[1.15rem]" strokeWidth={1.75} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span
                        className={`font-[var(--font-mono)] text-xs font-semibold tabular-nums ${accent.num}`}
                      >
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <h3 className="text-lg font-semibold leading-tight tracking-[-0.01em] text-foreground m-0">
                        {node.post.title}
                      </h3>
                    </div>
                    {node.post.excerpt && (
                      <p className="mt-1.5 text-sm leading-[1.55] text-muted-foreground line-clamp-2">
                        {node.post.excerpt}
                      </p>
                    )}
                    <div className="mt-2.5 flex flex-wrap items-center gap-y-1.5 gap-x-2.5 text-xs text-muted-foreground tabular-nums [&>*+*]:before:content-['·'] [&>*+*]:before:mr-2.5">
                      <time dateTime={new Date(node.post.date).toISOString()}>
                        {dateFormat(node.post.date, "MMM d, yyyy")}
                      </time>
                      {hasChildren && (
                        <span className={accent.num}>
                          {node.children.length}{" "}
                          {node.children.length === 1 ? "part" : "parts"}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </Link>

              {/* Child posts */}
              {hasChildren && (
                <div className="border-t border-border grid grid-cols-1 md:grid-cols-2">
                  {node.children.map((child) => (
                    <Link
                      key={child.slug}
                      to="/$year/$month/$slug/$child/"
                      params={childParams(child)}
                      className="flex items-baseline gap-2.5 px-5 py-3 pl-6 no-underline text-inherit border-b border-border md:[&:nth-last-child(2)]:border-b-0 last:border-b-0 md:odd:border-r transition-colors hover:bg-muted/60 focus-visible:outline-none focus-visible:bg-muted/60"
                    >
                      <span
                        className={`size-1.5 shrink-0 translate-y-1.5 rounded-full ${accent.bar}`}
                        aria-hidden
                      />
                      <span className="min-w-0 flex-1 truncate text-sm font-medium tracking-[-0.005em] text-foreground/90">
                        {child.title}
                      </span>
                      <time
                        dateTime={new Date(child.date).toISOString()}
                        className="shrink-0 text-xs text-muted-foreground tabular-nums"
                      >
                        {dateFormat(child.date, "MMM d, yyyy")}
                      </time>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          );
        })}

        {tree.length === 0 && (
          <p className="sm:col-span-2 mt-12 text-center text-sm text-muted-foreground">
            No posts in this series yet.
          </p>
        )}
      </section>
    </div>
  );
}
