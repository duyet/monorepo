import type { FetchedItem } from "./sources/types.js";
import { toEpochSeconds } from "./time.js";

/** D1's .bind() rejects `undefined`; coerce any optional/missing value to `null`. */
export function nn<T>(value: T | null | undefined): T | null {
  return value ?? null;
}

/** Pure builder for the `items` upsert bind args, so it can be unit-tested without a D1 binding. */
export function buildItemBindArgs(args: {
  id: string;
  sourceId: string;
  item: FetchedItem;
  score?: {
    relevance?: number;
    importance?: number;
    quality?: number;
    category?: string;
    tags?: string[];
  };
  rank: number;
  status: string;
  now: number;
}): unknown[] {
  const { id, sourceId, item, score, rank, status, now } = args;
  return [
    nn(id),
    nn(sourceId),
    nn(item.externalId),
    nn(item.url),
    nn(item.title),
    nn(item.summary),
    // Defense in depth: normalize to epoch seconds here regardless of what
    // unit the caller/adapter produced, so a bad upstream value can never
    // reach the database as milliseconds.
    nn(toEpochSeconds(item.publishedAt)),
    nn(toEpochSeconds(now)),
    nn(item.points ?? 0),
    nn(item.comments ?? 0),
    nn(score?.relevance),
    nn(score?.importance),
    nn(score?.quality),
    nn(score?.category),
    nn(JSON.stringify(score?.tags ?? [])),
    nn(rank),
    nn(status),
  ];
}

/** Pure builder for the `translations` upsert bind args. */
export function buildTranslationBindArgs(args: {
  id: string;
  title: string;
  summary: string;
}): unknown[] {
  return [nn(args.id), nn(args.title), nn(args.summary)];
}
