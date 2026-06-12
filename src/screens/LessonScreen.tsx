import { useMemo, useRef, useState } from "react";
import { useQuery } from "@evolu/react";
import { attemptsQuery, keyStatsQuery, practiceDaysQuery } from "../db/evolu";
import { recordAttempt, type KeyStatRowFull } from "../db/record";
import { lessonById, LESSONS, stageOf } from "../data/curriculum";
import { buildSteps } from "../data/generator";
import { TypingArea, type RunSummary, type Segment } from "../components/TypingArea";
import { Button, Card, Pill } from "../ui/primitives";
import { FingerLegend } from "../components/HandsHint";
import { IconSprout } from "../ui/icons";
import { navigate } from "../lib/router";
import { bestAccuracyByLesson, MASTERY, weakKeys } from "../lib/progress";
import { DRILL_LINES, useSettings } from "../ui/settings";

export function LessonScreen({ lessonId }: { lessonId: string }) {
  const lesson = lessonById(lessonId);
  const settings = useSettings();
  const attempts = useQuery(attemptsQuery);
  const keyStats = useQuery(keyStatsQuery) as unknown as KeyStatRowFull[];
  const days = useQuery(practiceDaysQuery);

  const best = useMemo(() => bestAccuracyByLesson(attempts as never), [attempts]);
  // capture previous best ONCE at mount so the summary can say "better than before"
  const prevBestRef = useRef<number>(best.get(lessonId) ?? 0);

  const [summary, setSummary] = useState<RunSummary | null>(null);
  // bumping this regenerates the drill — every attempt gets fresh random content
  const [attempt, setAttempt] = useState(0);

  // read key stats through a ref so a stats write mid-run can't regenerate text
  const statsRef = useRef<KeyStatRowFull[]>([]);
  statsRef.current = keyStats ?? [];

  const segments: Segment[] = useMemo(
    () =>
      lesson
        ? buildSteps(lesson, {
            maxGroupLen: settings.maxGroupLen,
            linesPerPhase: DRILL_LINES[settings.drillLength],
            weakKeys: weakKeys(statsRef.current),
            alternateHands: settings.handAlternation,
          }).map((s) => ({ label: s.label, text: s.text }))
        : [],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [lesson, attempt, settings.maxGroupLen, settings.drillLength, settings.handAlternation],
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
            setAttempt((a) => a + 1); // fresh random content for the new attempt
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
          <TypingArea segments={segments} onComplete={handleComplete} resetKey={`${lessonId}:${attempt}`} />
          {(settings.scaffold.keyboard || settings.scaffold.hands) && (
            <div style={{ marginTop: 18, paddingTop: 14, borderTop: "1px solid var(--border)" }}>
              <FingerLegend />
            </div>
          )}
        </Card>
      )}
    </div>
  );
}

function encouragement(acc: number): string {
  if (acc >= 0.97) return "Čistá práce.";
  if (acc >= 0.9) return "Hotovo — můžeš jít dál.";
  if (acc >= 0.75) return "Dobrý základ. Ještě jedno kolo to upevní.";
  return "Tahle lekce chce ještě chvíli. Klidně znovu.";
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
  const delta = Math.round((summary.accuracy - prevBest) * 100);
  const improved = prevBest > 0 && delta >= 1;
  // the two card states: mastered celebrates and points forward, under-mastery
  // shifts the filled button (and the icon's color) to "one more round"
  const mastered = summary.accuracy >= MASTERY;
  return (
    <Card style={{ textAlign: "center", padding: "2.5rem 1.5rem" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          color: mastered ? "var(--accent)" : "var(--gentle)",
          marginBottom: 8,
        }}
      >
        <IconSprout width={36} height={36} />
      </div>
      <h2 style={{ margin: "0 0 6px", fontSize: "1.5rem" }}>{encouragement(summary.accuracy)}</h2>
      {improved && (
        <p style={{ color: "var(--text-soft)", marginTop: 0 }}>O {delta} % líp než minule.</p>
      )}

      <div style={{ display: "flex", gap: 16, justifyContent: "center", margin: "1.6rem 0" }}>
        <Stat label="přesnost" value={`${acc} %`} hero />
        <Stat label="úhozů/min" value={`${Math.round(summary.cpm)}`} />
      </div>

      <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap" }}>
        <Button variant={mastered ? "soft" : "primary"} onClick={onReplay}>↺ Ještě jednou</Button>
        {onNext && (
          <Button variant={mastered ? "primary" : "soft"} onClick={onNext}>Pokračovat →</Button>
        )}
        {!onNext && mastered && (
          <Button onClick={() => navigate("/")}>Zpět na cestu</Button>
        )}
      </div>
      {(onNext || !mastered) && (
        <div style={{ marginTop: 12 }}>
          <Button variant="ghost" onClick={() => navigate("/")} style={{ fontSize: "0.9rem" }}>
            Zpět na cestu
          </Button>
        </div>
      )}
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
