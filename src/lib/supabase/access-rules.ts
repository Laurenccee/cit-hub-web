import { ROLES } from "@/utils/constants/roles";
import { ROUTES } from "@/utils/constants/routes";

const AUTH_ROUTES: string[] = [
  ROUTES.ROOT,
  ROUTES.SIGN_IN,
  ROUTES.FORGET_PASSWORD,
  ROUTES.EMAIL_VERIFICATION,
  ROUTES.RESET_PASSWORD,
];

const PUBLIC_ROUTES: string[] = [
  ROUTES.HOME,
  ROUTES.FEED,
  ROUTES.BULLETIN,
  ROUTES.SCHEDULE,
  ROUTES.PERSONNEL,
  ROUTES.PIONEERS,
  ROUTES.EVENTS,
];

const PUBLIC_ROUTE_PREFIXES = ["/personnel/", "/bulletin/", "/events/"];
const EVENT_GATE_PATTERN = /^\/events\/[^/]+\/(login|logout)$/;

// Roles that must finish a profile before using the app, and where that happens.
const SETUP_PATH_BY_ROLE: Record<number, string> = {
  [ROLES.FACULTY]: ROUTES.PERSONNEL_SETUP,
  [ROLES.STUDENT]: ROUTES.STUDENT_SETUP,
};

const SETUP_PATHS: string[] = [ROUTES.PERSONNEL_SETUP, ROUTES.STUDENT_SETUP];

export type AccessProfile = {
  role_id: number | null;
  change_password: boolean | null;
} | null;

/** Returns the path to redirect a signed-out visitor to, or null to allow. */
export function resolveGuestRedirect(
  path: string,
  hasResetCode: boolean,
): string | null {
  if (path === ROUTES.RESET_PASSWORD) {
    return hasResetCode ? null : ROUTES.SIGN_IN;
  }

  const isPublic =
    AUTH_ROUTES.includes(path) ||
    PUBLIC_ROUTES.includes(path) ||
    (path !== ROUTES.PERSONNEL_SETUP &&
      PUBLIC_ROUTE_PREFIXES.some((prefix) => path.startsWith(prefix)));

  return isPublic ? null : ROUTES.HOME;
}

async function resolveSetupRedirect(
  path: string,
  role: number | null | undefined,
  hasSetupProfile: (role: number) => Promise<boolean>,
): Promise<string | null> {
  if (role === ROLES.ADMIN) {
    return SETUP_PATHS.includes(path) ? ROUTES.HOME : null;
  }

  const setupPath = role == null ? undefined : SETUP_PATH_BY_ROLE[role];
  if (role == null || !setupPath) return null;

  const isSetUp = await hasSetupProfile(role);
  if (!isSetUp) return path === setupPath ? null : setupPath;
  return path === setupPath ? ROUTES.HOME : null;
}

function resolveRoleRedirect(
  path: string,
  role: number | null | undefined,
): string | null {
  // Only Admins and Pioneers (student officers) may open the Students directory.
  if (
    path === ROUTES.STUDENTS &&
    role !== ROLES.ADMIN &&
    role !== ROLES.PIONEER
  ) {
    return ROUTES.HOME;
  }

  // Students may not open the RFID gate terminals; send them to the event page.
  if (EVENT_GATE_PATTERN.test(path) && role === ROLES.STUDENT) {
    return path.replace(/\/(login|logout)$/, "");
  }

  return null;
}

/**
 * Returns the path to redirect a signed-in user to, or null to allow.
 * `hasSetupProfile` is only called for roles that must complete a profile.
 */
export async function resolveUserRedirect(
  path: string,
  profile: AccessProfile,
  hasSetupProfile: (role: number) => Promise<boolean>,
): Promise<string | null> {
  if (profile?.change_password === true) {
    return path === ROUTES.RESET_PASSWORD ? null : ROUTES.RESET_PASSWORD;
  }

  if (AUTH_ROUTES.includes(path)) return ROUTES.HOME;

  const role = profile?.role_id;
  const setupRedirect = await resolveSetupRedirect(path, role, hasSetupProfile);
  return setupRedirect ?? resolveRoleRedirect(path, role);
}
