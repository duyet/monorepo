import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowLeft, ExternalLink, Tag } from "lucide-react";
import { MiniGraph } from "../../components/MiniGraph";
import { getArticleBySlug, getLinkedArticles } from "../../../lib/content";
import { markdownToHtml } from "../../../lib/markdown";

export const Route = createFileRoute("/k/$slug")({
  loader: async ({ params }) => {
    const article = getArticleBySlug(params.slug);
    if (!article) throw notFound();
    const html = await markdownToHtml(article.raw);
    const linked = getLinkedArticles(params.slug);
    return { article, html, linked };
  },
  head: ({ loaderData }) => {
    const article = loaderData?.article;
    return {
      meta: [
        {
          title: article
            ? `${article.title} | Knowledge Base | duyet.net`
            : "Article | Knowledge Base | duyet.net",
        },
        ...(article?.summary
          ? [{ name: "description", content: article.summary }]
          : []),
        ...(article
          ? [
              { property: "og:title", content: article.title },
              { property: "og:type", content: "article" },
              ...(article.summary
                ? [{ property: "og:description", content: article.summary }]
                : []),
            ]
          : []),
      ],
    };
  },
  component: ArticlePage,
});

function ArticlePage() {
  const { article, html, linked } = Route.useLoaderData();
  const hasLinks = linked.outgoing.length > 0 || linked.incoming.length > 0;

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 py-12">
      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_220px] gap-10">
        {/* Main content */}
        <article>
          {/* Breadcrumb */}
          <p className="text-xs font-mono uppercase tracking-widest text-muted-foreground mb-4">
            <Link to="/" className="hover:text-foreground transition-colors">
              KB
            </Link>{" "}
            /{" "}
            <Link
              to="/c/$category"
              params={{ category: article.category }}
              className="hover:text-foreground transition-colors capitalize"
            >
              {article.category}
            </Link>{" "}
            / {article.slug}
          </p>

          {/* Header */}
          <h1 className="text-3xl font-bold tracking-tight mb-3">
            {article.title}
          </h1>
          {article.summary && (
            <p className="text-muted-foreground leading-relaxed mb-4">
              {article.summary}
            </p>
          )}
          <div className="flex flex-wrap items-center gap-3 mb-8 text-xs text-muted-foreground">
            {article.updated && (
              <span>Updated {article.updated}</span>
            )}
            {article.tags.length > 0 && (
              <div className="flex items-center gap-1.5 flex-wrap">
                <Tag className="size-3" />
                {article.tags.map((tag) => (
                  <span
                    key={tag}
                    className="border border-border rounded px-1.5 py-0.5"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
            <a
              href={`/k/${article.slug}.md`}
              className="flex items-center gap-1 hover:text-foreground transition-colors"
            >
              raw .md
              <ExternalLink className="size-3" />
            </a>
          </div>

          {/* Rendered markdown */}
          <div
            className="prose prose-sm dark:prose-invert max-w-none"
            dangerouslySetInnerHTML={{ __html: html }}
          />

          <div className="mt-8 pt-6 border-t border-border">
            <Link
              to="/"
              className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="size-3.5" />
              Back to KB
            </Link>
          </div>
        </article>

        {/* Sidebar — linked articles + mini graph */}
        {hasLinks && (
          <aside className="space-y-6">
            {linked.outgoing.length > 0 && (
              <div>
                <p className="text-xs font-mono uppercase tracking-widest text-muted-foreground mb-3">
                  Links to
                </p>
                <ul className="space-y-2">
                  {linked.outgoing.map((a) => (
                    <li key={a.slug}>
                      <Link
                        to="/k/$slug"
                        params={{ slug: a.slug }}
                        className="text-sm hover:underline underline-offset-4 block"
                      >
                        {a.title}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {linked.incoming.length > 0 && (
              <div>
                <p className="text-xs font-mono uppercase tracking-widest text-muted-foreground mb-3">
                  Linked from
                </p>
                <ul className="space-y-2">
                  {linked.incoming.map((a) => (
                    <li key={a.slug}>
                      <Link
                        to="/k/$slug"
                        params={{ slug: a.slug }}
                        className="text-sm hover:underline underline-offset-4 block"
                      >
                        {a.title}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <MiniGraph
              currentSlug={article.slug}
              currentTitle={article.title}
              outgoing={linked.outgoing}
              incoming={linked.incoming}
            />
          </aside>
        )}
      </div>
    </div>
  );
}
