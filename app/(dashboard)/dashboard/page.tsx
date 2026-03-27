'use client';

import { useQuery } from '@tanstack/react-query';
import {
  CalendarDays,
  CheckSquare,
  Clock,
  Users,
  TrendingUp,
  ArrowRight,
} from 'lucide-react';
import { useAcademyId } from '@/hooks/useAcademy';
import { useAuth } from '@/hooks/useAuth';
import apiClient from '@/lib/api/client';
import { ENDPOINTS } from '@/lib/api/endpoints';
import { formatDateTime, getGreeting, isToday, isUpcoming } from '@/lib/utils/date';
import { getCapacityColor } from '@/lib/utils/capacity';
import { CLASS_TYPE_CONFIG } from '@/lib/utils/class-type';
import type { ClassType, PaginatedResponse, TrainingClass } from '@/types/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/shared/EmptyState';
import { cn } from '@/lib/utils';

// ─────────────────────────────────────────────────────────────────────────────
// Stat card
// ─────────────────────────────────────────────────────────────────────────────

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ElementType;
  description?: string;
  loading?: boolean;
  accent?: string;
}

function StatCard({
  title,
  value,
  icon: Icon,
  description,
  loading,
  accent = 'text-blue-400 bg-blue-500/10',
}: StatCardProps) {
  return (
    <Card className="animate-fade-in">
      <CardHeader className="flex flex-row items-center justify-between pb-3 pt-5 px-5">
        <CardTitle className="text-xs">{title}</CardTitle>
        <div className={cn('flex h-8 w-8 items-center justify-center rounded-lg', accent)}>
          <Icon className="h-4 w-4" />
        </div>
      </CardHeader>
      <CardContent className="px-5 pb-5">
        {loading ? (
          <>
            <Skeleton className="h-8 w-20" />
            <Skeleton className="mt-2 h-3 w-28" />
          </>
        ) : (
          <>
            <div className="text-2xl font-bold tabular-nums text-foreground">
              {value}
            </div>
            {description && (
              <p className="mt-1 text-xs text-muted-foreground">{description}</p>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Class type badge
// ─────────────────────────────────────────────────────────────────────────────

function ClassTypeBadge({ type }: { type: ClassType }) {
  const config = CLASS_TYPE_CONFIG[type] ?? {
    label: type,
    className: 'border-white/10 text-muted-foreground',
  };
  return (
    <span
      className={cn(
        'inline-flex items-center rounded px-1.5 py-0.5 text-[11px] font-medium border',
        config.className,
      )}
    >
      {config.label}
    </span>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Dashboard page — fetches the next 10 upcoming classes
// ─────────────────────────────────────────────────────────────────────────────

const UPCOMING_DISPLAY_LIMIT = 8;
const FETCH_PAGE_SIZE = 10;

export default function DashboardPage() {
  const academyId = useAcademyId();
  const { user } = useAuth();

  const { data: classesPage, isLoading: loadingClasses } = useQuery<
    PaginatedResponse<TrainingClass>
  >({
    queryKey: ['classes', 'list', academyId],
    queryFn: async () => {
      const { data } = await apiClient.get<PaginatedResponse<TrainingClass>>(
        ENDPOINTS.CLASSES.LIST,
        {
          params: {
            academy: academyId,
            ordering: 'scheduled_at',
            page_size: FETCH_PAGE_SIZE,
          },
        },
      );
      return data;
    },
    enabled: !!academyId,
  });

  const allClasses = classesPage?.results ?? [];
  const upcomingClasses = allClasses.filter((c) => isUpcoming(c.scheduled_at));
  const todayClasses = allClasses.filter((c) => isToday(c.scheduled_at));
  const todayCheckins = todayClasses.reduce(
    (sum, c) => sum + c.attendance_count,
    0,
  );

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Page header */}
      <div>
        <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          {getGreeting()}{user?.username ? `, ${user.username}` : ''}
        </p>
        <h2 className="mt-1 text-2xl font-semibold tracking-tight text-foreground">
          Dashboard
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Resumen de actividad de tu academia
        </p>
      </div>

      {/* Stat cards */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total clases"
          value={classesPage?.count ?? 0}
          icon={CalendarDays}
          description="registradas en la academia"
          loading={loadingClasses}
          accent="text-blue-400 bg-blue-500/10"
        />
        <StatCard
          title="Próximas clases"
          value={upcomingClasses.length}
          icon={Clock}
          description="pendientes de realizar"
          loading={loadingClasses}
          accent="text-violet-400 bg-violet-500/10"
        />
        <StatCard
          title="Clases hoy"
          value={todayClasses.length}
          icon={Users}
          description={
            todayClasses.length > 0 ? 'programadas hoy' : 'ninguna hoy'
          }
          loading={loadingClasses}
          accent="text-amber-400 bg-amber-500/10"
        />
        <StatCard
          title="Check-ins hoy"
          value={todayCheckins}
          icon={CheckSquare}
          description={`en ${todayClasses.length} clase${todayClasses.length !== 1 ? 's' : ''}`}
          loading={loadingClasses}
          accent="text-emerald-400 bg-emerald-500/10"
        />
      </div>

      {/* Upcoming classes */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium text-foreground">
            Próximas clases
          </h3>
          {upcomingClasses.length > 0 && (
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <TrendingUp className="h-3 w-3" />
              {upcomingClasses.length} pendiente
              {upcomingClasses.length !== 1 ? 's' : ''}
            </span>
          )}
        </div>

        {loadingClasses ? (
          <div className="space-y-2">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-[68px] w-full" />
            ))}
          </div>
        ) : upcomingClasses.length === 0 ? (
          <EmptyState
            icon={CalendarDays}
            title="Sin clases próximas"
            description="No hay clases programadas en el futuro."
          />
        ) : (
          <div className="space-y-2">
            {upcomingClasses.slice(0, UPCOMING_DISPLAY_LIMIT).map((cls, i) => {
              const accentClass =
                CLASS_TYPE_CONFIG[cls.class_type]?.accentClass ?? 'bg-white/20';
              return (
                <div
                  key={cls.id}
                  className="group flex items-center gap-4 rounded-xl border border-white/[0.06] bg-card px-4 py-3.5 transition-all duration-200 hover:border-white/[0.1] hover:bg-white/[0.03] animate-slide-up"
                  style={{ '--slide-delay': `${i * 40}ms` } as React.CSSProperties}
                >
                  <div className={cn('h-8 w-1 shrink-0 rounded-full', accentClass)} />

                  <div className="min-w-0 flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="truncate text-sm font-medium text-foreground">
                        {cls.title}
                      </span>
                      <ClassTypeBadge type={cls.class_type} />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {formatDateTime(cls.scheduled_at)}
                      {' · '}
                      {cls.duration_minutes} min
                      {cls.professor_username && (
                        <> · {cls.professor_username}</>
                      )}
                    </p>
                  </div>

                  <div className="flex shrink-0 flex-col items-end gap-0.5">
                    <span
                      className={cn(
                        'font-mono text-sm font-medium',
                        getCapacityColor(cls.attendance_count, cls.max_capacity),
                      )}
                    >
                      {cls.attendance_count}
                      <span className="font-normal text-muted-foreground">
                        /{cls.max_capacity}
                      </span>
                    </span>
                    <span className="text-[10px] text-muted-foreground/60">
                      asistentes
                    </span>
                  </div>

                  <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground/30 transition-all duration-200 group-hover:translate-x-0.5 group-hover:text-muted-foreground/60" />
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
