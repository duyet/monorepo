/**
 * Production defaults from xai-org/x-algorithm
 * home-mixer/params/param.rs — last sync 2026-08-12T04:09:22Z
 * https://github.com/xai-org/x-algorithm
 */

export const SOURCE_REPO = "https://github.com/xai-org/x-algorithm";
export const PARAM_SYNC = "2026-08-12";
export const SITE_URL = "https://x-algo.duyet.net";
export const SITE_TITLE = "X For You algorithm, decoded";
export const SITE_DESCRIPTION =
  "Copy-link is 40× a like. One report wipes ~468 likes. Interactive map of the open-sourced For You ranking weights.";

export const NEGATIVE_SCORES_OFFSET = 0.001;
export const OON_WEIGHT = 0.75;
export const AUTHOR_DIVERSITY_DECAY = 0.5;
export const AUTHOR_DIVERSITY_FLOOR = 0.25;
export const REPLY_WEIGHT = 5;
export const MUTUAL_REPLY_BOOST = 15;
export const MAX_POST_AGE_HOURS = 48;
export const COLD_START_FOLLOWER_CAP = 1000;
export const COLD_START_IMPRESSION_THRESHOLD = 1000;

export type WeightRow = {
  id: string;
  label: string;
  weight: number;
  group: "positive" | "negative";
  note?: string;
};

export const WEIGHTS: WeightRow[] = [
  {
    id: "share_via_copy_link",
    label: "Copy link",
    weight: 20,
    group: "positive",
    note: "largest positive head",
  },
  {
    id: "reply",
    label: "Reply",
    weight: 5,
    group: "positive",
    note: "20 if mutual-follow original",
  },
  {
    id: "share_via_dm",
    label: "Share via DM",
    weight: 5,
    group: "positive",
  },
  { id: "quote", label: "Quote", weight: 5, group: "positive" },
  { id: "follow_author", label: "Follow author", weight: 4, group: "positive" },
  { id: "share", label: "Share", weight: 2, group: "positive" },
  { id: "retweet", label: "Repost", weight: 1, group: "positive" },
  { id: "favorite", label: "Like", weight: 0.5, group: "positive" },
  { id: "click", label: "Click post", weight: 0.4, group: "positive" },
  {
    id: "open_link",
    label: "Open link",
    weight: 0.2,
    group: "positive",
    note: "external URL click",
  },
  { id: "photo_expand", label: "Photo expand", weight: 0.05, group: "positive" },
  { id: "video_open", label: "Video open", weight: 0.05, group: "positive" },
  {
    id: "vqv",
    label: "Video quality view",
    weight: 0.05,
    group: "positive",
    note: "viewer <10k followers, video >10s",
  },
  { id: "quoted_click", label: "Quoted click", weight: 0.05, group: "positive" },
  {
    id: "post_unexplored",
    label: "Unexplored",
    weight: 0.02,
    group: "positive",
    note: "in-network only",
  },
  {
    id: "cont_dwell_time",
    label: "Dwell seconds",
    weight: 0.004,
    group: "positive",
    note: "multiplies seconds, not a 0–1 probability",
  },
  { id: "dwell", label: "Dwell (binary)", weight: 0, group: "positive" },
  { id: "profile_click", label: "Profile click", weight: 0, group: "positive" },
  { id: "report", label: "Report", weight: -234, group: "negative" },
  { id: "mute_author", label: "Mute", weight: -58.8, group: "negative" },
  {
    id: "not_interested",
    label: "Not interested",
    weight: -43.2,
    group: "negative",
  },
  { id: "block_author", label: "Block", weight: -31.2, group: "negative" },
  { id: "not_dwelled", label: "Not dwelled", weight: -0.02, group: "negative" },
];

export const WEIGHT_BY_ID: Record<string, number> = Object.fromEntries(
  WEIGHTS.map((w) => [w.id, w.weight]),
);

export type ScoreFlags = {
  inNetwork: boolean;
  isReply: boolean;
  isRetweet: boolean;
  isMutualFollow: boolean;
  authorOccurrence: number;
};

export type ActionProbs = Record<string, number>;

export function replyWeightFor(flags: ScoreFlags): number {
  const eligible =
    !flags.isReply && !flags.isRetweet && flags.isMutualFollow;
  return eligible ? REPLY_WEIGHT + MUTUAL_REPLY_BOOST : REPLY_WEIGHT;
}

export function diversityMultiplier(k: number): number {
  return (
    (1 - AUTHOR_DIVERSITY_FLOOR) * AUTHOR_DIVERSITY_DECAY ** k +
    AUTHOR_DIVERSITY_FLOOR
  );
}

export function oonApplies(flags: ScoreFlags): boolean {
  if (!flags.inNetwork) return true;
  return flags.isReply || flags.isRetweet;
}

export function offsetScore(combined: number): number {
  const positiveSum = WEIGHTS.filter(
    (w) => w.group === "positive" && w.id !== "cont_dwell_time",
  ).reduce((s, w) => s + w.weight, 0);
  const negativeSum = -WEIGHTS.filter((w) => w.group === "negative").reduce(
    (s, w) => s + w.weight,
    0,
  );
  const totalSum = positiveSum + negativeSum;
  if (totalSum === 0) return Math.max(combined, 0);
  if (combined < 0) {
    return ((combined + negativeSum) / totalSum) * NEGATIVE_SCORES_OFFSET;
  }
  return combined + NEGATIVE_SCORES_OFFSET;
}

export type ScoreBreakdown = {
  combined: number;
  weighted: number;
  diversity: number;
  oon: number;
  final: number;
  terms: Array<{ id: string; label: string; prob: number; weight: number; term: number }>;
};

export function scorePost(
  probs: ActionProbs,
  flags: ScoreFlags,
): ScoreBreakdown {
  const terms = WEIGHTS.map((w) => {
    const weight = w.id === "reply" ? replyWeightFor(flags) : w.weight;
    const prob = probs[w.id] ?? 0;
    return {
      id: w.id,
      label: w.label,
      prob,
      weight,
      term: prob * weight,
    };
  });
  const combined = terms.reduce((s, t) => s + t.term, 0);
  const weighted = offsetScore(combined);
  const diversity = diversityMultiplier(Math.max(0, flags.authorOccurrence));
  const oon = oonApplies(flags) ? OON_WEIGHT : 1;
  return {
    combined,
    weighted,
    diversity,
    oon,
    final: weighted * diversity * oon,
    terms: terms.filter((t) => t.prob !== 0 || t.id === "reply"),
  };
}

export type Preset = {
  id: string;
  label: string;
  blurb: string;
  flags: ScoreFlags;
  probs: ActionProbs;
};

export const PRESETS: Preset[] = [
  {
    id: "copy-link",
    label: "Copy-link",
    blurb: "People paste it into a chat.",
    flags: {
      inNetwork: false,
      isReply: false,
      isRetweet: false,
      isMutualFollow: false,
      authorOccurrence: 0,
    },
    probs: {
      share_via_copy_link: 0.06,
      share_via_dm: 0.03,
      reply: 0.08,
      quote: 0.04,
      favorite: 0.12,
      click: 0.2,
    },
  },
  {
    id: "conversation",
    label: "Conversation",
    blurb: "A claim people argue under.",
    flags: {
      inNetwork: true,
      isReply: false,
      isRetweet: false,
      isMutualFollow: true,
      authorOccurrence: 0,
    },
    probs: {
      reply: 0.18,
      quote: 0.06,
      favorite: 0.16,
      share: 0.02,
      click: 0.18,
    },
  },
  {
    id: "like-farm",
    label: "Like farm",
    blurb: "Lots of hearts, no talk.",
    flags: {
      inNetwork: false,
      isReply: false,
      isRetweet: false,
      isMutualFollow: false,
      authorOccurrence: 0,
    },
    probs: {
      favorite: 0.45,
      click: 0.15,
      reply: 0.015,
      quote: 0.005,
    },
  },
  {
    id: "ragebait",
    label: "Ragebait",
    blurb: "Replies plus reports.",
    flags: {
      inNetwork: false,
      isReply: false,
      isRetweet: false,
      isMutualFollow: false,
      authorOccurrence: 0,
    },
    probs: {
      favorite: 0.14,
      reply: 0.16,
      quote: 0.05,
      report: 0.012,
      mute_author: 0.02,
      not_interested: 0.03,
      click: 0.22,
    },
  },
  {
    id: "reply-guy",
    label: "Reply-guy",
    blurb: "A reply, even to followers.",
    flags: {
      inNetwork: true,
      isReply: true,
      isRetweet: false,
      isMutualFollow: true,
      authorOccurrence: 0,
    },
    probs: {
      reply: 0.1,
      favorite: 0.08,
      click: 0.12,
    },
  },
  {
    id: "flood",
    label: "Fourth post",
    blurb: "Same author, same slate.",
    flags: {
      inNetwork: true,
      isReply: false,
      isRetweet: false,
      isMutualFollow: true,
      authorOccurrence: 3,
    },
    probs: {
      reply: 0.12,
      favorite: 0.14,
      quote: 0.04,
      click: 0.16,
    },
  },
];

export type PipelineStep = {
  n: string;
  title: string;
  body: string;
};

export const PIPELINE: PipelineStep[] = [
  {
    n: "01",
    title: "Hydrate viewer",
    body: "Recent engagements, follows, blocks, mutes, muted keywords, already-seen posts.",
  },
  {
    n: "02",
    title: "Candidate sources",
    body: "Thunder: last 48h from follows (1200). Phoenix: OON two-tower (1000). SimClusters: cluster ANN (800).",
  },
  {
    n: "03",
    title: "Pre-score filters",
    body: "Dedup, older than 48h, your own posts, OON replies/RTs, seen, muted, blocked.",
  },
  {
    n: "04",
    title: "Phoenix score",
    body: "Transformer predicts P(each action). Candidates cannot attend to each other.",
  },
  {
    n: "05",
    title: "Weighted sum",
    body: "score = Σ P(action) × weight. Copy-link 20. Reply 5 (20 if mutual original). Report −234.",
  },
  {
    n: "06",
    title: "Adjust",
    body: "Author diversity 1 / 0.625 / 0.438 / 0.344. OON ×0.75. Small-account lift to slot 16.",
  },
  {
    n: "07",
    title: "DPP rerank",
    body: "VMRanker θ=0.65 zeros near-duplicates so one take does not fill the slate.",
  },
  {
    n: "08",
    title: "Visibility",
    body: "ALLOW, INTERSTITIAL, or DROP. NSFW / spam-HR / Do-Not-Amplify kill recommendations.",
  },
];

export type DropRule = {
  label: string;
  scope: "everyone" | "oon";
  meaning: string;
};

export const DROP_RULES: DropRule[] = [
  {
    label: "SPAM / BOUNCE / PDNA",
    scope: "everyone",
    meaning: "Removed from follower Home too.",
  },
  {
    label: "FOSNR hate / violence / abuse / civic",
    scope: "everyone",
    meaning: "Policy drop on Home, not just recommendations.",
  },
  {
    label: "NSFW / gore / NSFW text",
    scope: "oon",
    meaning: "Followers can still see it. Non-followers cannot.",
  },
  {
    label: "SPAM_HIGH_RECALL",
    scope: "oon",
    meaning: "Engagement bait and farming always land here.",
  },
  {
    label: "DO_NOT_AMPLIFY / MALICIOUS_URL",
    scope: "oon",
    meaning: "Link and amplification blocks for recommendations.",
  },
  {
    label: "FOSNR_ABUSE_INSULTS",
    scope: "oon",
    meaning: "English targeted insults. Followers still see it.",
  },
];

export type PlaybookItem = {
  title: string;
  body: string;
};

export const PLAYBOOK: PlaybookItem[] = [
  {
    title: "Original post only",
    body: "Replies and reposts from unfollowed accounts never enter OON. Even followers apply ×0.75 to your replies and RTs.",
  },
  {
    title: "First like inside 48 hours",
    body: "Phoenix HOME retrieval is 1fav_1day. Zero likes means you stay in Thunder (followers). After 48h AgeFilter drops you.",
  },
  {
    title: "Write for copy, reply, quote",
    body: "Copy-link is 40× a like. Reply and quote are 10×. Mutuals make reply 40×. Profile clicks and binary dwell are 0.",
  },
  {
    title: "One post, not a spray",
    body: "2nd / 3rd / 4th post in the same slate: ×0.625 / ×0.438 / ×0.344. DPP then zeros near-duplicates.",
  },
  {
    title: "Do not collect reports",
    body: "One predicted report (−234) wipes ~468 likes. Mute −58.8, not-interested −43.2, block −31.2.",
  },
  {
    title: "Stay off the drop list",
    body: "Bait, slop, NSFW, insults, and sketchy links never reach non-followers. Check x.com/i/under_the_hood.",
  },
];

export function likesEquivalent(weight: number): number {
  return weight / WEIGHT_BY_ID.favorite;
}

export function shareIntentUrl(text: string): string {
  return `https://x.com/intent/post?text=${encodeURIComponent(text)}`;
}

export const DEFAULT_SHARE_TEXT = `${SITE_TITLE}

Copy-link is 40× a like. One report wipes ~468 likes.

I mapped the open-sourced For You weights:
${SITE_URL}`;
