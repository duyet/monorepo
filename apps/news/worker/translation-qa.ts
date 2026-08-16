/**
 * Rates existing Vietnamese translations for naturalness against VI_STYLE,
 * then immediately re-translates the ones that fall short, feeding the
 * judge's critique back into the generator as guidance. One retry per item
 * per run — if the retry still doesn't clear the bar, the better of the two
 * attempts is kept and the item moves on rather than looping.
 */
import { callAnyrouter, parseJson, VI_STYLE } from "./llm.js";
import type { Env } from "./types.js";

export const QA_CAP = 15;
export const QA_RATING_THRESHOLD = 0.7;

export function buildPendingQaQuery(limit = QA_CAP): string {
  return `SELECT t.item_id AS id, i.title AS en_title, i.summary AS en_summary,
                  t.title AS vi_title, t.summary AS vi_summary
           FROM translations t
           JOIN items i ON i.id = t.item_id
           WHERE t.lang = 'vi' AND t.qa_rating IS NULL
             AND t.title IS NOT NULL AND t.title != ''
             AND t.summary IS NOT NULL AND t.summary != ''
           ORDER BY i.published_at DESC
           LIMIT ${limit}`;
}

export interface QaRow {
  id: string;
  en_title: string;
  en_summary: string | null;
  vi_title: string;
  vi_summary: string;
}

interface JudgeResult {
  i: number;
  rating: number;
  critique: string;
}

interface RetranslateResult {
  title: string;
  summary: string;
}

/**
 * Judges naturalness of a batch of {EN source, VI translation} pairs with
 * the same VI_STYLE criteria the generator writes to, so judge and
 * generator share standards. `critique` is only meaningful (and only
 * requested) for ratings that fail the threshold — the judge is told to
 * leave it empty otherwise.
 */
async function judgeTranslations(
  env: Env,
  rows: { i: number; en: string; vi: string }[]
): Promise<{ results: JudgeResult[]; tokens: number }> {
  const prompt = `Rate how natural each Vietnamese translation reads to a Vietnamese tech news reader, using the SAME house style rules given above (no parenthetical glosses, no calques, everyday word choice over stiff formalese, active voice, natural sentence rhythm).

For each item, return a naturalness rating from 0 (unusable, reads like machine translation) to 1 (indistinguishable from a native Vietnamese tech journalist's writing). If the rating is below 0.7, include a short critique (1-2 sentences) naming the specific problems (e.g. "calqued from English word order", "stiff passive voice", "over-formal Sino-Vietnamese", "parenthetical gloss"). If the rating is 0.7 or above, leave critique empty.

Items (en = English source, vi = Vietnamese translation to judge):
${JSON.stringify(rows)}

Respond with strict JSON only: {"results":[{"i":0,"rating":0.8,"critique":""}]}`;

  const { content: raw, tokens } = await callAnyrouter(
    env,
    [
      { role: "system", content: VI_STYLE },
      { role: "user", content: prompt },
    ],
    { json: true, modelSpec: env.ANYROUTER_QA_MODEL }
  );
  const parsed = parseJson<{ results: JudgeResult[] }>(raw);
  return {
    results: Array.isArray(parsed.results) ? parsed.results : [],
    tokens,
  };
}

/** Re-translates a single item, with the judge's critique fed back as
 * explicit guidance on what to avoid this time. */
async function retranslateWithCritique(
  env: Env,
  row: QaRow,
  critique: string
): Promise<{ result: RetranslateResult | null; tokens: number }> {
  const prompt = `Translate this AI/tech news item into Vietnamese.

The previous translation had these issues: ${critique || "did not read naturally"} — rewrite avoiding them.

Item:
${JSON.stringify({ title: row.en_title, summary: row.en_summary ?? "" })}

Respond with strict JSON only: {"title":"...","summary":"..."}`;

  const { content: raw, tokens } = await callAnyrouter(
    env,
    [
      { role: "system", content: VI_STYLE },
      { role: "user", content: prompt },
    ],
    { json: true, modelSpec: env.ANYROUTER_TRANSLATE_MODEL }
  );
  const parsed = parseJson<Partial<RetranslateResult>>(raw);
  if (!parsed.title || parsed.summary === undefined) {
    return { result: null, tokens };
  }
  return { result: { title: parsed.title, summary: parsed.summary }, tokens };
}

export async function ratePendingTranslations(
  env: Env,
  cap = QA_CAP
): Promise<void> {
  const { results } = await env.DB.prepare(
    buildPendingQaQuery(cap)
  ).all<QaRow>();
  const rows = results ?? [];
  if (rows.length === 0) return;

  let totalTokens = 0;
  const now = Math.floor(Date.now() / 1000);

  const { results: judged, tokens: judgeTokens } = await judgeTranslations(
    env,
    rows.map((row, i) => ({
      i,
      en: `${row.en_title}\n${row.en_summary ?? ""}`,
      vi: `${row.vi_title}\n${row.vi_summary}`,
    }))
  );
  totalTokens += judgeTokens;

  for (const judgment of judged) {
    const row = rows[judgment.i];
    if (!row) continue;

    if (judgment.rating >= QA_RATING_THRESHOLD) {
      await env.DB.prepare(
        "UPDATE translations SET qa_rating = ?, qa_at = ? WHERE item_id = ? AND lang = 'vi'"
      )
        .bind(judgment.rating, now, row.id)
        .run();
      continue;
    }

    // Low rating: retranslate once with the critique as guidance, re-judge
    // just that item, and keep whichever attempt scored higher.
    const { result: retranslated, tokens: retranslateTokens } =
      await retranslateWithCritique(env, row, judgment.critique);
    totalTokens += retranslateTokens;

    if (!retranslated) {
      await env.DB.prepare(
        "UPDATE translations SET qa_rating = ?, qa_at = ? WHERE item_id = ? AND lang = 'vi'"
      )
        .bind(judgment.rating, now, row.id)
        .run();
      continue;
    }

    const { results: rejudged, tokens: rejudgeTokens } =
      await judgeTranslations(env, [
        {
          i: 0,
          en: `${row.en_title}\n${row.en_summary ?? ""}`,
          vi: `${retranslated.title}\n${retranslated.summary}`,
        },
      ]);
    totalTokens += rejudgeTokens;
    const newRating = rejudged[0]?.rating ?? judgment.rating;

    if (newRating > judgment.rating) {
      await env.DB.prepare(
        `UPDATE translations SET title = ?, summary = ?, qa_rating = ?, qa_at = ?
         WHERE item_id = ? AND lang = 'vi'`
      )
        .bind(retranslated.title, retranslated.summary, newRating, now, row.id)
        .run();
    } else {
      await env.DB.prepare(
        "UPDATE translations SET qa_rating = ?, qa_at = ? WHERE item_id = ? AND lang = 'vi'"
      )
        .bind(judgment.rating, now, row.id)
        .run();
    }
  }

  console.log(
    `translation-qa: rated ${judged.length}/${rows.length} translations, ${totalTokens} tokens`
  );
}
