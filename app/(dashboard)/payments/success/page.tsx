'use client';

import Link from 'next/link';
import { CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function PaymentSuccessPage() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-6 text-center animate-fade-in">
      <div className="flex h-16 w-16 items-center justify-center rounded-full border border-emerald-500/20 bg-emerald-500/[0.07]">
        <CheckCircle className="h-8 w-8 text-emerald-400" />
      </div>

      <div className="space-y-2">
        <h1 className="text-xl font-semibold text-foreground">
          ¡Pago completado!
        </h1>
        <p className="text-sm text-muted-foreground max-w-sm">
          Tu pago ha sido procesado correctamente. La suscripción o registro
          estará activo en breve.
        </p>
      </div>

      <div className="flex gap-3">
        <Button asChild>
          <Link href="/payments">Ver mis pagos</Link>
        </Button>
        <Button variant="outline" asChild>
          <Link href="/membership">Volver a membresías</Link>
        </Button>
      </div>
    </div>
  );
}
