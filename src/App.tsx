import { Suspense } from "react";
import { EvoluProvider } from "@evolu/react";
import { evolu } from "./db/evolu";
import { parseRoute, useRoute } from "./lib/router";
import { useSettings } from "./ui/settings";
import { AppShell } from "./components/AppShell";
import { ReloadPrompt } from "./components/ReloadPrompt";
import { Onboarding } from "./screens/Onboarding";
import { CoursePath } from "./screens/CoursePath";
import { LessonScreen } from "./screens/LessonScreen";
import { Practice } from "./screens/Practice";
import { Playground } from "./screens/Playground";
import { Weak } from "./screens/Weak";
import { Settings } from "./screens/Settings";

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
