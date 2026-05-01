/**
 * ProseMirror-based document diffing utility.
 *
 * Uses Rust/WASM (similar crate) for text-level and block-level diffs,
 * then maps those onto ProseMirror document nodes to produce a merged
 * document with insert/delete marks that the DiffView component renders.
 */

import type { Node as ProseMirrorNode } from "prosemirror-model";
import { diff_text, align_blocks } from "@duyet/wasm/pkg/diff/diff.js";

// ---------------------------------------------------------------------------
// Diff type enum (matches the original diff-match-patch convention)
// ---------------------------------------------------------------------------

export enum DiffType {
  Unchanged = 0,
  Deleted = -1,
  Inserted = 1,
}

// ---------------------------------------------------------------------------
// WASM type code mapping
// Rust uses: 0=equal, 1=insert, 2=delete
// TS uses:   0=unchanged, 1=inserted, -1=deleted
// ---------------------------------------------------------------------------

const WASM_INSERT = 1;
const WASM_DELETE = 2;
const EMPTY_BLOCK: Record<string, unknown> = { type: "paragraph", content: [] };

function wasmToDiffType(code: number): DiffType {
  switch (code) {
    case WASM_INSERT: return DiffType.Inserted;
    case WASM_DELETE: return DiffType.Deleted;
    default: return DiffType.Unchanged;
  }
}

// ---------------------------------------------------------------------------
// Text-level diff using WASM
// ---------------------------------------------------------------------------

interface TextDiff {
  type: DiffType;
  text: string;
}

/**
 * Compute character-level diffs between two plain-text strings.
 * Returns an array of { type, text } segments.
 */
export function diffText(
  oldText: string,
  newText: string
): TextDiff[] {
  const json = diff_text(oldText, newText);
  const ops: Array<{ type: number; text: string }> = JSON.parse(json);
  return ops.map(({ type, text }) => ({
    type: wasmToDiffType(type),
    text,
  }));
}

// ---------------------------------------------------------------------------
// ProseMirror node-level diff
// ---------------------------------------------------------------------------

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

  const merged = alignBlocks(oldNodes, newNodes);

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
 * Align old and new block arrays using the WASM LCS implementation.
 * Converts blocks to text for comparison, delegates alignment to Rust,
 * then reconstructs block references with diff type annotations.
 *
 * The WASM output is in merged order. We track positions into the original
 * old/new block arrays using the line text to map back to block objects.
 */
function alignBlocks(
  oldBlocks: Record<string, unknown>[],
  newBlocks: Record<string, unknown>[]
): BlockData[] {
  if (oldBlocks.length === 0 && newBlocks.length === 0) return [];

  const oldTexts = oldBlocks.map(blockToHash);
  const newTexts = newBlocks.map(blockToHash);

  const oldJoined = oldTexts.join("\n");
  const newJoined = newTexts.join("\n");

  const json = align_blocks(oldJoined, newJoined);
  const wasmBlocks: Array<{ type: number; old_text: string; new_text: string }> = JSON.parse(json);

  // Walk the WASM output and map back to original block objects by index.
  // The LCS backtrack processes old/new arrays sequentially, so advancing
  // cursors linearly is correct.
  let oldIdx = 0;
  let newIdx = 0;
  const result: BlockData[] = [];

  for (const wb of wasmBlocks) {
    const diffType = wasmToDiffType(wb.type);

    // Advance old cursor to match text
    let oldBlock = EMPTY_BLOCK;
    while (oldIdx < oldTexts.length) {
      if (oldTexts[oldIdx] === wb.old_text) {
        oldBlock = oldBlocks[oldIdx];
        oldIdx++;
        break;
      }
      oldIdx++;
    }

    // Advance new cursor to match text
    let newBlock = EMPTY_BLOCK;
    while (newIdx < newTexts.length) {
      if (newTexts[newIdx] === wb.new_text) {
        newBlock = newBlocks[newIdx];
        newIdx++;
        break;
      }
      newIdx++;
    }

    result.push({ old: oldBlock, new: newBlock, type: diffType });
  }

  return result;
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
