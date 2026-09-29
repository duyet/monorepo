/**
 * Post-slug → route-params helpers.
 *
 * A post slug is its own URL path (`/2026/01/coding-agent/claude-code`), and
 * every listing surface links through TanStack Router's typed `Link`, which
 * takes the path split back out into `params`. Six route modules each carried a
 * byte-identical copy of that split, plus a two-variant copy for chapter links.
 *
 * These live in one place so a slug-shape change cannot leave one listing
 * page emitting `/2026//my-post` while another emits the right link.
 */

import type { Post } from "@duyet/interfaces";

/** Params for a top-level post link (`/$year/$month/$slug/`). */
export function postParams(post: Post) {
  const [, year, month, slug] = post.slug.split("/");
  return { year, month, slug };
}

/** Params for a chapter link (`/$year/$month/$slug/$child`). */
export function childParams(post: Post) {
  const segments = post.slug.replace(/^\//, "").split("/");
  return {
    year: segments[0],
    month: segments[1],
    slug: segments[2],
    child: segments[3],
  };
}
