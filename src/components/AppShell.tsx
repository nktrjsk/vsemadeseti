import type { ReactNode } from "react";
import { navigate, useRoute, parseRoute } from "../lib/router";

const NAV: [string, string, string][] = [
  ["/", "Cesta", "🧭"],
  ["/practice", "Volné psaní", "✍️"],
  ["/weak", "Doladit", "🎯"],
  ["/playground", "Hřiště", "🌿"],
  ["/settings", "Nastavení", "⚙️"],
];

export function AppShell({ children }: { children: ReactNode }) {
  const route = useRoute();
  const current = parseRoute(route).name;

  const isActive = (path: string) => {
    const n = parseRoute(path).name;
    return n === current || (path === "/" && current === "lesson");
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <header
        style={{
          position: "sticky",
          top: 0,
          zIndex: 10,
          background: "color-mix(in srgb, var(--bg) 88%, transparent)",
          backdropFilter: "blur(8px)",
          borderBottom: "1px solid var(--border)",
        }}
      >
        <div
          style={{
            maxWidth: 980,
            margin: "0 auto",
            padding: "0.6rem 1rem",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 12,
          }}
        >
          <button
            onClick={() => navigate("/")}
            style={{ display: "flex", alignItems: "center", gap: 8, background: "none", border: "none", cursor: "pointer" }}
          >
            <span style={{ fontSize: "1.3rem" }}>🌱</span>
            <span style={{ fontWeight: 700, fontSize: "1.1rem", color: "var(--text)" }}>vsemadeseti</span>
          </button>
          <nav style={{ display: "flex", gap: 2 }}>
            {NAV.map(([path, label, icon]) => (
              <button
                key={path}
                onClick={() => navigate(path)}
                aria-current={isActive(path) ? "page" : undefined}
                title={label}
                style={{
                  border: "none",
                  background: isActive(path) ? "var(--accent-soft)" : "transparent",
                  color: isActive(path) ? "var(--accent-strong)" : "var(--text-soft)",
                  borderRadius: 10,
                  padding: "0.4rem 0.7rem",
                  cursor: "pointer",
                  fontSize: "0.88rem",
                  fontWeight: 600,
                  fontFamily: "inherit",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                }}
              >
                <span aria-hidden>{icon}</span>
                <span style={{ display: "inline" }} className="nav-label">{label}</span>
              </button>
            ))}
          </nav>
        </div>
      </header>
      <main style={{ flex: 1 }}>{children}</main>
      <style>{`@media (max-width:640px){.nav-label{display:none !important}}`}</style>
    </div>
  );
}
