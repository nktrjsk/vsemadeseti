import { useEffect, useRef, useState } from "react";
import { useTypingSession } from "../engine/useTypingSession";
import { useSettings } from "../ui/settings";
import { resolveKeyboardPlatform } from "../lib/platform";
import { Keyboard } from "./Keyboard";
import { HandsHint } from "./HandsHint";
import { TextDisplay } from "./TextDisplay";
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
 * scaffolding the learner has enabled, and reports an aggregate on completion. */
export function TypingArea({
  segments,
  onComplete,
  showStats = true,
}: {
  segments: Segment[];
  onComplete?: (s: RunSummary) => void;
  showStats?: boolean;
}) {
  const settings = useSettings();
  const [segIndex, setSegIndex] = useState(0);
  const completedRef = useRef(false);

  const acc = useRef({
    correct: 0,
    errors: 0,
    durationMs: 0,
    chars: 0,
    tally: new Map<string, { hits: number; misses: number }>(),
  });

  // reset accumulator if the segment list identity changes
  useEffect(() => {
    setSegIndex(0);
    completedRef.current = false;
    acc.current = { correct: 0, errors: 0, durationMs: 0, chars: 0, tally: new Map() };
  }, [segments]);

  const current = segments[segIndex];

  const session = useTypingSession({
    target: current?.text ?? "",
    errorMode: settings.errorMode,
    onFinish: (s) => {
      const a = acc.current;
      a.errors += s.errors;
      a.durationMs += s.durationMs;
      a.chars += (current?.text.replace(/\n/g, "").length ?? 0);
      for (const [ch, t] of s.keyTally) {
        const prev = a.tally.get(ch) ?? { hits: 0, misses: 0 };
        a.tally.set(ch, { hits: prev.hits + t.hits, misses: prev.misses + t.misses });
      }
      if (segIndex + 1 < segments.length) {
        setSegIndex((i) => i + 1);
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
  }, [segIndex, session.ref]);

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
          {current.label} · {segIndex + 1}/{segments.length}
        </Pill>
        {showStats && session.started && (
          <div style={{ display: "flex", gap: 8 }}>
            <Pill tone="good">přesnost {Math.round(session.accuracy * 100)} %</Pill>
            <Pill>{Math.round(session.cpm)} úhozů/min</Pill>
          </div>
        )}
      </div>

      <Progress value={segments.length > 1 ? (segIndex + session.pos / Math.max(1, current.text.length)) / segments.length : session.pos / Math.max(1, current.text.length)} />

      <div style={{ padding: "1.5rem 0", minHeight: 130 }}>
        <TextDisplay items={session.items} justErrored={session.justErrored} />
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
