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
    <button {...rest} style={{ ...base, ...variants[variant], ...style }}>
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
