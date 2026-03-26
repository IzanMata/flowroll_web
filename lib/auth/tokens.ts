// Auth tokens are now stored in httpOnly cookies managed by the
// Next.js BFF route handlers (app/api/auth/*).
//
// Client-side code should never read or write tokens directly.
// Use the BFF endpoints via apiClient instead:
//   POST /api/auth/token/         → login
//   POST /api/auth/token/refresh/ → refresh
//   POST /api/auth/logout/        → logout
//   GET  /api/auth/me/            → current user
