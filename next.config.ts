import type { NextConfig } from 'next';

if (process.env.NODE_ENV === 'production' && !process.env.BACKEND_URL) {
  throw new Error(
    'BACKEND_URL environment variable is required in production.',
  );
}
const BACKEND_URL = process.env.BACKEND_URL ?? 'http://127.0.0.1:8000';

const nextConfig: NextConfig = {
  // Proxy unmatched /api/* requests to the Django backend.
  // Route Handlers (app/api/auth/*) take priority over these rewrites.
  async rewrites() {
    return {
      afterFiles: [
        {
          source: '/api/:path*',
          destination: `${BACKEND_URL}/api/:path*`,
        },
      ],
    };
  },

  // Static security headers applied to every response.
  // Content-Security-Policy is intentionally absent here — it is set
  // dynamically per request in middleware.ts so that a unique nonce can be
  // embedded (replaces the insecure 'unsafe-inline' directive).
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload',
          },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=(), payment=()',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
