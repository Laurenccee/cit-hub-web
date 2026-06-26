export const ROUTES = {
    ROOT: '/',
    SIGN_IN: '/sign-in',
    FORGET_PASSWORD: '/forget-password',
    EMAIL_VERIFICATION: '/email-verification',
    RESET_PASSWORD: '/reset-password',

    HOME: '/home',
    FEED: '/feed',
    BULLETIN: '/bulletin',
    SCHEDULE: '/schedule',
    PERSONNEL: '/personnel',
    PIONEERS: '/pioneers',

    PERSONNEL_SETUP: '/personnel/setup',
    PERSONNEL_EDIT: '/profile/edit',

    STUDENT_SETUP: '/student/setup',
    PROFILE: (id: string) => `/profile/${id}` as const,
};
