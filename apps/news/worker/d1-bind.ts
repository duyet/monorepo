import type { FetchedItem, FetchedItemSource } from "./sources/types.js";
import { toEpochSeconds } from "./time.js";

export const MAX_SOURCES_PER_ITEM = 8;

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
  llmTokens?: number;
}): unknown[] {
  const { id, sourceId, item, score, rank, status, now, llmTokens } = args;
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
    nn(llmTokens ?? 0),
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

/**
 * Pure builder for `item_sources` insert bind args, one row per source,
 * capped at `MAX_SOURCES_PER_ITEM` and positioned 0..n in array order.
 * Adapters may emit `postedAt` in ms; normalized to seconds here, same as
 * `item.publishedAt` in buildItemBindArgs.
 */
export function buildItemSourceBindArgs(
  itemId: string,
  sources: FetchedItemSource[]
): unknown[][] {
  return sources
    .slice(0, MAX_SOURCES_PER_ITEM)
    .map((source, position) => [
      nn(itemId),
      nn(position),
      nn(source.kind),
      nn(source.author),
      source.postedAt === undefined
        ? null
        : nn(toEpochSeconds(source.postedAt)),
      nn(source.quote),
      nn(source.url),
    ]);
}
