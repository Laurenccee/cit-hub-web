export const ROUTES = {
  ROOT: "/",
  SIGN_IN: "/sign-in",
  FORGET_PASSWORD: "/forget-password",
  EMAIL_VERIFICATION: "/email-verification",
  RESET_PASSWORD: "/reset-password",

  HOME: "/home",
  FEED: "/feed",
  BULLETIN: "/bulletin",
  SCHEDULE: "/schedule",
  PERSONNEL: "/personnel",
  PIONEERS: "/pioneers",
  EVENTS: "/events",
  STUDENTS: "/student",

  PERSONNEL_SETUP: "/personnel/setup",
  PERSONNEL_EDIT: (id: string) => `/personnel/${id}/edit` as const,

  STUDENT_SETUP: "/student/setup",
  PERSONNEL_PROFILE: (id: string) => `/personnel/${id}` as const,
};
