/**
 * Primary navigation.
 *
 * Lives here rather than in Header.tsx because Header is a "use client"
 * module: a server component importing a value from it receives a client
 * reference proxy, not the array. The Footer renders on the server, so the
 * shared constant has to sit outside the client boundary.
 */
export interface NavLink {
  href: string;
  label: string;
}

export const NAV_LINKS: readonly NavLink[] = [
  { href: "#top", label: "Home" },
  { href: "#menu", label: "Menu" },
  { href: "#story", label: "Our Story" },
  { href: "#moodboard", label: "Pinboard" },
  { href: "#visit", label: "Visit Us" },
] as const;
