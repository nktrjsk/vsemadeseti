import { useState } from "react";
import { Button, Card } from "../ui/primitives";
import { setSettings } from "../ui/settings";
import { navigate } from "../lib/router";
import { LESSONS } from "../data/curriculum";

const STEPS = [
  {
    emoji: "🌿",
    title: "Vítej u psaní všemi deseti",
    body: "Tohle je klidné místo, kde se naučíš psát, aniž by ses musel{a} dívat na klávesnici. Žádné soutěžení, žádný stres — jen ty a tvoje tempo.",
  },
  {
    emoji: "🤲",
    title: "Začni u základní řady",
    body: "Polož prsty na řadu A S D F a J K L Ů. Cítíš dva malé hrbolky na klávesách F a J? Tam patří ukazováčky. Odtud se vracíš po každém úhozu.",
  },
  {
    emoji: "🧭",
    title: "Jak to chodí",
    body: "Aplikace ti vždy ukáže další klávesu i správný prst. Když uděláš chybu, nic se neděje — jen to v klidu zkusíš znovu. Můžeš kdykoliv změnit nastavení tak, aby ti to sedělo.",
  },
];

export function Onboarding() {
  const [i, setI] = useState(0);
  const step = STEPS[i];
  const last = i === STEPS.length - 1;

  const finish = () => {
    setSettings({ onboarded: true });
    navigate(`/lesson/${LESSONS[0].id}`);
  };

  return (
    <div style={{ maxWidth: 520, margin: "0 auto", padding: "3rem 1rem", minHeight: "70vh", display: "flex", alignItems: "center" }}>
      <Card style={{ textAlign: "center", padding: "2.5rem 2rem", width: "100%" }}>
        <div style={{ fontSize: "3rem", marginBottom: 10 }}>{step.emoji}</div>
        <h1 style={{ fontSize: "1.6rem", margin: "0 0 12px" }}>{step.title}</h1>
        <p style={{ color: "var(--text-soft)", lineHeight: 1.6, fontSize: "1.05rem" }}>
          {step.body.replace(/\{a\}/g, "")}
        </p>

        <div style={{ display: "flex", gap: 6, justifyContent: "center", margin: "1.5rem 0" }}>
          {STEPS.map((_, idx) => (
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

        <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
          {i > 0 && <Button variant="ghost" onClick={() => setI(i - 1)}>Zpět</Button>}
          {!last && <Button onClick={() => setI(i + 1)}>Dál</Button>}
          {last && <Button onClick={finish}>Pojďme na to →</Button>}
        </div>
        {!last && (
          <div style={{ marginTop: 14 }}>
            <button
              onClick={finish}
              style={{ background: "none", border: "none", color: "var(--text-faint)", cursor: "pointer", fontSize: "0.85rem" }}
            >
              Přeskočit úvod
            </button>
          </div>
        )}
      </Card>
    </div>
  );
}
