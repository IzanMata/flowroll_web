'use client';

import { ErrorDisplay } from '@/components/shared/ErrorDisplay';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <ErrorDisplay
      error={error}
      reset={reset}
      title="Algo salió mal"
      description="Ha ocurrido un error inesperado."
      minHeight="min-h-[60vh]"
    />
  );
}
