import Container from "@duyet/components/Container";
import { createFileRoute, Link } from "@tanstack/react-router";
import { getAllSeries, getAllTags, getPostsByAllYear } from "@/lib/posts";
import type { Post } from "@duyet/interfaces";
import { Search } from "lucide-react";

export const Route = createFileRoute("/")({
  loader: async () => {
    const [postsByYear, seriesList, allTags] = await Promise.all([
      getPostsByAllYear(),
      getAllSeries(),
      getAllTags(),
    ]);
    return { postsByYear, seriesList, allTags };
  },
  component: HomePage,
});

function HomePage() {
  const { postsByYear } = Route.useLoaderData();

  const allPosts: Post[] = Object.entries(postsByYear)
    .sort(([a], [b]) => Number(b) - Number(a))
    .flatMap(([, posts]) => posts);

  const recentPosts = allPosts.slice(0, 15);

  return (
    <Container className="mx-auto max-w-[var(--container-max-width)] px-6 py-12 sm:px-10 lg:px-[var(--page-margins)] lg:py-[var(--section-spacer-lg)]">
      <div className="flex flex-col gap-12 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex-1 min-w-0">
          <h1 className="font-serif text-5xl sm:text-6xl lg:text-[72px] tracking-tight">
            News
          </h1>
          
          <div className="mt-12 overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[var(--border-subtle)] text-[var(--foreground-tertiary)] uppercase text-[12px] tracking-widest font-medium">
                  <th className="py-4 pr-6 font-medium">Date</th>
                  <th className="py-4 px-6 font-medium">Category</th>
                  <th className="py-4 pl-6 font-medium">Title</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-faint)]">
                {recentPosts.map((post) => (
                  <tr key={post.slug} className="group hover:bg-[var(--background-secondary)]/50 transition-colors">
                    <td className="py-6 pr-6 text-[var(--foreground-secondary)] text-[15px] whitespace-nowrap">
                      {new Date(post.date).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </td>
                    <td className="py-6 px-6">
                      <span className="text-[var(--foreground-secondary)] text-[15px]">
                        {post.tags?.[0] || "General"}
                      </span>
                    </td>
                    <td className="py-6 pl-6">
                      <Link
                        to={post.slug.replace(".html", "")}
                        className="text-[var(--foreground-primary)] text-[17px] font-medium group-hover:text-[var(--primary)] transition-colors line-clamp-1"
                      >
                        {post.title}
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          <div className="mt-12 flex justify-start">
             <Link to="/archives/" className="font-serif text-xl hover:text-[var(--primary)] transition-colors border-b border-[var(--primary)] pb-1">
                View all posts
             </Link>
          </div>
        </div>

        <aside className="w-full lg:w-[380px] space-y-12">
           {/* Search Placeholder */}
           <div className="relative group">
              <input 
                type="text" 
                placeholder="Search" 
                className="w-full h-14 pl-12 pr-6 rounded-xl border border-[var(--border-subtle)] bg-[var(--background)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/20 focus:border-[var(--primary)] transition-all"
              />
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-[var(--foreground-tertiary)] group-focus-within:text-[var(--primary)] transition-colors" />
           </div>

           {/* Decorative Image Card */}
           <div className="aspect-square rounded-[var(--radius-lg)] bg-cactus p-12 flex items-center justify-center shadow-xl relative overflow-hidden group hover:scale-[1.02] transition-transform">
              <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative z-10 space-y-4 text-center">
                 <span className="text-[var(--foreground-primary)] opacity-40 font-serif text-[120px] leading-none select-none">✱</span>
                 <p className="font-serif text-xl italic text-[var(--foreground-secondary)]">Notes & Essays</p>
              </div>
           </div>

           {/* Tags section or other sidebar content */}
           <div className="space-y-6">
              <h3 className="font-serif text-2xl tracking-tight">Popular Topics</h3>
              <div className="flex flex-wrap gap-2">
                 {allPosts.flatMap(p => p.tags || []).slice(0, 10).filter((v, i, a) => a.indexOf(v) === i).map(tag => (
                    <a
                      key={tag}
                      href={`/tag/${tag}`}
                      className="px-4 py-2 rounded-full bg-[var(--background-secondary)] text-[var(--foreground-secondary)] text-[14px] font-medium hover:bg-[var(--primary)] hover:text-white transition-all"
                    >
                       {tag}
                    </a>
                 ))}
              </div>
           </div>
        </aside>
      </div>
    </Container>
  );
}
