import { useEffect, useRef, useState } from "react";
import { useTypingSession } from "../engine/useTypingSession";
import { useSettings } from "../ui/settings";
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
      style={{ display: "flex", flexDirection: "column", gap: 18 }}
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

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
        <Pill>
          {current.label} · {idx + 1}/{segments.length}
        </Pill>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {showStats && session.started && (
            <>
              <Pill tone="good">přesnost {Math.round(session.accuracy * 100)} %</Pill>
              <Pill>{Math.round(session.cpm)} úhozů/min</Pill>
            </>
          )}
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
                color: "var(--text-soft)",
                borderRadius: 999,
                width: 32,
                height: 32,
                cursor: "pointer",
                fontSize: "1rem",
                lineHeight: 1,
              }}
            >
              ⚙
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

      <div style={{ padding: "1.5rem 0", minHeight: 130 }}>
        <TextDisplay items={session.items} justErrored={session.justErrored} showEnter={settings.enterAtEol} />
      </div>

      {settings.scaffold.hands && <HandsHint expected={session.expected} />}
      {settings.scaffold.keyboard && (
        <Keyboard
          expected={session.expected}
          scaffold={settings.scaffold}
          platform={resolveKeyboardPlatform(settings.keyboardLayout)}
        />
      )}

      <div style={{ display: "flex", justifyContent: "center", gap: 10 }}>
        <Button variant="ghost" onClick={() => session.reset()}>
          ↺ Začít tento krok znovu
        </Button>
      </div>
    </div>
  );
}
