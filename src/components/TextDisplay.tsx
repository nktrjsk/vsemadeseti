import type { CharItem } from "../engine/useTypingSession";

/* Renders the drill as a two-line window: the line currently being typed and the
 * next line waiting below it. Finished lines drop away — there is no scrolling.
 * Per-character status is gentle: errors are warm amber, never alarming red; the
 * current position shows a soft caret. `wrongGhost` briefly shows the mistyped
 * character at the cursor in block mode. The waiting line is dimmed so it reads
 * clearly as "coming next". */

interface Cell {
  it: CharItem;
  gi: number;
}

export function TextDisplay({
  items,
  justErrored,
  wrongGhost = null,
  showEnter = false,
}: {
  items: CharItem[];
  justErrored: boolean;
  wrongGhost?: string | null;
  showEnter?: boolean;
}) {
  // Group characters into logical lines (split on newlines; the newline stays as
  // the terminating cell of its line so it can render a ↵ when enter-at-EOL is on).
  const lines: Cell[][] = [];
  let cur: Cell[] = [];
  for (let gi = 0; gi < items.length; gi++) {
    const it = items[gi];
    cur.push({ it, gi });
    if (it.char === "\n") {
      lines.push(cur);
      cur = [];
    }
  }
  if (cur.length) lines.push(cur);
  if (lines.length === 0) lines.push([]);

  // The current line is the one holding the active character; once finished, fall
  // back to the last line.
  const curGi = items.findIndex((it) => it.status === "current");
  let curLineIdx =
    curGi >= 0 ? lines.findIndex((ln) => ln.some((c) => c.gi === curGi)) : lines.length - 1;
  if (curLineIdx < 0) curLineIdx = lines.length - 1;

  const renderCell = ({ it, gi }: Cell) => {
    const isNewline = it.char === "\n";
    // Newlines are structural here (each line is its own row) — only draw the ↵
    // glyph when the learner must actually press Enter.
    if (isNewline && !showEnter) return null;
    const isSpace = it.char === " ";
    const isCurrent = it.status === "current";
    const showGhost = isCurrent && wrongGhost != null;

    let color = "var(--text-pending)";
    let background = "transparent";
    let borderBottom = "2px solid transparent";
    if (it.status === "correct") color = "var(--text)";
    else if (it.status === "wrong") {
      color = "var(--gentle)";
      background = "color-mix(in srgb, var(--gentle) 22%, transparent)";
    } else if (isCurrent) {
      color = showGhost ? "var(--gentle)" : "var(--accent-strong)";
      borderBottom = `3px solid ${showGhost ? "var(--gentle)" : "var(--accent)"}`;
      background = justErrored
        ? "color-mix(in srgb, var(--gentle) 28%, transparent)"
        : showGhost
          ? "color-mix(in srgb, var(--gentle) 18%, transparent)"
          : "var(--accent-soft)";
    }

    const displayChar = showGhost ? wrongGhost : isNewline ? "↵" : it.char;
    return (
      <span
        key={gi}
        style={{
          color,
          background,
          borderBottom,
          borderRadius: 4,
          padding: isSpace ? "0 1px" : "0 1.5px",
          transition: "background .12s ease, color .12s ease",
          ...(isNewline && !showGhost ? { fontSize: "0.75em", opacity: 0.85 } : {}),
        }}
      >
        {displayChar}
      </span>
    );
  };

  const renderLine = (line: Cell[] | undefined, key: string, waiting: boolean) => (
    <div
      key={key}
      style={{
        minHeight: "1.9em",
        opacity: waiting ? 0.45 : 1,
        transition: "opacity .2s ease",
      }}
    >
      {line && line.length ? line.map(renderCell) : " "}
    </div>
  );

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
      {/* Re-keying on the line index remounts this block each time the window
          advances, so the entrance animation plays once per finished line — never
          on per-keystroke re-renders within the same line. */}
      <div key={curLineIdx} className="text-window">
        {renderLine(lines[curLineIdx], "current", false)}
        {renderLine(lines[curLineIdx + 1], "waiting", true)}
      </div>
      <style>{`
        .text-window {
          animation: lineAdvance .26s cubic-bezier(0.22, 1, 0.36, 1);
        }
        @keyframes lineAdvance {
          from { transform: translateY(0.55em); opacity: 0.55; }
          to   { transform: translateY(0); opacity: 1; }
        }
        @media (prefers-reduced-motion: reduce) {
          .text-window { animation: none; }
        }
      `}</style>
    </div>
  );
}
