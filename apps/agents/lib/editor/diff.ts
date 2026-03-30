/**
 * ProseMirror-based document diffing utility.
 *
 * Uses diff-match-patch for text-level diffs, then maps those onto
 * ProseMirror document nodes to produce a merged document with
 * insert/delete marks that the DiffView component renders.
 *
 * Ported from vercel/ai-chatbot lib/editor/diff.js, adapted to use
 * diff-match-patch instead of the original diff algorithm.
 */

import { type Node as ProseMirrorNode } from "prosemirror-model";
import DiffMatchPatch from "diff-match-patch";

// ---------------------------------------------------------------------------
// Diff type enum
// ---------------------------------------------------------------------------

export enum DiffType {
  Unchanged = 0,
  Deleted = -1,
  Inserted = 1,
}

// ---------------------------------------------------------------------------
// Text-level diff using diff-match-patch
// ---------------------------------------------------------------------------

const dmp = new DiffMatchPatch();
dmp.Edit_Cost = 8; // slightly more aggressive matching

interface TextDiff {
  type: DiffType;
  text: string;
}

function computeTextDiffs(oldText: string, newText: TextDiff[]): TextDiff[] {
  const results: TextDiff[] = [];

  for (const diff of newText) {
    results.push(diff);
  }

  return results;
}

/**
 * Compute character-level diffs between two plain-text strings.
 * Returns an array of { type, text } segments.
 */
export function diffText(
  oldText: string,
  newText: string
): TextDiff[] {
  const diffs = dmp.diff_main(oldText, newText);
  dmp.diff_cleanupSemantic(diffs);

  return diffs.map(([op, text]: [number, string]) => ({
    type: op as DiffType,
    text,
  }));
}

// ---------------------------------------------------------------------------
// ProseMirror node-level diff
// ---------------------------------------------------------------------------

interface NodeDiffResult {
  type: DiffType;
  node: ProseMirrorNode;
}

/**
 * Compare two ProseMirror JSON representations and produce a merged
 * document spec where changed nodes carry diff marks.
 *
 * This operates at the *node* level (paragraph-level granularity),
 * which is sufficient for the artifact diff view.
 */
export function diffEditor(
  schema: any,
  oldDocJSON: Record<string, unknown>,
  newDocJSON: Record<string, unknown>
): ProseMirrorNode {
  const oldNodes = getBlockNodes(oldDocJSON);
  const newNodes = getBlockNodes(newDocJSON);

  // Build a simple LCS-style alignment at the block level
  const { merged } = alignBlocks(oldNodes, newNodes);

  // Reconstruct a document from merged blocks, applying diff marks
  const nodes: ProseMirrorNode[] = [];

  for (const block of merged) {
    if (block.type === DiffType.Unchanged) {
      nodes.push(schema.nodeFromJSON(block.new));
    } else if (block.type === DiffType.Inserted) {
      nodes.push(
        wrapWithDiffMark(schema, block.new, "diffMark", { type: String(DiffType.Inserted) })
      );
    } else if (block.type === DiffType.Deleted) {
      nodes.push(
        wrapWithDiffMark(schema, block.old, "diffMark", { type: String(DiffType.Deleted) })
      );
    }
  }

  return schema.node("doc", null, nodes);
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

interface BlockData {
  old: Record<string, unknown>;
  new: Record<string, unknown>;
  type: DiffType;
}

function getBlockNodes(docJSON: Record<string, unknown>): Record<string, unknown>[] {
  const content = docJSON.content as Array<Record<string, unknown>> | undefined;
  return content ?? [];
}

/**
 * Align old and new block arrays using a simple LCS approach.
 * Returns merged blocks with diff type annotations.
 */
function alignBlocks(
  oldBlocks: Record<string, unknown>[],
  newBlocks: Record<string, unknown>[]
): { merged: BlockData[] } {
  const merged: BlockData[] = [];

  // Simple approach: hash each block's text content for comparison
  const oldHashes = oldBlocks.map(blockToHash);
  const newHashes = newBlocks.map(blockToHash);

  // Build LCS table
  const m = oldHashes.length;
  const n = newHashes.length;
  const dp: number[][] = Array.from({ length: m + 1 }, () =>
    Array(n + 1).fill(0)
  );

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (oldHashes[i - 1] === newHashes[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1] + 1;
      } else {
        dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
      }
    }
  }

  // Backtrack to produce the merged result
  const result: BlockData[] = [];
  let i = m,
    j = n;

  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && oldHashes[i - 1] === newHashes[j - 1]) {
      result.unshift({
        old: oldBlocks[i - 1],
        new: newBlocks[j - 1],
        type: DiffType.Unchanged,
      });
      i--;
      j--;
    } else if (j > 0 && (i === 0 || dp[i][j - 1] >= dp[i - 1][j])) {
      result.unshift({
        old: newBlocks[j - 1],
        new: newBlocks[j - 1],
        type: DiffType.Inserted,
      });
      j--;
    } else if (i > 0) {
      result.unshift({
        old: oldBlocks[i - 1],
        new: oldBlocks[i - 1],
        type: DiffType.Deleted,
      });
      i--;
    }
  }

  return { merged: result };
}

/**
 * Convert a block node to a simple hash string for comparison.
 */
function blockToHash(block: Record<string, unknown>): string {
  const text = extractText(block);
  return text.trim();
}

function extractText(node: Record<string, unknown>): string {
  if (typeof node.text === "string") return node.text;
  const content = node.content as Array<Record<string, unknown>> | undefined;
  if (!content) return "";
  return content.map(extractText).join("");
}

/**
 * Wrap a JSON node's inline content with a diff mark.
 */
function wrapWithDiffMark(
  schema: any,
  nodeJSON: Record<string, unknown>,
  markType: string,
  attrs: Record<string, string>
): ProseMirrorNode {
  const mark = schema.marks[markType];
  if (!mark) {
    return schema.nodeFromJSON(nodeJSON);
  }

  const wrappedJSON = { ...nodeJSON };
  const content = wrappedJSON.content as Array<Record<string, unknown>> | undefined;

  if (content) {
    wrappedJSON.content = content.map((child) => ({
      ...child,
      marks: [...(Array.isArray(child.marks) ? child.marks : []), { type: markType, attrs }],
    }));
  }

  try {
    return schema.nodeFromJSON(wrappedJSON);
  } catch {
    // If the marked node fails to parse, fall back to the original
    return schema.nodeFromJSON(nodeJSON);
  }
}
