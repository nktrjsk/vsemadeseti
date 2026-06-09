import { EvoluProvider } from "@evolu/react";
import { evolu } from "./db/evolu";
import { parseRoute, useRoute } from "./lib/router";
import { useSettings } from "./ui/settings";
import { AppShell } from "./components/AppShell";
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
      <AppShell>{screen}</AppShell>
    </EvoluProvider>
  );
}
