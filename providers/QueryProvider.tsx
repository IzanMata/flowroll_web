'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { lazy, Suspense, useState } from 'react';

const ReactQueryDevtools =
  process.env.NODE_ENV === 'development'
    ? lazy(() =>
        import('@tanstack/react-query-devtools').then((m) => ({
          default: m.ReactQueryDevtools,
        })),
      )
    : null;

export default function QueryProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  // useState ensures each request gets its own QueryClient in SSR
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 5 * 60 * 1000,  // 5 min — SaaS data changes infrequently
            gcTime: 10 * 60 * 1000,    // 10 min — keep cache longer for slow navigation
            retry: (failureCount, error) => {
              // Don't retry on auth errors; retry up to 2x on other failures
              if (error instanceof Error && 'response' in error) {
                const status = (error as { response?: { status?: number } }).response?.status;
                if (status === 401 || status === 403) return false;
              }
              return failureCount < 2;
            },
            refetchOnWindowFocus: false,
          },
        },
      }),
  );

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {ReactQueryDevtools && (
        <Suspense fallback={null}>
          <ReactQueryDevtools initialIsOpen={false} />
        </Suspense>
      )}
    </QueryClientProvider>
  );
}
