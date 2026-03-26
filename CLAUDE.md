# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev          # Start Next.js dev server on :3000
npm run build        # Production build
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

**Stack**: Next.js 16 (App Router) · React 19 · TypeScript 5 · Tailwind CSS 3.4 · shadcn/ui

**Domain**: Multi-tenant BJJ academy management SaaS (athletes, classes, attendance QR check-in, match tracking, technique library, tatami/timer).

### Directory layout

```
app/                  # Next.js App Router pages
  (auth)/             # Unauthenticated routes (login)
  (dashboard)/        # Protected routes (athletes, classes, community, etc.)
lib/
  apiClient.ts        # Axios instance — baseURL from NEXT_PUBLIC_API_URL (default: localhost:8000)
  api/endpoints.ts    # All API endpoint constants (AUTH, ACADEMIES, ATHLETES, …)
  auth/tokens.ts      # JWT helpers (getAccessToken, setTokens, clearTokens)
providers/
  AuthProvider.tsx    # JWT auth context (login/logout, user state, JWT decode)
  AcademyProvider.tsx # Active academy / tenant selection
  QueryProvider.tsx   # TanStack React Query setup (1-min stale, 1 retry, SSR-safe)
features/             # Domain-driven: each feature owns api/, hooks/, components/
components/
  ui/                 # shadcn/ui primitives (do not edit directly)
  layout/             # Sidebar, Topbar, AcademySelector
  shared/             # Cross-feature components (BeltBadge, EmptyState, …)
types/api.d.ts        # Auto-generated from OpenAPI — do not edit by hand
__tests__/            # Mirrors source structure; Vitest + React Testing Library
```

### Key patterns

- **API calls** go through the Axios instance in `lib/apiClient.ts`; endpoints are constants in `lib/api/endpoints.ts`.
- **Data fetching** uses TanStack React Query via custom hooks (e.g. `features/techniques/hooks/useTechniques.ts`).
- **Auth** is JWT-based. Tokens live in localStorage via `lib/auth/tokens.ts`; `AuthProvider` decodes the JWT to extract `user_id`. Multi-academy tenancy is handled by `AcademyProvider`.
- **Styling** uses Tailwind with CSS variable-based theming (dark mode via `.dark` class). The `cn()` helper (`lib/utils.ts`) wraps `clsx` + `tailwind-merge`.
- **TypeScript types** for the API are auto-generated — run `npm run api:generate` after backend schema changes.
- **Tests** use Vitest globals (no import needed for `describe`/`it`/`expect`) + jsdom environment + `@testing-library/jest-dom` matchers (loaded via `vitest.setup.ts`).
