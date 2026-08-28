import type { CSSProperties, ReactElement } from "react";
import { highlightTitle, tagsForHighlight } from "../lib/highlight";
import { topicColor } from "../lib/topic-color";

/** Feed-title and AI;DR entity spans: same `topic-colored` palette, capped
 * by `highlightTitle` so a bullet never becomes a rainbow. */
export function HighlightedText({
  text,
  tags,
}: {
  text: string;
  tags: string[];
}): ReactElement {
  const segments = highlightTitle(text, tagsForHighlight(tags));
  return (
    <>
      {segments.map((s, i) => {
        if (s.highlighted && s.tag) {
          const color = topicColor(s.tag);
          return (
            <span
              key={i}
              className="topic-colored font-semibold"
              style={
                {
                  "--tc-light": color.light,
                  "--tc-dark": color.dark,
                } as CSSProperties
              }
            >
              {s.text}
            </span>
          );
        }
        return s.highlighted ? (
          <span key={i} className="font-semibold text-accent">
            {s.text}
          </span>
        ) : (
          <span key={i}>{s.text}</span>
        );
      })}
    </>
  );
}
