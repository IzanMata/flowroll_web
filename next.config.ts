import type { NextConfig } from 'next';

const BACKEND_URL = process.env.BACKEND_URL ?? 'http://127.0.0.1:8000';
const isDev = process.env.NODE_ENV === 'development';

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

  // Security headers applied to every response.
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
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              `script-src 'self'${isDev ? " 'unsafe-eval'" : ''} 'unsafe-inline'`,
              "style-src 'self' 'unsafe-inline'",
              "img-src 'self' data: blob:",
              "font-src 'self' data:",
              "connect-src 'self'",
              "frame-ancestors 'none'",
            ].join('; '),
          },
        ],
      },
    ];
  },
};

export default nextConfig;
