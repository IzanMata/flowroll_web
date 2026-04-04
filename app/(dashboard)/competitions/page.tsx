'use client';

import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  ChevronDown,
  ChevronRight,
  Loader2,
  Plus,
  Trophy,
  Users,
} from 'lucide-react';
import { useAcademyId } from '@/hooks/useAcademy';
import apiClient from '@/lib/api/client';
import { ENDPOINTS } from '@/lib/api/endpoints';
import { getFullName } from '@/lib/utils/user';
import type {
  AthleteProfile,
  PaginatedResponse,
  RegisterParticipantRequest,
  Tournament,
  TournamentDivision,
  TournamentDivisionRequest,
  TournamentMatch,
  TournamentParticipant,
  TournamentRequest,
  TournamentStatus,
} from '@/types/api';
import { BeltBadge } from '@/components/shared/BeltBadge';
import { EmptyState } from '@/components/shared/EmptyState';
import { PageHeader } from '@/components/shared/PageHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

// ─────────────────────────────────────────────────────────────────────────────
// Status config
// ─────────────────────────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<TournamentStatus, { label: string; className: string }> = {
  DRAFT: { label: 'Borrador', className: 'border-white/10 text-muted-foreground' },
  OPEN: { label: 'Inscripción abierta', className: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400' },
  IN_PROGRESS: { label: 'En curso', className: 'border-blue-500/30 bg-blue-500/10 text-blue-400' },
  COMPLETED: { label: 'Completado', className: 'border-white/10 text-muted-foreground/60' },
  CANCELLED: { label: 'Cancelado', className: 'border-red-500/20 text-red-400/60' },
};

const FORMAT_LABELS: Record<string, string> = {
  SINGLE_ELIMINATION: 'Eliminación simple',
  DOUBLE_ELIMINATION: 'Eliminación doble',
  ROUND_ROBIN: 'Todos contra todos',
};

// ─────────────────────────────────────────────────────────────────────────────
// Skeletons
// ─────────────────────────────────────────────────────────────────────────────

function TournamentCardSkeleton() {
  return (
    <div className="rounded-xl border border-white/[0.06] bg-card px-4 py-4 space-y-3">
      <div className="flex items-start justify-between">
        <div className="space-y-1.5">
          <Skeleton className="h-4 w-48" />
          <Skeleton className="h-3 w-32" />
        </div>
        <Skeleton className="h-5 w-24 rounded" />
      </div>
      <Skeleton className="h-3 w-40" />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Create tournament form
// ─────────────────────────────────────────────────────────────────────────────

function CreateTournamentForm({
  academyId,
  onClose,
}: {
  academyId: number;
  onClose: () => void;
}) {
  const queryClient = useQueryClient();
  const [form, setForm] = useState<TournamentRequest>({
    name: '',
    date: '',
    format: 'SINGLE_ELIMINATION',
  });
  const [error, setError] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: async () => {
      await apiClient.post(ENDPOINTS.COMPETITIONS.TOURNAMENTS, form, {
        params: { academy: academyId },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['competitions', 'tournaments', academyId] });
      onClose();
    },
    onError: () => setError('No se pudo crear el torneo.'),
  });

  return (
    <div className="rounded-xl border border-blue-500/20 bg-blue-500/[0.04] px-4 py-4 space-y-3">
      <p className="text-sm font-medium text-foreground">Nuevo torneo</p>

      <div className="grid gap-2 sm:grid-cols-2">
        <Input
          placeholder="Nombre del torneo"
          value={form.name}
          onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
        />
        <Input
          type="date"
          value={form.date}
          onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
        />
        <Input
          placeholder="Lugar (opcional)"
          value={form.location ?? ''}
          onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))}
        />
        <select
          className="h-9 rounded-md border border-input bg-transparent px-3 text-sm text-foreground"
          value={form.format}
          onChange={(e) =>
            setForm((f) => ({ ...f, format: e.target.value as TournamentRequest['format'] }))
          }
        >
          {Object.entries(FORMAT_LABELS).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </div>

      {error && <p className="text-xs text-red-400">{error}</p>}

      <div className="flex gap-2">
        <Button
          size="sm"
          onClick={() => mutation.mutate()}
          disabled={mutation.isPending || !form.name || !form.date}
        >
          {mutation.isPending ? (
            <><Loader2 className="h-4 w-4 animate-spin" />Creando…</>
          ) : (
            <><Plus className="h-4 w-4" />Crear torneo</>
          )}
        </Button>
        <Button size="sm" variant="ghost" onClick={onClose}>
          Cancelar
        </Button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Register participant form
// ─────────────────────────────────────────────────────────────────────────────

function RegisterParticipantForm({
  tournament,
  academyId,
  divisions,
  onClose,
}: {
  tournament: Tournament;
  academyId: number;
  divisions: TournamentDivision[];
  onClose: () => void;
}) {
  const queryClient = useQueryClient();
  const [athleteId, setAthleteId] = useState('');
  const [divisionId, setDivisionId] = useState('');
  const [error, setError] = useState<string | null>(null);

  const { data: athletesPage } = useQuery<PaginatedResponse<AthleteProfile>>({
    queryKey: ['athletes', 'list', academyId],
    queryFn: async () => {
      const { data } = await apiClient.get(ENDPOINTS.ATHLETES.LIST, {
        params: { academy: academyId, page_size: 200 },
      });
      return data;
    },
    enabled: !!academyId,
  });
  const athletes = athletesPage?.results ?? [];

  const mutation = useMutation({
    mutationFn: async () => {
      const payload: RegisterParticipantRequest = { athlete_id: Number(athleteId) };
      if (divisionId) payload.division_id = Number(divisionId);
      await apiClient.post(
        ENDPOINTS.COMPETITIONS.TOURNAMENT_REGISTER(tournament.id),
        payload,
        { params: { academy: academyId } },
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['competitions', 'participants', tournament.id],
      });
      onClose();
    },
    onError: () => setError('No se pudo registrar al atleta.'),
  });

  return (
    <div className="space-y-2 border-t border-white/[0.05] px-4 pb-4 pt-3">
      <p className="text-xs font-medium text-muted-foreground">Registrar participante</p>
      <div className="flex flex-wrap gap-2">
        <select
          className="h-9 rounded-md border border-input bg-transparent px-3 text-sm text-foreground min-w-[180px]"
          value={athleteId}
          onChange={(e) => setAthleteId(e.target.value)}
        >
          <option value="">Seleccionar atleta…</option>
          {athletes.map((a) => (
            <option key={a.id} value={a.id}>
              {getFullName(a.user)}
            </option>
          ))}
        </select>
        {divisions.length > 0 && (
          <select
            className="h-9 rounded-md border border-input bg-transparent px-3 text-sm text-foreground min-w-[160px]"
            value={divisionId}
            onChange={(e) => setDivisionId(e.target.value)}
          >
            <option value="">Sin división</option>
            {divisions.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            ))}
          </select>
        )}
        <Button
          size="sm"
          onClick={() => mutation.mutate()}
          disabled={mutation.isPending || !athleteId}
        >
          {mutation.isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            'Registrar'
          )}
        </Button>
        <Button size="sm" variant="ghost" onClick={onClose}>
          Cancelar
        </Button>
      </div>
      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Bracket view
// ─────────────────────────────────────────────────────────────────────────────

function BracketView({ tournamentId, academyId }: { tournamentId: number; academyId: number }) {
  const { data: matches, isLoading } = useQuery<TournamentMatch[]>({
    queryKey: ['competitions', 'bracket', tournamentId],
    queryFn: async () => {
      const { data } = await apiClient.get(
        ENDPOINTS.COMPETITIONS.TOURNAMENT_BRACKET(tournamentId),
        { params: { academy: academyId } },
      );
      return data;
    },
  });

  if (isLoading) {
    return (
      <div className="space-y-1.5 px-4 pb-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-10 w-full rounded-lg" />
        ))}
      </div>
    );
  }

  if (!matches || matches.length === 0) {
    return (
      <p className="px-4 pb-4 text-xs text-muted-foreground">
        El cuadro aún no se ha generado.
      </p>
    );
  }

  const byRound = matches.reduce<Record<number, TournamentMatch[]>>((acc, m) => {
    if (!acc[m.round_number]) acc[m.round_number] = [];
    acc[m.round_number].push(m);
    return acc;
  }, {});

  return (
    <div className="space-y-4 px-4 pb-4">
      {Object.entries(byRound).map(([round, roundMatches]) => (
        <div key={round}>
          <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground/60">
            Ronda {round}
          </p>
          <div className="space-y-1.5">
            {roundMatches.map((m) => {
              const nameA = m.participant_a
                ? getFullName(m.participant_a.athlete.user)
                : 'BYE';
              const nameB = m.participant_b
                ? getFullName(m.participant_b.athlete.user)
                : 'BYE';
              const winnerId = m.winner?.id;
              return (
                <div
                  key={m.id}
                  className="flex items-center gap-2 rounded-lg border border-white/[0.06] bg-white/[0.02] px-3 py-2 text-xs"
                >
                  <span
                    className={cn(
                      'flex-1 truncate',
                      winnerId === m.participant_a?.id
                        ? 'font-semibold text-emerald-400'
                        : 'text-foreground',
                    )}
                  >
                    {nameA}
                  </span>
                  <span className="text-muted-foreground/40 font-mono">
                    {m.is_finished ? `${m.score_a ?? 0}–${m.score_b ?? 0}` : 'vs'}
                  </span>
                  <span
                    className={cn(
                      'flex-1 truncate text-right',
                      winnerId === m.participant_b?.id
                        ? 'font-semibold text-emerald-400'
                        : 'text-foreground',
                    )}
                  >
                    {nameB}
                  </span>
                  {m.is_finished && (
                    <span className="ml-1 shrink-0 rounded bg-white/[0.04] px-1 py-0.5 text-[10px] text-muted-foreground">
                      Fin.
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Tournament card
// ─────────────────────────────────────────────────────────────────────────────

function TournamentCard({
  tournament,
  academyId,
}: {
  tournament: Tournament;
  academyId: number;
}) {
  const queryClient = useQueryClient();
  const [expanded, setExpanded] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const statusCfg = STATUS_CONFIG[tournament.status];

  const { data: divisions = [] } = useQuery<TournamentDivision[]>({
    queryKey: ['competitions', 'divisions', tournament.id],
    queryFn: async () => {
      const { data } = await apiClient.get(ENDPOINTS.COMPETITIONS.DIVISIONS, {
        params: { tournament: tournament.id },
      });
      return Array.isArray(data) ? data : data.results ?? [];
    },
    enabled: expanded,
  });

  const { data: participants = [] } = useQuery<TournamentParticipant[]>({
    queryKey: ['competitions', 'participants', tournament.id],
    queryFn: async () => {
      const { data } = await apiClient.get(
        ENDPOINTS.COMPETITIONS.TOURNAMENT_PARTICIPANTS(tournament.id),
        { params: { academy: academyId } },
      );
      return Array.isArray(data) ? data : data.results ?? [];
    },
    enabled: expanded,
  });

  const openMutation = useMutation({
    mutationFn: async () => {
      await apiClient.post(
        ENDPOINTS.COMPETITIONS.TOURNAMENT_OPEN(tournament.id),
        {},
        { params: { academy: academyId } },
      );
    },
    onSuccess: () => {
      setError(null);
      queryClient.invalidateQueries({ queryKey: ['competitions', 'tournaments', academyId] });
    },
    onError: () => setError('No se pudo abrir la inscripción.'),
  });

  const bracketMutation = useMutation({
    mutationFn: async () => {
      await apiClient.post(
        ENDPOINTS.COMPETITIONS.TOURNAMENT_GENERATE_BRACKET(tournament.id),
        {},
        { params: { academy: academyId } },
      );
    },
    onSuccess: () => {
      setError(null);
      queryClient.invalidateQueries({ queryKey: ['competitions', 'tournaments', academyId] });
      queryClient.invalidateQueries({ queryKey: ['competitions', 'bracket', tournament.id] });
    },
    onError: () => setError('No se pudo generar el cuadro.'),
  });

  const completeMutation = useMutation({
    mutationFn: async () => {
      await apiClient.post(
        ENDPOINTS.COMPETITIONS.TOURNAMENT_COMPLETE(tournament.id),
        {},
        { params: { academy: academyId } },
      );
    },
    onSuccess: () => {
      setError(null);
      queryClient.invalidateQueries({ queryKey: ['competitions', 'tournaments', academyId] });
    },
    onError: () => setError('No se pudo completar el torneo.'),
  });

  const isPending =
    openMutation.isPending || bracketMutation.isPending || completeMutation.isPending;

  return (
    <div
      className={cn(
        'rounded-xl border bg-card transition-all duration-200',
        expanded ? 'border-white/[0.1]' : 'border-white/[0.06] hover:border-white/[0.1]',
      )}
    >
      {/* Header row */}
      <div
        className="flex cursor-pointer items-start gap-3 px-4 py-4"
        onClick={() => setExpanded((e) => !e)}
      >
        <div className="mt-0.5 shrink-0 text-muted-foreground/40">
          {expanded ? (
            <ChevronDown className="h-4 w-4" />
          ) : (
            <ChevronRight className="h-4 w-4" />
          )}
        </div>

        <div className="min-w-0 flex-1 space-y-1">
          <p className="truncate text-sm font-medium text-foreground">{tournament.name}</p>
          <p className="text-xs text-muted-foreground">
            {FORMAT_LABELS[tournament.format]} ·{' '}
            {new Date(tournament.date).toLocaleDateString('es-ES', {
              day: 'numeric',
              month: 'short',
              year: 'numeric',
            })}
            {tournament.location && ` · ${tournament.location}`}
          </p>
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

      {/* Expanded section */}
      {expanded && (
        <div className="border-t border-white/[0.05]">
          {/* Action buttons */}
          <div className="flex flex-wrap gap-2 px-4 py-3">
            {tournament.status === 'DRAFT' && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => openMutation.mutate()}
                disabled={isPending}
                className="border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10"
              >
                {openMutation.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  'Abrir inscripción'
                )}
              </Button>
            )}
            {tournament.status === 'OPEN' && (
              <>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setShowRegister((v) => !v)}
                  className="border-blue-500/30 text-blue-400 hover:bg-blue-500/10"
                >
                  <Users className="h-3.5 w-3.5" />
                  Registrar atleta
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => bracketMutation.mutate()}
                  disabled={isPending}
                  className="border-amber-500/30 text-amber-400 hover:bg-amber-500/10"
                >
                  {bracketMutation.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    'Generar cuadro'
                  )}
                </Button>
              </>
            )}
            {tournament.status === 'IN_PROGRESS' && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => completeMutation.mutate()}
                disabled={isPending}
                className="border-white/20 text-muted-foreground hover:bg-white/[0.04]"
              >
                {completeMutation.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  'Completar torneo'
                )}
              </Button>
            )}
          </div>

          {error && <p className="px-4 pb-2 text-xs text-red-400">{error}</p>}

          {/* Register form */}
          {showRegister && (
            <RegisterParticipantForm
              tournament={tournament}
              academyId={academyId}
              divisions={divisions}
              onClose={() => setShowRegister(false)}
            />
          )}

          {/* Participants list */}
          {participants.length > 0 && (
            <div className="border-t border-white/[0.05] px-4 py-3">
              <p className="mb-2 text-xs font-medium text-muted-foreground">
                Participantes ({participants.length})
              </p>
              <div className="space-y-1">
                {participants
                  .filter((p) => p.status === 'REGISTERED')
                  .map((p) => (
                    <div key={p.id} className="flex items-center gap-2 text-xs">
                      <BeltBadge color={p.athlete.belt.color} size="sm" />
                      <span className="text-foreground">
                        {getFullName(p.athlete.user)}
                      </span>
                      {p.division && (
                        <span className="text-muted-foreground/60">— {p.division.name}</span>
                      )}
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* Bracket */}
          {(tournament.status === 'IN_PROGRESS' || tournament.status === 'COMPLETED') && (
            <div className="border-t border-white/[0.05] pt-3">
              <p className="mb-2 px-4 text-xs font-medium text-muted-foreground">Cuadro</p>
              <BracketView tournamentId={tournament.id} academyId={academyId} />
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Page
// ─────────────────────────────────────────────────────────────────────────────

export default function CompetitionsPage() {
  const academyId = useAcademyId();
  const [showCreate, setShowCreate] = useState(false);

  const { data, isLoading, isError } = useQuery<PaginatedResponse<Tournament>>({
    queryKey: ['competitions', 'tournaments', academyId],
    queryFn: async () => {
      const { data } = await apiClient.get<PaginatedResponse<Tournament>>(
        ENDPOINTS.COMPETITIONS.TOURNAMENTS,
        { params: { academy: academyId, ordering: '-date', page_size: 50 } },
      );
      return data;
    },
    enabled: !!academyId,
  });

  const tournaments = data?.results ?? [];

  const subtitle = isLoading
    ? '…'
    : isError
      ? 'No se pudo cargar la lista'
      : `${data?.count ?? 0} torneo${data?.count !== 1 ? 's' : ''} registrados`;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-start justify-between">
        <PageHeader eyebrow="Academia" title="Competiciones" subtitle={subtitle} />
        {academyId && (
          <Button
            size="sm"
            onClick={() => setShowCreate((v) => !v)}
            className="mt-1 shrink-0"
          >
            <Plus className="h-4 w-4" />
            Nuevo torneo
          </Button>
        )}
      </div>

      {showCreate && academyId && (
        <CreateTournamentForm academyId={academyId} onClose={() => setShowCreate(false)} />
      )}

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <TournamentCardSkeleton key={i} />
          ))}
        </div>
      ) : tournaments.length === 0 ? (
        <EmptyState
          icon={Trophy}
          title="Sin torneos"
          description="No hay torneos registrados en esta academia."
        />
      ) : (
        <div className="space-y-3">
          {tournaments.map((t) => (
            <TournamentCard key={t.id} tournament={t} academyId={academyId!} />
          ))}
        </div>
      )}
    </div>
  );
}
