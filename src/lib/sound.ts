import { getSettings } from "../ui/settings";

/* Gentle WebAudio cues — soft, never a buzzer. Created lazily on first use so
 * we don't touch AudioContext before a user gesture. */

let ctx: AudioContext | null = null;

function ac(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!ctx) {
    const Ctor = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!Ctor) return null;
    ctx = new Ctor();
  }
  if (ctx.state === "suspended") void ctx.resume();
  return ctx;
}

function tone(freq: number, durMs: number, gainPeak: number, type: OscillatorType = "sine") {
  const s = getSettings();
  if (!s.sound) return;
  const a = ac();
  if (!a) return;
  const now = a.currentTime;
  const osc = a.createOscillator();
  const gain = a.createGain();
  osc.type = type;
  osc.frequency.value = freq;
  const peak = gainPeak * s.volume;
  gain.gain.setValueAtTime(0.0001, now);
  gain.gain.exponentialRampToValueAtTime(Math.max(0.0002, peak), now + 0.008);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + durMs / 1000);
  osc.connect(gain).connect(a.destination);
  osc.start(now);
  osc.stop(now + durMs / 1000 + 0.02);
}

export const sound = {
  /** soft tick on a correct keypress */
  key() {
    tone(660, 35, 0.05, "sine");
  },
  /** quiet, non-alarming "try again" — a low mellow blip */
  miss() {
    tone(180, 90, 0.06, "triangle");
  },
  /** warm two-note chime at lesson end */
  done() {
    tone(587.33, 140, 0.09, "sine"); // D5
    setTimeout(() => tone(880, 220, 0.09, "sine"), 120); // A5
  },
  /** soft confirmation for milestones */
  milestone() {
    tone(523.25, 120, 0.08, "sine");
    setTimeout(() => tone(659.25, 160, 0.08, "sine"), 110);
    setTimeout(() => tone(783.99, 240, 0.08, "sine"), 240);
  },
};
