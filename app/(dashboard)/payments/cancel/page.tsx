'use client';

import Link from 'next/link';
import { XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function PaymentCancelPage() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-6 text-center animate-fade-in">
      <div className="flex h-16 w-16 items-center justify-center rounded-full border border-red-500/20 bg-red-500/[0.07]">
        <XCircle className="h-8 w-8 text-red-400" />
      </div>

      <div className="space-y-2">
        <h1 className="text-xl font-semibold text-foreground">
          Pago cancelado
        </h1>
        <p className="text-sm text-muted-foreground max-w-sm">
          No se ha realizado ningún cargo. Puedes volver a intentarlo cuando
          quieras.
        </p>
      </div>

      <Button asChild>
        <Link href="/membership">Volver a membresías</Link>
      </Button>
    </div>
  );
}
