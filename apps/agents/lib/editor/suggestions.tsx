import type { Node } from "prosemirror-model";
import { Plugin, PluginKey } from "prosemirror-state";
import { DecorationSet } from "prosemirror-view";

export interface Suggestion {
  id: string;
  documentId: string;
  originalText: string;
  suggestedText: string;
  isResolved: boolean;
}

export interface UISuggestion extends Suggestion {
  selectionStart: number;
  selectionEnd: number;
}

export const suggestionsPluginKey = new PluginKey("suggestions");

export const suggestionsPlugin = new Plugin({
  key: suggestionsPluginKey,
  state: {
    init() {
      return { decorations: DecorationSet.empty, selected: null };
    },
    apply(tr, state) {
      const newDecorations = tr.getMeta(suggestionsPluginKey);
      if (newDecorations) {
        return newDecorations;
      }

      return {
        decorations: state.decorations.map(tr.mapping, tr.doc),
        selected: state.selected,
      };
    },
  },
  props: {
    decorations(state) {
      return this.getState(state)?.decorations ?? DecorationSet.empty;
    },
    handleDOMEvents: {
      mousedown(_view, event) {
        const target = event.target as HTMLElement;
        if (target.closest(".suggestion-highlight")) {
          event.preventDefault();
          return true;
        }
        return false;
      },
    },
  },
});

export function projectWithPositions(
  doc: Node,
  suggestions: Suggestion[]
): UISuggestion[] {
  return suggestions.map((suggestion) => {
    let selectionStart = 0;
    let selectionEnd = 0;

    doc.nodesBetween(0, doc.content.size, (node, pos) => {
      if (node.isText && node.text) {
        const index = node.text.indexOf(suggestion.originalText);
        if (index !== -1 && selectionStart === 0) {
          selectionStart = pos + index;
          selectionEnd = pos + index + suggestion.originalText.length;
          return false;
        }
      }
      return true;
    });

    return {
      ...suggestion,
      selectionStart,
      selectionEnd,
    };
  });
}
