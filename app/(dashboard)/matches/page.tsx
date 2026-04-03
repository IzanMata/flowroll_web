'use client';

import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { CheckSquare, Loader2, Minus, Plus, Swords } from 'lucide-react';
import { useAcademyId } from '@/hooks/useAcademy';
import apiClient from '@/lib/api/client';
import { ENDPOINTS } from '@/lib/api/endpoints';
import { getFullName } from '@/lib/utils/user';
import type { Match, MatchScoreUpdateRequest, MatchStatus, PaginatedResponse } from '@/types/api';
import { BeltBadge } from '@/components/shared/BeltBadge';
import { EmptyState } from '@/components/shared/EmptyState';
import { PageHeader } from '@/components/shared/PageHeader';
import { Button } from '@/components/ui/button';
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

// ─────────────────────────────────────────────────────────────────────────────
// Score controls for IN_PROGRESS matches
// ─────────────────────────────────────────────────────────────────────────────

type ScoreAction = MatchScoreUpdateRequest['action'];

function ScoreButton({
  label,
  delta,
  onClick,
  disabled,
}: {
  label: string;
  delta: number;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={cn(
        'flex items-center gap-0.5 rounded-md border px-2 py-0.5 text-[11px] font-medium transition-colors disabled:opacity-40',
        delta > 0
          ? 'border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10'
          : 'border-red-500/30 text-red-400 hover:bg-red-500/10',
      )}
    >
      {delta > 0 ? <Plus className="h-3 w-3" /> : <Minus className="h-3 w-3" />}
      {label}
    </button>
  );
}

function LiveScorePanel({ match }: { match: Match }) {
  const queryClient = useQueryClient();
  const [error, setError] = useState<string | null>(null);

  const eventMutation = useMutation({
    mutationFn: async (payload: MatchScoreUpdateRequest) => {
      await apiClient.post(ENDPOINTS.MATCHES.ADD_EVENT(match.id), payload);
    },
    onSuccess: () => {
      setError(null);
      queryClient.invalidateQueries({ queryKey: ['matches', 'list'] });
    },
    onError: () => setError('No se pudo registrar el evento.'),
  });

  const finishMutation = useMutation({
    mutationFn: async () => {
      await apiClient.post(ENDPOINTS.MATCHES.FINISH(match.id));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['matches', 'list'] });
    },
    onError: () => setError('No se pudo finalizar el combate.'),
  });

  function addEvent(side: 'A' | 'B', action: ScoreAction, delta: number) {
    eventMutation.mutate({ side, action, delta });
  }

  const pending = eventMutation.isPending || finishMutation.isPending;

  return (
    <div className="space-y-3 border-t border-white/[0.05] px-4 pb-4 pt-3">
      <div className="grid grid-cols-2 gap-4">
        {/* Side A */}
        <div className="space-y-2">
          <p className="text-xs font-medium text-foreground truncate">
            {getFullName(match.athlete_a.user)}
          </p>
          <div className="flex items-baseline gap-3 font-mono">
            <span className="text-2xl font-bold text-emerald-400">
              {match.score_a.points}
            </span>
            <span className="text-xs text-muted-foreground">
              {match.score_a.advantages}v · {match.score_a.penalties}p
            </span>
          </div>
          <div className="flex flex-wrap gap-1">
            <ScoreButton label="Punto" delta={1} disabled={pending} onClick={() => addEvent('A', 'POINTS', 1)} />
            <ScoreButton label="Punto" delta={-1} disabled={pending} onClick={() => addEvent('A', 'POINTS', -1)} />
            <ScoreButton label="Ventaja" delta={1} disabled={pending} onClick={() => addEvent('A', 'ADVANTAGE', 1)} />
            <ScoreButton label="Penalty" delta={1} disabled={pending} onClick={() => addEvent('A', 'PENALTY', 1)} />
          </div>
        </div>

        {/* Side B */}
        <div className="space-y-2">
          <p className="text-xs font-medium text-foreground truncate">
            {getFullName(match.athlete_b.user)}
          </p>
          <div className="flex items-baseline gap-3 font-mono">
            <span className="text-2xl font-bold text-blue-400">
              {match.score_b.points}
            </span>
            <span className="text-xs text-muted-foreground">
              {match.score_b.advantages}v · {match.score_b.penalties}p
            </span>
          </div>
          <div className="flex flex-wrap gap-1">
            <ScoreButton label="Punto" delta={1} disabled={pending} onClick={() => addEvent('B', 'POINTS', 1)} />
            <ScoreButton label="Punto" delta={-1} disabled={pending} onClick={() => addEvent('B', 'POINTS', -1)} />
            <ScoreButton label="Ventaja" delta={1} disabled={pending} onClick={() => addEvent('B', 'ADVANTAGE', 1)} />
            <ScoreButton label="Penalty" delta={1} disabled={pending} onClick={() => addEvent('B', 'PENALTY', 1)} />
          </div>
        </div>
      </div>

      {error && <p className="text-xs text-red-400">{error}</p>}

      <Button
        size="sm"
        variant="outline"
        onClick={() => finishMutation.mutate()}
        disabled={pending}
        className="border-amber-500/30 text-amber-400 hover:bg-amber-500/10 hover:text-amber-300"
      >
        {finishMutation.isPending ? (
          <><Loader2 className="h-4 w-4 animate-spin" />Finalizando…</>
        ) : (
          <><CheckSquare className="h-4 w-4" />Finalizar combate</>
        )}
      </Button>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Match row
// ─────────────────────────────────────────────────────────────────────────────

function MatchRow({ match }: { match: Match }) {
  const [expanded, setExpanded] = useState(false);
  const statusCfg = STATUS_CONFIG[match.status];
  const aWon = match.winner === 'A';
  const bWon = match.winner === 'B';
  const isInProgress = match.status === 'IN_PROGRESS';

  return (
    <div
      className={cn(
        'rounded-xl border bg-card transition-all duration-200',
        isInProgress
          ? 'border-emerald-500/20 hover:border-emerald-500/30'
          : 'border-white/[0.06] hover:border-white/[0.1]',
      )}
    >
      <div
        className={cn(
          'flex items-center gap-4 px-4 py-3.5',
          isInProgress && 'cursor-pointer hover:bg-white/[0.02]',
        )}
        onClick={() => isInProgress && setExpanded((e) => !e)}
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
                {getFullName(match.athlete_a.user)}
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
                {getFullName(match.athlete_b.user)}
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
          {isInProgress && (
            <p className="font-mono text-xs text-muted-foreground">
              {match.score_a.points} – {match.score_b.points}
              {' · '}
              <span className="text-emerald-400/60">toca para gestionar</span>
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

      {isInProgress && expanded && <LiveScorePanel match={match} />}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Page
// ─────────────────────────────────────────────────────────────────────────────

export default function MatchesPage() {
  const academyId = useAcademyId();

  const { data: page, isLoading, isError } = useQuery<PaginatedResponse<Match>>({
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

  const subtitle = isLoading
    ? '…'
    : isError
      ? 'No se pudo cargar la lista'
      : `${page?.count ?? 0} combate${page?.count !== 1 ? 's' : ''} registrados`;

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader eyebrow="Academia" title="Combates" subtitle={subtitle} />

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
          {matches.map((match) => (
            <MatchRow key={match.id} match={match} />
          ))}
        </div>
      )}
    </div>
  );
}
