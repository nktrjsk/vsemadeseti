import { useMemo, useRef, useState } from "react";
import { useQuery } from "@evolu/react";
import { attemptsQuery, keyStatsQuery, practiceDaysQuery } from "../db/evolu";
import { recordAttempt, type KeyStatRowFull } from "../db/record";
import { buildSteps, lessonById, LESSONS, stageOf } from "../data/curriculum";
import { TypingArea, type RunSummary, type Segment } from "../components/TypingArea";
import { Button, Card, Pill } from "../ui/primitives";
import { FingerLegend } from "../components/HandsHint";
import { navigate } from "../lib/router";
import { bestAccuracyByLesson } from "../lib/progress";

export function LessonScreen({ lessonId }: { lessonId: string }) {
  const lesson = lessonById(lessonId);
  const attempts = useQuery(attemptsQuery);
  const keyStats = useQuery(keyStatsQuery) as unknown as KeyStatRowFull[];
  const days = useQuery(practiceDaysQuery);

  const best = useMemo(() => bestAccuracyByLesson(attempts as never), [attempts]);
  // capture previous best ONCE at mount so the summary can say "better than before"
  const prevBestRef = useRef<number>(best.get(lessonId) ?? 0);

  const [summary, setSummary] = useState<RunSummary | null>(null);

  const segments: Segment[] = useMemo(
    () => (lesson ? buildSteps(lesson).map((s) => ({ label: s.label, text: s.text })) : []),
    [lesson],
  );

  if (!lesson) {
    return (
      <Card>
        <p>Lekce nenalezena.</p>
        <Button onClick={() => navigate("/")}>Zpět na cestu</Button>
      </Card>
    );
  }

  const stage = stageOf(lesson);
  const nextLesson = LESSONS.find((l) => l.index === lesson.index + 1);

  const handleComplete = (s: RunSummary) => {
    recordAttempt(
      lessonId,
      s,
      keyStats,
      (days as unknown as Array<{ day: string }>).map((d) => d.day),
    );
    setSummary(s);
  };

  return (
    <div style={{ maxWidth: 880, margin: "0 auto", padding: "1rem" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
        <Button variant="ghost" onClick={() => navigate("/")}>← Cesta</Button>
        <Pill>{stage.title}</Pill>
        <h2 style={{ margin: 0, fontSize: "1.25rem" }}>{lesson.title}</h2>
      </div>

      {summary ? (
        <SummaryCard
          summary={summary}
          prevBest={prevBestRef.current}
          onReplay={() => {
            prevBestRef.current = Math.max(prevBestRef.current, summary.accuracy);
            setSummary(null);
          }}
          onNext={
            nextLesson
              ? () => {
                  setSummary(null);
                  navigate(`/lesson/${nextLesson.id}`);
                }
              : undefined
          }
        />
      ) : (
        <Card>
          <TypingArea segments={segments} onComplete={handleComplete} />
          <div style={{ marginTop: 18, paddingTop: 14, borderTop: "1px solid var(--border)" }}>
            <FingerLegend />
          </div>
        </Card>
      )}
    </div>
  );
}

function encouragement(acc: number): string {
  if (acc >= 0.97) return "Krásná, čistá práce! 🌿";
  if (acc >= 0.9) return "Pěkně ti to jde — jsi připraven{a} jít dál.";
  if (acc >= 0.75) return "Dobrý pokus. Klidně si to projdi ještě jednou.";
  return "Každý pokus se počítá. Zkus to znovu, beze spěchu.";
}

function SummaryCard({
  summary,
  prevBest,
  onReplay,
  onNext,
}: {
  summary: RunSummary;
  prevBest: number;
  onReplay: () => void;
  onNext?: () => void;
}) {
  const acc = Math.round(summary.accuracy * 100);
  const improved = summary.accuracy > prevBest + 0.001 && prevBest > 0;
  return (
    <Card style={{ textAlign: "center", padding: "2.5rem 1.5rem" }}>
      <div style={{ fontSize: "2.6rem", marginBottom: 6 }}>🌱</div>
      <h2 style={{ margin: "0 0 6px", fontSize: "1.5rem" }}>{encouragement(summary.accuracy).replace("{a}", "")}</h2>
      <p style={{ color: "var(--text-soft)", marginTop: 0 }}>
        {improved
          ? "Lepší než minule — roste ti to pod rukama."
          : "Postupuješ svým vlastním tempem."}
      </p>

      <div style={{ display: "flex", gap: 16, justifyContent: "center", margin: "1.6rem 0" }}>
        <Stat label="přesnost" value={`${acc} %`} hero />
        <Stat label="úhozů/min" value={`${Math.round(summary.cpm)}`} />
      </div>
      <p style={{ fontSize: "0.82rem", color: "var(--text-faint)", maxWidth: 380, margin: "0 auto 1.4rem" }}>
        Rychlost je tu jen pro tebe, jako informace. Žádné srovnávání, žádný spěch.
      </p>

      <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap" }}>
        <Button variant="soft" onClick={onReplay}>↺ Ještě jednou</Button>
        {onNext && <Button onClick={onNext}>Pokračovat →</Button>}
        {!onNext && <Button onClick={onReplay}>Hotovo 🎉</Button>}
      </div>
    </Card>
  );
}

function Stat({ label, value, hero }: { label: string; value: string; hero?: boolean }) {
  return (
    <div style={{ minWidth: 96 }}>
      <div style={{ fontSize: hero ? "2.4rem" : "1.8rem", fontWeight: 700, color: hero ? "var(--accent-strong)" : "var(--text)" }}>
        {value}
      </div>
      <div style={{ fontSize: "0.8rem", color: "var(--text-soft)" }}>{label}</div>
    </div>
  );
}
