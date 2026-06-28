import { Suspense } from "react";
import { EvoluProvider } from "@evolu/react";
import { evolu } from "./db/evolu";
import { parseRoute, useRoute } from "./lib/router";
import { useSettings } from "./ui/settings";
import { AppShell } from "./components/AppShell";
import { ReloadPrompt } from "./components/ReloadPrompt";
import { lazyScreen } from "./lib/lazyScreen";
// Onboarding + CoursePath are the immediate first views (first-run and the
// default route), so they stay eager. The rest load on navigation through the
// existing Suspense boundary, keeping the initial chunk small. lazyScreen adds
// stale-deploy recovery so a missing/hung chunk can't wedge the loader (#5).
import { Onboarding } from "./screens/Onboarding";
import { CoursePath } from "./screens/CoursePath";
const LessonScreen = lazyScreen(() => import("./screens/LessonScreen").then((m) => ({ default: m.LessonScreen })));
const Practice = lazyScreen(() => import("./screens/Practice").then((m) => ({ default: m.Practice })));
const Playground = lazyScreen(() => import("./screens/Playground").then((m) => ({ default: m.Playground })));
const Weak = lazyScreen(() => import("./screens/Weak").then((m) => ({ default: m.Weak })));
const Settings = lazyScreen(() => import("./screens/Settings").then((m) => ({ default: m.Settings })));

export function App() {
  const route = useRoute();
  const settings = useSettings();
  const { name, param } = parseRoute(route);

  // first run: show onboarding until completed (settings page still reachable)
  if (!settings.onboarded && name !== "welcome" && name !== "settings") {
    return (
      <EvoluProvider value={evolu}>
        <Onboarding />
        <ReloadPrompt />
      </EvoluProvider>
    );
  }

  let screen;
  switch (name) {
    case "welcome":
      screen = <Onboarding />;
      break;
    case "lesson":
      screen = <LessonScreen lessonId={param ?? ""} />;
      break;
    case "practice":
      screen = <Practice />;
      break;
    case "playground":
      screen = <Playground />;
      break;
    case "weak":
      screen = <Weak />;
      break;
    case "settings":
      screen = <Settings />;
      break;
    case "course":
    default:
      screen = <CoursePath />;
  }

  return (
    <EvoluProvider value={evolu}>
      <AppShell>
        <Suspense fallback={<ScreenLoading />}>{screen}</Suspense>
      </AppShell>
      <ReloadPrompt />
    </EvoluProvider>
  );
}

/** Calm placeholder while Evolu loads progress from local storage (or syncs on
 * a fresh device). useQuery suspends until the local query resolves; without a
 * boundary a cold load to a data-backed screen would have no fallback. */
function ScreenLoading() {
  return (
    <div
      role="status"
      aria-live="polite"
      style={{
        maxWidth: 760,
        margin: "0 auto",
        padding: "4rem 1rem",
        textAlign: "center",
        color: "var(--text-soft)",
      }}
    >
      Načítám tvůj postup…
    </div>
  );
}
