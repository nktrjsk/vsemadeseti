import { useEffect, useState, type ReactNode } from "react";
import { Button, Card, FieldRow, Segmented, Toggle } from "../ui/primitives";
import { setSettings, useSettings, type ErrorMode, type TextSize, type Theme } from "../ui/settings";
import { navigate } from "../lib/router";
import { LESSONS } from "../data/curriculum";
import { IconCompass, IconSettings, IconSprout } from "../ui/icons";

// Steps:
// 0 — Welcome
// 1 — Appearance (was StepSettings)
// 2 — Typing behavior (new: misclick mode + stats toggle)
// 3 — Jak to chodí (StepHow)
// 4 — Home row (StepHomeRow, last)
const TOTAL_STEPS = 5;

export function Onboarding() {
  const [i, setI] = useState(0);
  const [leaving, setLeaving] = useState(false);
  const last = i === TOTAL_STEPS - 1;

  const finish = () => {
    setSettings({ onboarded: true });
    const go = () => navigate(`/lesson/${LESSONS[0].id}`);
    // gently fade the flow out before handing off to the first lesson;
    // honor reduced-motion by navigating immediately
    const reduce = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      go();
      return;
    }
    setLeaving(true);
    window.setTimeout(go, 240);
  };

  // keyboard accelerator: Enter advances (or starts the first lesson on the last
  // step), but only when focus isn't on a control that handles Enter itself
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Enter" || leaving) return;
      const tag = document.activeElement?.tagName;
      if (tag === "BUTTON" || tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;
      e.preventDefault();
      if (last) finish();
      else setI((n) => Math.min(n + 1, TOTAL_STEPS - 1));
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [last, leaving]);

  return (
    <div
      style={{
        maxWidth: 520,
        margin: "0 auto",
        padding: "2.5rem 1rem 3rem",
        minHeight: "80vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 22,
        opacity: leaving ? 0 : 1,
        transform: leaving ? "translateY(-8px)" : "none",
        transition: "opacity .24s ease-out, transform .24s ease-out",
      }}
    >
      {i > 0 && (
        <div
          style={{
            fontWeight: 600,
            fontSize: "0.9rem",
            letterSpacing: "0.04em",
            color: "var(--text-soft)",
          }}
        >
          Všema deseti
        </div>
      )}
      <Card style={{ textAlign: "center", padding: "2.5rem 2rem", width: "100%" }}>
        {i === 0 && <StepWelcome />}
        {i === 1 && <StepAppearance />}
        {i === 2 && <StepBehavior />}
        {i === 3 && <StepHow />}
        {i === 4 && <StepHomeRow />}

        <div style={{ margin: "1.5rem 0" }}>
          <div style={{ fontSize: "0.8rem", color: "var(--text-soft)", marginBottom: 8 }}>
            Krok {i + 1} ze {TOTAL_STEPS}
          </div>
          <div aria-hidden="true" style={{ display: "flex", gap: 6, justifyContent: "center" }}>
            {Array.from({ length: TOTAL_STEPS }, (_, idx) => (
              <span
                key={idx}
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: 999,
                  background: idx === i ? "var(--accent)" : "var(--border)",
                }}
              />
            ))}
          </div>
        </div>

        <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
          {i > 0 && <Button variant="ghost" onClick={() => setI(i - 1)}>Zpět</Button>}
          {!last && <Button onClick={() => setI(i + 1)}>Dál</Button>}
          {last && <Button onClick={finish}>Začít první lekci →</Button>}
        </div>
        {!last && (
          <div style={{ marginTop: 6, display: "flex", justifyContent: "center" }}>
            <button
              onClick={finish}
              style={{
                background: "none",
                border: "none",
                color: "var(--text-soft)",
                cursor: "pointer",
                fontSize: "0.85rem",
                minHeight: 44,
                padding: "0 1rem",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                textDecoration: "underline",
                textUnderlineOffset: 3,
                textDecorationColor: "var(--border)",
              }}
            >
              Přeskočit úvod
            </button>
          </div>
        )}
      </Card>
    </div>
  );
}

function StepIcon({ children }: { children: ReactNode }) {
  return (
    <div style={{ display: "flex", justifyContent: "center", color: "var(--accent)", marginBottom: 12 }}>
      {children}
    </div>
  );
}

function StepTitle({ children }: { children: ReactNode }) {
  return <h1 style={{ fontSize: "1.6rem", margin: "0 0 12px" }}>{children}</h1>;
}

function StepBody({ children }: { children: ReactNode }) {
  return (
    <p style={{ color: "var(--text-soft)", lineHeight: 1.6, fontSize: "1.05rem", margin: 0 }}>
      {children}
    </p>
  );
}

function StepWelcome() {
  return (
    <>
      <StepIcon><IconSprout width={40} height={40} /></StepIcon>
      <StepTitle>Vítej u psaní všemi deseti</StepTitle>
      <StepBody>
        Naučíš se psát bez koukání na klávesnici — po malých krocích, od dvou kláves po celá slova.
      </StepBody>
      <p style={{ color: "var(--text-soft)", fontSize: "0.88rem", marginTop: 10, marginBottom: 0 }}>
        Funguje offline, bez účtu — všechno zůstává jen ve tvém zařízení.
      </p>
    </>
  );
}

/* The home row drawn as keys, with the two F/J anchors pulsing — the bump marks
 * say "find these without looking" better than a paragraph can. */
function StepHomeRow() {
  return (
    <>
      <StepTitle>Začni u základní řady</StepTitle>
      <div aria-hidden="true" style={{ display: "flex", gap: 6, justifyContent: "center", margin: "18px 0 18px" }}>
        {["A", "S", "D"].map((ch) => <HomeKey key={ch} ch={ch} />)}
        <HomeKey ch="F" anchor />
        <span style={{ width: 12 }} />
        <HomeKey ch="J" anchor />
        {["K", "L", "Ů"].map((ch) => <HomeKey key={ch} ch={ch} />)}
      </div>
      <StepBody>
        Polož prsty na vyznačené klávesy. Hrbolky na F a J vedou ukazováčky; tam se prsty
        po každém úhozu vracejí.
      </StepBody>
      <style>{`
        @keyframes obPulse {
          0% { box-shadow: 0 0 0 0 color-mix(in srgb, var(--accent) 35%, transparent); }
          70% { box-shadow: 0 0 0 8px color-mix(in srgb, var(--accent) 0%, transparent); }
          100% { box-shadow: 0 0 0 0 transparent; }
        }
        @media (prefers-reduced-motion: reduce) {
          .ob-key-anchor { animation: none !important; }
        }
      `}</style>
    </>
  );
}

function HomeKey({ ch, anchor }: { ch: string; anchor?: boolean }) {
  return (
    <span
      className={anchor ? "ob-key-anchor" : undefined}
      style={{
        width: "clamp(30px, 8vw, 38px)",
        height: 42,
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
        border: `1px solid ${anchor ? "var(--accent)" : "var(--border)"}`,
        borderRadius: 8,
        background: anchor ? "var(--accent-soft)" : "var(--surface-2)",
        color: anchor ? "var(--accent-strong)" : "var(--text-soft)",
        fontFamily: "var(--font-type)",
        fontWeight: 600,
        animation: anchor ? "obPulse 2.4s ease-in-out infinite" : undefined,
      }}
    >
      {ch}
      {anchor && (
        <span
          aria-hidden="true"
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            bottom: 5,
            display: "flex",
            justifyContent: "center",
            gap: 3,
          }}
        >
          <span style={{ width: 3, height: 3, borderRadius: 999, background: "currentColor", opacity: 0.65 }} />
          <span style={{ width: 3, height: 3, borderRadius: 999, background: "currentColor", opacity: 0.65 }} />
        </span>
      )}
    </span>
  );
}

function StepAppearance() {
  const s = useSettings();
  return (
    <>
      <StepIcon><IconSettings width={40} height={40} /></StepIcon>
      <StepTitle>Nastav si prostředí</StepTitle>
      <div style={{ textAlign: "left", margin: "0 auto", maxWidth: 400 }}>
        <FieldRow label="Motiv">
          <Segmented<Theme>
            value={s.theme}
            onChange={(v) => setSettings({ theme: v })}
            options={[
              ["system", "Systém"],
              ["light", "Světlý"],
              ["dark", "Tmavý"],
            ]}
          />
        </FieldRow>
        <FieldRow label="Velikost textu">
          <Segmented<TextSize>
            value={s.textSize}
            onChange={(v) => setSettings({ textSize: v })}
            options={[
              ["normal", "Normální"],
              ["large", "Větší"],
              ["larger", "Největší"],
            ]}
          />
        </FieldRow>
        <FieldRow label="Písmo pro dyslektiky" hint="Lépe rozlišitelná písmena v textu cvičení">
          <Toggle on={s.dyslexia} onChange={(v) => setSettings({ dyslexia: v })} />
        </FieldRow>
        <FieldRow label="Jemné zvuky" hint="Tiché cvaknutí a krátký tón na konci lekce" last>
          <Toggle on={s.sound} onChange={(v) => setSettings({ sound: v })} />
        </FieldRow>
      </div>
      <p style={{ color: "var(--text-soft)", fontSize: "0.85rem", marginTop: 12, marginBottom: 0 }}>
        Všechno jde později změnit v Nastavení.
      </p>
    </>
  );
}

const MISCLICK_HINTS: Record<ErrorMode, string> = {
  block: "Špatná klávesa se na chvíli ukáže a počká, než napíšeš tu správnou.",
  flow: "Píšeš plynule dál; překlepy se označí a započítají.",
};

function StepBehavior() {
  const s = useSettings();
  return (
    <>
      <StepIcon><IconCompass width={40} height={40} /></StepIcon>
      <StepTitle>Nastav si psaní</StepTitle>
      <div style={{ textAlign: "left", margin: "0 auto", maxWidth: 400 }}>
        <FieldRow label="Po překlepu:">
          <Segmented<ErrorMode>
            value={s.errorMode}
            onChange={(v) => setSettings({ errorMode: v })}
            options={[
              ["block", "Oprava na místě"],
              ["flow", "Označit a psát dál"],
            ]}
          />
        </FieldRow>
        <div
          style={{
            fontSize: "0.82rem",
            color: "var(--text-soft)",
            marginBottom: 12,
            textAlign: "left",
          }}
        >
          {MISCLICK_HINTS[s.errorMode]}
        </div>
        <FieldRow label="Zobrazovat rychlost a přesnost" last>
          <Toggle on={s.showStats} onChange={(v) => setSettings({ showStats: v })} />
        </FieldRow>
      </div>
      <p style={{ color: "var(--text-soft)", fontSize: "0.85rem", marginTop: 12, marginBottom: 0 }}>
        Obojí lze kdykoli změnit v nastavení nebo přímo při cvičení.
      </p>
    </>
  );
}

function StepHow() {
  return (
    <>
      <StepIcon><IconCompass width={40} height={40} /></StepIcon>
      <StepTitle>Jak to chodí</StepTitle>
      <StepBody>
        Aplikace ukazuje další klávesu i prst, kterým ji stisknout. Překlep nic nepokazí — jen ho
        opravíš a pokračuješ. Pomůcky i chování jdou upravit v nastavení.
      </StepBody>
    </>
  );
}
