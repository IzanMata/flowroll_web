// ─────────────────────────────────────────────────────────────────────────────
// API endpoint constants — all routes as typed functions or strings
// Multi-tenant routes require ?academy=<id> added by the query hooks
// ─────────────────────────────────────────────────────────────────────────────

export const ENDPOINTS = {
  // Auth — intentionally un-versioned (stable infrastructure)
  AUTH: {
    TOKEN: '/api/auth/token/',
    REFRESH: '/api/auth/token/refresh/',
    LOGOUT: '/api/auth/logout/',
    ME: '/api/auth/me/',
    REGISTER: '/api/auth/register/',
    VERIFY_EMAIL: '/api/auth/verify-email/',
    RESEND_VERIFICATION: '/api/auth/resend-verification/',
    CHANGE_PASSWORD: '/api/auth/change-password/',
    PASSWORD_RESET: '/api/auth/password-reset/',
    PASSWORD_RESET_CONFIRM: '/api/auth/password-reset/confirm/',
    SOCIAL_GOOGLE: '/api/auth/social/google/',
  },

  // Academies — /api/v1/
  ACADEMIES: {
    LIST: '/api/v1/academies/',
    DETAIL: (id: number) => `/api/v1/academies/${id}/`,
    MY_ACADEMIES: '/api/v1/academies/',
    PUBLIC: '/api/v1/academies/public/',
    MEMBERS: (id: number) => `/api/v1/academies/${id}/members/`,
    MEMBER_DETAIL: (academyId: number, userId: number) =>
      `/api/v1/academies/${academyId}/members/${userId}/`,
  },

  // Athletes — /api/v1/
  ATHLETES: {
    LIST: '/api/v1/athletes/',
    DETAIL: (id: number) => `/api/v1/athletes/${id}/`,
    PROMOTE: (id: number) => `/api/v1/athletes/${id}/promote/`,
    QR_TOKEN: (id: number) => `/api/v1/athletes/${id}/qr-token/`,
  },

  // Attendance / Classes — /api/v1/
  CLASSES: {
    LIST: '/api/v1/attendance/classes/',
    DETAIL: (id: number) => `/api/v1/attendance/classes/${id}/`,
    CHECKIN_QR: '/api/v1/attendance/classes/qr_checkin/',
    CHECKIN_MANUAL: '/api/v1/attendance/classes/manual_checkin/',
    GENERATE_QR: (id: number) => `/api/v1/attendance/classes/${id}/generate_qr/`,
    DROP_INS: '/api/v1/attendance/drop-ins/',
  },

  // Matches — /api/v1/
  MATCHES: {
    LIST: '/api/v1/matches/',
    DETAIL: (id: number) => `/api/v1/matches/${id}/`,
    ADD_EVENT: (id: number) => `/api/v1/matches/${id}/add_event/`,
    FINISH: (id: number) => `/api/v1/matches/${id}/finish_match/`,
  },

  // Tatami / Timer — /api/v1/
  TATAMI: {
    PRESETS: '/api/v1/tatami/timer-presets/',
    PRESET_DETAIL: (id: number) => `/api/v1/tatami/timer-presets/${id}/`,
    PRESET_START: (id: number) => `/api/v1/tatami/timer-presets/${id}/start_session/`,
    SESSIONS: '/api/v1/tatami/timer-sessions/',
    SESSION_DETAIL: (id: number) => `/api/v1/tatami/timer-sessions/${id}/`,
    SESSION_PAUSE: (id: number) => `/api/v1/tatami/timer-sessions/${id}/pause/`,
    SESSION_FINISH: (id: number) => `/api/v1/tatami/timer-sessions/${id}/finish/`,
    MATCHUPS: '/api/v1/tatami/matchups/',
    MATCHUP_PAIR: '/api/v1/tatami/matchups/pair_athletes/',
    WEIGHT_CLASSES: '/api/v1/tatami/weight-classes/',
  },

  // Membership — /api/v1/
  MEMBERSHIP: {
    PLANS: '/api/v1/membership/plans/',
    PLAN_DETAIL: (id: number) => `/api/v1/membership/plans/${id}/`,
    SUBSCRIPTIONS: '/api/v1/membership/subscriptions/',
    SUBSCRIPTION_DETAIL: (id: number) => `/api/v1/membership/subscriptions/${id}/`,
    SUBSCRIPTION_CANCEL: (id: number) => `/api/v1/membership/subscriptions/${id}/cancel/`,
    ENROLL: '/api/v1/membership/enroll/',
    LEAVE: (academyId: number) => `/api/v1/membership/${academyId}/leave/`,
    PROMOTIONS: '/api/v1/membership/promotions/',
    PROMOTION_DETAIL: (id: number) => `/api/v1/membership/promotions/${id}/`,
    SEMINARS: '/api/v1/membership/seminars/',
    SEMINAR_DETAIL: (id: number) => `/api/v1/membership/seminars/${id}/`,
    SEMINAR_REGISTER: (id: number) => `/api/v1/membership/seminars/${id}/register/`,
  },

  // Techniques (platform library — no academy scoping) — /api/v1/
  TECHNIQUES: {
    LIST: '/api/v1/techniques/',
    DETAIL: (id: number) => `/api/v1/techniques/${id}/`,
    CATEGORIES: '/api/v1/techniques/categories/',
  },

  // Learning — /api/v1/
  LEARNING: {
    TECHNIQUE_NOTES: '/api/v1/learning/technique-notes/',
    TECHNIQUE_NOTE_DETAIL: (id: number) => `/api/v1/learning/technique-notes/${id}/`,
    SPARRING_NOTES: '/api/v1/learning/sparring-notes/',
    SPARRING_NOTE_DETAIL: (id: number) => `/api/v1/learning/sparring-notes/${id}/`,
    VIDEO_LIBRARY: '/api/v1/learning/videos/',
  },

  // Competitions — /api/v1/
  COMPETITIONS: {
    TOURNAMENTS: '/api/v1/competitions/tournaments/',
    TOURNAMENT_DETAIL: (id: number) => `/api/v1/competitions/tournaments/${id}/`,
    TOURNAMENT_OPEN: (id: number) => `/api/v1/competitions/tournaments/${id}/open/`,
    TOURNAMENT_REGISTER: (id: number) => `/api/v1/competitions/tournaments/${id}/register/`,
    TOURNAMENT_GENERATE_BRACKET: (id: number) => `/api/v1/competitions/tournaments/${id}/generate_bracket/`,
    TOURNAMENT_BRACKET: (id: number) => `/api/v1/competitions/tournaments/${id}/bracket/`,
    TOURNAMENT_PARTICIPANTS: (id: number) => `/api/v1/competitions/tournaments/${id}/participants/`,
    TOURNAMENT_COMPLETE: (id: number) => `/api/v1/competitions/tournaments/${id}/complete/`,
    MATCH_RESULT: (id: number) => `/api/v1/competitions/matches/${id}/result/`,
    DIVISIONS: '/api/v1/competitions/divisions/',
    DIVISION_DETAIL: (id: number) => `/api/v1/competitions/divisions/${id}/`,
  },

  // Stats — /api/v1/
  STATS: {
    LIST: '/api/v1/stats/',
    ATHLETE: (id: number) => `/api/v1/stats/athlete/${id}/`,
    ATHLETE_RECOMPUTE: (id: number) => `/api/v1/stats/athlete/${id}/recompute/`,
    LEADERBOARD: '/api/v1/stats/leaderboard/',
  },

  // Payments (Stripe Connect marketplace) — /api/v1/
  PAYMENTS: {
    ACADEMY_ONBOARDING: '/api/v1/payments/academy-onboarding/',
    CONNECT_STATUS: (academyId: number) =>
      `/api/v1/payments/academy/${academyId}/connect-status/`,
    ACADEMY_DASHBOARD: (academyId: number) =>
      `/api/v1/payments/academy/${academyId}/dashboard/`,
    CHECKOUT: '/api/v1/payments/checkout/',
    SEMINAR_CHECKOUT: '/api/v1/payments/seminar-checkout/',
    HISTORY: '/api/v1/payments/history/',
  },

  // Community — /api/v1/
  COMMUNITY: {
    ACHIEVEMENTS: '/api/v1/community/achievements/',
    MY_ACHIEVEMENTS: '/api/v1/community/achievements/mine/',
    OPEN_MAT_SESSIONS: '/api/v1/community/open-mat/',
    OPEN_MAT_DETAIL: (id: number) => `/api/v1/community/open-mat/${id}/`,
    OPEN_MAT_JOIN: (id: number) => `/api/v1/community/open-mat/${id}/join/`,
  },
} as const;
