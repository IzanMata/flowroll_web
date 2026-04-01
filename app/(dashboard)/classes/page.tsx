'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { CalendarDays } from 'lucide-react';
import { useAcademyId } from '@/hooks/useAcademy';
import apiClient from '@/lib/api/client';
import { ENDPOINTS } from '@/lib/api/endpoints';
import { formatDateTime } from '@/lib/utils/date';
import { getCapacityColor } from '@/lib/utils/capacity';
import { CLASS_TYPE_CONFIG } from '@/lib/utils/class-type';
import type { ClassType, PaginatedResponse, TrainingClass } from '@/types/api';
import { EmptyState } from '@/components/shared/EmptyState';
import { PageHeader } from '@/components/shared/PageHeader';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

const ALL_TYPES: ClassType[] = ['GI', 'NOGI', 'KIDS', 'COMPETITION', 'OPEN_MAT'];

function ClassRowSkeleton() {
  return (
    <div className="flex items-center gap-4 rounded-xl border border-white/[0.06] bg-card px-4 py-3.5">
      <Skeleton className="h-8 w-1 rounded-full shrink-0" />
      <div className="flex-1 space-y-1.5">
        <div className="flex items-center gap-2">
          <Skeleton className="h-3.5 w-40" />
          <Skeleton className="h-4 w-14 rounded" />
        </div>
        <Skeleton className="h-3 w-56" />
      </div>
      <Skeleton className="h-5 w-12" />
    </div>
  );
}

export default function ClassesPage() {
  const academyId = useAcademyId();
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<ClassType | 'ALL'>('ALL');

  const { data: page, isLoading, isError } = useQuery<PaginatedResponse<TrainingClass>>({
    queryKey: ['classes', 'list', academyId],
    queryFn: async () => {
      const { data } = await apiClient.get<PaginatedResponse<TrainingClass>>(
        ENDPOINTS.CLASSES.LIST,
        {
          params: {
            academy: academyId,
            ordering: '-scheduled_at',
            page_size: 100,
          },
        },
      );
      return data;
    },
    enabled: !!academyId,
  });

  const classes = page?.results ?? [];
  const q = search.trim().toLowerCase();
  const filtered = classes.filter((c) => {
    const matchesType = typeFilter === 'ALL' || c.class_type === typeFilter;
    const matchesSearch =
      !q ||
      c.title.toLowerCase().includes(q) ||
      (c.professor_username?.toLowerCase().includes(q) ?? false);
    return matchesType && matchesSearch;
  });

  const subtitle = isLoading
    ? '…'
    : isError
      ? 'No se pudo cargar la lista'
      : `${page?.count ?? 0} clase${page?.count !== 1 ? 's' : ''} registradas`;

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader eyebrow="Academia" title="Clases" subtitle={subtitle} />

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="w-full max-w-xs">
          <Input
            placeholder="Buscar clases…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex flex-wrap gap-1.5">
          <button
            onClick={() => setTypeFilter('ALL')}
            className={cn(
              'rounded-lg px-3 py-1.5 text-xs font-medium transition-colors',
              typeFilter === 'ALL'
                ? 'bg-white/10 text-foreground'
                : 'text-muted-foreground hover:text-foreground',
            )}
          >
            Todas
          </button>
          {ALL_TYPES.map((t) => (
            <button
              key={t}
              onClick={() => setTypeFilter(t)}
              className={cn(
                'rounded-lg px-3 py-1.5 text-xs font-medium transition-colors',
                typeFilter === t
                  ? 'bg-white/10 text-foreground'
                  : 'text-muted-foreground hover:text-foreground',
              )}
            >
              {CLASS_TYPE_CONFIG[t].label}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <ClassRowSkeleton key={i} />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={CalendarDays}
          title={search || typeFilter !== 'ALL' ? 'Sin resultados' : 'Sin clases'}
          description={
            search || typeFilter !== 'ALL'
              ? 'Prueba ajustando los filtros.'
              : 'No hay clases registradas en esta academia.'
          }
        />
      ) : (
        <div className="space-y-2">
          {filtered.map((cls) => {
            const cfg = CLASS_TYPE_CONFIG[cls.class_type] ?? {
              label: cls.class_type,
              className: 'border-white/10 text-muted-foreground',
              accentClass: 'bg-white/20',
            };
            return (
              <div
                key={cls.id}
                className="flex items-center gap-4 rounded-xl border border-white/[0.06] bg-card px-4 py-3.5 transition-all duration-200 hover:border-white/[0.1] hover:bg-white/[0.03]"
              >
                <div className={cn('h-8 w-1 shrink-0 rounded-full', cfg.accentClass)} />

                <div className="min-w-0 flex-1 space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="truncate text-sm font-medium text-foreground">
                      {cls.title}
                    </span>
                    <span
                      className={cn(
                        'shrink-0 inline-flex items-center rounded px-1.5 py-0.5 text-[11px] font-medium border',
                        cfg.className,
                      )}
                    >
                      {cfg.label}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {formatDateTime(cls.scheduled_at)}
                    {' · '}
                    {cls.duration_minutes} min
                    {cls.professor_username && <> · {cls.professor_username}</>}
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
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
