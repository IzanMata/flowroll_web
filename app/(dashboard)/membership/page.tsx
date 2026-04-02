'use client';

import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { CheckCircle, CreditCard, Loader2, LogOut } from 'lucide-react';
import { useAcademyId } from '@/hooks/useAcademy';
import apiClient from '@/lib/api/client';
import { ENDPOINTS } from '@/lib/api/endpoints';
import type { MembershipPlan, PaginatedResponse, Subscription } from '@/types/api';
import { EmptyState } from '@/components/shared/EmptyState';
import { PageHeader } from '@/components/shared/PageHeader';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

const PERIOD_LABELS: Record<MembershipPlan['billing_period'], string> = {
  MONTHLY: 'mes',
  QUARTERLY: 'trimestre',
  ANNUAL: 'año',
};

const STATUS_LABELS: Record<Subscription['status'], string> = {
  ACTIVE: 'Activa',
  EXPIRED: 'Expirada',
  CANCELLED: 'Cancelada',
  PENDING: 'Pendiente',
};

const STATUS_COLORS: Record<Subscription['status'], string> = {
  ACTIVE: 'text-emerald-400',
  EXPIRED: 'text-red-400',
  CANCELLED: 'text-muted-foreground',
  PENDING: 'text-amber-400',
};

// ─────────────────────────────────────────────────────────────────────────────
// Skeletons
// ─────────────────────────────────────────────────────────────────────────────

function PlanCardSkeleton() {
  return (
    <Card>
      <CardHeader className="pb-3 pt-5 px-5">
        <Skeleton className="h-4 w-32" />
      </CardHeader>
      <CardContent className="px-5 pb-5 space-y-3">
        <Skeleton className="h-7 w-24" />
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-2/3" />
        <Skeleton className="h-9 w-full" />
      </CardContent>
    </Card>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Active subscription card
// ─────────────────────────────────────────────────────────────────────────────

function ActiveSubscriptionCard({
  subscription,
  academyId,
}: {
  subscription: Subscription;
  academyId: number;
}) {
  const queryClient = useQueryClient();
  const [confirmCancel, setConfirmCancel] = useState(false);

  const cancelMutation = useMutation({
    mutationFn: async () => {
      await apiClient.post(
        ENDPOINTS.MEMBERSHIP.SUBSCRIPTION_CANCEL(subscription.id),
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['membership', 'subscriptions', academyId],
      });
      setConfirmCancel(false);
    },
  });

  const leaveMutation = useMutation({
    mutationFn: async () => {
      await apiClient.post(ENDPOINTS.MEMBERSHIP.LEAVE(academyId));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['membership', 'subscriptions', academyId],
      });
    },
  });

  const plan = subscription.plan;
  const isActive = subscription.status === 'ACTIVE';

  return (
    <Card className="border-blue-500/20 bg-blue-500/[0.03]">
      <CardHeader className="pb-2 pt-5 px-5">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-semibold text-foreground flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-emerald-400" />
            Suscripción actual
          </CardTitle>
          <span
            className={`text-xs font-medium ${STATUS_COLORS[subscription.status]}`}
          >
            {STATUS_LABELS[subscription.status]}
          </span>
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-3 px-5 pb-5">
        <div>
          <p className="font-semibold text-foreground">{plan.name}</p>
          <p className="text-sm text-muted-foreground">
            {parseFloat(plan.price).toLocaleString('es-ES', {
              style: 'currency',
              currency: 'EUR',
            })}{' '}
            / {PERIOD_LABELS[plan.billing_period]}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
          <div>
            <span className="text-foreground font-medium">Inicio: </span>
            {new Date(subscription.start_date).toLocaleDateString('es-ES')}
          </div>
          <div>
            <span className="text-foreground font-medium">Vence: </span>
            {new Date(subscription.end_date).toLocaleDateString('es-ES')}
          </div>
        </div>

        {isActive && (
          <div className="space-y-2 pt-1">
            {cancelMutation.isError && (
              <p className="text-xs text-red-400">
                No se pudo cancelar. Inténtalo de nuevo.
              </p>
            )}
            {leaveMutation.isError && (
              <p className="text-xs text-red-400">
                No se pudo procesar la baja. Inténtalo de nuevo.
              </p>
            )}

            {confirmCancel ? (
              <div className="space-y-2">
                <p className="text-xs text-muted-foreground">
                  ¿Seguro que quieres cancelar tu suscripción?
                </p>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => cancelMutation.mutate()}
                    disabled={cancelMutation.isPending}
                  >
                    {cancelMutation.isPending ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      'Confirmar cancelación'
                    )}
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setConfirmCancel(false)}
                  >
                    Cancelar
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex gap-2 flex-wrap">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setConfirmCancel(true)}
                >
                  Cancelar suscripción
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-red-400 hover:text-red-300 hover:bg-red-500/[0.07]"
                  onClick={() => leaveMutation.mutate()}
                  disabled={leaveMutation.isPending}
                >
                  {leaveMutation.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      <LogOut className="h-4 w-4" />
                      Darse de baja
                    </>
                  )}
                </Button>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Plan card with enroll button
// ─────────────────────────────────────────────────────────────────────────────

function PlanCard({
  plan,
  hasActiveSubscription,
}: {
  plan: MembershipPlan;
  hasActiveSubscription: boolean;
}) {
  const academyId = useAcademyId();
  const queryClient = useQueryClient();
  const [enrolled, setEnrolled] = useState(false);
  const [enrollError, setEnrollError] = useState<string | null>(null);

  const enrollMutation = useMutation({
    mutationFn: async () => {
      await apiClient.post(ENDPOINTS.MEMBERSHIP.ENROLL, {
        plan_id: plan.id,
        academy: academyId,
      });
    },
    onSuccess: () => {
      setEnrolled(true);
      setEnrollError(null);
      queryClient.invalidateQueries({
        queryKey: ['membership', 'subscriptions', academyId],
      });
    },
    onError: (err: unknown) => {
      if (typeof err === 'object' && err !== null && 'response' in err) {
        const axiosErr = err as { response?: { data?: Record<string, unknown> } };
        const data = axiosErr.response?.data;
        if (data) {
          const first = Object.values(data)[0];
          setEnrollError(Array.isArray(first) ? String(first[0]) : String(first));
          return;
        }
      }
      setEnrollError('No se pudo procesar la inscripción.');
    },
  });

  return (
    <Card className="flex flex-col transition-all duration-200 hover:border-white/[0.1]">
      <CardHeader className="pb-2 pt-5 px-5">
        <CardTitle className="text-sm font-semibold text-foreground">
          {plan.name}
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col flex-1 gap-3 px-5 pb-5">
        <div>
          <span className="text-2xl font-bold tabular-nums text-foreground">
            {parseFloat(plan.price).toLocaleString('es-ES', {
              style: 'currency',
              currency: 'EUR',
            })}
          </span>
          <span className="ml-1 text-xs text-muted-foreground">
            / {PERIOD_LABELS[plan.billing_period]}
          </span>
        </div>

        {plan.description && (
          <p className="text-xs text-muted-foreground leading-relaxed">
            {plan.description}
          </p>
        )}

        {plan.max_classes_per_week != null && (
          <p className="text-xs text-muted-foreground">
            Hasta{' '}
            <span className="font-medium text-foreground">
              {plan.max_classes_per_week} clase
              {plan.max_classes_per_week !== 1 ? 's' : ''}
            </span>{' '}
            por semana
          </p>
        )}

        <div className="mt-auto space-y-2">
          {enrollError && (
            <p className="text-xs text-red-400">{enrollError}</p>
          )}
          {enrolled ? (
            <div className="flex items-center gap-2 text-sm text-emerald-400">
              <CheckCircle className="h-4 w-4" />
              Inscripción completada
            </div>
          ) : (
            <Button
              className="w-full"
              size="sm"
              onClick={() => enrollMutation.mutate()}
              disabled={hasActiveSubscription || enrollMutation.isPending}
            >
              {enrollMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Procesando…
                </>
              ) : hasActiveSubscription ? (
                'Ya tienes una suscripción activa'
              ) : (
                'Inscribirse'
              )}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Page
// ─────────────────────────────────────────────────────────────────────────────

export default function MembershipPage() {
  const academyId = useAcademyId();

  const { data: plansPage, isLoading: loadingPlans, isError } = useQuery<
    PaginatedResponse<MembershipPlan>
  >({
    queryKey: ['membership', 'plans', academyId],
    queryFn: async () => {
      const { data } = await apiClient.get<PaginatedResponse<MembershipPlan>>(
        ENDPOINTS.MEMBERSHIP.PLANS,
        { params: { academy: academyId } },
      );
      return data;
    },
    enabled: !!academyId,
  });

  const { data: subsPage, isLoading: loadingSubs } = useQuery<
    PaginatedResponse<Subscription>
  >({
    queryKey: ['membership', 'subscriptions', academyId],
    queryFn: async () => {
      const { data } = await apiClient.get<PaginatedResponse<Subscription>>(
        ENDPOINTS.MEMBERSHIP.SUBSCRIPTIONS,
        { params: { academy: academyId } },
      );
      return data;
    },
    enabled: !!academyId,
  });

  const plans = plansPage?.results ?? [];
  const subscriptions = subsPage?.results ?? [];
  const activeSubscription = subscriptions.find((s) => s.status === 'ACTIVE');
  const hasActiveSubscription = !!activeSubscription;

  const isLoading = loadingPlans || loadingSubs;

  const subtitle = loadingPlans
    ? '…'
    : isError
      ? 'No se pudo cargar los planes'
      : `${plans.length} plan${plans.length !== 1 ? 'es' : ''} disponible${plans.length !== 1 ? 's' : ''}`;

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader eyebrow="Academia" title="Membresías" subtitle={subtitle} />

      {/* Active subscription */}
      {loadingSubs ? (
        <Skeleton className="h-36 w-full rounded-xl" />
      ) : activeSubscription && academyId ? (
        <ActiveSubscriptionCard
          subscription={activeSubscription}
          academyId={academyId}
        />
      ) : null}

      {/* Plans */}
      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <PlanCardSkeleton key={i} />
          ))}
        </div>
      ) : plans.length === 0 ? (
        <EmptyState
          icon={CreditCard}
          title="Sin planes"
          description="No hay planes de membresía configurados en esta academia."
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {plans.map((plan) => (
            <PlanCard
              key={plan.id}
              plan={plan}
              hasActiveSubscription={hasActiveSubscription}
            />
          ))}
        </div>
      )}
    </div>
  );
}
