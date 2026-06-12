import { useState } from "react";
import { TypingArea } from "../components/TypingArea";
import { Button, Card, Pill } from "../ui/primitives";
import { SENTENCES, PHRASES } from "../data/words";

/* Free / custom-text practice — type a provided calm passage or paste your own.
 * No gating, no saved score; purely for the joy of typing something real. */

const PASSAGES: { title: string; text: string }[] = [
  { title: "Klidné věty", text: SENTENCES.slice(0, 4).join("\n") },
  { title: "Krátká slova", text: PHRASES.join("\n") },
  {
    title: "O psaní",
    text: "Psaní všemi deseti je jako chůze.\nZ počátku myslíš na každý krok.\nPak to jde samo a ty jen plyneš.",
  },
];

export function Practice() {
  const [text, setText] = useState<string | null>(null);
  const [draft, setDraft] = useState("");

  if (text != null) {
    return (
      <div style={{ maxWidth: 880, margin: "0 auto", padding: "1rem" }}>
        <div style={{ display: "flex", gap: 10, marginBottom: 14, alignItems: "center" }}>
          <Button variant="ghost" onClick={() => setText(null)}>← Zpět</Button>
          <Pill>Volné psaní</Pill>
        </div>
        <Card>
          <TypingArea segments={[{ label: "Text", text }]} />
        </Card>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 720, margin: "0 auto", padding: "1.5rem 1rem" }}>
      <h1 style={{ fontSize: "1.6rem" }}>Volné psaní</h1>
      <p style={{ color: "var(--text-soft)" }}>
        Vyber si text, nebo vlož vlastní — písničku, báseň, poznámky. Výsledky se neukládají.
      </p>

      <div style={{ display: "grid", gap: 12, marginTop: 18 }}>
        {PASSAGES.map((p) => (
          <Card key={p.title} onClick={() => setText(p.text)} style={{ cursor: "pointer" }}>
            <div style={{ fontWeight: 600 }}>{p.title}</div>
            <div style={{ color: "var(--text-soft)", fontSize: "0.9rem", marginTop: 4, whiteSpace: "pre-wrap" }}>
              {p.text.split("\n")[0]}…
            </div>
          </Card>
        ))}

        <Card>
          <div style={{ fontWeight: 600, marginBottom: 8 }}>Vlož vlastní text</div>
          <textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="Sem vlož cokoliv, co si chceš procvičit…"
            rows={4}
            style={{
              width: "100%",
              borderRadius: 10,
              border: "1px solid var(--border)",
              padding: "0.7rem",
              fontFamily: "inherit",
              fontSize: "1rem",
              background: "var(--surface-2)",
              color: "var(--text)",
              resize: "vertical",
            }}
          />
          <div style={{ marginTop: 10 }}>
            <Button disabled={!draft.trim()} onClick={() => setText(draft.trim())}>
              Začít psát
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
