import type { FetchedItemSource } from "./sources/types.js";
import { unionTopics } from "./topics.js";
import type { Env } from "./types.js";

// Self-contained anyrouter call, deliberately NOT imported from llm.ts:
// llm.ts is being actively reworked (streaming + prompt changes) by another
// agent, so this file avoids touching or importing from it entirely.
const MAX_TOKENS = 4096;

/**
 * Strips ```json fences and parses. If there's no fence, falls back to
 * extracting the outermost {...} block. Throws if nothing parseable is
 * found. (Deliberately duplicated from llm.ts's parseJson rather than
 * imported, for the same "don't touch llm.ts" reason as above.)
 */
function parseJsonLoose<T>(raw: string): T {
  let text = raw.trim();
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fenced) {
    text = fenced[1].trim();
  } else {
    const start = text.search(/[[{]/);
    const end = text.lastIndexOf("}");
    if (start >= 0 && end > start) {
      text = text.slice(start, end + 1);
    }
  }
  return JSON.parse(text) as T;
}

async function callAnyrouterForClustering(
  env: Env,
  prompt: string
): Promise<{ content: string; tokens: number }> {
  const baseUrl = env.ANYROUTER_BASE_URL || "https://anyrouter.dev/api/v1";
  const res = await fetch(`${baseUrl}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${env.ANYROUTER_API_KEY}`,
    },
    body: JSON.stringify({
      model: env.ANYROUTER_MODEL,
      messages: [{ role: "user", content: prompt }],
      temperature: 0,
      max_tokens: MAX_TOKENS,
      response_format: { type: "json_object" },
    }),
    signal: AbortSignal.timeout(30_000),
  });

  if (!res.ok) {
    throw new Error(
      `anyrouter request failed: ${res.status} ${await res.text()}`
    );
  }

  const data = (await res.json()) as {
    choices?: { message?: { content?: string } }[];
    usage?: { total_tokens?: number };
  };
  const content = data.choices?.[0]?.message?.content;
  if (!content?.trim()) throw new Error("anyrouter response missing content");
  return { content, tokens: data.usage?.total_tokens ?? 0 };
}

export interface ClusterNewInput {
  i: number;
  title: string;
}

export interface ClusterExistingInput {
  id: string;
  title: string;
}

export interface Cluster {
  new: number[];
  existing: string[];
}

const TITLE_DUP_JACCARD = 0.55;
const TITLE_DUP_MIN_SHARED = 3;

const TITLE_STOPWORDS = new Set([
  "a",
  "an",
  "the",
  "for",
  "to",
  "of",
  "in",
  "on",
  "at",
  "its",
  "it",
  "and",
  "or",
  "over",
  "more",
  "than",
  "since",
  "by",
  "with",
  "from",
  "as",
  "is",
  "are",
  "times",
  "time",
  "into",
  "after",
  "before",
  "about",
  "vs",
]);

/** Lowercase, strip UPDATE:, fold $8 billion → 8b / 5x → 5, drop punctuation. */
export function normalizeTitleForDedupe(title: string): string {
  return title
    .normalize("NFKD")
    .toLowerCase()
    .replace(/^update:\s*/i, "")
    .replace(/[“”"'`’]/g, "")
    .replace(/[$€£]/g, "")
    .replace(/\b(\d+(?:\.\d+)?)\s*(?:billion|bn)\b/g, "$1b")
    .replace(/\b(\d+(?:\.\d+)?)\s*(?:million|mn)\b/g, "$1m")
    .replace(/\b(\d+(?:\.\d+)?)[x×]\b/g, "$1")
    .replace(/\bfive\b/g, "5")
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
    .replace(/\s+/g, " ");
}

export function significantTitleTokens(title: string): Set<string> {
  const out = new Set<string>();
  for (const tok of normalizeTitleForDedupe(title).split(" ")) {
    if (!tok || tok.length < 2 || TITLE_STOPWORDS.has(tok)) continue;
    const stemmed =
      tok.length > 3 && tok.endsWith("s") ? tok.slice(0, -1) : tok;
    out.add(stemmed);
  }
  return out;
}

export function titleSimilarity(a: string, b: string): number {
  const na = normalizeTitleForDedupe(a);
  const nb = normalizeTitleForDedupe(b);
  if (!na || !nb) return 0;
  if (na === nb) return 1;
  const ta = significantTitleTokens(a);
  const tb = significantTitleTokens(b);
  if (ta.size === 0 || tb.size === 0) return 0;
  let inter = 0;
  for (const t of ta) {
    if (tb.has(t)) inter++;
  }
  return inter / (ta.size + tb.size - inter);
}

/** Same underlying headline: exact normalized match, or high token overlap. */
export function isTitleNearDuplicate(a: string, b: string): boolean {
  const na = normalizeTitleForDedupe(a);
  const nb = normalizeTitleForDedupe(b);
  if (!na || !nb) return false;
  if (na === nb) return true;
  const ta = significantTitleTokens(a);
  const tb = significantTitleTokens(b);
  let inter = 0;
  for (const t of ta) {
    if (tb.has(t)) inter++;
  }
  if (inter < TITLE_DUP_MIN_SHARED) return false;
  const jaccard = inter / (ta.size + tb.size - inter);
  const overlap = inter / Math.min(ta.size, tb.size);
  return jaccard >= TITLE_DUP_JACCARD || overlap >= TITLE_DUP_JACCARD;
}

type UfKey = string;

function unionFind() {
  const parent = new Map<UfKey, UfKey>();
  const find = (key: UfKey): UfKey => {
    const current = parent.get(key) ?? key;
    if (current !== key) {
      const root = find(current);
      parent.set(key, root);
      return root;
    }
    return current;
  };
  const union = (a: UfKey, b: UfKey) => {
    const pa = find(a);
    const pb = find(b);
    if (pa !== pb) parent.set(pa, pb);
  };
  const ensure = (key: UfKey) => {
    if (!parent.has(key)) parent.set(key, key);
  };
  return { find, union, ensure };
}

function emitClusters(
  uf: ReturnType<typeof unionFind>,
  newItems: ClusterNewInput[],
  recentItems: ClusterExistingInput[]
): Cluster[] {
  const groups = new Map<UfKey, Cluster>();
  for (const item of newItems) {
    const root = uf.find(`n:${item.i}`);
    const group = groups.get(root) ?? { new: [], existing: [] };
    group.new.push(item.i);
    groups.set(root, group);
  }
  for (const item of recentItems) {
    const key = `e:${item.id}`;
    const root = uf.find(key);
    const group = groups.get(root);
    if (!group) continue;
    group.existing.push(item.id);
  }
  return [...groups.values()].filter(
    (cluster) => cluster.new.length + cluster.existing.length >= 2
  );
}

/**
 * Deterministic fallback for the LLM clusterer: same story, different URL
 * (HuggingNews slug churn, HN vs original). Does not invent merges — only
 * high-overlap / normalized-equal titles.
 */
export function clusterByTitleSimilarity(
  newItems: ClusterNewInput[],
  recentItems: ClusterExistingInput[]
): Cluster[] {
  if (newItems.length === 0) return [];
  const uf = unionFind();
  for (const item of newItems) uf.ensure(`n:${item.i}`);
  for (const item of recentItems) uf.ensure(`e:${item.id}`);

  for (let i = 0; i < newItems.length; i++) {
    for (let j = i + 1; j < newItems.length; j++) {
      if (isTitleNearDuplicate(newItems[i].title, newItems[j].title)) {
        uf.union(`n:${newItems[i].i}`, `n:${newItems[j].i}`);
      }
    }
    for (const existing of recentItems) {
      if (isTitleNearDuplicate(newItems[i].title, existing.title)) {
        uf.union(`n:${newItems[i].i}`, `e:${existing.id}`);
      }
    }
  }
  return emitClusters(uf, newItems, recentItems);
}

/** Union LLM clusters with title-similarity clusters so either signal wins. */
export function mergeClusters(groups: Cluster[][]): Cluster[] {
  const newSeen = new Set<number>();
  const existingSeen = new Set<string>();
  for (const list of groups) {
    for (const cluster of list) {
      for (const i of cluster.new) newSeen.add(i);
      for (const id of cluster.existing) existingSeen.add(id);
    }
  }
  if (newSeen.size === 0 && existingSeen.size === 0) return [];

  const uf = unionFind();
  const newItems: ClusterNewInput[] = [...newSeen].map((i) => ({
    i,
    title: "",
  }));
  const recentItems: ClusterExistingInput[] = [...existingSeen].map((id) => ({
    id,
    title: "",
  }));
  for (const item of newItems) uf.ensure(`n:${item.i}`);
  for (const item of recentItems) uf.ensure(`e:${item.id}`);

  for (const list of groups) {
    for (const cluster of list) {
      const members: UfKey[] = [
        ...cluster.new.map((i) => `n:${i}`),
        ...cluster.existing.map((id) => `e:${id}`),
      ];
      for (let i = 1; i < members.length; i++) {
        uf.union(members[0], members[i]);
      }
    }
  }
  return emitClusters(uf, newItems, recentItems);
}

/** Defensive: keeps only well-shaped clusters with at least 2 total members
 * (a cluster of 1 item isn't a duplicate of anything). */
function normalizeClusters(raw: unknown): Cluster[] {
  if (!raw || typeof raw !== "object" || !("clusters" in raw)) return [];
  const clusters = (raw as { clusters?: unknown }).clusters;
  if (!Array.isArray(clusters)) return [];

  const out: Cluster[] = [];
  for (const entry of clusters) {
    if (!entry || typeof entry !== "object") continue;
    const e = entry as { new?: unknown; existing?: unknown };
    const newIdx = Array.isArray(e.new)
      ? e.new.filter((v): v is number => typeof v === "number")
      : [];
    const existingIds = Array.isArray(e.existing)
      ? e.existing.filter((v): v is string => typeof v === "string")
      : [];
    if (newIdx.length + existingIds.length < 2) continue;
    out.push({ new: newIdx, existing: existingIds });
  }
  return out;
}

/**
 * One LLM call asking which new items report the same underlying story as
 * each other or as a recently-published existing item. Any failure
 * (network, malformed/unexpected JSON) resolves to `[]` — no merging, every
 * item stays independent.
 */
export async function clusterSimilar(
  env: Env,
  newItems: ClusterNewInput[],
  recentItems: ClusterExistingInput[]
): Promise<Cluster[]> {
  if (newItems.length === 0) return [];

  const prompt = `You are deduplicating AI/tech news items. Some of the "new" items below may report the exact same underlying story as each other, or as one of the "existing" items (already published in the last 72h). Group only items about the SAME concrete event/story (not just the same general topic).

New items:
${JSON.stringify(newItems)}

Existing items:
${JSON.stringify(recentItems)}

Respond with strict JSON only: {"clusters":[{"new":[0,3],"existing":["abc123"]}]} — omit "new" or "existing" if empty for a cluster, and omit clusters entirely (empty array) if nothing matches.`;

  try {
    const { content, tokens } = await callAnyrouterForClustering(env, prompt);
    console.log(`clusterSimilar used ${tokens} tokens`);
    return normalizeClusters(parseJsonLoose<unknown>(content));
  } catch (error) {
    console.error("clusterSimilar failed:", error);
    return [];
  }
}

export type CanonicalSelection =
  | { type: "existing"; id: string }
  | { type: "new"; index: number };

/** Existing item wins as canonical; otherwise the new item with the
 * highest rank in `ranks` (index -> rank) wins. Returns null only if the
 * cluster has no existing id and none of its "new" indices have a known
 * rank (shouldn't happen for a well-formed cluster). */
export function selectCanonical(
  cluster: Cluster,
  ranks: Map<number, number>
): CanonicalSelection | null {
  if (cluster.existing.length > 0) {
    return { type: "existing", id: cluster.existing[0] };
  }

  let bestIndex: number | null = null;
  let bestRank = Number.NEGATIVE_INFINITY;
  for (const i of cluster.new) {
    const rank = ranks.get(i);
    if (rank === undefined) continue;
    if (bestIndex === null || rank > bestRank) {
      bestIndex = i;
      bestRank = rank;
    }
  }
  return bestIndex === null ? null : { type: "new", index: bestIndex };
}

/** Merges `incoming` sources onto `base`, deduping by URL (base wins on
 * conflict, order preserved), capped at `cap` total. Sources without a URL
 * are kept as-is (can't be deduped by URL) but still count toward the cap. */
export function unionSources(
  base: FetchedItemSource[],
  incoming: FetchedItemSource[],
  cap: number
): FetchedItemSource[] {
  const seenUrls = new Set<string>();
  const out: FetchedItemSource[] = [];

  for (const source of [...base, ...incoming]) {
    if (out.length >= cap) break;
    if (source.url) {
      if (seenUrls.has(source.url)) continue;
      seenUrls.add(source.url);
    }
    out.push(source);
  }

  return out;
}

export interface MergeCandidate {
  /** Index into the clustering request, matching ClusterNewInput.i. */
  i: number;
  id: string;
  url: string;
  sourceId: string;
  sources?: FetchedItemSource[];
  /** Canonical topic tags (already normalized/mapped by topics.ts), used
   * to union topics across a cluster so counts don't fragment across
   * near-duplicate stories. */
  topics?: string[];
  points: number;
  comments: number;
  rank: number;
}

export interface ExistingCandidate {
  points: number;
  comments: number;
}

export interface MergePlanEntry {
  /** Canonical item id: either an existing item's id, or a new item's id. */
  duplicateOf: string;
}

export interface CanonicalUpdate {
  isExisting: boolean;
  extraSources: FetchedItemSource[];
  extraTopics: string[];
  maxPoints: number;
  maxComments: number;
}

export interface MergePlan {
  /** New item id -> merge target, for every new item that is NOT the
   * canonical of its cluster. */
  merged: Map<string, MergePlanEntry>;
  /** Canonical item id -> accumulated updates from the rest of its
   * cluster. Present for every cluster that produced a merge, including
   * ones whose canonical is itself a new item. */
  canonicalUpdates: Map<string, CanonicalUpdate>;
}

/**
 * Pure planning step: given the clusters an LLM proposed and enough data
 * about each candidate item, decides who's canonical, who gets marked
 * merged, and what points/comments/sources the canonical should absorb.
 * Does no I/O — workflow.ts applies this plan against D1.
 */
export function buildMergePlan(
  clusters: Cluster[],
  candidates: MergeCandidate[],
  existingById: Map<string, ExistingCandidate>,
  sourceCap: number,
  topicCap = sourceCap
): MergePlan {
  const byIndex = new Map(candidates.map((c) => [c.i, c]));
  const ranks = new Map(candidates.map((c) => [c.i, c.rank]));

  const merged = new Map<string, MergePlanEntry>();
  const canonicalUpdates = new Map<string, CanonicalUpdate>();

  for (const cluster of clusters) {
    const canonical = selectCanonical(cluster, ranks);
    if (!canonical) continue;

    const canonicalId =
      canonical.type === "existing"
        ? canonical.id
        : (byIndex.get(canonical.index)?.id ?? null);
    if (!canonicalId) continue;

    let maxPoints =
      canonical.type === "existing"
        ? (existingById.get(canonical.id)?.points ?? 0)
        : 0;
    let maxComments =
      canonical.type === "existing"
        ? (existingById.get(canonical.id)?.comments ?? 0)
        : 0;
    const extraSources: FetchedItemSource[] = [];
    const extraTopics: string[] = [];

    for (const i of cluster.new) {
      const candidate = byIndex.get(i);
      if (!candidate) continue;

      maxPoints = Math.max(maxPoints, candidate.points);
      maxComments = Math.max(maxComments, candidate.comments);

      const isCanonicalItself =
        canonical.type === "new" && canonical.index === i;
      if (isCanonicalItself) {
        // The canonical's own topics still count toward the union.
        extraTopics.push(...(candidate.topics ?? []));
        continue;
      }

      merged.set(candidate.id, { duplicateOf: canonicalId });
      extraSources.push(...(candidate.sources ?? []));
      extraSources.push({
        kind: "source",
        url: candidate.url,
        author: candidate.sourceId,
      });
      extraTopics.push(...(candidate.topics ?? []));
    }

    if (extraSources.length === 0 && canonical.type === "existing") {
      // Cluster only referenced an existing item plus... nothing merged
      // into it (shouldn't happen given normalizeClusters' size>=2 guard,
      // but stay defensive).
      continue;
    }

    const existingUpdate = canonicalUpdates.get(canonicalId);
    canonicalUpdates.set(canonicalId, {
      isExisting: canonical.type === "existing",
      extraSources: unionSources(
        existingUpdate?.extraSources ?? [],
        extraSources,
        sourceCap
      ),
      extraTopics: unionTopics(
        existingUpdate?.extraTopics ?? [],
        extraTopics,
        topicCap
      ),
      maxPoints,
      maxComments,
    });
  }

  return { merged, canonicalUpdates };
}
