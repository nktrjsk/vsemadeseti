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
import { clearErrorLog, formatDiagnostics, getErrorLog } from "../lib/errlog";
import { Button, Card, FieldRow, Pill, Segmented, Stepper, Toggle } from "../ui/primitives";

export function Settings() {
  const s = useSettings();
  const [mnemonic, setMnemonic] = useState<string | null>(null);
  const [showPhrase, setShowPhrase] = useState(false);
  const [copied, setCopied] = useState(false);
  const [armed, setArmed] = useState(false); // delete is two-step: arm, then confirm
  const [restoreText, setRestoreText] = useState("");
  const [restoreErr, setRestoreErr] = useState<string | null>(null);
  const [errCount, setErrCount] = useState(() => getErrorLog().length);
  const [diagCopied, setDiagCopied] = useState(false);

  const copyDiagnostics = () => {
    void navigator.clipboard?.writeText(formatDiagnostics()).then(() => {
      setDiagCopied(true);
      window.setTimeout(() => setDiagCopied(false), 1800);
    });
  };

  const copyPhrase = () => {
    if (!mnemonic) return;
    void navigator.clipboard?.writeText(mnemonic).then(() => {
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    });
  };

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
        <FieldRow label="Motiv">
          <Segmented<Theme>
            value={s.theme}
            onChange={(v) => setSettings({ theme: v })}
            options={[
              ["system", "Podle systému"],
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
      </Section>

      <Section title="Zvuk">
        <FieldRow label="Jemné zvuky" hint="Tiché cvaknutí a krátký tón na konci lekce">
          <Toggle on={s.sound} onChange={(v) => setSettings({ sound: v })} />
        </FieldRow>
        {s.sound && (
          <FieldRow label="Hlasitost">
            <input
              type="range"
              min={0}
              max={1}
              step={0.05}
              value={s.volume}
              onChange={(e) => setSettings({ volume: Number(e.target.value) })}
              style={{ width: 180 }}
            />
          </FieldRow>
        )}
      </Section>

      <Section title="Psaní">
        <FieldRow label="Při překlepu" hint="Jak se aplikace zachová, když stiskneš špatnou klávesu">
          <Segmented<ErrorMode>
            value={s.errorMode}
            onChange={(v) => setSettings({ errorMode: v })}
            options={[
              ["block", "Počkat na správnou"],
              ["flow", "Pokračovat dál"],
            ]}
          />
        </FieldRow>
        <FieldRow label="Délka skupin" hint="Skupiny ve cvičení mají 1 až tolik znaků">
          <Stepper value={s.maxGroupLen} min={1} max={8} onChange={(v) => setSettings({ maxGroupLen: v })} />
        </FieldRow>
        <FieldRow label="Enter na konci řádku" hint="Každý řádek cvičení se ukončí klávesou Enter">
          <Toggle on={s.enterAtEol} onChange={(v) => setSettings({ enterAtEol: v })} />
        </FieldRow>
        <FieldRow label="Střídání rukou" hint="Skupiny upřednostní střídání levé a pravé ruky; vypnuto = čistě náhodné">
          <Toggle on={s.handAlternation} onChange={(v) => setSettings({ handAlternation: v })} />
        </FieldRow>
        <FieldRow label="Délka cvičení" hint="Kolik řádků má každá část lekce">
          <Segmented<DrillLength>
            value={s.drillLength}
            onChange={(v) => setSettings({ drillLength: v })}
            options={[
              ["short", "Krátké"],
              ["normal", "Normální"],
              ["long", "Dlouhé"],
            ]}
          />
        </FieldRow>
      </Section>

      <Section title="Pomůcky při psaní" >
        <FieldRow label="Klávesnice na obrazovce">
          <Toggle on={s.scaffold.keyboard} onChange={(v) => setScaffold({ keyboard: v })} />
        </FieldRow>
        {s.scaffold.keyboard && (
          <FieldRow label="Typ klávesnice" hint="Které spodní klávesy (⌘ vs Ctrl) se mají zobrazit">
            <Segmented<KeyboardLayout>
              value={s.keyboardLayout}
              onChange={(v) => setSettings({ keyboardLayout: v })}
              options={[
                ["auto", "Automaticky"],
                ["mac", "Mac"],
                ["pc", "Windows/PC"],
              ]}
            />
          </FieldRow>
        )}
        <FieldRow label="Barvy prstů">
          <Toggle on={s.scaffold.fingerColors} onChange={(v) => setScaffold({ fingerColors: v })} />
        </FieldRow>
        <FieldRow label="Zvýraznit další klávesu">
          <Toggle on={s.scaffold.nextKey} onChange={(v) => setScaffold({ nextKey: v })} />
        </FieldRow>
        <FieldRow label="Diagram rukou">
          <Toggle on={s.scaffold.hands} onChange={(v) => setScaffold({ hands: v })} />
        </FieldRow>
      </Section>

      <Section title="Záloha a přenos">
        <ul className="settings-list" style={{ marginTop: 0, marginBottom: "0.8rem" }}>
          <li>Data zůstávají jen v tomhle prohlížeči.</li>
          <li>Obnovovací frází je přeneseš na jiné zařízení — bez účtu, bez e-mailu.</li>
        </ul>
        <Card style={{ background: "var(--surface-2)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
            <strong>Obnovovací fráze</strong>
            <div style={{ display: "flex", gap: 6 }}>
              <Button variant="ghost" onClick={copyPhrase}>{copied ? "Zkopírováno ✓" : "Kopírovat"}</Button>
              <Button variant="ghost" onClick={() => setShowPhrase((v) => !v)}>
                {showPhrase ? "Skrýt" : "Zobrazit"}
              </Button>
            </div>
          </div>
          {showPhrase ? (
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
          ) : (
            <p style={{ fontSize: "0.85rem", color: "var(--text-soft)", margin: "10px 0 0", lineHeight: 1.6 }}>
              Zobrazí se citlivá fráze. Zkontroluj, že ti nikdo nekouká přes rameno.
            </p>
          )}
          <ul className="settings-list" style={{ fontSize: "0.8rem", marginTop: 10, marginBottom: 0 }}>
            <li>Ulož si ji na bezpečné místo.</li>
            <li>Kdo ji má, vidí tvůj pokrok.</li>
          </ul>
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
          <summary style={{ cursor: "pointer", color: "var(--text-soft)" }}>
            Začít úplně od začátku
          </summary>
          <div style={{ marginTop: 10 }}>
            <p style={{ fontSize: "0.85rem", color: "var(--text-soft)" }}>
              Tímto smažeš veškerý svůj pokrok z tohoto zařízení. Nelze vrátit zpět.
            </p>
            {armed ? (
              <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                <Button variant="danger" onClick={() => void evolu.resetAppOwner()}>
                  Opravdu smazat
                </Button>
                <Button variant="ghost" onClick={() => setArmed(false)}>
                  Zrušit
                </Button>
              </div>
            ) : (
              <Button variant="danger" onClick={() => setArmed(true)}>
                Smazat všechna data
              </Button>
            )}
          </div>
        </details>
      </Section>

      <Section title="Diagnostika">
        <ul className="settings-list" style={{ marginTop: 0, marginBottom: "0.8rem" }}>
          <li>Když se něco pokazí, aplikace si chybu poznamená — jen do tohoto prohlížeče.</li>
          <li>Hlášení můžeš zkopírovat a vložit do chybového hlášení na GitHubu.</li>
        </ul>
        <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
          <span style={{ fontSize: "0.85rem", color: "var(--text-soft)" }}>
            {errCount === 0
              ? "Zatím žádné zaznamenané chyby."
              : `Zaznamenané chyby: ${errCount}`}
          </span>
          <span style={{ flex: 1 }} />
          <Button variant="ghost" onClick={copyDiagnostics}>
            {diagCopied ? "Zkopírováno ✓" : "Kopírovat hlášení"}
          </Button>
          {errCount > 0 && (
            <Button
              variant="ghost"
              onClick={() => {
                clearErrorLog();
                setErrCount(0);
              }}
            >
              Vymazat
            </Button>
          )}
        </div>
      </Section>

      <Section title="Proč Všema deseti">
        <ul className="settings-list" style={{ fontSize: "0.92rem" }}>
          <li>Data zůstávají v zařízení — aplikace funguje offline a nic neposílá na servery.</li>
          <li>Žádné žebříčky ani srovnávání s ostatními; čísla jsou jen informace pro tebe.</li>
          <li>Chyby k učení patří — ukazují se klidně a nikdy se netrestají.</li>
          <li>Přístupnost od základu: písmo pro dyslektiky, větší text, ovládání bez myši.</li>
        </ul>
      </Section>
    </div>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div style={{ margin: "1.4rem 0" }}>
      <h2 style={{ fontSize: "0.85rem", textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--text-soft)" }}>
        {title}
      </h2>
      <Card>{children}</Card>
    </div>
  );
}


