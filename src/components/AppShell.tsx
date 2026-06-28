import type { ReactNode } from "react";
import { navigate, useRoute, parseRoute } from "../lib/router";
import {
  IconGithub,
  IconLeaf,
  IconPen,
  IconRoute,
  IconSettings,
  IconSprout,
  IconTarget,
} from "../ui/icons";

const REPO_URL = "https://github.com/nktrjsk/vsemadeseti";

const NAV: [string, string, () => ReactNode][] = [
  ["/", "Cesta", () => <IconRoute />],
  ["/practice", "Volné psaní", () => <IconPen />],
  ["/weak", "Doladit", () => <IconTarget />],
  ["/playground", "Hřiště", () => <IconLeaf />],
  ["/settings", "Nastavení", () => <IconSettings />],
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
      <a href="#main" className="skip-link">Přeskočit na obsah</a>
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
            style={{ display: "flex", alignItems: "center", gap: 8, background: "none", border: "none", cursor: "pointer", flexShrink: 0 }}
          >
            <span aria-hidden style={{ display: "inline-flex", color: "var(--accent)" }}>
              <IconSprout width={22} height={22} />
            </span>
            <span style={{ fontWeight: 700, fontSize: "1.1rem", color: "var(--text)", whiteSpace: "nowrap" }}>Všema deseti</span>
          </button>
          <nav style={{ display: "flex", gap: 2 }}>
            {NAV.map(([path, label, renderIcon]) => (
              <button
                key={path}
                onClick={() => navigate(path)}
                aria-current={isActive(path) ? "page" : undefined}
                aria-label={label}
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
                <span aria-hidden style={{ display: "inline-flex" }}>{renderIcon()}</span>
                <span style={{ display: "inline" }} className="nav-label">{label}</span>
              </button>
            ))}
          </nav>
        </div>
      </header>
      <main id="main" tabIndex={-1} style={{ flex: 1, outline: "none" }}>{children}</main>
      <footer
        style={{
          borderTop: "1px solid var(--border)",
          padding: "1rem",
          display: "flex",
          justifyContent: "center",
        }}
      >
        <a
          href={REPO_URL}
          target="_blank"
          rel="noreferrer"
          aria-label="Zdrojový kód na GitHubu"
          title="Zdrojový kód na GitHubu"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            color: "var(--text-soft)",
            textDecoration: "none",
            fontSize: "0.85rem",
          }}
        >
          <IconGithub width={18} height={18} />
          <span>Otevřený zdroj na GitHubu</span>
        </a>
      </footer>
      <style>{`@media (max-width:640px){.nav-label{display:none !important}}`}</style>
    </div>
  );
}
