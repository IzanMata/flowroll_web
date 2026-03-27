/**
 * In-memory rate limiter for authentication endpoints.
 *
 * NOTE: This store is per-process. In a multi-instance or serverless
 * deployment, use a shared store (e.g. Redis / Upstash) instead.
 */

const WINDOW_MS = 15 * 60 * 1000; // 15 minutes
const MAX_ATTEMPTS = 5;

interface Entry {
  count: number;
  resetAt: number;
}

const store = new Map<string, Entry>();

// Periodically evict expired entries to prevent unbounded memory growth.
setInterval(
  () => {
    const now = Date.now();
    for (const [key, entry] of store) {
      if (now >= entry.resetAt) store.delete(key);
    }
  },
  5 * 60 * 1000,
);

export interface RateLimitResult {
  allowed: boolean;
  /** Seconds until the window resets (only present when allowed === false). */
  retryAfter?: number;
}

/**
 * Checks whether `key` (typically an IP address) is within the rate limit.
 * Increments the counter on every call.
 */
export function checkRateLimit(key: string): RateLimitResult {
  const now = Date.now();
  const entry = store.get(key);

  if (!entry || now >= entry.resetAt) {
    store.set(key, { count: 1, resetAt: now + WINDOW_MS });
    return { allowed: true };
  }

  if (entry.count >= MAX_ATTEMPTS) {
    return {
      allowed: false,
      retryAfter: Math.ceil((entry.resetAt - now) / 1000),
    };
  }

  entry.count += 1;
  return { allowed: true };
}
