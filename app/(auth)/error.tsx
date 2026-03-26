'use client';

import { useEffect } from 'react';
import { AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function AuthError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-[#080808] text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-red-500/10">
        <AlertTriangle className="h-6 w-6 text-red-400" />
      </div>
      <div>
        <h2 className="text-lg font-semibold text-foreground">
          Error de autenticación
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          No se pudo procesar la solicitud.
        </p>
      </div>
      <Button variant="outline" onClick={reset}>
        Reintentar
      </Button>
    </div>
  );
}
