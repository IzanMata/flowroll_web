'use client';

import { ExternalLink, Receipt } from 'lucide-react';
import { usePaymentHistory } from '@/features/payments/hooks/usePayments';
import { EmptyState } from '@/components/shared/EmptyState';
import { PageHeader } from '@/components/shared/PageHeader';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import type { Payment } from '@/types/api';
import { cn } from '@/lib/utils';

// ─────────────────────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────────────────────

const STATUS_LABELS: Record<Payment['status'], string> = {
  PENDING: 'Pendiente',
  SUCCEEDED: 'Completado',
  FAILED: 'Fallido',
  REFUNDED: 'Reembolsado',
};

const STATUS_COLORS: Record<Payment['status'], string> = {
  PENDING: 'text-amber-400 border-amber-500/20 bg-amber-500/[0.07]',
  SUCCEEDED: 'text-emerald-400 border-emerald-500/20 bg-emerald-500/[0.07]',
  FAILED: 'text-red-400 border-red-500/20 bg-red-500/[0.07]',
  REFUNDED: 'text-blue-400 border-blue-500/20 bg-blue-500/[0.07]',
};

const TYPE_LABELS: Record<Payment['payment_type'], string> = {
  SUBSCRIPTION: 'Suscripción',
  SEMINAR: 'Seminario',
  DROP_IN: 'Entrada suelta',
};

// ─────────────────────────────────────────────────────────────────────────────
// Payment row
// ─────────────────────────────────────────────────────────────────────────────

function PaymentRow({ payment }: { payment: Payment }) {
  const amount = parseFloat(payment.amount).toLocaleString('es-ES', {
    style: 'currency',
    currency: payment.currency.toUpperCase(),
  });

  return (
    <div className="flex items-center gap-4 rounded-xl border border-white/[0.06] bg-card px-4 py-3.5 transition-all duration-200 hover:border-white/[0.1]">
      <div className="min-w-0 flex-1 space-y-1">
        <div className="flex items-center gap-2 flex-wrap">
          <p className="text-sm font-medium text-foreground">
            {payment.description ?? TYPE_LABELS[payment.payment_type]}
          </p>
          <span
            className={cn(
              'inline-flex items-center rounded-md border px-1.5 py-0.5 text-[10px] font-medium',
              STATUS_COLORS[payment.status],
            )}
          >
            {STATUS_LABELS[payment.status]}
          </span>
        </div>
        <p className="text-xs text-muted-foreground">
          {TYPE_LABELS[payment.payment_type]} ·{' '}
          {new Date(payment.created_at).toLocaleDateString('es-ES', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
          })}
        </p>
      </div>

      <div className="flex shrink-0 items-center gap-3">
        <span className="text-sm font-bold tabular-nums text-foreground">
          {amount}
        </span>
        {payment.stripe_invoice_url && (
          <a
            href={payment.stripe_invoice_url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 rounded-md border border-white/[0.06] px-2 py-1 text-xs text-muted-foreground transition-colors hover:border-white/[0.15] hover:text-foreground"
          >
            <ExternalLink className="h-3 w-3" />
            Factura
          </a>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Skeleton
// ─────────────────────────────────────────────────────────────────────────────

function PaymentRowSkeleton() {
  return (
    <div className="flex items-center gap-4 rounded-xl border border-white/[0.06] bg-card px-4 py-3.5">
      <div className="flex-1 space-y-2">
        <Skeleton className="h-3.5 w-48" />
        <Skeleton className="h-3 w-32" />
      </div>
      <Skeleton className="h-4 w-16" />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Page
// ─────────────────────────────────────────────────────────────────────────────

export default function PaymentsPage() {
  const { data, isLoading } = usePaymentHistory();
  const payments = data?.results ?? [];

  const subtitle = isLoading
    ? '…'
    : `${payments.length} pago${payments.length !== 1 ? 's' : ''}`;

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader eyebrow="Finanzas" title="Historial de pagos" subtitle={subtitle} />

      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <PaymentRowSkeleton key={i} />
          ))}
        </div>
      ) : payments.length === 0 ? (
        <EmptyState
          icon={Receipt}
          title="Sin pagos"
          description="Aquí aparecerán tus pagos de suscripciones y seminarios."
        />
      ) : (
        <div className="space-y-2">
          {payments.map((p) => (
            <PaymentRow key={p.id} payment={p} />
          ))}
        </div>
      )}
    </div>
  );
}
