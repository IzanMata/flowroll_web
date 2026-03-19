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
import type { PaginatedResponse, TrainingClass } from '@/types/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
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
// Class type badge colors
// ─────────────────────────────────────────────────────────────────────────────

const CLASS_TYPE_CONFIG: Record<
  string,
  { label: string; className: string }
> = {
  GI: {
    label: 'Gi',
    className: 'border-blue-500/30 bg-blue-500/10 text-blue-400',
  },
  NOGI: {
    label: 'NoGi',
    className: 'border-purple-500/30 bg-purple-500/10 text-purple-400',
  },
  KIDS: {
    label: 'Kids',
    className: 'border-amber-500/30 bg-amber-500/10 text-amber-400',
  },
  COMPETITION: {
    label: 'Competición',
    className: 'border-red-500/30 bg-red-500/10 text-red-400',
  },
  OPEN_MAT: {
    label: 'Open Mat',
    className: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400',
  },
};

function ClassTypeBadge({ type }: { type: string }) {
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
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

function formatDateTime(iso: string): string {
  return new Intl.DateTimeFormat('es-ES', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(iso));
}

function isUpcoming(scheduledAt: string): boolean {
  return new Date(scheduledAt) > new Date();
}

function isToday(scheduledAt: string): boolean {
  const d = new Date(scheduledAt);
  const today = new Date();
  return (
    d.getFullYear() === today.getFullYear() &&
    d.getMonth() === today.getMonth() &&
    d.getDate() === today.getDate()
  );
}

function getGreeting(): string {
  const h = new Date().getHours();
  if (h < 13) return 'Buenos días';
  if (h < 20) return 'Buenas tardes';
  return 'Buenas noches';
}

function getCapacityColor(count: number, max: number): string {
  if (max === 0) return 'text-muted-foreground';
  const ratio = count / max;
  if (ratio >= 0.9) return 'text-red-400';
  if (ratio >= 0.7) return 'text-amber-400';
  return 'text-emerald-400';
}

// ─────────────────────────────────────────────────────────────────────────────
// Dashboard page
// ─────────────────────────────────────────────────────────────────────────────

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
            page_size: 50,
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
            {upcomingClasses.slice(0, 8).map((cls, i) => (
              <div
                key={cls.id}
                className="group flex items-center gap-4 rounded-xl border border-white/[0.06] bg-card px-4 py-3.5 transition-all duration-200 hover:border-white/[0.1] hover:bg-white/[0.03] animate-slide-up"
                style={{ animationDelay: `${i * 40}ms` }}
              >
                {/* Left accent bar based on class type */}
                <div
                  className={cn(
                    'h-8 w-1 shrink-0 rounded-full',
                    cls.class_type === 'GI' && 'bg-blue-500',
                    cls.class_type === 'NOGI' && 'bg-purple-500',
                    cls.class_type === 'KIDS' && 'bg-amber-500',
                    cls.class_type === 'COMPETITION' && 'bg-red-500',
                    cls.class_type === 'OPEN_MAT' && 'bg-emerald-500',
                    !['GI','NOGI','KIDS','COMPETITION','OPEN_MAT'].includes(cls.class_type) && 'bg-white/20',
                  )}
                />

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
                      getCapacityColor(
                        cls.attendance_count,
                        cls.max_capacity,
                      ),
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
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
