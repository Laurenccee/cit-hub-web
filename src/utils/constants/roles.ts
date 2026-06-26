export const ROLES = {
  ADMIN: 0,
  FACULTY: 1,
  PIONEER: 2,
  CLERK: 3,
} as const;

export type Role = (typeof ROLES)[keyof typeof ROLES];
