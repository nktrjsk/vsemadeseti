import { useEffect, useRef, useState, type CSSProperties } from "react";
import { useTypingSession } from "../engine/useTypingSession";
import { setScaffold, setSettings, useSettings } from "../ui/settings";
import { IconEye, IconEyeOff, IconRestart, IconSettings } from "../ui/icons";
import { resolveKeyboardPlatform } from "../lib/platform";
import { Keyboard } from "./Keyboard";
import { HandsHint } from "./HandsHint";
import { TextDisplay } from "./TextDisplay";
import { DrillSettings } from "./DrillSettings";
import { Button, Pill, Progress } from "../ui/primitives";

export interface Segment {
  label: string;
  text: string;
}

export interface RunSummary {
  accuracy: number;
  cpm: number;
  errors: number;
  durationMs: number;
  keyTally: Map<string, { hits: number; misses: number }>;
}

/* Runs a sequence of segments (lesson steps / drill / passage), shows the
 * scaffolding the learner has enabled, and reports an aggregate on completion.
 * `resetKey` controls when progress resets: if provided, a regenerated segment
 * list (e.g. after a gear-settings change) keeps the learner on the current
 * step; only a resetKey change starts over. Without it, any new segment list
 * resets (legacy behavior for ad-hoc drills). */
export function TypingArea({
  segments,
  onComplete,
  showStats = true,
  resetKey,
}: {
  segments: Segment[];
  onComplete?: (s: RunSummary) => void;
  showStats?: boolean;
  resetKey?: unknown;
}) {
  const settings = useSettings();
  const [segIndex, setSegIndex] = useState(0);
  const [showGear, setShowGear] = useState(false);
  const completedRef = useRef(false);

  const acc = useRef({
    correct: 0,
    errors: 0,
    durationMs: 0,
    chars: 0,
    tally: new Map<string, { hits: number; misses: number }>(),
  });

  // reset progress + accumulator when a new run starts
  const runKey = resetKey !== undefined ? resetKey : segments;
  useEffect(() => {
    setSegIndex(0);
    completedRef.current = false;
    acc.current = { correct: 0, errors: 0, durationMs: 0, chars: 0, tally: new Map() };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [runKey]);

  // a regenerated segment list can be shorter than where we were
  const idx = Math.min(segIndex, Math.max(0, segments.length - 1));
  const current = segments[idx];

  const session = useTypingSession({
    target: current?.text ?? "",
    errorMode: settings.errorMode,
    requireEnter: settings.enterAtEol,
    onFinish: (s) => {
      const a = acc.current;
      a.errors += s.errors;
      a.durationMs += s.durationMs;
      a.chars += s.chars;
      for (const [ch, t] of s.keyTally) {
        const prev = a.tally.get(ch) ?? { hits: 0, misses: 0 };
        a.tally.set(ch, { hits: prev.hits + t.hits, misses: prev.misses + t.misses });
      }
      if (idx + 1 < segments.length) {
        setSegIndex(idx + 1);
      } else if (!completedRef.current) {
        completedRef.current = true;
        const totalChars = a.chars;
        const accuracy = totalChars + a.errors > 0 ? totalChars / (totalChars + a.errors) : 1;
        const cpm = a.durationMs > 0 ? (totalChars / a.durationMs) * 60000 : 0;
        onComplete?.({ accuracy, cpm, errors: a.errors, durationMs: a.durationMs, keyTally: a.tally });
      }
    },
  });

  // keep the hidden field focused so keystrokes are captured
  useEffect(() => {
    const id = window.setTimeout(() => session.ref.current?.focus(), 30);
    return () => window.clearTimeout(id);
  }, [idx, session.ref]);

  if (!current) return null;

  return (
    <div
      onClick={() => session.ref.current?.focus()}
      style={{ display: "flex", flexDirection: "column", flex: 1, minHeight: 0 }}
    >
      {/* hidden input that actually receives keystrokes (incl. dead keys) */}
      <textarea
        ref={session.ref}
        aria-label="Pole pro psaní"
        autoFocus
        spellCheck={false}
        autoCapitalize="off"
        autoCorrect="off"
        style={{
          position: "absolute",
          opacity: 0,
          width: 1,
          height: 1,
          pointerEvents: "none",
          left: -9999,
        }}
        onBlur={(e) => {
          // re-focus shortly; learners shouldn't lose capture on stray clicks
          const el = e.currentTarget;
          window.setTimeout(() => el.focus(), 0);
        }}
      />

      {/* Upper region: header + progress + the two-line text window. No scroll —
          the text shows only the current line and the next; finished lines drop
          away (see TextDisplay), so it never grows or needs to scroll. */}
      <div style={{ flex: 1, minHeight: 0, display: "flex", flexDirection: "column", gap: 18, padding: "0 0 8px" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexShrink: 0 }}>
        <Pill>
          {current.label} · {idx + 1}/{segments.length}
        </Pill>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {/* Live stats pills: only when component prop allows AND global setting is on */}
          {showStats && settings.showStats && session.started && (
            <>
              <Pill tone="good">přesnost {Math.round(session.accuracy * 100)} %</Pill>
              <Pill>{Math.round(session.cpm)} úhozů/min</Pill>
            </>
          )}
          {/* Eye toggle: only render when the component prop allows stats (i.e. not forced off) */}
          {showStats && (
            <button
              aria-label={settings.showStats ? "Skrýt rychlost a přesnost" : "Zobrazit rychlost a přesnost"}
              title={settings.showStats ? "Skrýt rychlost a přesnost" : "Zobrazit rychlost a přesnost"}
              onMouseDown={(e) => e.preventDefault()}
              onClick={(e) => {
                e.stopPropagation();
                setSettings({ showStats: !settings.showStats });
              }}
              style={{
                border: "1px solid var(--border)",
                background: settings.showStats ? "var(--accent-soft)" : "var(--surface-2)",
                color: settings.showStats ? "var(--accent-strong)" : "var(--text-soft)",
                borderRadius: 999,
                width: 32,
                height: 32,
                cursor: "pointer",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {settings.showStats
                ? <IconEye width={16} height={16} />
                : <IconEyeOff width={16} height={16} />}
            </button>
          )}
          <button
            aria-label="Začít tento krok znovu"
            title="Začít tento krok znovu"
            onMouseDown={(e) => e.preventDefault()}
            onClick={(e) => {
              e.stopPropagation();
              session.reset();
            }}
            style={{
              border: "1px solid var(--border)",
              background: "var(--surface-2)",
              color: "var(--text-soft)",
              borderRadius: 999,
              width: 32,
              height: 32,
              cursor: "pointer",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <IconRestart width={16} height={16} />
          </button>
          <div style={{ position: "relative" }}>
            <button
              aria-label="Nastavení cvičení"
              aria-expanded={showGear}
              onMouseDown={(e) => e.preventDefault()}
              onClick={(e) => {
                e.stopPropagation();
                setShowGear((v) => !v);
              }}
              style={{
                border: "1px solid var(--border)",
                background: showGear ? "var(--accent-soft)" : "var(--surface-2)",
                color: showGear ? "var(--accent-strong)" : "var(--text-soft)",
                borderRadius: 999,
                width: 32,
                height: 32,
                cursor: "pointer",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <IconSettings width={16} height={16} />
            </button>
            {showGear && (
              <>
                <div
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowGear(false);
                  }}
                  style={{ position: "fixed", inset: 0, zIndex: 19 }}
                />
                <div
                  onClick={(e) => e.stopPropagation()}
                  style={{
                    position: "absolute",
                    right: 0,
                    top: "calc(100% + 8px)",
                    zIndex: 20,
                    width: 320,
                    maxWidth: "86vw",
                    background: "var(--surface)",
                    border: "1px solid var(--border)",
                    borderRadius: 14,
                    boxShadow: "var(--shadow)",
                    padding: "0.6rem 1rem",
                  }}
                >
                  <DrillSettings />
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      <Progress value={segments.length > 1 ? (idx + session.pos / Math.max(1, current.text.length)) / segments.length : session.pos / Math.max(1, current.text.length)} />

      {/* The two-line text window, centered in the available space so the
          keyboard never looks stranded below a void. */}
      <div
        className="exercise-text"
        style={{
          padding: "0.5rem 0",
          flex: 1,
          minHeight: 0,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          overflow: "hidden",
        }}
      >
        <TextDisplay
          items={session.items}
          justErrored={session.justErrored}
          wrongGhost={session.wrongGhost}
          showEnter={settings.enterAtEol}
        />
      </div>
      </div>{/* end upper region */}

      {/* Pinned-bottom region: hands hint + keyboard + scaffold toggles.
          container-type lets the keyboard/hands size themselves with cqw against
          this region's width. --ku (the key unit) is defined here so the keyboard
          AND the hands inherit the SAME scale and shrink/grow together: width-driven
          (cqw), capped by viewport height (dvh) so they never crowd out the drill
          text, and clamped for tiny/huge screens. */}
      <div
        style={{
          flexShrink: 0,
          containerType: "inline-size",
          "--ku": "clamp(22px, min(5.6cqw, 4.6dvh), 50px)",
        } as CSSProperties}
      >
        {settings.scaffold.hands && <HandsHint expected={session.expected} />}
        {settings.scaffold.keyboard && (
          <Keyboard
            expected={session.expected}
            scaffold={settings.scaffold}
            platform={resolveKeyboardPlatform(settings.keyboardLayout)}
          />
        )}

        <div style={{ display: "flex", justifyContent: "center", gap: 10, flexWrap: "wrap", marginTop: 8 }}>
          <Button
            variant="ghost"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => setScaffold({ keyboard: !settings.scaffold.keyboard })}
            style={{ fontSize: "0.85rem", padding: "0.3rem 0.8rem" }}
          >
            {settings.scaffold.keyboard ? "Skrýt klávesnici" : "Zobrazit klávesnici"}
          </Button>
          <Button
            variant="ghost"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => setScaffold({ hands: !settings.scaffold.hands })}
            style={{ fontSize: "0.85rem", padding: "0.3rem 0.8rem" }}
          >
            {settings.scaffold.hands ? "Skrýt ruce" : "Zobrazit ruce"}
          </Button>
        </div>
      </div>
    </div>
  );
}
