'use client';

import { useEffect } from 'react';
import { AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ErrorDisplayProps {
  error: Error & { digest?: string };
  reset: () => void;
  title?: string;
  description?: string;
  /** Tailwind min-height class applied to the wrapper, e.g. "min-h-screen" */
  minHeight?: string;
  /** Extra classes for the wrapper */
  className?: string;
}

export function ErrorDisplay({
  error,
  reset,
  title = 'Algo salió mal',
  description = 'Ha ocurrido un error inesperado.',
  minHeight = 'min-h-[60vh]',
  className,
}: ErrorDisplayProps) {
  useEffect(() => {
    if (process.env.NODE_ENV !== 'production') {
      console.error(error);
    } else if (error.digest) {
      // In production only log the opaque digest — no stack traces exposed.
      console.error('Error digest:', error.digest);
    }
  }, [error]);

  return (
    <div
      className={`flex ${minHeight} flex-col items-center justify-center gap-4 text-center ${className ?? ''}`}
    >
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-red-500/10">
        <AlertTriangle className="h-6 w-6 text-red-400" />
      </div>
      <div>
        <h2 className="text-lg font-semibold text-foreground">{title}</h2>
        <p className="mt-1 text-sm text-muted-foreground">{description}</p>
      </div>
      <Button variant="outline" onClick={reset}>
        Reintentar
      </Button>
    </div>
  );
}
