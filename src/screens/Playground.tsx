import { useState } from "react";
import { useSettings } from "../ui/settings";
import { Keyboard } from "../components/Keyboard";
import { HandsHint } from "../components/HandsHint";
import { Card, Pill } from "../ui/primitives";
import { charInfo } from "../data/layout";
import { resolveKeyboardPlatform } from "../lib/platform";

/* Relaxed playground — type anything, feel the keyboard. Zero tracking.
 * The finger guides follow your *last* key so you can explore freely. */

export function Playground() {
  const settings = useSettings();
  const [last, setLast] = useState<string | null>(null);
  const [text, setText] = useState("");

  return (
    <div style={{ maxWidth: 820, margin: "0 auto", padding: "1.5rem 1rem" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
        <h1 style={{ fontSize: "1.6rem", margin: 0 }}>Hřiště</h1>
        <Pill>nic se nezaznamenává</Pill>
      </div>
      <p style={{ color: "var(--text-soft)" }}>Jen si piš a osahej si klávesnici. Žádný cíl, žádné měření.</p>

      <Card style={{ marginTop: 14 }}>
        <textarea
          autoFocus
          value={text}
          onChange={(e) => {
            const v = e.target.value;
            setText(v);
            const ch = v.slice(-1);
            setLast(ch && charInfo(ch) ? ch : null);
          }}
          placeholder="Piš tady…"
          rows={3}
          style={{
            width: "100%",
            border: "none",
            outline: "none",
            background: "transparent",
            color: "var(--text)",
            fontFamily: "var(--font-type)",
            fontSize: "1.4rem",
            resize: "none",
            lineHeight: 1.6,
          }}
        />
      </Card>

      <div style={{ marginTop: 18, display: "flex", flexDirection: "column", gap: 14 }}>
        {settings.scaffold.hands && <HandsHint expected={last} />}
        {settings.scaffold.keyboard && (
          <Keyboard
            expected={last}
            scaffold={settings.scaffold}
            platform={resolveKeyboardPlatform(settings.keyboardLayout)}
          />
        )}
      </div>
    </div>
  );
}
