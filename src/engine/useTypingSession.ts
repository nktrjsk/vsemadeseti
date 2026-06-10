import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { ErrorMode } from "../ui/settings";
import { sound } from "../lib/sound";

/* Core typing loop.
 *
 * Input is read from `beforeinput` on a hidden field, NOT raw keydown — this is
 * what makes Czech dead keys work: the browser composes ´+o -> "ó" and delivers
 * it as a single insertText whose data is the composed character. We
 * preventDefault so the field never actually mutates.
 *
 * Newlines in the target are auto-skipped (visual only) by default; with
 * `requireEnter` they become real expected characters — the learner must press
 * Enter at the end of each row and mistakes there count like any other key. */

export type CharStatus = "pending" | "current" | "correct" | "wrong";

export interface CharItem {
  char: string;
  status: CharStatus;
}

export interface TypingState {
  ref: React.RefObject<HTMLTextAreaElement | null>;
  items: CharItem[];
  pos: number;
  expected: string | null;
  finished: boolean;
  started: boolean;
  justErrored: boolean;
  errors: number;
  correct: number;
  accuracy: number; // 0..1
  cpm: number;
  elapsedMs: number;
  reset: () => void;
  /** per-expected-char hit/miss tallies for this session */
  keyTally: Map<string, { hits: number; misses: number }>;
}

export interface TypingOptions {
  target: string;
  errorMode: ErrorMode;
  /** newlines must be typed with Enter instead of being auto-skipped */
  requireEnter?: boolean;
  onFinish?: (summary: {
    accuracy: number;
    cpm: number;
    errors: number;
    durationMs: number;
    /** typeable length of the target under the current Enter rule */
    chars: number;
    keyTally: Map<string, { hits: number; misses: number }>;
  }) => void;
}

function skipNewlines(target: string, from: number): number {
  let i = from;
  while (i < target.length && target[i] === "\n") i++;
  return i;
}

export function useTypingSession({
  target,
  errorMode,
  requireEnter = false,
  onFinish,
}: TypingOptions): TypingState {
  const ref = useRef<HTMLTextAreaElement | null>(null);

  const [pos, setPos] = useState(() => (requireEnter ? 0 : skipNewlines(target, 0)));
  const [wrongSet, setWrongSet] = useState<Set<number>>(() => new Set());
  const [finished, setFinished] = useState(false);
  const [justErrored, setJustErrored] = useState(false);
  const [errors, setErrors] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [, forceTick] = useState(0);

  const startRef = useRef<number | null>(null);
  const endRef = useRef<number | null>(null);
  const tally = useRef<Map<string, { hits: number; misses: number }>>(new Map());
  const errorFlashTimer = useRef<number | null>(null);

  const reset = useCallback(() => {
    setPos(requireEnter ? 0 : skipNewlines(target, 0));
    setWrongSet(new Set());
    setFinished(false);
    setErrors(0);
    setCorrect(0);
    setJustErrored(false);
    startRef.current = null;
    endRef.current = null;
    tally.current = new Map();
    ref.current?.focus();
  }, [target, requireEnter]);

  // reset whenever the target changes
  useEffect(() => {
    reset();
  }, [reset]);

  const bump = useCallback((ch: string, hit: boolean) => {
    const t = tally.current.get(ch) ?? { hits: 0, misses: 0 };
    if (hit) t.hits++;
    else t.misses++;
    tally.current.set(ch, t);
  }, []);

  const finish = useCallback(() => {
    endRef.current = performance.now();
    setFinished(true);
    sound.done();
    const durationMs = startRef.current != null ? endRef.current - startRef.current : 0;
    const totalCorrect = requireEnter ? target.length : target.replace(/\n/g, "").length;
    const acc = totalCorrect + errors > 0 ? totalCorrect / (totalCorrect + errors) : 1;
    const cpm = durationMs > 0 ? (totalCorrect / durationMs) * 60000 : 0;
    onFinish?.({ accuracy: acc, cpm, errors, durationMs, chars: totalCorrect, keyTally: tally.current });
  }, [target, requireEnter, errors, onFinish]);

  const handleChar = useCallback(
    (input: string) => {
      if (finished) return;
      if (startRef.current == null) startRef.current = performance.now();
      const expected = target[pos];
      if (expected == null) return;

      const isCorrect = input === expected;
      if (isCorrect) {
        bump(expected, true);
        setCorrect((c) => c + 1);
        sound.key();
        const next = requireEnter ? pos + 1 : skipNewlines(target, pos + 1);
        if (next >= target.length) {
          setPos(next);
          finish();
        } else {
          setPos(next);
        }
      } else {
        bump(expected, false);
        setErrors((e) => e + 1);
        sound.miss();
        setJustErrored(true);
        if (errorFlashTimer.current) window.clearTimeout(errorFlashTimer.current);
        errorFlashTimer.current = window.setTimeout(() => setJustErrored(false), 320);
        if (errorMode === "flow") {
          setWrongSet((s) => new Set(s).add(pos));
          const next = requireEnter ? pos + 1 : skipNewlines(target, pos + 1);
          setPos(next);
          if (next >= target.length) finish();
        }
        // block mode: do not advance
      }
    },
    [finished, target, pos, bump, finish, errorMode, requireEnter],
  );

  const handleBackspace = useCallback(() => {
    if (errorMode !== "flow" || finished) return;
    setPos((p) => {
      let q = p - 1;
      if (!requireEnter) while (q > 0 && target[q] === "\n") q--;
      if (q < 0) return p;
      setWrongSet((s) => {
        const n = new Set(s);
        n.delete(q);
        return n;
      });
      return q;
    });
  }, [errorMode, finished, target, requireEnter]);

  // attach beforeinput listener to the hidden field
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const onBeforeInput = (e: Event) => {
      const ie = e as InputEvent;
      e.preventDefault();
      switch (ie.inputType) {
        case "insertText":
          if (ie.data) for (const ch of ie.data) handleChar(ch);
          break;
        case "insertLineBreak":
        case "insertParagraph":
          handleChar("\n");
          break;
        case "deleteContentBackward":
          handleBackspace();
          break;
      }
    };
    el.addEventListener("beforeinput", onBeforeInput);
    return () => el.removeEventListener("beforeinput", onBeforeInput);
  }, [handleChar, handleBackspace]);

  // live CPM ticking while active
  useEffect(() => {
    if (finished || startRef.current == null) return;
    const t = window.setInterval(() => forceTick((n) => n + 1), 500);
    return () => window.clearInterval(t);
  }, [finished, pos]);

  const items = useMemo<CharItem[]>(() => {
    const out: CharItem[] = [];
    for (let i = 0; i < target.length; i++) {
      const ch = target[i];
      let status: CharStatus;
      if (i < pos) status = wrongSet.has(i) ? "wrong" : "correct";
      else if (i === pos) status = "current";
      else status = "pending";
      out.push({ char: ch, status });
    }
    return out;
  }, [target, pos, wrongSet]);

  const elapsedMs =
    startRef.current != null
      ? (endRef.current ?? performance.now()) - startRef.current
      : 0;
  const totalCorrectChars = correct;
  const cpm = elapsedMs > 0 ? (totalCorrectChars / elapsedMs) * 60000 : 0;
  const accuracy =
    totalCorrectChars + errors > 0
      ? totalCorrectChars / (totalCorrectChars + errors)
      : 1;

  return {
    ref,
    items,
    pos,
    expected: target[pos] ?? null,
    finished,
    started: startRef.current != null,
    justErrored,
    errors,
    correct,
    accuracy,
    cpm,
    elapsedMs,
    reset,
    keyTally: tally.current,
  };
}
