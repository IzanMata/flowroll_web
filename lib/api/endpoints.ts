// ─────────────────────────────────────────────────────────────────────────────
// API endpoint constants — all routes as typed functions or strings
// Multi-tenant routes require ?academy=<id> added by the query hooks
// ─────────────────────────────────────────────────────────────────────────────

export const ENDPOINTS = {
  // Auth
  AUTH: {
    TOKEN: '/api/auth/token/',
    REFRESH: '/api/auth/token/refresh/',
    LOGOUT: '/api/auth/logout/',
    ME: '/api/auth/me/',
  },

  // Academies
  ACADEMIES: {
    LIST: '/api/academies/',
    DETAIL: (id: number) => `/api/academies/${id}/`,
    MY_ACADEMIES: '/api/academies/',
  },

  // Athletes
  ATHLETES: {
    LIST: '/api/athletes/',
    DETAIL: (id: number) => `/api/athletes/${id}/`,
    PROMOTE: (id: number) => `/api/athletes/${id}/promote/`,
    QR_TOKEN: (id: number) => `/api/athletes/${id}/qr-token/`,
  },

  // Attendance / Classes
  CLASSES: {
    LIST: '/api/attendance/classes/',
    DETAIL: (id: number) => `/api/attendance/classes/${id}/`,
    CHECKIN_QR: '/api/attendance/classes/qr_checkin/',
    CHECKIN_MANUAL: '/api/attendance/classes/manual_checkin/',
    GENERATE_QR: (id: number) => `/api/attendance/classes/${id}/generate_qr/`,
    DROP_INS: '/api/attendance/drop-ins/',
  },

  // Matches
  MATCHES: {
    LIST: '/api/matches/',
    DETAIL: (id: number) => `/api/matches/${id}/`,
    ADD_EVENT: (id: number) => `/api/matches/${id}/add_event/`,
    FINISH: (id: number) => `/api/matches/${id}/finish_match/`,
  },

  // Tatami / Timer
  TATAMI: {
    PRESETS: '/api/tatami/timer-presets/',
    PRESET_DETAIL: (id: number) => `/api/tatami/timer-presets/${id}/`,
    PRESET_START: (id: number) => `/api/tatami/timer-presets/${id}/start_session/`,
    SESSIONS: '/api/tatami/timer-sessions/',
    SESSION_DETAIL: (id: number) => `/api/tatami/timer-sessions/${id}/`,
    SESSION_PAUSE: (id: number) => `/api/tatami/timer-sessions/${id}/pause/`,
    SESSION_FINISH: (id: number) => `/api/tatami/timer-sessions/${id}/finish/`,
    MATCHUPS: '/api/tatami/matchups/',
    MATCHUP_PAIR: '/api/tatami/matchups/pair_athletes/',
    WEIGHT_CLASSES: '/api/tatami/weight-classes/',
  },

  // Membership
  MEMBERSHIP: {
    PLANS: '/api/membership/plans/',
    PLAN_DETAIL: (id: number) => `/api/membership/plans/${id}/`,
    SUBSCRIPTIONS: '/api/membership/subscriptions/',
    SUBSCRIPTION_DETAIL: (id: number) => `/api/membership/subscriptions/${id}/`,
    PROMOTIONS: '/api/membership/promotions/',
    PROMOTION_DETAIL: (id: number) => `/api/membership/promotions/${id}/`,
    SEMINARS: '/api/membership/seminars/',
    SEMINAR_DETAIL: (id: number) => `/api/membership/seminars/${id}/`,
    SEMINAR_REGISTER: (id: number) => `/api/membership/seminars/${id}/register/`,
  },

  // Techniques (platform library — no academy scoping)
  TECHNIQUES: {
    LIST: '/api/techniques/',
    DETAIL: (id: number) => `/api/techniques/${id}/`,
    CATEGORIES: '/api/techniques/categories/',
  },

  // Learning
  LEARNING: {
    TECHNIQUE_NOTES: '/api/learning/technique-notes/',
    TECHNIQUE_NOTE_DETAIL: (id: number) => `/api/learning/technique-notes/${id}/`,
    SPARRING_NOTES: '/api/learning/sparring-notes/',
    SPARRING_NOTE_DETAIL: (id: number) => `/api/learning/sparring-notes/${id}/`,
    VIDEO_LIBRARY: '/api/learning/videos/',
  },

  // Community
  COMMUNITY: {
    ACHIEVEMENTS: '/api/community/achievements/',
    MY_ACHIEVEMENTS: '/api/community/achievements/mine/',
    OPEN_MAT_SESSIONS: '/api/community/open-mat/',
    OPEN_MAT_DETAIL: (id: number) => `/api/community/open-mat/${id}/`,
    OPEN_MAT_JOIN: (id: number) => `/api/community/open-mat/${id}/join/`,
  },
} as const;
