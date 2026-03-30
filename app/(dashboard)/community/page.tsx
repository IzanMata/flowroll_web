'use client';

import { useQuery } from '@tanstack/react-query';
import { Users, Trophy } from 'lucide-react';
import { useAcademyId } from '@/hooks/useAcademy';
import apiClient from '@/lib/api/client';
import { ENDPOINTS } from '@/lib/api/endpoints';
import { formatDateTime } from '@/lib/utils/date';
import type { Achievement, OpenMatSession, PaginatedResponse } from '@/types/api';
import { EmptyState } from '@/components/shared/EmptyState';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

const CATEGORY_LABELS: Record<Achievement['category'], string> = {
  ATTENDANCE: 'Asistencia',
  COMPETITION: 'Competición',
  PROMOTION: 'Promoción',
  LEARNING: 'Aprendizaje',
  COMMUNITY: 'Comunidad',
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
  const hostName =
    [session.host.user.first_name, session.host.user.last_name]
      .filter(Boolean)
      .join(' ') || session.host.user.username;
  const spotsLeft = session.max_participants - session.participant_count;

  return (
    <div className="flex items-center gap-4 rounded-xl border border-white/[0.06] bg-card px-4 py-3.5 transition-all duration-200 hover:border-white/[0.1] hover:bg-white/[0.03]">
      <div className="min-w-0 flex-1 space-y-1">
        <p className="truncate text-sm font-medium text-foreground">
          {session.title}
        </p>
        <p className="text-xs text-muted-foreground">
          {formatDateTime(session.scheduled_at)} · {hostName}
        </p>
      </div>
      <div className="flex shrink-0 flex-col items-end gap-0.5">
        <span
          className={cn(
            'font-mono text-sm font-medium',
            spotsLeft <= 0
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

function AchievementCard({ achievement }: { achievement: Achievement }) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-white/[0.06] bg-card px-4 py-3 transition-all duration-200 hover:border-white/[0.1] hover:bg-white/[0.03]">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-white/[0.07] bg-white/[0.04] text-base">
        {achievement.icon}
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-foreground">
          {achievement.name}
        </p>
        <p className="truncate text-xs text-muted-foreground">
          {achievement.description}
        </p>
      </div>
      <span className="shrink-0 inline-flex items-center rounded px-1.5 py-0.5 text-[11px] font-medium border border-white/10 text-muted-foreground">
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

  const { data: achievementsPage, isLoading: loadingAchievements } = useQuery<
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

  const openMats = openMatPage?.results ?? [];
  const achievements = achievementsPage?.results ?? [];

  return (
    <div className="space-y-10 animate-fade-in">
      <div>
        <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          Academia
        </p>
        <h2 className="mt-1 text-2xl font-semibold tracking-tight text-foreground">
          Comunidad
        </h2>
      </div>

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

      {/* Achievements */}
      <section className="space-y-4">
        <h3 className="text-sm font-medium text-foreground">Logros</h3>
        {loadingAchievements ? (
          <div className="space-y-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <AchievementSkeleton key={i} />
            ))}
          </div>
        ) : achievements.length === 0 ? (
          <EmptyState
            icon={Trophy}
            title="Sin logros"
            description="No hay logros disponibles todavía."
          />
        ) : (
          <div className="space-y-2">
            {achievements.map((a) => (
              <AchievementCard key={a.id} achievement={a} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
