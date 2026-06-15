import type { SVGProps } from "react";

/* A small, consistent stroke-icon family — replaces cross-platform system
 * emoji in the chrome so the UI looks the same everywhere. 24×24, currentColor,
 * rounded joins, light 1.75 weight to match the calm register. Decorative by
 * default (aria-hidden); pass aria-label + role="img" when an icon stands alone. */

function Icon({ children, ...rest }: SVGProps<SVGSVGElement>) {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...rest}
    >
      {children}
    </svg>
  );
}

/** Sprout — the brand mark: a stem with two opening leaves. */
export function IconSprout(props: SVGProps<SVGSVGElement>) {
  return (
    <Icon {...props}>
      <path d="M12 21v-8" />
      <path d="M12 13c0-3.3 2.4-5.5 6-5.5.2 3.3-2.4 5.5-6 5.5Z" />
      <path d="M12 14.5C12 11.7 9.9 10 7 10c-.2 2.8 1.9 4.5 5 4.5Z" />
    </Icon>
  );
}

/** Route — the course path: a winding line between two stops. */
export function IconRoute(props: SVGProps<SVGSVGElement>) {
  return (
    <Icon {...props}>
      <circle cx="6" cy="19" r="2" />
      <circle cx="18" cy="5" r="2" />
      <path d="M8 19h6.5a3 3 0 0 0 3-3V9" />
    </Icon>
  );
}

/** Pen — free writing / practice. */
export function IconPen(props: SVGProps<SVGSVGElement>) {
  return (
    <Icon {...props}>
      <path d="M12.5 20H21" />
      <path d="M16.4 3.6a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z" />
    </Icon>
  );
}

/** Target — tune up the keys you keep missing ("Doladit"). */
export function IconTarget(props: SVGProps<SVGSVGElement>) {
  return (
    <Icon {...props}>
      <circle cx="12" cy="12" r="8" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="12" cy="12" r="0.6" fill="currentColor" stroke="none" />
    </Icon>
  );
}

/** Leaf — the relaxed playground ("Hřiště"). */
export function IconLeaf(props: SVGProps<SVGSVGElement>) {
  return (
    <Icon {...props}>
      <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.5 19 2c1 2 2 4.2 2 8 0 5.5-4.8 10-10 10Z" />
      <path d="M2 21c0-3 1.9-5.4 5-6" />
    </Icon>
  );
}

/** Keyboard — home row with the two F/J guide keys hinted. */
export function IconKeyboard(props: SVGProps<SVGSVGElement>) {
  return (
    <Icon {...props}>
      <rect x="2.5" y="6.5" width="19" height="12" rx="2" />
      <path d="M6 10.5h.01M9.5 10.5h.01M13 10.5h.01M16.5 10.5h.01" />
      <path d="M8 14.5h8" />
    </Icon>
  );
}

/** Compass — how the app guides you (next key, right finger). */
export function IconCompass(props: SVGProps<SVGSVGElement>) {
  return (
    <Icon {...props}>
      <circle cx="12" cy="12" r="9" />
      <path d="m15.5 8.5-2 5-5 2 2-5Z" />
    </Icon>
  );
}

/** Restart — replay the current step. */
export function IconRestart(props: SVGProps<SVGSVGElement>) {
  return (
    <Icon {...props}>
      <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
      <path d="M3 3v5h5" />
    </Icon>
  );
}

/** Sun — practice days this year. */
export function IconSun(props: SVGProps<SVGSVGElement>) {
  return (
    <Icon {...props}>
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2.5v2M12 19.5v2M2.5 12h2M19.5 12h2M5 5l1.4 1.4M17.6 17.6 19 19M19 5l-1.4 1.4M6.4 17.6 5 19" />
    </Icon>
  );
}

/** Sliders — settings ("Nastavení"). */
export function IconSettings(props: SVGProps<SVGSVGElement>) {
  return (
    <Icon {...props}>
      <path d="M20 7h-8" />
      <path d="M6 7H4" />
      <path d="M14 17h6" />
      <path d="M8 17H4" />
      <circle cx="9" cy="7" r="2.4" />
      <circle cx="11" cy="17" r="2.4" />
    </Icon>
  );
}

/** Help — a circle with a question mark inside. */
export function IconHelp(props: SVGProps<SVGSVGElement>) {
  return (
    <Icon {...props}>
      <circle cx="12" cy="12" r="9" />
      <path d="M9.5 9a2.5 2.5 0 0 1 5 .5c0 1.5-2.5 2-2.5 3.5" />
      <circle cx="12" cy="16.5" r="0.6" fill="currentColor" stroke="none" />
    </Icon>
  );
}

/** Eye — show statistics. */
export function IconEye(props: SVGProps<SVGSVGElement>) {
  return (
    <Icon {...props}>
      <path d="M2 12c2-4.8 6-7.5 10-7.5s8 2.7 10 7.5" />
      <path d="M2 12c2 4.8 6 7.5 10 7.5s8-2.7 10-7.5" />
      <circle cx="12" cy="12" r="2.8" />
    </Icon>
  );
}

/** EyeOff — hide statistics. */
export function IconEyeOff(props: SVGProps<SVGSVGElement>) {
  return (
    <Icon {...props}>
      <path d="M2 2l20 20" />
      <path d="M6.7 6.7A10 10 0 0 0 2 12c2 4.8 6 7.5 10 7.5a10 10 0 0 0 5.3-1.5" />
      <path d="M10.6 5.6A10 10 0 0 1 12 4.5c4 0 8 2.7 10 7.5a10.6 10.6 0 0 1-2.3 3.2" />
      <path d="M9.5 9.5a2.8 2.8 0 0 0 4 4" />
    </Icon>
  );
}
