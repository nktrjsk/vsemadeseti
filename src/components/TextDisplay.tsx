import type { CharItem } from "../engine/useTypingSession";

/* Renders the drill text with gentle per-character status. Errors are warm
 * (amber), never alarming red. The current position shows a soft caret.
 * With `showEnter`, line breaks render a typeable ↵ glyph at the row end. */

export function TextDisplay({
  items,
  justErrored,
  showEnter = false,
}: {
  items: CharItem[];
  justErrored: boolean;
  showEnter?: boolean;
}) {
  return (
    <div
      style={{
        fontFamily: "var(--font-type)",
        fontSize: "clamp(1.3rem, 2.6vw, 1.9rem)",
        lineHeight: 1.9,
        letterSpacing: "0.02em",
        textAlign: "center",
        maxWidth: 820,
        margin: "0 auto",
        whiteSpace: "pre-wrap",
        wordBreak: "break-word",
      }}
    >
      {items.map((it, i) => {
        const isNewline = it.char === "\n";
        if (isNewline && !showEnter) return <br key={i} />;
        const isSpace = it.char === " ";
        let color = "var(--text-faint)";
        let background = "transparent";
        let borderBottom = "2px solid transparent";
        if (it.status === "correct") color = "var(--text)";
        else if (it.status === "wrong") {
          color = "var(--gentle)";
          background = "color-mix(in srgb, var(--gentle) 22%, transparent)";
        } else if (it.status === "current") {
          color = "var(--accent-strong)";
          borderBottom = "3px solid var(--accent)";
          background = justErrored
            ? "color-mix(in srgb, var(--gentle) 28%, transparent)"
            : "var(--accent-soft)";
        }
        const span = (
          <span
            key={isNewline ? undefined : i}
            style={{
              color,
              background,
              borderBottom,
              borderRadius: 4,
              padding: isSpace ? "0 1px" : "0 1.5px",
              transition: "background .12s ease, color .12s ease",
              ...(isNewline ? { fontSize: "0.75em", opacity: 0.85 } : {}),
            }}
          >
            {isNewline ? "↵" : it.char}
          </span>
        );
        if (isNewline) {
          return (
            <span key={i}>
              {span}
              <br />
            </span>
          );
        }
        return span;
      })}
    </div>
  );
}
