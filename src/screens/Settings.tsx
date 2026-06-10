import { useEffect, useState, type ReactNode } from "react";
import { getOrThrow, Mnemonic } from "@evolu/common";
import { evolu } from "../db/evolu";
import {
  setScaffold,
  setSettings,
  useSettings,
  type DrillLength,
  type ErrorMode,
  type TextSize,
  type Theme,
} from "../ui/settings";
import type { KeyboardLayout } from "../lib/platform";
import { Button, Card, Pill, Segmented, Stepper, Toggle } from "../ui/primitives";

export function Settings() {
  const s = useSettings();
  const [mnemonic, setMnemonic] = useState<string | null>(null);
  const [showPhrase, setShowPhrase] = useState(false);
  const [restoreText, setRestoreText] = useState("");
  const [restoreErr, setRestoreErr] = useState<string | null>(null);

  useEffect(() => {
    void evolu.appOwner.then((o) => setMnemonic(o.mnemonic ?? null));
  }, []);

  const doRestore = () => {
    setRestoreErr(null);
    const res = Mnemonic.from(restoreText.trim());
    if (!res.ok) {
      setRestoreErr("To nevypadá jako platná obnovovací fráze. Zkontroluj prosím slova.");
      return;
    }
    void evolu.restoreAppOwner(getOrThrow(res));
  };

  return (
    <div style={{ maxWidth: 640, margin: "0 auto", padding: "1.5rem 1rem 4rem" }}>
      <h1 style={{ fontSize: "1.7rem" }}>Nastavení</h1>

      <Section title="Vzhled">
        <Row label="Motiv">
          <Segmented<Theme>
            value={s.theme}
            onChange={(v) => setSettings({ theme: v })}
            options={[
              ["system", "Podle systému"],
              ["light", "Světlý"],
              ["dark", "Tmavý"],
            ]}
          />
        </Row>
        <Row label="Velikost textu">
          <Segmented<TextSize>
            value={s.textSize}
            onChange={(v) => setSettings({ textSize: v })}
            options={[
              ["normal", "Normální"],
              ["large", "Větší"],
              ["larger", "Největší"],
            ]}
          />
        </Row>
        <Row label="Písmo pro dyslektiky" hint="Lépe rozlišitelná písmena v textu cvičení">
          <Toggle on={s.dyslexia} onChange={(v) => setSettings({ dyslexia: v })} />
        </Row>
      </Section>

      <Section title="Zvuk">
        <Row label="Jemné zvuky" hint="Tiché cvaknutí a milý tón na konci lekce">
          <Toggle on={s.sound} onChange={(v) => setSettings({ sound: v })} />
        </Row>
        {s.sound && (
          <Row label="Hlasitost">
            <input
              type="range"
              min={0}
              max={1}
              step={0.05}
              value={s.volume}
              onChange={(e) => setSettings({ volume: Number(e.target.value) })}
              style={{ width: 180 }}
            />
          </Row>
        )}
      </Section>

      <Section title="Psaní">
        <Row label="Při překlepu" hint="Jak se aplikace zachová, když stiskneš špatnou klávesu">
          <Segmented<ErrorMode>
            value={s.errorMode}
            onChange={(v) => setSettings({ errorMode: v })}
            options={[
              ["block", "Počkat na správnou"],
              ["flow", "Pokračovat dál"],
            ]}
          />
        </Row>
        <Row label="Délka skupin" hint="Skupiny ve cvičení mají 1 až tolik znaků">
          <Stepper value={s.maxGroupLen} min={1} max={8} onChange={(v) => setSettings({ maxGroupLen: v })} />
        </Row>
        <Row label="Enter na konci řádku" hint="Každý řádek cvičení se ukončí klávesou Enter">
          <Toggle on={s.enterAtEol} onChange={(v) => setSettings({ enterAtEol: v })} />
        </Row>
        <Row label="Střídání rukou" hint="Skupiny upřednostní střídání levé a pravé ruky; vypnuto = čistě náhodné">
          <Toggle on={s.handAlternation} onChange={(v) => setSettings({ handAlternation: v })} />
        </Row>
        <Row label="Délka cvičení" hint="Kolik řádků má každá část lekce">
          <Segmented<DrillLength>
            value={s.drillLength}
            onChange={(v) => setSettings({ drillLength: v })}
            options={[
              ["short", "Krátké"],
              ["normal", "Normální"],
              ["long", "Dlouhé"],
            ]}
          />
        </Row>
      </Section>

      <Section title="Pomůcky při psaní" >
        <Row label="Klávesnice na obrazovce">
          <Toggle on={s.scaffold.keyboard} onChange={(v) => setScaffold({ keyboard: v })} />
        </Row>
        {s.scaffold.keyboard && (
          <Row label="Typ klávesnice" hint="Které spodní klávesy (⌘ vs Ctrl) se mají zobrazit">
            <Segmented<KeyboardLayout>
              value={s.keyboardLayout}
              onChange={(v) => setSettings({ keyboardLayout: v })}
              options={[
                ["auto", "Automaticky"],
                ["mac", "Mac"],
                ["pc", "Windows/PC"],
              ]}
            />
          </Row>
        )}
        <Row label="Barvy prstů">
          <Toggle on={s.scaffold.fingerColors} onChange={(v) => setScaffold({ fingerColors: v })} />
        </Row>
        <Row label="Zvýraznit další klávesu">
          <Toggle on={s.scaffold.nextKey} onChange={(v) => setScaffold({ nextKey: v })} />
        </Row>
        <Row label="Diagram rukou">
          <Toggle on={s.scaffold.hands} onChange={(v) => setScaffold({ hands: v })} />
        </Row>
      </Section>

      <Section title="Záloha a přenos">
        <p style={{ color: "var(--text-soft)", fontSize: "0.9rem", marginTop: 0 }}>
          Tvá data zůstávají jen v tomhle prohlížeči. Pomocí obnovovací fráze si je můžeš
          přenést na jiné zařízení — žádný účet, žádný e-mail.
        </p>
        <Card style={{ background: "var(--surface-2)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <strong>Obnovovací fráze</strong>
            <Button variant="ghost" onClick={() => setShowPhrase((v) => !v)}>
              {showPhrase ? "Skrýt" : "Zobrazit"}
            </Button>
          </div>
          {showPhrase && (
            <div
              style={{
                marginTop: 8,
                fontFamily: "var(--font-type)",
                background: "var(--surface)",
                border: "1px solid var(--border)",
                borderRadius: 10,
                padding: "0.7rem",
                wordSpacing: "0.3rem",
                userSelect: "all",
              }}
            >
              {mnemonic ?? "…"}
            </div>
          )}
          <p style={{ fontSize: "0.8rem", color: "var(--text-faint)", marginBottom: 0 }}>
            Ulož si ji na bezpečné místo. Kdo ji má, vidí tvůj pokrok.
          </p>
        </Card>

        <details style={{ marginTop: 14 }}>
          <summary style={{ cursor: "pointer", color: "var(--text-soft)" }}>
            Obnovit z fráze (jiné zařízení)
          </summary>
          <div style={{ marginTop: 10 }}>
            <textarea
              value={restoreText}
              onChange={(e) => setRestoreText(e.target.value)}
              rows={2}
              placeholder="Vlož svou obnovovací frázi…"
              style={{
                width: "100%",
                borderRadius: 10,
                border: "1px solid var(--border)",
                padding: "0.6rem",
                fontFamily: "inherit",
                background: "var(--surface-2)",
                color: "var(--text)",
              }}
            />
            {restoreErr && <Pill>{restoreErr}</Pill>}
            <div style={{ marginTop: 8 }}>
              <Button variant="soft" disabled={!restoreText.trim()} onClick={doRestore}>
                Obnovit data
              </Button>
            </div>
          </div>
        </details>

        <details style={{ marginTop: 14 }}>
          <summary style={{ cursor: "pointer", color: "var(--text-faint)" }}>
            Začít úplně od začátku
          </summary>
          <div style={{ marginTop: 10 }}>
            <p style={{ fontSize: "0.85rem", color: "var(--text-soft)" }}>
              Tímto smažeš veškerý svůj pokrok z tohoto zařízení. Nelze vrátit zpět.
            </p>
            <Button variant="ghost" onClick={() => void evolu.resetAppOwner()}>
              Smazat a začít znovu
            </Button>
          </div>
        </details>
      </Section>
    </div>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div style={{ margin: "1.4rem 0" }}>
      <h2 style={{ fontSize: "0.85rem", textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--text-faint)" }}>
        {title}
      </h2>
      <Card>{children}</Card>
    </div>
  );
}

function Row({ label, hint, children }: { label: string; hint?: string; children: ReactNode }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 12,
        padding: "0.6rem 0",
        borderBottom: "1px solid var(--border)",
      }}
    >
      <div>
        <div style={{ fontWeight: 500 }}>{label}</div>
        {hint && <div style={{ fontSize: "0.8rem", color: "var(--text-faint)" }}>{hint}</div>}
      </div>
      <div>{children}</div>
    </div>
  );
}

