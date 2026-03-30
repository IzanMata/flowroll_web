'use client';

import { useQuery } from '@tanstack/react-query';
import { Swords } from 'lucide-react';
import { useAcademyId } from '@/hooks/useAcademy';
import apiClient from '@/lib/api/client';
import { ENDPOINTS } from '@/lib/api/endpoints';
import type { Match, MatchStatus, PaginatedResponse } from '@/types/api';
import { BeltBadge } from '@/components/shared/BeltBadge';
import { EmptyState } from '@/components/shared/EmptyState';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

const STATUS_CONFIG: Record<MatchStatus, { label: string; className: string }> = {
  PENDING: {
    label: 'Pendiente',
    className: 'border-white/10 text-muted-foreground',
  },
  IN_PROGRESS: {
    label: 'En curso',
    className: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400',
  },
  FINISHED: {
    label: 'Finalizado',
    className: 'border-white/10 text-muted-foreground/60',
  },
};

function MatchRowSkeleton() {
  return (
    <div className="flex items-center gap-4 rounded-xl border border-white/[0.06] bg-card px-4 py-3.5">
      <div className="flex-1 space-y-2">
        <div className="flex items-center gap-2">
          <Skeleton className="h-3.5 w-32" />
          <Skeleton className="h-3 w-2" />
          <Skeleton className="h-3.5 w-32" />
        </div>
        <Skeleton className="h-3 w-24" />
      </div>
      <Skeleton className="h-5 w-20 rounded" />
    </div>
  );
}

function athleteName(m: Match, side: 'a' | 'b') {
  const profile = side === 'a' ? m.athlete_a : m.athlete_b;
  const { first_name, last_name, username } = profile.user;
  return [first_name, last_name].filter(Boolean).join(' ') || username;
}

export default function MatchesPage() {
  const academyId = useAcademyId();

  const { data: page, isLoading } = useQuery<PaginatedResponse<Match>>({
    queryKey: ['matches', 'list', academyId],
    queryFn: async () => {
      const { data } = await apiClient.get<PaginatedResponse<Match>>(
        ENDPOINTS.MATCHES.LIST,
        {
          params: {
            academy: academyId,
            ordering: '-created_at',
            page_size: 100,
          },
        },
      );
      return data;
    },
    enabled: !!academyId,
  });

  const matches = page?.results ?? [];

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          Academia
        </p>
        <h2 className="mt-1 text-2xl font-semibold tracking-tight text-foreground">
          Combates
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          {isLoading
            ? '…'
            : `${page?.count ?? 0} combate${page?.count !== 1 ? 's' : ''} registrados`}
        </p>
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <MatchRowSkeleton key={i} />
          ))}
        </div>
      ) : matches.length === 0 ? (
        <EmptyState
          icon={Swords}
          title="Sin combates"
          description="No hay combates registrados en esta academia."
        />
      ) : (
        <div className="space-y-2">
          {matches.map((match) => {
            const statusCfg = STATUS_CONFIG[match.status];
            const aWon = match.winner === 'A';
            const bWon = match.winner === 'B';
            return (
              <div
                key={match.id}
                className="flex items-center gap-4 rounded-xl border border-white/[0.06] bg-card px-4 py-3.5 transition-all duration-200 hover:border-white/[0.1] hover:bg-white/[0.03]"
              >
                <div className="min-w-0 flex-1 space-y-1">
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
                    <div className="flex items-center gap-1.5">
                      <span
                        className={cn(
                          'text-sm font-medium',
                          aWon ? 'text-emerald-400' : 'text-foreground',
                        )}
                      >
                        {athleteName(match, 'a')}
                      </span>
                      <BeltBadge color={match.athlete_a.belt.color} size="sm" />
                    </div>
                    <span className="text-xs text-muted-foreground/40">vs</span>
                    <div className="flex items-center gap-1.5">
                      <span
                        className={cn(
                          'text-sm font-medium',
                          bWon ? 'text-emerald-400' : 'text-foreground',
                        )}
                      >
                        {athleteName(match, 'b')}
                      </span>
                      <BeltBadge color={match.athlete_b.belt.color} size="sm" />
                    </div>
                  </div>
                  {match.status === 'FINISHED' && (
                    <p className="font-mono text-xs text-muted-foreground">
                      {match.score_a.points}–{match.score_b.points}
                      {match.score_a.advantages > 0 || match.score_b.advantages > 0
                        ? ` (${match.score_a.advantages}v${match.score_b.advantages})`
                        : ''}
                    </p>
                  )}
                </div>

                <span
                  className={cn(
                    'shrink-0 inline-flex items-center rounded px-1.5 py-0.5 text-[11px] font-medium border',
                    statusCfg.className,
                  )}
                >
                  {statusCfg.label}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
