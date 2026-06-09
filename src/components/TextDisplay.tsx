import type { CharItem } from "../engine/useTypingSession";

/* Renders the drill text with gentle per-character status. Errors are warm
 * (amber), never alarming red. The current position shows a soft caret. */

export function TextDisplay({ items, justErrored }: { items: CharItem[]; justErrored: boolean }) {
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
        if (it.char === "\n") return <br key={i} />;
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
        return (
          <span
            key={i}
            style={{
              color,
              background,
              borderBottom,
              borderRadius: 4,
              padding: isSpace ? "0 1px" : "0 1.5px",
              transition: "background .12s ease, color .12s ease",
            }}
          >
            {isSpace ? "·".replace("·", " ") : it.char}
            {isSpace && it.status === "current" ? "" : ""}
          </span>
        );
      })}
    </div>
  );
}
