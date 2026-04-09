'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  AlertCircle,
  CheckCircle2,
  ExternalLink,
  Loader2,
  Shield,
  Zap,
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useAcademyId } from '@/hooks/useAcademy';
import {
  getAcademyDashboard,
  startAcademyOnboarding,
} from '@/features/payments/api/fetchPayments';
import { useConnectStatus } from '@/features/payments/hooks/usePayments';
import { PageHeader } from '@/components/shared/PageHeader';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

// ─────────────────────────────────────────────────────────────────────────────
// Connect status card
// ─────────────────────────────────────────────────────────────────────────────

function ConnectStatusCard() {
  const academyId = useAcademyId();
  const queryClient = useQueryClient();
  const { data: status, isLoading } = useConnectStatus();

  const onboardMutation = useMutation({
    mutationFn: () => startAcademyOnboarding(academyId!),
    onSuccess: ({ onboarding_url }) => {
      window.location.href = onboarding_url;
    },
  });

  const dashboardMutation = useMutation({
    mutationFn: () => getAcademyDashboard(academyId!),
    onSuccess: ({ dashboard_url }) => {
      window.open(dashboard_url, '_blank', 'noopener,noreferrer');
      queryClient.invalidateQueries({
        queryKey: ['payments', 'connect-status', academyId],
      });
    },
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader className="pb-3 pt-5 px-5">
          <Skeleton className="h-4 w-48" />
        </CardHeader>
        <CardContent className="px-5 pb-5 space-y-4">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-2/3" />
          <Skeleton className="h-9 w-40" />
        </CardContent>
      </Card>
    );
  }

  const isConnected = status?.has_stripe_account ?? false;
  const isVerified = status?.charges_enabled && status?.details_submitted;

  return (
    <Card>
      <CardHeader className="pb-3 pt-5 px-5">
        <CardTitle className="flex items-center gap-2 text-sm font-semibold">
          <Zap className="h-4 w-4 text-muted-foreground" />
          Stripe Connect
        </CardTitle>
      </CardHeader>
      <CardContent className="px-5 pb-5 space-y-5">
        {/* Status badges */}
        <div className="space-y-2">
          <StatusRow
            label="Cuenta creada"
            active={isConnected}
          />
          <StatusRow
            label="Verificación completada"
            active={!!status?.details_submitted}
          />
          <StatusRow
            label="Pagos habilitados"
            active={!!status?.charges_enabled}
          />
          <StatusRow
            label="Transferencias habilitadas"
            active={!!status?.payouts_enabled}
          />
        </div>

        {/* Description */}
        <p className="text-xs text-muted-foreground leading-relaxed">
          {isVerified
            ? 'Tu academia está lista para recibir pagos. FlowRoll retiene una comisión del 10% y el resto se transfiere automáticamente a tu cuenta.'
            : isConnected
              ? 'La cuenta existe pero aún no ha completado la verificación de identidad. Completa el proceso en Stripe para empezar a recibir pagos.'
              : 'Conecta tu academia con Stripe para aceptar pagos de suscripciones y seminarios. El proceso de verificación (KYC) tarda solo unos minutos.'}
        </p>

        {/* Error */}
        {(onboardMutation.isError || dashboardMutation.isError) && (
          <div className="flex items-center gap-2 rounded-lg border border-red-500/20 bg-red-500/[0.07] px-4 py-3">
            <AlertCircle className="h-4 w-4 shrink-0 text-red-400" />
            <p className="text-xs text-red-400">
              No se pudo completar la operación. Inténtalo de nuevo.
            </p>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3 flex-wrap">
          {!isConnected ? (
            <Button
              onClick={() => onboardMutation.mutate()}
              disabled={onboardMutation.isPending}
            >
              {onboardMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Redirigiendo…
                </>
              ) : (
                <>
                  <Zap className="h-4 w-4" />
                  Conectar con Stripe
                </>
              )}
            </Button>
          ) : !isVerified ? (
            <Button
              variant="outline"
              onClick={() => onboardMutation.mutate()}
              disabled={onboardMutation.isPending}
            >
              {onboardMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Redirigiendo…
                </>
              ) : (
                'Completar verificación'
              )}
            </Button>
          ) : null}

          {isConnected && (
            <Button
              variant="outline"
              onClick={() => dashboardMutation.mutate()}
              disabled={dashboardMutation.isPending}
            >
              {dashboardMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Abriendo…
                </>
              ) : (
                <>
                  <ExternalLink className="h-4 w-4" />
                  Dashboard de Stripe
                </>
              )}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function StatusRow({ label, active }: { label: string; active: boolean }) {
  return (
    <div className="flex items-center gap-2">
      {active ? (
        <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
      ) : (
        <div className="h-4 w-4 shrink-0 rounded-full border border-white/[0.1]" />
      )}
      <span className={`text-xs ${active ? 'text-foreground' : 'text-muted-foreground'}`}>
        {label}
      </span>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Commission info card
// ─────────────────────────────────────────────────────────────────────────────

function CommissionInfoCard() {
  const rows = [
    { label: 'Precio del plan', value: '50,00 €', note: 'ejemplo' },
    { label: 'Comisión Stripe (~3%)', value: '−1,50 €', muted: true },
    { label: 'Comisión FlowRoll (10%)', value: '−5,00 €', muted: true },
    { label: 'La academia recibe', value: '≈ 43,50 €', highlight: true },
  ];

  return (
    <Card>
      <CardHeader className="pb-3 pt-5 px-5">
        <CardTitle className="flex items-center gap-2 text-sm font-semibold">
          <Shield className="h-4 w-4 text-muted-foreground" />
          Estructura de comisiones
        </CardTitle>
      </CardHeader>
      <CardContent className="px-5 pb-5 space-y-4">
        <div className="space-y-2 rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
          {rows.map(({ label, value, muted, highlight, note }) => (
            <div
              key={label}
              className={`flex justify-between text-xs ${
                highlight
                  ? 'border-t border-white/[0.06] pt-2 font-semibold text-foreground'
                  : muted
                    ? 'text-muted-foreground'
                    : 'text-foreground'
              }`}
            >
              <span>
                {label}
                {note && (
                  <span className="ml-1 text-muted-foreground/60">({note})</span>
                )}
              </span>
              <span
                className={
                  highlight ? 'text-emerald-400' : muted ? '' : ''
                }
              >
                {value}
              </span>
            </div>
          ))}
        </div>
        <p className="text-xs text-muted-foreground leading-relaxed">
          Las facturas se generan automáticamente en Stripe. El alumno recibe un
          PDF por email y puede descargarlo desde el historial de pagos.
        </p>
      </CardContent>
    </Card>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Page
// ─────────────────────────────────────────────────────────────────────────────

export default function BillingPage() {
  const { user } = useAuth();
  const academyId = useAcademyId();

  const currentAcademy = user?.academies.find((a) => a.id === academyId);
  const isOwner = currentAcademy?.role === 'OWNER';

  if (!isOwner) {
    return (
      <div className="space-y-6 animate-fade-in">
        <PageHeader
          eyebrow="Configuración"
          title="Facturación"
          subtitle="Gestión de pagos de la academia"
        />
        <div className="flex items-center gap-3 rounded-xl border border-amber-500/20 bg-amber-500/[0.07] px-4 py-3">
          <AlertCircle className="h-4 w-4 shrink-0 text-amber-400" />
          <p className="text-sm text-amber-400">
            Solo el propietario de la academia puede gestionar la facturación.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        eyebrow="Configuración"
        title="Facturación"
        subtitle="Gestión de pagos y Stripe Connect"
      />

      <div className="grid gap-4 lg:grid-cols-2">
        <ConnectStatusCard />
        <CommissionInfoCard />
      </div>
    </div>
  );
}
