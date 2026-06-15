import { useEffect, useMemo, useRef } from "react";
import { useQuery } from "@evolu/react";
import { attemptsQuery, practiceDaysQuery } from "../db/evolu";
import { STAGES, LESSONS, type Lesson } from "../data/curriculum";
import {
  bestAccuracyByLesson,
  completedCount,
  MASTERY,
  practiceDaysInYear,
  suggestedLesson,
} from "../lib/progress";
import { TOTAL_LESSONS } from "../data/curriculum";
import { Button, Pill, Progress } from "../ui/primitives";
import { navigate } from "../lib/router";
import { setSettings, useSettings } from "../ui/settings";
import { IconHelp, IconSun } from "../ui/icons";

// Correct Czech pluralisation of "den" (day): 1 → den, 2–4 → dny, else → dní.
// Intl.PluralRules encodes the CLDR rule so large counts (22, 101…) stay right.
const czDaysRules = new Intl.PluralRules("cs");
function czDays(n: number): string {
  switch (czDaysRules.select(n)) {
    case "one":
      return "den";
    case "few":
      return "dny";
    default:
      return "dní";
  }
}

export function CoursePath() {
  const attempts = useQuery(attemptsQuery);
  const days = useQuery(practiceDaysQuery);
  const settings = useSettings();

  const best = useMemo(() => bestAccuracyByLesson(attempts as never), [attempts]);
  const suggested = suggestedLesson(best);
  const done = completedCount(best);
  const daysWithMe = useMemo(
    () => practiceDaysInYear((days as unknown as Array<{ day: string }>).map((d) => d.day)),
    [days],
  );

  const firstRun = done === 0;
  const allDone = done === TOTAL_LESSONS;
  // Where "Pokračovat" sends you: the suggested lesson normally; the very first
  // lesson once everything's mastered (a calm "projít znovu").
  const resumeLesson = allDone ? LESSONS[0] : suggested;
  const resumeLabel = firstRun ? "Začít" : allDone ? "Projít znovu" : "Pokračovat";

  // Gently bring the suggested node into view for a returning learner, so the
  // "tady jsi" marker isn't hidden below the fold. First-run starts at the top
  // (lesson 1 is already there); a finished learner isn't scrolled to the end.
  const suggestedRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (done === 0 || done >= TOTAL_LESSONS) return;
    const node = suggestedRef.current;
    if (!node) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    node.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "center" });
  }, [done, suggested.id]);

  // Show backup nudge when: ≥3 lessons done, phrase not yet seen, not dismissed
  const showBackupNudge = done >= 3 && !settings.backupPhraseSeen && !settings.backupNudgeDismissed;

  return (
    <div className="cp-page" style={{ margin: "0 auto", padding: "1.5rem 1rem 5rem" }}>
      <style>{PATH_CSS}</style>
      <header style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: "1.9rem", margin: "0 0 14px" }}>Tvá cesta psaní</h1>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
          <Pill tone={done > 0 ? "good" : "soft"}>{done} / {TOTAL_LESSONS} lekcí</Pill>
          {daysWithMe > 0 && (
            <Pill>
              <IconSun width={14} height={14} /> letos {daysWithMe} {czDays(daysWithMe)} cvičení
            </Pill>
          )}
        </div>
        <Button
          variant="primary"
          onClick={() => navigate(`/lesson/${resumeLesson.id}`)}
          style={{ marginTop: 14, display: "inline-flex", alignItems: "center", gap: 8 }}
        >
          <span style={{ fontWeight: 600 }}>{resumeLabel}</span>
          <span style={{ opacity: 0.85, fontWeight: 500 }}>· {resumeLesson.title}</span>
          <span aria-hidden="true" style={{ marginLeft: 2 }}>→</span>
        </Button>
        <div style={{ marginTop: 14 }}>
          <Progress value={done / TOTAL_LESSONS} label={`Hotovo ${done} z ${TOTAL_LESSONS} lekcí`} />
        </div>
        {settings.pathLegendDismissed ? (
          <button
            onClick={() => setSettings({ pathLegendDismissed: false })}
            aria-label="Zobrazit nápovědu k mapě"
            title="Zobrazit nápovědu"
            style={{
              border: "none",
              background: "transparent",
              color: "var(--text-faint)",
              cursor: "pointer",
              fontSize: "0.8rem",
              lineHeight: 1,
              padding: "4px 0",
              marginTop: 8,
              fontFamily: "inherit",
              display: "inline-flex",
              alignItems: "center",
              gap: 5,
            }}
          >
            <IconHelp width={14} height={14} />
            Zobrazit nápovědu
          </button>
        ) : (
          <PathLegend />
        )}
        {showBackupNudge && (
          <BackupNudge onNavigate={() => navigate("/settings")} onDismiss={() => setSettings({ backupNudgeDismissed: true })} />
        )}
      </header>

      {/* One continuous trail: a single spine runs behind every stage so the
          journey reads as unbroken, with stage titles as quiet side-labels. */}
      <div className="cp-trail">
        <div className="cp-spine-line" aria-hidden="true" />
        {STAGES.map((stage) => (
          <section key={stage.id} className="cp-stage">
            <div className="cp-stage-head">
              <h2 style={{ fontSize: "1.05rem", margin: 0, color: "var(--text)" }}>{stage.title}</h2>
              <span style={{ fontSize: "0.85rem", color: "var(--text-soft)" }}>{stage.subtitle}</span>
            </div>
            {stage.lessons.map((lesson) => {
              const isSuggested = lesson.id === suggested.id;
              return (
                <PathNode
                  key={lesson.id}
                  rowRef={isSuggested ? suggestedRef : undefined}
                  lesson={lesson}
                  // alternate by global order so the zig-zag carries across
                  // stage boundaries instead of resetting to the left each time
                  side={lesson.index % 2 === 0 ? "left" : "right"}
                  index={lesson.index}
                  accuracy={best.get(lesson.id)}
                  suggested={isSuggested}
                />
              );
            })}
          </section>
        ))}
      </div>
    </div>
  );
}

/** Quiet one-line nudge to save the recovery phrase once the learner has some progress. */
function BackupNudge({ onNavigate, onDismiss }: { onNavigate: () => void; onDismiss: () => void }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        marginTop: 12,
        fontSize: "0.82rem",
        color: "var(--text-soft)",
        flexWrap: "wrap",
      }}
    >
      <span>
        Až budeš chtít, ulož si obnovovací frázi — přeneseš s ní postup do jiného zařízení.
      </span>
      <button
        onClick={onNavigate}
        style={{
          border: "none",
          background: "transparent",
          color: "var(--accent-strong)",
          cursor: "pointer",
          fontSize: "0.82rem",
          fontFamily: "inherit",
          padding: 0,
          textDecoration: "underline",
          textUnderlineOffset: 2,
          textDecorationColor: "var(--accent-soft)",
        }}
      >
        Otevřít nastavení
      </button>
      <button
        onClick={onDismiss}
        aria-label="Zavřít upozornění na zálohu"
        style={{
          border: "none",
          background: "transparent",
          color: "var(--text-faint)",
          cursor: "pointer",
          fontSize: "0.9rem",
          lineHeight: 1,
          padding: "2px 4px",
          fontFamily: "inherit",
        }}
      >
        ×
      </button>
    </div>
  );
}

/** One quiet, dismissible line decoding the node glyphs — so a first-timer
 * can read the map (and meet the 90% idea) without tripping over it first. */
function PathLegend() {
  const items: { glyph: ReturnType<typeof LegendDot>; label: string }[] = [
    { glyph: <LegendDot kind="done" />, label: "hotovo" },
    { glyph: <LegendDot kind="here" />, label: "tady jsi" },
    { glyph: <LegendDot kind="tried" />, label: "rozpracováno — pod 90 %" },
    { glyph: <LegendDot kind="todo" />, label: "nevyzkoušeno" },
  ];
  return (
    <div
      style={{
        display: "flex",
        flexWrap: "wrap",
        alignItems: "center",
        gap: "6px 14px",
        marginTop: 12,
        fontSize: "0.8rem",
        color: "var(--text-soft)",
      }}
    >
      {items.map((it) => (
        <span key={it.label} style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
          {it.glyph}
          {it.label}
        </span>
      ))}
      <button
        onClick={() => setSettings({ pathLegendDismissed: true })}
        aria-label="Uzavřít nápovědu"
        title="Uzavřít nápovědu"
        style={{
          border: "none",
          background: "transparent",
          color: "var(--text-soft)",
          cursor: "pointer",
          fontSize: "0.8rem",
          lineHeight: 1,
          padding: "4px 6px",
          borderRadius: 8,
          fontFamily: "inherit",
          display: "inline-flex",
          alignItems: "center",
          gap: 5,
        }}
      >
        × uzavřít nápovědu
      </button>
    </div>
  );
}

/** Miniature of the real path bubbles, so the legend teaches the actual glyphs. */
function LegendDot({ kind }: { kind: "done" | "here" | "tried" | "todo" }) {
  const styles: Record<typeof kind, { bg: string; border: string; color: string; glyph: string }> = {
    done: { bg: "var(--accent)", border: "var(--accent)", color: "var(--on-accent)", glyph: "✓" },
    here: { bg: "var(--accent-strong)", border: "var(--accent)", color: "var(--on-accent)", glyph: "›" },
    tried: {
      bg: "color-mix(in srgb, var(--gentle) 24%, var(--surface))",
      border: "var(--gentle)",
      color: "var(--text-soft)",
      glyph: "·",
    },
    todo: { bg: "var(--surface)", border: "var(--border)", color: "var(--text-soft)", glyph: "·" },
  };
  const s = styles[kind];
  return (
    <span
      aria-hidden="true"
      style={{
        width: 18,
        height: 18,
        flex: "none",
        borderRadius: "50%",
        background: s.bg,
        border: `1.5px solid ${s.border}`,
        color: s.color,
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: "0.65rem",
      }}
    >
      {s.glyph}
    </span>
  );
}

function PathNode({
  lesson,
  side,
  index,
  accuracy,
  suggested,
  rowRef,
}: {
  lesson: Lesson;
  side: "left" | "right";
  /** global lesson order, used to gently vary the path */
  index: number;
  /** best accuracy seen for this lesson, or undefined if never attempted */
  accuracy?: number;
  suggested: boolean;
  rowRef?: React.Ref<HTMLDivElement>;
}) {
  // Gentle wave on the connector length so cards don't sit at one rigid
  // distance from the spine — softens the metronome without a game-board.
  // (Capped to 16px on narrow screens by the media query below.)
  const linkWidth = 46 + Math.round(Math.sin(index * 0.7) * 18);
  const attempted = accuracy !== undefined;
  const completed = attempted && accuracy >= MASTERY;
  const inProgress = attempted && !completed; // tried, not yet at the 90% mark
  const active = completed || suggested;
  const pct = attempted ? Math.round(accuracy * 100) : null;

  // One subtitle per node, picked by state. The in-progress line surfaces the
  // otherwise-invisible mastery gate softly, in the Patient Teacher voice.
  let subtitle: { text: string; color: string } | null = null;
  if (suggested && inProgress) {
    subtitle = { text: `tady jsi · zatím ${pct} %`, color: "var(--accent-strong)" };
  } else if (suggested) {
    subtitle = { text: "tady jsi → pokračuj", color: "var(--accent-strong)" };
  } else if (completed) {
    subtitle = { text: `nejlíp ${pct} % · klidně zopakuj`, color: "var(--text-soft)" };
  } else if (inProgress) {
    subtitle = { text: `zatím ${pct} % · hotovo od 90 %`, color: "var(--text-soft)" };
  }

  // Explicit accessible name: the visual title + subtitle would otherwise be
  // read as one mashed string („t, ztady jsi · zatím 82 %"), and visual cues
  // like „tady jsi" lose their meaning without the map around them.
  const state = suggested
    ? inProgress
      ? `aktuální lekce, zatím ${pct} %`
      : "aktuální lekce, pokračuj tady"
    : completed
      ? `dokončeno, nejlíp ${pct} %`
      : inProgress
        ? `rozpracováno, zatím ${pct} %, hotovo od 90 %`
        : null;
  const cardLabel = `Lekce ${lesson.title}${state ? `, ${state}` : ""}. Otevřít.`;

  return (
    <div ref={rowRef} className={`cp-row cp-row--${side}`}>
      <div className="cp-cell">
        <button
          className="cp-card"
          onClick={() => navigate(`/lesson/${lesson.id}`)}
          aria-current={suggested ? "step" : undefined}
          aria-label={cardLabel}
          style={{
            background: suggested ? "var(--accent-soft)" : "var(--surface)",
            border: `1px solid ${suggested ? "var(--accent)" : "var(--border)"}`,
          }}
        >
          <div aria-hidden="true" style={{ fontWeight: 600, color: "var(--text)" }}>{lesson.title}</div>
          {subtitle && (
            <div aria-hidden="true" style={{ fontSize: "0.78rem", color: subtitle.color, marginTop: 2 }}>
              {subtitle.text}
            </div>
          )}
        </button>
        <span
          className="cp-link"
          aria-hidden="true"
          style={{ width: linkWidth, background: active ? "var(--accent)" : "var(--border)" }}
        />
      </div>

      <div className="cp-spine" aria-hidden="true">
        <div
          className="cp-bubble"
          style={{
            color: active ? "var(--on-accent)" : "var(--text-soft)",
            background: completed
              ? "var(--accent)"
              : suggested
                ? "var(--accent-strong)"
                : inProgress
                  ? "color-mix(in srgb, var(--gentle) 24%, var(--surface))"
                  : "var(--surface)",
            border: `2px solid ${
              active ? "var(--accent)" : inProgress ? "var(--gentle)" : "var(--border)"
            }`,
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
.cp-page { max-width: 760px; }
@media (min-width: 820px) { .cp-page { max-width: 820px; } }

.cp-trail { position: relative; }
/* one unbroken spine behind the whole trail; stage labels mask it like
   stations on a line, so the journey never visually segments */
.cp-spine-line {
  position: absolute;
  left: 50%;
  top: 44px;
  bottom: 22px;
  width: 2px;
  /* a step above --border (1.25:1 on --bg was near-invisible on sunlit
     phones) — the path is the screen's metaphor, it has to be seen */
  background: color-mix(in srgb, var(--text-faint) 60%, var(--border));
  transform: translateX(-1px);
}
.cp-stage-head {
  position: relative;
  z-index: 1;
  background: var(--bg);
  padding: 6px 0;
  margin: 24px 0 6px;
}
.cp-stage:first-child .cp-stage-head { margin-top: 0; }
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
  border-radius: 12px;
  padding: 0.7rem 1rem;
  max-width: 260px;
  box-shadow: var(--shadow);
  transition: transform .12s ease;
  font-family: inherit;
  text-align: left;
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
/* right node: mirror — card on the outer (right) edge, link reaches in to the spine.
   row-reverse flips the cell to [link][card] so the connector sits toward the spine.
   Text stays left-aligned in both — right-aligned body copy reads awkwardly. */
.cp-row--right .cp-cell:first-child { grid-column: 3; flex-direction: row-reverse; }
.cp-row--right .cp-spine { grid-column: 2; }
.cp-row--right .cp-cell:last-child { grid-column: 1; }

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
  .cp-row--left .cp-cell:last-child,
  .cp-row--right .cp-cell:last-child { display: none; }
  .cp-link { max-width: 16px; }
}
`;
