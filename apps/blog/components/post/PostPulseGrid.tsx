import type { Post } from "@duyet/interfaces";
import { dateFormat } from "@duyet/libs/date";
import { Bookmark, ThumbsDown, ThumbsUp, Upload } from "lucide-react";
import type { ReactNode } from "react";
import { IsFeatured, IsNewPost } from "./PostBadges";

const pulseThumbnails = [
  "/media/post-thumbnails/pulse-1.jpeg",
  "/media/post-thumbnails/pulse-2.jpeg",
  "/media/post-thumbnails/pulse-3.jpeg",
  "/media/post-thumbnails/pulse-4.jpeg",
  "/media/post-thumbnails/pulse-5.jpeg",
];

export interface PostPulseGridProps {
  posts: Post[];
}

export function PostPulseGrid({ posts }: PostPulseGridProps) {
  if (!posts.length) {
    return null;
  }

  return (
    <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
      {posts.map((post, index) => (
        <PostPulseCard key={post.slug} post={post} index={index} />
      ))}
    </div>
  );
}

function PostPulseCard({ post, index }: { post: Post; index: number }) {
  const thumbnail = pulseThumbnails[index % pulseThumbnails.length];
  const excerpt = post.excerpt || post.snippet;

  return (
    <article className="group rounded-[28px] border border-[#1a1a1a]/10 bg-white p-4 shadow-[0_18px_48px_rgba(15,23,42,0.06)] transition duration-300 ease-out hover:-translate-y-1 hover:border-[#1a1a1a]/20 hover:shadow-[0_22px_58px_rgba(15,23,42,0.10)] active:scale-[0.995] dark:border-white/10 dark:bg-[#171815] dark:shadow-none dark:hover:border-white/20 motion-reduce:transform-none sm:p-5">
      <a
        href={post.slug}
        className="grid gap-4 outline-none focus-visible:ring-2 focus-visible:ring-[#1a1a1a] focus-visible:ring-offset-4 focus-visible:ring-offset-[#f8f8f2] dark:focus-visible:ring-[#f8f8f2] dark:focus-visible:ring-offset-[#0d0e0c] sm:grid-cols-[128px_1fr] sm:gap-5"
      >
        <div className="aspect-[1.08] overflow-hidden rounded-[22px] bg-[#f4f4ef] sm:aspect-square">
          <img
            src={thumbnail}
            alt=""
            loading="lazy"
            className="h-full w-full object-cover transition duration-500 ease-out group-hover:scale-[1.035] motion-reduce:transform-none"
          />
        </div>

        <div className="min-w-0 pt-0.5">
          <div className="flex flex-wrap items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-[#1a1a1a]/45 dark:text-[#f8f8f2]/45">
            <time>{dateFormat(post.date, "MMM dd, yyyy")}</time>
            {post.category ? <span>{post.category}</span> : null}
          </div>
          <h3 className="mt-3 text-2xl font-semibold leading-tight tracking-tight text-[#111] dark:text-[#f8f8f2]">
            {post.title}
            <IsNewPost date={post.date} />
            <IsFeatured featured={post.featured} />
          </h3>
          {excerpt ? (
            <p className="mt-3 line-clamp-3 text-base font-medium leading-7 text-[#1a1a1a]/72 dark:text-[#f8f8f2]/68">
              {excerpt}
            </p>
          ) : null}
        </div>
      </a>

      <div className="mt-4 flex items-center gap-5 pl-1 text-[#1a1a1a]/55 dark:text-[#f8f8f2]/55 sm:ml-[148px]">
        <PostAction label="Like">
          <ThumbsUp size={20} strokeWidth={2} />
        </PostAction>
        <PostAction label="Dislike">
          <ThumbsDown size={20} strokeWidth={2} />
        </PostAction>
        <PostAction label="Share">
          <Upload size={20} strokeWidth={2} />
        </PostAction>
        <PostAction label="Save">
          <Bookmark size={20} strokeWidth={2} />
        </PostAction>
      </div>
    </article>
  );
}

function PostAction({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <span
      aria-label={label}
      className="rounded-lg p-1 transition duration-200 group-hover:-translate-y-0.5 group-hover:text-[#1a1a1a] dark:group-hover:text-[#f8f8f2] motion-reduce:transform-none"
    >
      {children}
    </span>
  );
}
