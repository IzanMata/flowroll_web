'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Users } from 'lucide-react';
import { useAcademyId } from '@/hooks/useAcademy';
import apiClient from '@/lib/api/client';
import { ENDPOINTS } from '@/lib/api/endpoints';
import { getFullName } from '@/lib/utils/user';
import type { AthleteProfile, PaginatedResponse } from '@/types/api';
import { BeltBadge } from '@/components/shared/BeltBadge';
import { EmptyState } from '@/components/shared/EmptyState';
import { PageHeader } from '@/components/shared/PageHeader';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';

function AthleteCardSkeleton() {
  return (
    <div className="flex items-center gap-4 rounded-xl border border-white/[0.06] bg-card px-4 py-3.5">
      <Skeleton className="h-9 w-9 rounded-full shrink-0" />
      <div className="flex-1 space-y-1.5">
        <Skeleton className="h-3.5 w-36" />
        <Skeleton className="h-3 w-24" />
      </div>
      <Skeleton className="h-5 w-14 rounded" />
    </div>
  );
}

function AvatarInitials({ name }: { name: string }) {
  const initials = name
    .split(' ')
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? '')
    .join('');
  return (
    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/[0.06] text-xs font-semibold text-muted-foreground">
      {initials || '?'}
    </div>
  );
}

export default function AthletesPage() {
  const academyId = useAcademyId();
  const [search, setSearch] = useState('');

  const { data: page, isLoading, isError } = useQuery<PaginatedResponse<AthleteProfile>>({
    queryKey: ['athletes', 'list', academyId],
    queryFn: async () => {
      const { data } = await apiClient.get<PaginatedResponse<AthleteProfile>>(
        ENDPOINTS.ATHLETES.LIST,
        { params: { academy: academyId, page_size: 100 } },
      );
      return data;
    },
    enabled: !!academyId,
  });

  const athletes = page?.results ?? [];
  const q = search.trim().toLowerCase();
  const filtered = q
    ? athletes.filter((a) => {
        const full = getFullName(a.user).toLowerCase();
        return full.includes(q) || a.user.username.toLowerCase().includes(q);
      })
    : athletes;

  const subtitle = isLoading
    ? '…'
    : isError
      ? 'No se pudo cargar la lista'
      : `${page?.count ?? 0} atleta${page?.count !== 1 ? 's' : ''} registrados`;

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader eyebrow="Academia" title="Atletas" subtitle={subtitle} />

      <div className="max-w-sm">
        <Input
          placeholder="Buscar atletas…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <AthleteCardSkeleton key={i} />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={Users}
          title={search ? 'Sin resultados' : 'Sin atletas'}
          description={
            search
              ? `No se encontraron atletas para "${search}".`
              : 'No hay atletas registrados en esta academia.'
          }
        />
      ) : (
        <div className="space-y-2">
          {filtered.map((athlete) => (
            <div
              key={athlete.id}
              className="flex items-center gap-4 rounded-xl border border-white/[0.06] bg-card px-4 py-3.5 transition-all duration-200 hover:border-white/[0.1] hover:bg-white/[0.03]"
            >
              <AvatarInitials name={getFullName(athlete.user)} />

              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-foreground">
                  {getFullName(athlete.user)}
                </p>
                <p className="text-xs text-muted-foreground">
                  @{athlete.user.username}
                  {athlete.weight_class && ` · ${athlete.weight_class}`}
                </p>
              </div>

              <BeltBadge
                color={athlete.belt.color}
                stripes={athlete.belt.stripes}
                size="sm"
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
