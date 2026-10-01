import { ROLES } from "./roles";

export const NAV_LINKS = [
  { label: "Home", href: "/home" },
  { label: "Bulletin", href: "/bulletin" },
  { label: "Schedule", href: "/schedule" },
  { label: "Events", href: "/events" },
  { label: "Personnel", href: "/personnel" },
  { label: "Pioneers", href: "/pioneers" },
  {
    label: "Students",
    href: "/students",
    roles: [ROLES.ADMIN, ROLES.PIONEER] as number[],
  },
];

/** Filters nav links by the current user's role; links without a `roles` allowlist are shown to everyone. */
export function getVisibleNavLinks(role: number | null) {
  return NAV_LINKS.filter(
    (link) =>
      !("roles" in link) ||
      !link.roles ||
      (role !== null && link.roles.includes(role)),
  );
}
