# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev          # Start Next.js dev server on :3000
npm run build        # Production build
npm run start        # Run production build
npm run lint         # ESLint
npm run format       # Prettier (writes in place)
npm run test         # Run all tests once (Vitest)
npm run test:watch   # Vitest in watch mode

# Run a single test file
npx vitest run __tests__/components/ui/button.test.tsx

# Run tests matching a pattern
npx vitest run --grep "Button"

# Regenerate TypeScript types from the Django backend's OpenAPI schema
npm run api:generate
```

## Architecture

**Stack**: Next.js 16 (App Router) · React 19 · TypeScript 5 · Tailwind CSS 3.4 · shadcn/ui · TanStack React Query 5 · Zod · react-hook-form · Axios

**Domain**: Multi-tenant BJJ academy management SaaS (athletes, classes, attendance QR check-in, match tracking, technique library, tatami/timer, competitions, stats).

### Directory layout

```
app/                        # Next.js App Router
  (auth)/                   # Unauthenticated routes (login, register, verify-email, password-reset)
  (dashboard)/              # Protected routes wrapped in auth guard + AcademyProvider
    dashboard/              # Main dashboard
    athletes/
    classes/
    matches/
    competitions/
    tatami/
    membership/
    learning/
    community/
    stats/
    settings/
    settings/members/
  api/auth/                 # BFF route handlers (token, token/refresh, me, logout, social/google)
  techniques/               # Public technique library + [id] detail
  page.tsx                  # Public landing page
lib/
  api/
    client.ts               # Axios instance + token refresh interceptor + apiFetch<T>()
    endpoints.ts            # All API endpoint constants (AUTH, ACADEMIES, ATHLETES, …)
    cookies.ts              # httpOnly cookie helpers (server-side only)
    csrf.ts                 # Origin-header CSRF validation
    rateLimit.ts            # In-memory per-IP rate limiter (5 req/15min)
  auth/
    tokens.ts               # Token documentation (cookies, not localStorage)
  utils/
    capacity.ts             # getCapacityColor() for class fill ratio
    class-type.ts           # CLASS_TYPE_CONFIG (GI, NOGI, KIDS, COMPETITION, OPEN_MAT)
    date.ts                 # Spanish locale date helpers (formatDateTime, isUpcoming, getGreeting…)
    user.ts                 # getFullName()
  utils.ts                  # cn() helper (clsx + tailwind-merge)
providers/
  AuthProvider.tsx          # Auth context (user, isLoading, isAuthenticated, login, logout)
  AcademyProvider.tsx       # Active academy / tenant selection + localStorage persistence
  QueryProvider.tsx         # TanStack React Query setup (5-min stale, 2 retries, SSR-safe)
features/                   # Domain-driven: each feature owns api/, hooks/, components/
  belts/api/fetchBelts.ts
  categories/api/fetchCategories.ts
  techniques/
    api/fetchTechniques.ts
    hooks/useTechniques.ts
    components/TechniqueNode.tsx
components/
  ui/                       # shadcn/ui primitives — do not edit directly
  layout/                   # Sidebar, Topbar, AcademySelector
  shared/                   # BeltBadge, EmptyState, ErrorDisplay, PageHeader, GoogleSignInButton…
  techniques/               # technique-card.tsx
hooks/
  useAuth.ts                # Wrapper for AuthContext (throws if used outside AuthProvider)
  useAcademy.ts             # useAcademy() + useAcademyId() convenience hook
types/
  api.d.ts                  # Auto-generated from Django OpenAPI — do not edit by hand
  api.ts                    # Manual type extensions
__tests__/                  # Mirrors source structure; Vitest + React Testing Library
middleware.ts               # Server-side auth guard (cookie check) + per-request CSP nonce
```

### Key patterns

#### API calls
All API calls go through the Axios instance in `lib/api/client.ts`. The instance uses **relative URLs** (`/api/*`) — Next.js rewrites these to the Django backend (`BACKEND_URL`). `middleware.ts` injects the `Authorization: Bearer` header from the `flowroll_access` httpOnly cookie before the request reaches the backend.

Endpoints are constants in `lib/api/endpoints.ts`. Some are functions: `ATHLETES.DETAIL(id)`, `ACADEMIES.MEMBERS(academyId)`.

Use the `apiFetch<T>(endpoint, options?)` GET helper from `lib/api/client.ts` for type-safe fetches.

#### Data fetching
Uses TanStack React Query via custom hooks. The feature module owns every layer:
1. `features/<domain>/api/fetch<Domain>.ts` — async function calling `apiFetch<T>()`
2. `features/<domain>/hooks/use<Domain>.ts` — `useQuery({ queryKey, queryFn })`
3. Page/component calls the hook and handles `isLoading` / `error` states

Query defaults (QueryProvider): `staleTime: 5min`, `gcTime: 10min`, `retry: 2` (no retry on 401/403), `refetchOnWindowFocus: false`.

#### Authentication
Tokens are stored in **httpOnly cookies** (`flowroll_access`, `flowroll_refresh`) managed server-side. There is **no client-side JWT decoding**.

- BFF endpoints in `app/api/auth/` proxy auth requests to Django and set/clear cookies.
- `AuthProvider` calls `GET /api/auth/me/` on mount to validate session and populate user state.
- `middleware.ts` redirects to `/login` when the `flowroll_access` cookie is absent on protected routes.
- The Axios interceptor handles 401s by POSTing to `/api/auth/token/refresh/` (BFF), queuing concurrent requests during refresh, then retrying.
- Rate limiting: 5 login attempts per IP per 15 minutes (`lib/api/rateLimit.ts`).
- CSRF: BFF validates the `Origin` header matches `Host` (`lib/api/csrf.ts`).

#### Multi-tenancy
`AcademyProvider` fetches the user's academy list, persists the active selection to `localStorage` (`flowroll_active_academy`), and reads it synchronously on mount to avoid a flash. Access via `useAcademy()` or the `useAcademyId()` shortcut.

Pass the active academy ID as a query param when filtering API results: `?academy=<id>`.

#### Forms
Use **Zod + react-hook-form** with `zodResolver`:

```ts
const schema = z.object({ email: z.string().email(), password: z.string().min(8) })
const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
  resolver: zodResolver(schema)
})
```

#### Styling
Tailwind CSS with CSS variable-based theming. Dark mode via `.dark` class. Always use the `cn()` helper from `lib/utils.ts` to merge Tailwind classes safely (wraps `clsx` + `tailwind-merge`). Fonts: Geist Sans / Geist Mono.

#### TypeScript types
`types/api.d.ts` is auto-generated — run `npm run api:generate` after any Django OpenAPI schema change. Never edit it manually.

#### Tests
Vitest with globals enabled (no need to import `describe`/`it`/`expect`). Environment: jsdom. Extended matchers via `@testing-library/jest-dom` (loaded in `vitest.setup.ts`).

Test files live in `__tests__/` mirroring the source tree. Use `vi.mock()` for next/navigation and the API client. Use `renderHook()` for custom hooks.

### Security notes

- **CSP**: `middleware.ts` generates a per-request nonce (`crypto.randomUUID()`) and injects a strict `Content-Security-Policy` header. Inline styles use `'unsafe-inline'` (required by Tailwind/shadcn CSS vars). Scripts use the nonce + `'strict-dynamic'`.
- **Cookies**: `flowroll_access` (30 min TTL) and `flowroll_refresh` (7 days TTL) are `httpOnly`, `secure` in production, `sameSite: strict`. Management is in `lib/api/cookies.ts` (server-only).
- **Rate limiting**: In-memory per process — note this does **not** distribute across multiple instances.
- **Security headers**: Set in `next.config.ts` — HSTS, X-Content-Type-Options, X-Frame-Options, Referrer-Policy, Permissions-Policy.

### Environment variables

| Variable | Default | Required in production |
|---|---|---|
| `BACKEND_URL` | `http://127.0.0.1:8000` | Yes (throws build error if missing) |
| `NODE_ENV` | `development` | Set by runtime |
| `DOCKER_BUILD` | — | `true` enables standalone output |
| `NEXT_TELEMETRY_DISABLED` | — | Set to `1` to disable |

### Docker

Multi-stage build (`Dockerfile`):
1. Install deps (`node:20-alpine`)
2. Build with `DOCKER_BUILD=true` → `.next/standalone`
3. Lean runtime: copies standalone output + `public/`; runs as non-root `nextjs` user on port 3000.

```bash
docker build -t flowroll-web .
docker run -e BACKEND_URL=https://api.example.com -p 3000:3000 flowroll-web
```

### Localization

UI text, date formatting, and error messages are in **Spanish**. Date utilities in `lib/utils/date.ts` use `es-ES` locale.
