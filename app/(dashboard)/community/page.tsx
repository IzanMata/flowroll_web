'use client';

import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Loader2, Star, Trophy, UserPlus, Users } from 'lucide-react';
import { useAcademyId } from '@/hooks/useAcademy';
import apiClient from '@/lib/api/client';
import { ENDPOINTS } from '@/lib/api/endpoints';
import { formatDateTime } from '@/lib/utils/date';
import { getFullName } from '@/lib/utils/user';
import type { Achievement, AthleteAchievement, OpenMatSession, PaginatedResponse } from '@/types/api';
import { EmptyState } from '@/components/shared/EmptyState';
import { PageHeader } from '@/components/shared/PageHeader';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

const CATEGORY_LABELS: Record<Achievement['category'], string> = {
  ATTENDANCE: 'Asistencia',
  COMPETITION: 'Competición',
  PROMOTION: 'Promoción',
  LEARNING: 'Aprendizaje',
  COMMUNITY: 'Comunidad',
};

const CATEGORY_COLORS: Record<Achievement['category'], string> = {
  ATTENDANCE: 'border-blue-500/30 text-blue-400',
  COMPETITION: 'border-amber-500/30 text-amber-400',
  PROMOTION: 'border-purple-500/30 text-purple-400',
  LEARNING: 'border-emerald-500/30 text-emerald-400',
  COMMUNITY: 'border-pink-500/30 text-pink-400',
};

// ─── Open Mat ────────────────────────────────────────────────────────────────

function OpenMatSkeleton() {
  return (
    <div className="flex items-center gap-4 rounded-xl border border-white/[0.06] bg-card px-4 py-3.5">
      <div className="flex-1 space-y-1.5">
        <Skeleton className="h-3.5 w-44" />
        <Skeleton className="h-3 w-56" />
      </div>
      <Skeleton className="h-5 w-12" />
    </div>
  );
}

function OpenMatCard({ session }: { session: OpenMatSession }) {
  const queryClient = useQueryClient();
  const [joined, setJoined] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const spotsLeft = session.max_participants - session.participant_count;
  const isFull = spotsLeft <= 0;

  const joinMutation = useMutation({
    mutationFn: async () => {
      await apiClient.post(ENDPOINTS.COMMUNITY.OPEN_MAT_JOIN(session.id));
    },
    onSuccess: () => {
      setJoined(true);
      setError(null);
      queryClient.invalidateQueries({ queryKey: ['community', 'open-mat'] });
    },
    onError: () => setError('No se pudo unir a la sesión.'),
  });

  return (
    <div className="rounded-xl border border-white/[0.06] bg-card px-4 py-3.5 transition-all duration-200 hover:border-white/[0.1] hover:bg-white/[0.03]">
      <div className="flex items-center gap-4">
        <div className="min-w-0 flex-1 space-y-1">
          <p className="truncate text-sm font-medium text-foreground">
            {session.title}
          </p>
          <p className="text-xs text-muted-foreground">
            {formatDateTime(session.scheduled_at)} · {getFullName(session.host.user)}
          </p>
          {error && <p className="text-xs text-red-400">{error}</p>}
        </div>
        <div className="flex shrink-0 items-center gap-3">
          <div className="flex flex-col items-end gap-0.5">
            <span
              className={cn(
                'font-mono text-sm font-medium',
                isFull
                  ? 'text-red-400'
                  : spotsLeft <= 3
                    ? 'text-amber-400'
                    : 'text-emerald-400',
              )}
            >
              {session.participant_count}
              <span className="font-normal text-muted-foreground">
                /{session.max_participants}
              </span>
            </span>
            <span className="text-[10px] text-muted-foreground/60">plazas</span>
          </div>

          {joined ? (
            <span className="text-xs text-emerald-400 font-medium">¡Apuntado!</span>
          ) : (
            <Button
              size="sm"
              variant="outline"
              disabled={isFull || joinMutation.isPending}
              onClick={() => joinMutation.mutate()}
              className="h-7 text-xs"
            >
              {joinMutation.isPending ? (
                <Loader2 className="h-3 w-3 animate-spin" />
              ) : (
                <>
                  <UserPlus className="h-3 w-3" />
                  {isFull ? 'Lleno' : 'Unirme'}
                </>
              )}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Achievements ─────────────────────────────────────────────────────────────

function AchievementSkeleton() {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-white/[0.06] bg-card px-4 py-3">
      <Skeleton className="h-8 w-8 rounded-lg shrink-0" />
      <div className="flex-1 space-y-1.5">
        <Skeleton className="h-3.5 w-32" />
        <Skeleton className="h-3 w-48" />
      </div>
      <Skeleton className="h-4 w-20 rounded" />
    </div>
  );
}

function AchievementCard({
  achievement,
  earned,
}: {
  achievement: Achievement;
  earned?: boolean;
}) {
  return (
    <div
      className={cn(
        'flex items-center gap-3 rounded-xl border px-4 py-3 transition-all duration-200',
        earned
          ? 'border-amber-500/20 bg-amber-500/[0.04] hover:border-amber-500/30'
          : 'border-white/[0.06] bg-card hover:border-white/[0.1] hover:bg-white/[0.03]',
      )}
    >
      <div
        className={cn(
          'flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border text-base',
          earned
            ? 'border-amber-500/30 bg-amber-500/10'
            : 'border-white/[0.07] bg-white/[0.04]',
        )}
      >
        {achievement.icon}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p className="truncate text-sm font-medium text-foreground">
            {achievement.name}
          </p>
          {earned && (
            <Star className="h-3 w-3 shrink-0 text-amber-400 fill-amber-400" />
          )}
        </div>
        <p className="truncate text-xs text-muted-foreground">
          {achievement.description}
        </p>
      </div>
      <span
        className={cn(
          'shrink-0 inline-flex items-center rounded px-1.5 py-0.5 text-[11px] font-medium border',
          CATEGORY_COLORS[achievement.category],
        )}
      >
        {CATEGORY_LABELS[achievement.category]}
      </span>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function CommunityPage() {
  const academyId = useAcademyId();

  const { data: openMatPage, isLoading: loadingOpenMat } = useQuery<
    PaginatedResponse<OpenMatSession>
  >({
    queryKey: ['community', 'open-mat', academyId],
    queryFn: async () => {
      const { data } = await apiClient.get<PaginatedResponse<OpenMatSession>>(
        ENDPOINTS.COMMUNITY.OPEN_MAT_SESSIONS,
        {
          params: {
            academy: academyId,
            ordering: 'scheduled_at',
            page_size: 20,
          },
        },
      );
      return data;
    },
    enabled: !!academyId,
  });

  const { data: allAchievementsPage, isLoading: loadingAllAchievements } = useQuery<
    PaginatedResponse<Achievement>
  >({
    queryKey: ['community', 'achievements'],
    queryFn: async () => {
      const { data } = await apiClient.get<PaginatedResponse<Achievement>>(
        ENDPOINTS.COMMUNITY.ACHIEVEMENTS,
        { params: { page_size: 50 } },
      );
      return data;
    },
  });

  const { data: myAchievementsPage, isLoading: loadingMyAchievements } = useQuery<
    PaginatedResponse<AthleteAchievement>
  >({
    queryKey: ['community', 'my-achievements'],
    queryFn: async () => {
      const { data } = await apiClient.get<PaginatedResponse<AthleteAchievement>>(
        ENDPOINTS.COMMUNITY.MY_ACHIEVEMENTS,
        { params: { page_size: 50 } },
      );
      return data;
    },
  });

  const openMats = openMatPage?.results ?? [];
  const allAchievements = allAchievementsPage?.results ?? [];
  const myAchievementIds = new Set(
    (myAchievementsPage?.results ?? []).map((a) => a.achievement.id),
  );
  const loadingAchievements = loadingAllAchievements || loadingMyAchievements;

  return (
    <div className="space-y-10 animate-fade-in">
      <PageHeader eyebrow="Academia" title="Comunidad" />

      {/* Open Mat */}
      <section className="space-y-4">
        <h3 className="text-sm font-medium text-foreground">Open Mat</h3>
        {loadingOpenMat ? (
          <div className="space-y-2">
            {Array.from({ length: 3 }).map((_, i) => (
              <OpenMatSkeleton key={i} />
            ))}
          </div>
        ) : openMats.length === 0 ? (
          <EmptyState
            icon={Users}
            title="Sin sesiones de Open Mat"
            description="No hay sesiones de Open Mat programadas."
          />
        ) : (
          <div className="space-y-2">
            {openMats.map((s) => (
              <OpenMatCard key={s.id} session={s} />
            ))}
          </div>
        )}
      </section>

      {/* My achievements summary */}
      {!loadingMyAchievements && myAchievementsPage && myAchievementsPage.count > 0 && (
        <section className="space-y-2">
          <div className="flex items-center gap-2">
            <Star className="h-4 w-4 text-amber-400 fill-amber-400" />
            <h3 className="text-sm font-medium text-foreground">
              Mis logros —{' '}
              <span className="text-amber-400">{myAchievementsPage.count}</span>
            </h3>
          </div>
        </section>
      )}

      {/* All achievements */}
      <section className="space-y-4">
        <h3 className="text-sm font-medium text-foreground">Logros</h3>
        {loadingAchievements ? (
          <div className="space-y-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <AchievementSkeleton key={i} />
            ))}
          </div>
        ) : allAchievements.length === 0 ? (
          <EmptyState
            icon={Trophy}
            title="Sin logros"
            description="No hay logros disponibles todavía."
          />
        ) : (
          <div className="space-y-2">
            {allAchievements.map((a) => (
              <AchievementCard
                key={a.id}
                achievement={a}
                earned={myAchievementIds.has(a.id)}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
