import { useMemo } from "react";
import { useQuery } from "@evolu/react";
import { attemptsQuery, practiceDaysQuery } from "../db/evolu";
import { STAGES, type Lesson } from "../data/curriculum";
import {
  bestAccuracyByLesson,
  completedCount,
  isCompleted,
  streak,
  suggestedLesson,
} from "../lib/progress";
import { TOTAL_LESSONS } from "../data/curriculum";
import { Pill, Progress } from "../ui/primitives";
import { navigate } from "../lib/router";

export function CoursePath() {
  const attempts = useQuery(attemptsQuery);
  const days = useQuery(practiceDaysQuery);

  const best = useMemo(() => bestAccuracyByLesson(attempts as never), [attempts]);
  const suggested = suggestedLesson(best);
  const done = completedCount(best);
  const streakDays = useMemo(
    () => streak((days as unknown as Array<{ day: string }>).map((d) => d.day)),
    [days],
  );

  return (
    <div style={{ maxWidth: 760, margin: "0 auto", padding: "1.5rem 1rem 5rem" }}>
      <style>{PATH_CSS}</style>
      <header style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: "1.9rem", margin: "0 0 4px" }}>Tvá cesta psaní</h1>
        <p style={{ color: "var(--text-soft)", margin: "0 0 16px" }}>
          Krok za krokem, vlastním tempem. Nic nespěchá.
        </p>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
          <Pill tone="good">{done} / {TOTAL_LESSONS} lekcí</Pill>
          {streakDays > 0 && <Pill>🌤️ {streakDays} {streakDays === 1 ? "den" : streakDays < 5 ? "dny" : "dní"} v kuse</Pill>}
        </div>
        <div style={{ marginTop: 12 }}>
          <Progress value={done / TOTAL_LESSONS} />
        </div>
      </header>

      {STAGES.map((stage) => (
        <section key={stage.id} style={{ marginBottom: 34 }}>
          <div style={{ marginBottom: 10 }}>
            <h2 style={{ fontSize: "1.05rem", margin: 0, color: "var(--text)" }}>{stage.title}</h2>
            <span style={{ fontSize: "0.85rem", color: "var(--text-faint)" }}>{stage.subtitle}</span>
          </div>
          <div className="cp-track">
            <div className="cp-spine-line" />
            {stage.lessons.map((lesson, i) => (
              <PathNode
                key={lesson.id}
                lesson={lesson}
                side={i % 2 === 0 ? "left" : "right"}
                completed={isCompleted(lesson.id, best)}
                suggested={lesson.id === suggested.id}
              />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}

function PathNode({
  lesson,
  side,
  completed,
  suggested,
}: {
  lesson: Lesson;
  side: "left" | "right";
  completed: boolean;
  suggested: boolean;
}) {
  const active = completed || suggested;
  return (
    <div className={`cp-row cp-row--${side}`}>
      <div className="cp-cell">
        <button
          className="cp-card"
          onClick={() => navigate(`/lesson/${lesson.id}`)}
          style={{
            background: suggested ? "var(--accent-soft)" : "var(--surface)",
            border: `1px solid ${suggested ? "var(--accent)" : "var(--border)"}`,
          }}
        >
          <div style={{ fontWeight: 600, color: "var(--text)" }}>{lesson.title}</div>
          {suggested && (
            <div style={{ fontSize: "0.78rem", color: "var(--accent-strong)", marginTop: 2 }}>
              tady jsi → pokračuj
            </div>
          )}
          {completed && !suggested && (
            <div style={{ fontSize: "0.78rem", color: "var(--text-faint)", marginTop: 2 }}>
              hotovo · klidně zopakuj
            </div>
          )}
        </button>
        <span
          className="cp-link"
          style={{ background: active ? "var(--accent)" : "var(--border)" }}
        />
      </div>

      <div className="cp-spine">
        <div
          className="cp-bubble"
          style={{
            color: active ? "#fff" : "var(--text-faint)",
            background: completed ? "var(--accent)" : suggested ? "var(--accent-strong)" : "var(--surface)",
            border: `2px solid ${active ? "var(--accent)" : "var(--border)"}`,
            boxShadow: suggested ? "0 0 0 5px var(--accent-soft)" : "var(--shadow)",
            animation: suggested ? "pulseNode 1.6s ease-in-out infinite" : undefined,
          }}
        >
          {completed ? "✓" : suggested ? "›" : "·"}
        </div>
      </div>

      <div className="cp-cell" />
    </div>
  );
}

const PATH_CSS = `
.cp-track { position: relative; }
.cp-spine-line {
  position: absolute;
  left: 50%;
  top: 8px;
  bottom: 8px;
  width: 2px;
  background: var(--border);
  transform: translateX(-1px);
}
.cp-row {
  display: grid;
  grid-template-columns: 1fr 32px 1fr;
  align-items: center;
  margin: 16px 0;
  position: relative;
}
.cp-row > * { grid-row: 1; } /* keep all cells on one row even when columns are reassigned out of order */
.cp-cell { display: flex; align-items: center; min-width: 0; justify-content: flex-end; }
.cp-spine { display: flex; justify-content: center; position: relative; z-index: 2; }
.cp-card {
  cursor: pointer;
  border-radius: 14px;
  padding: 0.7rem 1rem;
  max-width: 260px;
  box-shadow: var(--shadow);
  transition: transform .12s ease;
  font-family: inherit;
}
.cp-card:hover { transform: translateY(-1px); }
.cp-link { width: 48px; flex: none; height: 2px; border-radius: 2px; }
.cp-bubble {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.9rem;
}
/* left node: card pushed to the outer (left) edge, connector reaches in to the spine.
   DOM order [card][link] already gives card-left / link-right, so defaults suffice. */
.cp-row--left .cp-cell:first-child { grid-column: 1; }
.cp-row--left .cp-spine { grid-column: 2; }
.cp-row--left .cp-cell:last-child { grid-column: 3; }
.cp-row--left .cp-card { text-align: left; }
/* right node: mirror — card on the outer (right) edge, link reaches in to the spine.
   row-reverse flips the cell to [link][card] so the connector sits toward the spine. */
.cp-row--right .cp-cell:first-child { grid-column: 3; flex-direction: row-reverse; }
.cp-row--right .cp-spine { grid-column: 2; }
.cp-row--right .cp-cell:last-child { grid-column: 1; }
.cp-row--right .cp-card { text-align: right; }

@keyframes pulseNode {
  0%, 100% { box-shadow: 0 0 0 5px var(--accent-soft); }
  50% { box-shadow: 0 0 0 9px var(--accent-soft); }
}

/* On narrow screens the zig-zag has no room — fall back to a single
   left-aligned timeline so cards stay readable. */
@media (max-width: 560px) {
  .cp-spine-line { left: 19px; }
  .cp-row--left, .cp-row--right { grid-template-columns: 38px 1fr; }
  .cp-row--left .cp-spine, .cp-row--right .cp-spine { grid-column: 1; }
  .cp-row--left .cp-cell:first-child,
  .cp-row--right .cp-cell:first-child {
    grid-column: 2; flex-direction: row-reverse; justify-content: flex-end;
  }
  .cp-row--left .cp-card, .cp-row--right .cp-card { text-align: left; }
  .cp-row--left .cp-cell:last-child,
  .cp-row--right .cp-cell:last-child { display: none; }
  .cp-link { max-width: 16px; }
}
`;
