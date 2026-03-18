'use client';

import { useQuery } from '@tanstack/react-query';
import {
  CalendarDays,
  CheckSquare,
  Clock,
  Users,
} from 'lucide-react';
import { useAcademyId } from '@/hooks/useAcademy';
import apiClient from '@/lib/api/client';
import { ENDPOINTS } from '@/lib/api/endpoints';
import type { PaginatedResponse, TrainingClass } from '@/types/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { EmptyState } from '@/components/shared/EmptyState';

// ─────────────────────────────────────────────────────────────────────────────
// Stat card
// ─────────────────────────────────────────────────────────────────────────────

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ElementType;
  description?: string;
  loading?: boolean;
}

function StatCard({ title, value, icon: Icon, description, loading }: StatCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle>{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        {loading ? (
          <Skeleton className="h-8 w-20" />
        ) : (
          <div className="text-2xl font-bold font-mono text-foreground">{value}</div>
        )}
        {description && !loading && (
          <p className="mt-1 text-xs text-muted-foreground">{description}</p>
        )}
        {loading && <Skeleton className="mt-1 h-3 w-32" />}
      </CardContent>
    </Card>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

const CLASS_TYPE_LABELS: Record<string, string> = {
  GI: 'Gi',
  NOGI: 'NoGi',
  KIDS: 'Kids',
  COMPETITION: 'Competición',
  OPEN_MAT: 'Open Mat',
};

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

// ─────────────────────────────────────────────────────────────────────────────
// Dashboard page
// ─────────────────────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const academyId = useAcademyId();

  const { data: classesPage, isLoading: loadingClasses } = useQuery<
    PaginatedResponse<TrainingClass>
  >({
    queryKey: ['classes', 'list', academyId],
    queryFn: async () => {
      const { data } = await apiClient.get<PaginatedResponse<TrainingClass>>(
        ENDPOINTS.CLASSES.LIST,
        { params: { academy: academyId, ordering: 'scheduled_at', page_size: 50 } },
      );
      return data;
    },
    enabled: !!academyId,
  });

  const allClasses = classesPage?.results ?? [];
  const upcomingClasses = allClasses.filter((c) => isUpcoming(c.scheduled_at));
  const todayClasses = allClasses.filter((c) => isToday(c.scheduled_at));

  const todayCheckins = todayClasses.reduce((sum, c) => sum + c.attendance_count, 0);
  const nextClass = upcomingClasses[0] ?? null;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-foreground">Dashboard</h2>
        <p className="text-sm text-muted-foreground">
          Resumen de actividad de tu academia
        </p>
      </div>

      {/* Stat cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total clases"
          value={classesPage?.count ?? 0}
          icon={CalendarDays}
          description="registradas en la academia"
          loading={loadingClasses}
        />
        <StatCard
          title="Próximas clases"
          value={upcomingClasses.length}
          icon={Clock}
          description="pendientes de realizar"
          loading={loadingClasses}
        />
        <StatCard
          title="Clases hoy"
          value={todayClasses.length}
          icon={Users}
          description={todayClasses.length > 0 ? 'programadas hoy' : 'ninguna hoy'}
          loading={loadingClasses}
        />
        <StatCard
          title="Check-ins hoy"
          value={todayCheckins}
          icon={CheckSquare}
          description={`en ${todayClasses.length} clases`}
          loading={loadingClasses}
        />
      </div>

      {/* Upcoming classes */}
      <div className="space-y-3">
        <h3 className="text-sm font-medium text-foreground">Próximas clases</h3>

        {loadingClasses ? (
          <div className="space-y-2">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-16 w-full" />
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
            {upcomingClasses.slice(0, 8).map((cls) => (
              <div
                key={cls.id}
                className="flex items-center justify-between rounded-[6px] border border-white/[0.06] bg-card px-4 py-3"
              >
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-foreground">
                      {cls.title}
                    </span>
                    <Badge variant="outline" className="text-xs">
                      {CLASS_TYPE_LABELS[cls.class_type] ?? cls.class_type}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {formatDateTime(cls.scheduled_at)} · {cls.duration_minutes} min ·{' '}
                    <span className="text-muted-foreground">{cls.professor_username}</span>
                  </p>
                </div>
                <span className="font-mono text-sm text-muted-foreground">
                  {cls.attendance_count}/{cls.max_capacity}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
