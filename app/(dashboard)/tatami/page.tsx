'use client';

import { useEffect, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  ChevronRight,
  Pause,
  Play,
  RotateCcw,
  Square,
  Timer,
  Users,
  Zap,
} from 'lucide-react';
import { useAcademyId } from '@/hooks/useAcademy';
import apiClient from '@/lib/api/client';
import { ENDPOINTS } from '@/lib/api/endpoints';
import type {
  AthleteProfile,
  Matchup,
  PaginatedResponse,
  TimerPreset,
  TimerSession,
  WeightClass,
} from '@/types/api';
import { EmptyState } from '@/components/shared/EmptyState';
import { PageHeader } from '@/components/shared/PageHeader';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

function formatSeconds(s: number): string {
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
}

const STATUS_COLORS: Record<TimerSession['status'], string> = {
  IDLE: 'text-muted-foreground',
  RUNNING: 'text-emerald-400',
  PAUSED: 'text-amber-400',
  FINISHED: 'text-muted-foreground/50',
};

const STATUS_LABELS: Record<TimerSession['status'], string> = {
  IDLE: 'Listo',
  RUNNING: 'En curso',
  PAUSED: 'Pausado',
  FINISHED: 'Finalizado',
};

// ─────────────────────────────────────────────────────────────────────────────
// Active Session Panel
// ─────────────────────────────────────────────────────────────────────────────

function ActiveSessionPanel({ session }: { session: TimerSession }) {
  const queryClient = useQueryClient();
  const [elapsed, setElapsed] = useState(session.elapsed_seconds);

  // Live tick for RUNNING sessions
  useEffect(() => {
    setElapsed(session.elapsed_seconds);
    if (session.status !== 'RUNNING') return;
    const id = setInterval(() => setElapsed((e) => e + 1), 1_000);
    return () => clearInterval(id);
  }, [session.elapsed_seconds, session.status]);

  const pauseMutation = useMutation({
    mutationFn: () => apiClient.post(ENDPOINTS.TATAMI.SESSION_PAUSE(session.id)),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ['tatami', 'sessions'] }),
  });

  const resumeMutation = useMutation({
    mutationFn: () =>
      // Pause endpoint toggles; if paused, posting again resumes (backend handles this)
      apiClient.post(ENDPOINTS.TATAMI.SESSION_PAUSE(session.id)),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ['tatami', 'sessions'] }),
  });

  const finishMutation = useMutation({
    mutationFn: () => apiClient.post(ENDPOINTS.TATAMI.SESSION_FINISH(session.id)),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ['tatami', 'sessions'] }),
  });

  const workSeconds = session.preset.work_seconds;
  const progressPct = Math.min(100, (elapsed % workSeconds) / workSeconds * 100);
  const isRunning = session.status === 'RUNNING';
  const isPaused = session.status === 'PAUSED';
  const isFinished = session.status === 'FINISHED';

  return (
    <Card className="border-blue-500/20 bg-blue-500/[0.03]">
      <CardHeader className="pb-2 pt-5 px-5">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-sm font-semibold">
            <Zap className="h-4 w-4 text-blue-400" />
            Sesión activa — {session.preset.name}
          </CardTitle>
          <span className={cn('text-xs font-medium', STATUS_COLORS[session.status])}>
            {STATUS_LABELS[session.status]}
          </span>
        </div>
      </CardHeader>
      <CardContent className="px-5 pb-5 space-y-4">
        {/* Big timer display */}
        <div className="text-center space-y-1">
          <p className="font-mono text-5xl font-bold tabular-nums text-foreground tracking-tight">
            {formatSeconds(elapsed)}
          </p>
          <p className="text-xs text-muted-foreground">
            Ronda {session.current_round} / {session.preset.rounds}
            {' · '}
            {formatSeconds(session.preset.work_seconds)} trabajo
            {session.preset.rest_seconds > 0 &&
              ` · ${formatSeconds(session.preset.rest_seconds)} descanso`}
          </p>
        </div>

        {/* Progress bar */}
        <div className="h-1.5 w-full rounded-full bg-white/[0.06] overflow-hidden">
          <div
            className="h-full rounded-full bg-blue-500 transition-all duration-1000"
            style={{ width: `${progressPct}%` }}
          />
        </div>

        {/* Controls */}
        {!isFinished && (
          <div className="flex justify-center gap-3">
            {isRunning ? (
              <Button
                variant="outline"
                onClick={() => pauseMutation.mutate()}
                disabled={pauseMutation.isPending}
              >
                <Pause className="h-4 w-4" />
                Pausar
              </Button>
            ) : isPaused ? (
              <Button
                onClick={() => resumeMutation.mutate()}
                disabled={resumeMutation.isPending}
              >
                <Play className="h-4 w-4" />
                Reanudar
              </Button>
            ) : null}
            <Button
              variant="destructive"
              onClick={() => finishMutation.mutate()}
              disabled={finishMutation.isPending}
            >
              <Square className="h-4 w-4" />
              Finalizar
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Preset card
// ─────────────────────────────────────────────────────────────────────────────

function PresetCard({
  preset,
  hasActiveSession,
}: {
  preset: TimerPreset;
  hasActiveSession: boolean;
}) {
  const queryClient = useQueryClient();

  const startMutation = useMutation({
    mutationFn: () =>
      apiClient.post<TimerSession>(ENDPOINTS.TATAMI.PRESET_START(preset.id)),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ['tatami', 'sessions'] }),
  });

  return (
    <Card className="flex flex-col transition-all duration-200 hover:border-white/[0.1]">
      <CardHeader className="pb-2 pt-5 px-5">
        <CardTitle className="flex items-center gap-2 text-sm font-semibold">
          <Timer className="h-4 w-4 text-muted-foreground" />
          {preset.name}
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col flex-1 gap-3 px-5 pb-5">
        <div className="grid grid-cols-3 gap-2 text-xs">
          <div className="rounded-lg border border-white/[0.06] bg-white/[0.02] px-2.5 py-2 text-center">
            <p className="font-mono text-base font-bold text-foreground">
              {preset.rounds}
            </p>
            <p className="text-muted-foreground">rondas</p>
          </div>
          <div className="rounded-lg border border-white/[0.06] bg-white/[0.02] px-2.5 py-2 text-center">
            <p className="font-mono text-base font-bold text-foreground">
              {formatSeconds(preset.work_seconds)}
            </p>
            <p className="text-muted-foreground">trabajo</p>
          </div>
          <div className="rounded-lg border border-white/[0.06] bg-white/[0.02] px-2.5 py-2 text-center">
            <p className="font-mono text-base font-bold text-foreground">
              {formatSeconds(preset.rest_seconds)}
            </p>
            <p className="text-muted-foreground">descanso</p>
          </div>
        </div>

        {startMutation.isError && (
          <p className="text-xs text-red-400">No se pudo iniciar la sesión.</p>
        )}

        <Button
          className="mt-auto w-full"
          size="sm"
          onClick={() => startMutation.mutate()}
          disabled={hasActiveSession || startMutation.isPending}
        >
          {startMutation.isPending ? (
            'Iniciando…'
          ) : hasActiveSession ? (
            'Sesión en curso'
          ) : (
            <>
              <Play className="h-4 w-4" />
              Iniciar sesión
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Matchups section
// ─────────────────────────────────────────────────────────────────────────────

function MatchupsSection({ academyId }: { academyId: number }) {
  const queryClient = useQueryClient();
  const [athleteAId, setAthleteAId] = useState<string>('');
  const [athleteBId, setAthleteBId] = useState<string>('');
  const [pairError, setPairError] = useState<string | null>(null);

  const { data: athletesPage } = useQuery<PaginatedResponse<AthleteProfile>>({
    queryKey: ['athletes', 'list', academyId],
    queryFn: async () => {
      const { data } = await apiClient.get<PaginatedResponse<AthleteProfile>>(
        ENDPOINTS.ATHLETES.LIST,
        { params: { academy: academyId, page_size: 100 } },
      );
      return data;
    },
  });

  const { data: weightClassesPage } = useQuery<PaginatedResponse<WeightClass>>({
    queryKey: ['tatami', 'weight-classes', academyId],
    queryFn: async () => {
      const { data } = await apiClient.get<PaginatedResponse<WeightClass>>(
        ENDPOINTS.TATAMI.WEIGHT_CLASSES,
        { params: { academy: academyId } },
      );
      return data;
    },
  });

  const { data: matchupsPage, isLoading } = useQuery<PaginatedResponse<Matchup>>({
    queryKey: ['tatami', 'matchups', academyId],
    queryFn: async () => {
      const { data } = await apiClient.get<PaginatedResponse<Matchup>>(
        ENDPOINTS.TATAMI.MATCHUPS,
        { params: { academy: academyId } },
      );
      return data;
    },
  });

  const pairMutation = useMutation({
    mutationFn: async () => {
      await apiClient.post(ENDPOINTS.TATAMI.MATCHUP_PAIR, {
        athlete_a_id: Number(athleteAId),
        athlete_b_id: Number(athleteBId),
        academy: academyId,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tatami', 'matchups'] });
      setAthleteAId('');
      setAthleteBId('');
      setPairError(null);
    },
    onError: () => setPairError('No se pudo crear el emparejamiento.'),
  });

  const athletes = athletesPage?.results ?? [];
  const matchups = matchupsPage?.results ?? [];

  const getFullName = (a: AthleteProfile) =>
    [a.user.first_name, a.user.last_name].filter(Boolean).join(' ') ||
    a.user.username;

  const RESULT_LABELS: Record<string, string> = {
    A_WIN: 'Gana A',
    B_WIN: 'Gana B',
    DRAW: 'Empate',
  };

  return (
    <section className="space-y-4">
      <h3 className="text-sm font-medium text-foreground flex items-center gap-2">
        <Users className="h-4 w-4 text-muted-foreground" />
        Emparejamientos
      </h3>

      {/* Pair form */}
      <div className="rounded-xl border border-white/[0.06] bg-card p-4 space-y-3">
        <p className="text-xs font-medium text-muted-foreground">
          Crear emparejamiento
        </p>
        <div className="flex gap-3 flex-wrap">
          <select
            value={athleteAId}
            onChange={(e) => setAthleteAId(e.target.value)}
            className="flex-1 min-w-[140px] h-10 rounded-md border border-input bg-background px-3 text-sm"
          >
            <option value="">Atleta A…</option>
            {athletes.map((a) => (
              <option key={a.id} value={a.id}>
                {getFullName(a)}
              </option>
            ))}
          </select>
          <div className="flex items-center self-center text-xs text-muted-foreground font-medium">
            vs
          </div>
          <select
            value={athleteBId}
            onChange={(e) => setAthleteBId(e.target.value)}
            className="flex-1 min-w-[140px] h-10 rounded-md border border-input bg-background px-3 text-sm"
          >
            <option value="">Atleta B…</option>
            {athletes.map((a) => (
              <option key={a.id} value={a.id}>
                {getFullName(a)}
              </option>
            ))}
          </select>
          <Button
            size="sm"
            onClick={() => pairMutation.mutate()}
            disabled={!athleteAId || !athleteBId || athleteAId === athleteBId || pairMutation.isPending}
          >
            <ChevronRight className="h-4 w-4" />
            Emparejar
          </Button>
        </div>
        {pairError && <p className="text-xs text-red-400">{pairError}</p>}
        {pairMutation.isSuccess && (
          <p className="text-xs text-emerald-400">Emparejamiento creado.</p>
        )}
      </div>

      {/* Matchup list */}
      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-14 w-full rounded-xl" />
          ))}
        </div>
      ) : matchups.length === 0 ? (
        <EmptyState
          icon={Users}
          title="Sin emparejamientos"
          description="Crea un emparejamiento seleccionando dos atletas."
        />
      ) : (
        <div className="space-y-2">
          {matchups.map((m) => (
            <div
              key={m.id}
              className="flex items-center gap-4 rounded-xl border border-white/[0.06] bg-card px-4 py-3.5"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm font-medium text-foreground truncate">
                    {getFullName(m.athlete_a)}
                  </span>
                  <span className="text-xs text-muted-foreground/40">vs</span>
                  <span className="text-sm font-medium text-foreground truncate">
                    {getFullName(m.athlete_b)}
                  </span>
                </div>
                {m.weight_class && (
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {m.weight_class.name}
                  </p>
                )}
              </div>
              {m.result && (
                <span className="shrink-0 text-xs font-medium text-emerald-400">
                  {RESULT_LABELS[m.result] ?? m.result}
                </span>
              )}
            </div>
          ))}
        </div>
      )}

      {(weightClassesPage?.results ?? []).length > 0 && (
        <details className="text-xs text-muted-foreground">
          <summary className="cursor-pointer hover:text-foreground transition-colors">
            Clases de peso disponibles
          </summary>
          <div className="mt-2 flex flex-wrap gap-2">
            {(weightClassesPage?.results ?? []).map((wc) => (
              <span
                key={wc.id}
                className="rounded-md border border-white/[0.07] px-2 py-0.5 text-xs"
              >
                {wc.name}
                {wc.min_kg != null && wc.max_kg != null &&
                  ` (${wc.min_kg}–${wc.max_kg} kg)`}
              </span>
            ))}
          </div>
        </details>
      )}
    </section>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Page
// ─────────────────────────────────────────────────────────────────────────────

export default function TatamiPage() {
  const academyId = useAcademyId();

  const { data: presetsPage, isLoading: loadingPresets } = useQuery<
    PaginatedResponse<TimerPreset>
  >({
    queryKey: ['tatami', 'presets', academyId],
    queryFn: async () => {
      const { data } = await apiClient.get<PaginatedResponse<TimerPreset>>(
        ENDPOINTS.TATAMI.PRESETS,
        { params: { academy: academyId } },
      );
      return data;
    },
    enabled: !!academyId,
  });

  // Poll active sessions every 5 s
  const { data: sessionsPage } = useQuery<PaginatedResponse<TimerSession>>({
    queryKey: ['tatami', 'sessions', academyId],
    queryFn: async () => {
      const { data } = await apiClient.get<PaginatedResponse<TimerSession>>(
        ENDPOINTS.TATAMI.SESSIONS,
        { params: { academy: academyId, ordering: '-started_at', page_size: 1 } },
      );
      return data;
    },
    enabled: !!academyId,
    refetchInterval: 5_000,
  });

  const presets = presetsPage?.results ?? [];
  const latestSession = sessionsPage?.results?.[0] ?? null;
  const hasActiveSession =
    latestSession !== null &&
    (latestSession.status === 'RUNNING' || latestSession.status === 'PAUSED');

  return (
    <div className="space-y-8 animate-fade-in">
      <PageHeader
        eyebrow="Tatami"
        title="Tatami & Temporizador"
        subtitle="Gestiona sesiones de timer y emparejamientos"
      />

      {/* Active session */}
      {latestSession && latestSession.status !== 'FINISHED' && (
        <ActiveSessionPanel session={latestSession} />
      )}

      {/* Timer presets */}
      <section className="space-y-4">
        <h3 className="text-sm font-medium text-foreground flex items-center gap-2">
          <Timer className="h-4 w-4 text-muted-foreground" />
          Presets de temporizador
        </h3>
        {loadingPresets ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-40 rounded-xl" />
            ))}
          </div>
        ) : presets.length === 0 ? (
          <EmptyState
            icon={Timer}
            title="Sin presets"
            description="No hay presets de temporizador configurados."
          />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {presets.map((preset) => (
              <PresetCard
                key={preset.id}
                preset={preset}
                hasActiveSession={hasActiveSession}
              />
            ))}
          </div>
        )}
      </section>

      {/* Matchups */}
      {academyId && <MatchupsSection academyId={academyId} />}
    </div>
  );
}
