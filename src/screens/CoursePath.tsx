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
          <div style={{ position: "relative" }}>
            <div
              style={{
                position: "absolute",
                left: "50%",
                top: 8,
                bottom: 8,
                width: 2,
                background: "var(--border)",
                transform: "translateX(-1px)",
              }}
            />
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
  const left = side === "left";
  return (
    <div
      style={{
        display: "flex",
        flexDirection: left ? "row" : "row-reverse",
        alignItems: "center",
        margin: "10px 0",
        position: "relative",
      }}
    >
      <div style={{ flex: 1, display: "flex", justifyContent: left ? "flex-end" : "flex-start" }}>
        <button
          onClick={() => navigate(`/lesson/${lesson.id}`)}
          style={{
            cursor: "pointer",
            textAlign: left ? "right" : "left",
            background: suggested ? "var(--accent-soft)" : "var(--surface)",
            border: `1px solid ${suggested ? "var(--accent)" : "var(--border)"}`,
            borderRadius: 14,
            padding: "0.7rem 1rem",
            maxWidth: 280,
            boxShadow: "var(--shadow)",
            transition: "transform .12s ease",
            fontFamily: "inherit",
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
      </div>

      {/* node bubble on the central line */}
      <div style={{ width: 0, display: "flex", justifyContent: "center", position: "relative", zIndex: 2 }}>
        <div
          style={{
            width: 30,
            height: 30,
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "0.9rem",
            color: completed ? "#fff" : suggested ? "#fff" : "var(--text-faint)",
            background: completed ? "var(--accent)" : suggested ? "var(--accent-strong)" : "var(--surface)",
            border: `2px solid ${completed || suggested ? "var(--accent)" : "var(--border)"}`,
            boxShadow: suggested ? "0 0 0 5px var(--accent-soft)" : "var(--shadow)",
            animation: suggested ? "pulseNode 1.6s ease-in-out infinite" : undefined,
          }}
        >
          {completed ? "✓" : suggested ? "›" : "·"}
        </div>
      </div>
      <div style={{ flex: 1 }} />
      <style>{`@keyframes pulseNode{0%,100%{box-shadow:0 0 0 5px var(--accent-soft)}50%{box-shadow:0 0 0 9px var(--accent-soft)}}`}</style>
    </div>
  );
}
