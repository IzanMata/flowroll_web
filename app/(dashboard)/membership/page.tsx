'use client';

import { useQuery } from '@tanstack/react-query';
import { CreditCard } from 'lucide-react';
import { useAcademyId } from '@/hooks/useAcademy';
import apiClient from '@/lib/api/client';
import { ENDPOINTS } from '@/lib/api/endpoints';
import type { MembershipPlan, PaginatedResponse } from '@/types/api';
import { EmptyState } from '@/components/shared/EmptyState';
import { PageHeader } from '@/components/shared/PageHeader';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const PERIOD_LABELS: Record<MembershipPlan['billing_period'], string> = {
  MONTHLY: 'mes',
  QUARTERLY: 'trimestre',
  ANNUAL: 'año',
};

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
      </CardContent>
    </Card>
  );
}

function PlanCard({ plan }: { plan: MembershipPlan }) {
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
          <p className="mt-auto text-xs text-muted-foreground">
            Hasta{' '}
            <span className="font-medium text-foreground">
              {plan.max_classes_per_week} clase
              {plan.max_classes_per_week !== 1 ? 's' : ''}
            </span>{' '}
            por semana
          </p>
        )}
      </CardContent>
    </Card>
  );
}

export default function MembershipPage() {
  const academyId = useAcademyId();

  const { data: page, isLoading, isError } = useQuery<PaginatedResponse<MembershipPlan>>({
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

  const plans = page?.results ?? [];

  const subtitle = isLoading
    ? '…'
    : isError
      ? 'No se pudo cargar los planes'
      : `${plans.length} plan${plans.length !== 1 ? 'es' : ''} disponible${plans.length !== 1 ? 's' : ''}`;

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader eyebrow="Academia" title="Membresías" subtitle={subtitle} />

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
            <PlanCard key={plan.id} plan={plan} />
          ))}
        </div>
      )}
    </div>
  );
}
