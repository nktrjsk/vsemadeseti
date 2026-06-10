import type { ButtonHTMLAttributes, CSSProperties, ReactNode } from "react";

export function Button({
  variant = "primary",
  style,
  children,
  ...rest
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "soft" | "ghost";
}) {
  const base: CSSProperties = {
    border: "none",
    borderRadius: 12,
    padding: "0.65rem 1.2rem",
    fontSize: "1rem",
    fontWeight: 600,
    cursor: "pointer",
    transition: "transform .12s ease, background .18s ease, box-shadow .18s ease",
    fontFamily: "inherit",
  };
  const variants: Record<string, CSSProperties> = {
    primary: { background: "var(--accent)", color: "#fff", boxShadow: "var(--shadow)" },
    soft: { background: "var(--accent-soft)", color: "var(--accent-strong)" },
    ghost: { background: "transparent", color: "var(--text-soft)" },
  };
  return (
    <button
      {...rest}
      style={{
        ...base,
        ...variants[variant],
        ...(rest.disabled ? { opacity: 0.45, cursor: "default" } : {}),
        ...style,
      }}
    >
      {children}
    </button>
  );
}

export function Card({
  children,
  style,
  onClick,
}: {
  children: ReactNode;
  style?: CSSProperties;
  onClick?: () => void;
}) {
  return (
    <div
      onClick={onClick}
      style={{
        background: "var(--surface)",
        border: "1px solid var(--border)",
        borderRadius: 18,
        boxShadow: "var(--shadow)",
        padding: "1.25rem",
        ...style,
      }}
    >
      {children}
    </div>
  );
}

export function Pill({ children, tone = "soft" }: { children: ReactNode; tone?: "soft" | "good" }) {
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        background: tone === "good" ? "var(--accent-soft)" : "var(--surface-2)",
        color: tone === "good" ? "var(--accent-strong)" : "var(--text-soft)",
        borderRadius: 999,
        padding: "0.25rem 0.7rem",
        fontSize: "0.82rem",
        fontWeight: 600,
      }}
    >
      {children}
    </span>
  );
}

export function Toggle({ on, onChange }: { on: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      role="switch"
      aria-checked={on}
      onClick={() => onChange(!on)}
      style={{
        width: 46,
        height: 26,
        borderRadius: 999,
        border: "none",
        cursor: "pointer",
        background: on ? "var(--accent)" : "var(--border)",
        position: "relative",
        transition: "background .18s ease",
      }}
    >
      <span
        style={{
          position: "absolute",
          top: 3,
          left: on ? 23 : 3,
          width: 20,
          height: 20,
          borderRadius: "50%",
          background: "#fff",
          transition: "left .18s ease",
          boxShadow: "0 1px 2px rgba(0,0,0,.2)",
        }}
      />
    </button>
  );
}

export function Segmented<T extends string>({
  value,
  onChange,
  options,
}: {
  value: T;
  onChange: (v: T) => void;
  options: [T, string][];
}) {
  return (
    <div style={{ display: "inline-flex", background: "var(--surface-2)", borderRadius: 10, padding: 3, gap: 2 }}>
      {options.map(([v, label]) => (
        <button
          key={v}
          onClick={() => onChange(v)}
          style={{
            border: "none",
            cursor: "pointer",
            borderRadius: 8,
            padding: "0.35rem 0.7rem",
            fontSize: "0.85rem",
            fontWeight: 600,
            fontFamily: "inherit",
            background: value === v ? "var(--surface)" : "transparent",
            color: value === v ? "var(--accent-strong)" : "var(--text-soft)",
            boxShadow: value === v ? "var(--shadow)" : "none",
          }}
        >
          {label}
        </button>
      ))}
    </div>
  );
}

export function Stepper({
  value,
  min,
  max,
  onChange,
}: {
  value: number;
  min: number;
  max: number;
  onChange: (v: number) => void;
}) {
  return (
    <div style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
      <Button
        variant="soft"
        aria-label="Méně"
        disabled={value <= min}
        onClick={() => onChange(Math.max(min, value - 1))}
        style={{ padding: "0.15rem 0.65rem", fontSize: "1.05rem" }}
      >
        −
      </Button>
      <span style={{ minWidth: 22, textAlign: "center", fontWeight: 700 }}>{value}</span>
      <Button
        variant="soft"
        aria-label="Více"
        disabled={value >= max}
        onClick={() => onChange(Math.min(max, value + 1))}
        style={{ padding: "0.15rem 0.65rem", fontSize: "1.05rem" }}
      >
        +
      </Button>
    </div>
  );
}

export function Progress({ value }: { value: number }) {
  return (
    <div
      style={{
        height: 8,
        borderRadius: 999,
        background: "var(--surface-2)",
        overflow: "hidden",
      }}
      role="progressbar"
      aria-valuenow={Math.round(value * 100)}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <div
        style={{
          width: `${Math.min(100, Math.max(0, value * 100))}%`,
          height: "100%",
          background: "var(--accent)",
          borderRadius: 999,
          transition: "width .4s ease",
        }}
      />
    </div>
  );
}
