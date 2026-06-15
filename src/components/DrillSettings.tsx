import type { ReactNode } from "react";
import { setSettings, useSettings, type DrillLength, type ErrorMode } from "../ui/settings";
import { Segmented, Stepper, Toggle } from "../ui/primitives";

/* Quick drill settings behind the gear icon on the exercise screen. The same
 * options live in the main Settings screen; this is the in-context shortcut.
 * Changes apply immediately — the running step regenerates with the new value. */

const MISCLICK_HINTS: Record<ErrorMode, string> = {
  block: "Špatná klávesa se na chvíli ukáže a počká, než napíšeš tu správnou.",
  flow: "Píšeš plynule dál; překlepy se označí a započítají.",
};

export function DrillSettings() {
  const s = useSettings();
  return (
    <div
      // keep the hidden typing field focused while interacting with the popover
      onMouseDown={(e) => e.preventDefault()}
      style={{ display: "flex", flexDirection: "column" }}
    >
      <Row label="Po překlepu:" hint={MISCLICK_HINTS[s.errorMode]}>
        <Segmented<ErrorMode>
          value={s.errorMode}
          onChange={(v) => setSettings({ errorMode: v })}
          options={[
            ["block", "Oprava na místě"],
            ["flow", "Označit a psát dál"],
          ]}
        />
      </Row>
      <Row label="Délka skupin" hint="Skupiny mají 1 až tolik znaků">
        <Stepper
          value={s.maxGroupLen}
          min={1}
          max={8}
          onChange={(v) => setSettings({ maxGroupLen: v })}
        />
      </Row>
      <Row label="Enter na konci řádku" hint="Řádek se ukončí klávesou Enter">
        <Toggle on={s.enterAtEol} onChange={(v) => setSettings({ enterAtEol: v })} />
      </Row>
      <Row label="Střídání rukou" hint="Skupiny preferují střídání rukou; vypnuto = čistá náhoda">
        <Toggle on={s.handAlternation} onChange={(v) => setSettings({ handAlternation: v })} />
      </Row>
      <Row label="Délka cvičení">
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
        gap: 14,
        padding: "0.55rem 0",
      }}
    >
      <div>
        <div style={{ fontWeight: 500, fontSize: "0.92rem" }}>{label}</div>
        {hint && <div style={{ fontSize: "0.76rem", color: "var(--text-faint)" }}>{hint}</div>}
      </div>
      <div>{children}</div>
    </div>
  );
}
