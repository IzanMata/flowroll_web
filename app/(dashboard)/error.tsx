'use client';

import { ErrorDisplay } from '@/components/shared/ErrorDisplay';

export default function DashboardError({
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
      title="Error en el módulo"
      description="No se pudo cargar esta sección. Inténtalo de nuevo."
      minHeight="min-h-[50vh]"
    />
  );
}
