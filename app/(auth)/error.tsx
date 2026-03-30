'use client';

import { ErrorDisplay } from '@/components/shared/ErrorDisplay';

export default function AuthError({
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
      title="Error de autenticación"
      description="No se pudo procesar la solicitud."
      minHeight="min-h-screen"
      className="bg-[#080808]"
    />
  );
}
