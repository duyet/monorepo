export interface RankScoreInput {
  importance: number;
  quality: number;
  points: number;
  comments: number;
  publishedAt: number;
  now: number;
}

export function rankScore({
  importance,
  quality,
  points,
  comments,
  publishedAt,
  now,
}: RankScoreInput): number {
  const ageHours = Math.max(0, (now - publishedAt) / (1000 * 60 * 60));
  const qualityFactor = 0.6 + 0.4 * (quality / 10);
  const decay = Math.exp(-ageHours / 36);
  const engagement = 1 + Math.log10(1 + points + 0.5 * comments);
  return importance * qualityFactor * decay * engagement;
}
