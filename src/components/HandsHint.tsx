import type { CSSProperties } from "react";
import { charInfo, FINGER_LABEL_CS } from "../data/layout";
import { FINGER_STYLE } from "../lib/finger";

/* A small two-hands diagram that lights up the finger to use for the next key.
 * Pure SVG, color + label (non-color-only). */

const HAND_FINGERS = {
  left: ["l-pinky", "l-ring", "l-middle", "l-index"] as const,
  right: ["r-index", "r-middle", "r-ring", "r-pinky"] as const,
};

export function HandsHint({ expected }: { expected: string | null }) {
  const info = expected ? charInfo(expected) : undefined;
  const activeFinger = info?.finger ?? null;
  const usesThumb = activeFinger === "thumb";

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 8,
        // hands scale off the keyboard's key unit so the two stay proportional
        // and shrink/grow together
        "--hand-w": "calc(var(--ku, 44px) * 1.5)",
      } as CSSProperties}
    >
      <div style={{ display: "flex", gap: "calc(var(--hand-w) * 0.34)" }}>
        <Hand side="left" active={activeFinger} thumb={usesThumb} />
        <Hand side="right" active={activeFinger} thumb={usesThumb} />
      </div>
      <div style={{ minHeight: 22, fontSize: "0.9rem", color: "var(--text-soft)" }}>
        {activeFinger ? (
          <span>
            Použij{" "}
            <strong style={{ color: FINGER_STYLE[activeFinger].solid }}>
              {FINGER_LABEL_CS[activeFinger]}
            </strong>
          </span>
        ) : (
          <span>&nbsp;</span>
        )}
      </div>
    </div>
  );
}

function Hand({
  side,
  active,
  thumb,
}: {
  side: "left" | "right";
  active: string | null;
  thumb: boolean;
}) {
  const fingers = HAND_FINGERS[side];
  const thumbActive = thumb && (side === "left"); // show on one thumb only
  return (
    <svg
      viewBox="0 0 86 92"
      role="img"
      aria-hidden
      style={{ width: "var(--hand-w)", height: "calc(var(--hand-w) * 1.07)", display: "block" }}
    >
      {/* palm */}
      <rect x="14" y="52" width="58" height="34" rx="14" fill="var(--surface-2)" stroke="var(--border)" />
      {/* four fingers */}
      {fingers.map((f, i) => {
        const x = side === "left" ? 16 + i * 14 : 16 + i * 14;
        const isActive = active === f;
        const fs = FINGER_STYLE[f];
        const h = i === 0 || i === 3 ? 30 : i === 1 ? 42 : 46; // stagger
        return (
          <rect
            key={f}
            x={x}
            y={54 - h}
            width="11"
            height={h + 6}
            rx="5.5"
            fill={isActive ? fs.solid : "var(--surface-2)"}
            stroke={isActive ? fs.solid : "var(--border)"}
            style={{ transition: "fill .15s ease" }}
          />
        );
      })}
      {/* thumb */}
      <rect
        x={side === "left" ? 60 : 12}
        y="56"
        width="12"
        height="26"
        rx="6"
        transform={`rotate(${side === "left" ? 35 : -35} ${side === "left" ? 66 : 18} 60)`}
        fill={thumbActive ? FINGER_STYLE.thumb.solid : "var(--surface-2)"}
        stroke="var(--border)"
      />
    </svg>
  );
}

export function FingerLegend() {
  const items = [
    ["l-pinky", "l-ring", "l-middle", "l-index"],
    ["r-index", "r-middle", "r-ring", "r-pinky"],
  ] as const;
  return (
    <div style={{ display: "flex", gap: 18, flexWrap: "wrap", justifyContent: "center" }}>
      {items.flat().map((f) => {
        const fs = FINGER_STYLE[f as keyof typeof FINGER_STYLE];
        return (
          <span key={f} style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: "0.78rem", color: "var(--text-soft)" }}>
            <span
              style={{
                width: 16,
                height: 16,
                borderRadius: 5,
                background: fs.bg,
                color: fs.solid,
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "0.55rem",
                border: `1px solid ${fs.solid}`,
              }}
            >
              {fs.badge}
            </span>
            {fs.shortCs}
          </span>
        );
      })}
    </div>
  );
}
