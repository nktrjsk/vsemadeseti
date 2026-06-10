import { useMemo } from "react";
import { useQuery } from "@evolu/react";
import { keyStatsQuery } from "../db/evolu";
import { weakKeys } from "../lib/progress";
import { filterByChars, WORDS } from "../data/words";
import { randomGroups } from "../data/generator";
import { TypingArea, type Segment } from "../components/TypingArea";
import { Button, Card, Pill } from "../ui/primitives";
import { navigate } from "../lib/router";
import { DRILL_LINES, useSettings } from "../ui/settings";

/* Targeted weak-key drills — turns your most-missed keys into a short, gentle
 * practice. Mistakes become care, not punishment. */

export function Weak() {
  const stats = useQuery(keyStatsQuery) as unknown as Array<{ char: string; hits: number; misses: number }>;
  const weak = useMemo(() => weakKeys(stats), [stats]);
  const settings = useSettings();

  const segments: Segment[] = useMemo(() => {
    if (weak.length === 0) return [];
    const focus = weak.slice(0, 5);
    const lines = DRILL_LINES[settings.drillLength];
    const segs: Segment[] = [];
    segs.push({
      label: "Zaměř se",
      text: randomGroups(focus, {
        maxGroupLen: settings.maxGroupLen,
        lines,
        focus,
        alternateHands: settings.handAlternation,
      }),
    });
    const mixPool = [...new Set([..."fjdksla", ...focus])];
    segs.push({
      label: "Spojení",
      text: randomGroups(mixPool, {
        maxGroupLen: settings.maxGroupLen,
        lines,
        focus,
        alternateHands: settings.handAlternation,
        weight: (c) => (focus.includes(c) ? 3 : 1),
      }),
    });
    const words = filterByChars(WORDS, new Set([..."asdfghjkleiou", ...weak])).filter((w) =>
      focus.some((k) => w.includes(k)),
    );
    if (words.length >= 4) segs.push({ label: "Slova", text: words.slice(0, 14).join(" ") });
    return segs;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [weak, settings.maxGroupLen, settings.drillLength, settings.handAlternation]);

  if (weak.length === 0) {
    return (
      <div style={{ maxWidth: 560, margin: "0 auto", padding: "3rem 1rem", textAlign: "center" }}>
        <div style={{ fontSize: "2.6rem" }}>🌼</div>
        <h1 style={{ fontSize: "1.5rem" }}>Zatím nic k dolaďování</h1>
        <p style={{ color: "var(--text-soft)" }}>
          Až nasbíráš pár lekcí, najdeme klávesy, které ti dělají největší vrásky, a připravíme
          na ně klidné cvičení. Žádný spěch.
        </p>
        <Button onClick={() => navigate("/")}>Zpět na cestu</Button>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 880, margin: "0 auto", padding: "1rem" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
        <Button variant="ghost" onClick={() => navigate("/")}>← Cesta</Button>
        <Pill>Doladění kláves</Pill>
      </div>
      <Card style={{ marginBottom: 14 }}>
        <p style={{ margin: 0, color: "var(--text-soft)" }}>
          Tyhle klávesy ti zatím utíkají nejčastěji. Pojďme je v klidu posílit:
        </p>
        <div style={{ display: "flex", gap: 8, marginTop: 10, flexWrap: "wrap" }}>
          {weak.map((k) => (
            <span
              key={k}
              style={{
                fontFamily: "var(--font-type)",
                fontSize: "1.2rem",
                fontWeight: 700,
                background: "var(--accent-soft)",
                color: "var(--accent-strong)",
                borderRadius: 8,
                padding: "0.2rem 0.7rem",
              }}
            >
              {k === " " ? "␣" : k}
            </span>
          ))}
        </div>
      </Card>
      <Card>
        <TypingArea segments={segments} resetKey="weak" />
      </Card>
    </div>
  );
}
