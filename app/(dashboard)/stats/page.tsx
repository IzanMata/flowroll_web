'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { BarChart2, Loader2, RefreshCw, Trophy } from 'lucide-react';
import { useAcademyId } from '@/hooks/useAcademy';
import apiClient from '@/lib/api/client';
import { ENDPOINTS } from '@/lib/api/endpoints';
import { getFullName } from '@/lib/utils/user';
import type { AthleteMatchStats, PaginatedResponse } from '@/types/api';
import { BeltBadge } from '@/components/shared/BeltBadge';
import { EmptyState } from '@/components/shared/EmptyState';
import { PageHeader } from '@/components/shared/PageHeader';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

// ─────────────────────────────────────────────────────────────────────────────
// Stat pill
// ─────────────────────────────────────────────────────────────────────────────

function StatPill({ label, value, accent }: { label: string; value: string | number; accent?: string }) {
  return (
    <div className="flex flex-col items-center rounded-lg border border-white/[0.06] bg-white/[0.02] px-3 py-2 text-center min-w-[60px]">
      <span className={cn('text-base font-bold font-mono', accent ?? 'text-foreground')}>
        {value}
      </span>
      <span className="text-[10px] text-muted-foreground">{label}</span>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Recompute button
// ─────────────────────────────────────────────────────────────────────────────

function RecomputeButton({ athleteId, academyId }: { athleteId: number; academyId: number }) {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async () => {
      await apiClient.post(
        ENDPOINTS.STATS.ATHLETE_RECOMPUTE(athleteId),
        {},
        { params: { academy: academyId } },
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stats', 'list', academyId] });
      queryClient.invalidateQueries({ queryKey: ['stats', 'leaderboard', academyId] });
    },
  });

  return (
    <button
      onClick={() => mutation.mutate()}
      disabled={mutation.isPending}
      title="Recomputar estadísticas"
      className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:text-foreground disabled:opacity-40"
    >
      {mutation.isPending ? (
        <Loader2 className="h-3.5 w-3.5 animate-spin" />
      ) : (
        <RefreshCw className="h-3.5 w-3.5" />
      )}
    </button>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Stats row
// ─────────────────────────────────────────────────────────────────────────────

function StatsRow({
  stats,
  rank,
  academyId,
}: {
  stats: AthleteMatchStats;
  rank?: number;
  academyId: number;
}) {
  const winRatePct = Math.round(stats.win_rate * 100);
  const fullName = getFullName(stats.athlete.user);

  return (
    <div className="rounded-xl border border-white/[0.06] bg-card px-4 py-3.5 transition-colors hover:border-white/[0.1]">
      <div className="flex flex-wrap items-center gap-3">
        {/* Rank */}
        {rank !== undefined && (
          <span
            className={cn(
              'shrink-0 w-6 text-center text-xs font-bold font-mono',
              rank === 1
                ? 'text-amber-400'
                : rank === 2
                  ? 'text-slate-300'
                  : rank === 3
                    ? 'text-amber-700'
                    : 'text-muted-foreground/40',
            )}
          >
            {rank}
          </span>
        )}

        {/* Athlete info */}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <p className="truncate text-sm font-medium text-foreground">{fullName}</p>
            <BeltBadge color={stats.athlete.belt.color} size="sm" />
          </div>
          <p className="text-xs text-muted-foreground">@{stats.athlete.user.username}</p>
        </div>

        {/* Stats pills */}
        <div className="flex shrink-0 flex-wrap gap-1.5">
          <StatPill label="PJ" value={stats.total_matches} />
          <StatPill label="G" value={stats.wins} accent="text-emerald-400" />
          <StatPill label="P" value={stats.losses} accent="text-red-400" />
          <StatPill label="E" value={stats.draws} />
          <StatPill
            label="Win%"
            value={`${winRatePct}%`}
            accent={winRatePct >= 50 ? 'text-emerald-400' : 'text-muted-foreground'}
          />
          <StatPill label="Sub" value={stats.submissions_won} accent="text-blue-400" />
        </div>

        <RecomputeButton athleteId={stats.athlete.id} academyId={academyId} />
      </div>
    </div>
  );
}

function StatsRowSkeleton() {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-white/[0.06] bg-card px-4 py-3.5">
      <div className="flex-1 space-y-1.5">
        <Skeleton className="h-3.5 w-36" />
        <Skeleton className="h-3 w-24" />
      </div>
      <div className="flex gap-1.5">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-10 w-14 rounded-lg" />
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Leaderboard section
// ─────────────────────────────────────────────────────────────────────────────

function Leaderboard({ academyId }: { academyId: number }) {
  const { data: leaders, isLoading } = useQuery<AthleteMatchStats[]>({
    queryKey: ['stats', 'leaderboard', academyId],
    queryFn: async () => {
      const { data } = await apiClient.get(ENDPOINTS.STATS.LEADERBOARD, {
        params: { academy: academyId, limit: 10 },
      });
      return Array.isArray(data) ? data : data.results ?? [];
    },
    enabled: !!academyId,
  });

  if (isLoading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <StatsRowSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (!leaders || leaders.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        Aún no hay datos en el ranking.
      </p>
    );
  }

  return (
    <div className="space-y-2">
      {leaders.map((s, i) => (
        <StatsRow key={s.id} stats={s} rank={i + 1} academyId={academyId} />
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Full stats list
// ─────────────────────────────────────────────────────────────────────────────

function AllStats({ academyId }: { academyId: number }) {
  const { data, isLoading, isError } = useQuery<PaginatedResponse<AthleteMatchStats> | AthleteMatchStats[]>({
    queryKey: ['stats', 'list', academyId],
    queryFn: async () => {
      const { data } = await apiClient.get(ENDPOINTS.STATS.LIST, {
        params: { academy: academyId, page_size: 100 },
      });
      return data;
    },
    enabled: !!academyId,
  });

  const statsList: AthleteMatchStats[] = Array.isArray(data)
    ? data
    : (data as PaginatedResponse<AthleteMatchStats>)?.results ?? [];

  if (isLoading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <StatsRowSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (isError || statsList.length === 0) {
    return (
      <EmptyState
        icon={BarChart2}
        title="Sin estadísticas"
        description="No hay estadísticas de combate registradas en esta academia."
      />
    );
  }

  return (
    <div className="space-y-2">
      {statsList.map((s) => (
        <StatsRow key={s.id} stats={s} academyId={academyId} />
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Page
// ─────────────────────────────────────────────────────────────────────────────

export default function StatsPage() {
  const academyId = useAcademyId();

  return (
    <div className="space-y-8 animate-fade-in">
      <PageHeader
        eyebrow="Academia"
        title="Estadísticas"
        subtitle="Rendimiento de combate por atleta"
      />

      {/* Leaderboard */}
      <section className="space-y-3">
        <div className="flex items-center gap-2">
          <Trophy className="h-4 w-4 text-amber-400" />
          <h2 className="text-sm font-semibold text-foreground">Ranking — Top 10 victorias</h2>
        </div>
        {academyId ? (
          <Leaderboard academyId={academyId} />
        ) : (
          <p className="text-sm text-muted-foreground">Selecciona una academia.</p>
        )}
      </section>

      {/* Divider */}
      <div className="border-t border-white/[0.05]" />

      {/* All athletes */}
      <section className="space-y-3">
        <div className="flex items-center gap-2">
          <BarChart2 className="h-4 w-4 text-blue-400" />
          <h2 className="text-sm font-semibold text-foreground">Todos los atletas</h2>
        </div>
        <p className="text-xs text-muted-foreground">
          PJ = partidos jugados · G = ganados · P = perdidos · E = empates · Sub = sumisiones
        </p>
        {academyId ? (
          <AllStats academyId={academyId} />
        ) : (
          <p className="text-sm text-muted-foreground">Selecciona una academia.</p>
        )}
      </section>
    </div>
  );
}
