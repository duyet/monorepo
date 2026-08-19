import { parseTweetId, TWEET_EMBED_WRAP_CLASS } from "../../lib/x-embed";

export interface XPostProps {
  id?: string;
  url?: string;
}

/**
 * Official X/Twitter embed for MDX posts. Pass a status `id` or `url`.
 * `widgets.js` (loaded on post pages) hydrates `blockquote.twitter-tweet`.
 */
export function XPost({ id, url }: XPostProps) {
  const tweetId = id ?? (url ? parseTweetId(url) : null);
  if (!tweetId) return null;

  const href =
    url && parseTweetId(url) ? url : `https://x.com/i/web/status/${tweetId}`;

  return (
    <div className={TWEET_EMBED_WRAP_CLASS}>
      <blockquote className="twitter-tweet">
        <a href={href}>{href}</a>
      </blockquote>
    </div>
  );
}

export const Tweet = XPost;
