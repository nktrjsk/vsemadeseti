import { charInfo, FINGER_HAND, rowsFor, type KeyDef, type Platform } from "../data/layout";
import { FINGER_STYLE } from "../lib/finger";
import type { Scaffold } from "../ui/settings";

interface Props {
  expected: string | null;
  scaffold: Scaffold;
  platform: Platform;
}

export function Keyboard({ expected, scaffold, platform }: Props) {
  const rows = rowsFor(platform);
  const info = expected ? charInfo(expected) : undefined;
  const nextCode = info?.key.code ?? null;
  const needsShift = info?.needsShift ?? false;
  // standard rule: shift with the hand opposite the target key
  const shiftToHighlight =
    needsShift && info
      ? FINGER_HAND[info.finger] === "left"
        ? "ShiftRight"
        : "ShiftLeft"
      : null;

  return (
    <div
      aria-hidden
      style={{
        userSelect: "none",
        display: "flex",
        flexDirection: "column",
        gap: 6,
        padding: 10,
        background: "var(--surface-2)",
        borderRadius: 16,
        border: "1px solid var(--border)",
        width: "100%",
        maxWidth: 760,
        margin: "0 auto",
      }}
    >
      {rows.map((row, ri) => (
        <div key={ri} style={{ display: "flex", gap: 6 }}>
          {row.map((k) => (
            <Key
              key={k.code}
              def={k}
              isNext={scaffold.nextKey && k.code === nextCode}
              isShift={scaffold.nextKey && k.code === shiftToHighlight}
              scaffold={scaffold}
            />
          ))}
        </div>
      ))}
    </div>
  );
}

function Key({
  def,
  isNext,
  isShift,
  scaffold,
}: {
  def: KeyDef;
  isNext: boolean;
  isShift: boolean;
  scaffold: Scaffold;
}) {
  const fs = FINGER_STYLE[def.finger];
  const colored = scaffold.fingerColors;
  const highlight = isNext || isShift;

  const isLetter = /^[a-zěščřžýáíéúůóťňď]$/i.test(def.base) && def.base.length === 1;

  return (
    <div
      style={{
        position: "relative",
        flex: `${def.w ?? 1} 1 0`,
        minWidth: 0,
        height: 44,
        borderRadius: 9,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        fontSize: "0.95rem",
        fontWeight: 600,
        color: colored ? fs.text : "var(--text-soft)",
        background: isNext
          ? fs.solid
          : isShift
            ? "var(--accent-soft)"
            : colored
              ? fs.bg
              : "var(--surface)",
        border: `1px solid ${highlight ? "var(--accent-strong)" : "var(--border)"}`,
        boxShadow: isNext ? "0 0 0 3px var(--accent-soft)" : "none",
        transition: "background .15s ease, box-shadow .15s ease",
        animation: isNext ? "pulseKey 1.1s ease-in-out infinite" : undefined,
      }}
    >
      {isNext && <span style={{ color: "#fff" }}>{def.base}</span>}
      {!isNext && (
        <>
          {def.shift && isLetter ? (
            <span>{def.base.toUpperCase()}</span>
          ) : (
            <>
              {def.shift && (
                <span style={{ fontSize: "0.62rem", opacity: 0.55, lineHeight: 1 }}>
                  {def.shift}
                </span>
              )}
              <span>{def.base}</span>
            </>
          )}
        </>
      )}
      {def.label && (
        <span style={{ fontSize: "0.5rem", opacity: 0.6, lineHeight: 1, marginTop: 2 }}>
          {def.label}
        </span>
      )}
      {/* colour-blind-safe non-hue cue */}
      {colored && def.finger !== "thumb" && (
        <span
          style={{
            position: "absolute",
            top: 2,
            right: 4,
            fontSize: "0.5rem",
            opacity: isNext ? 0.9 : 0.5,
            color: isNext ? "#fff" : fs.solid,
          }}
        >
          {fs.badge}
        </span>
      )}
      <style>{`@keyframes pulseKey{0%,100%{box-shadow:0 0 0 3px var(--accent-soft)}50%{box-shadow:0 0 0 6px var(--accent-soft)}}`}</style>
    </div>
  );
}
