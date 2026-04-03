'use client';

import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { CalendarDays, ChevronDown, ChevronUp, Loader2, QrCode, UserCheck } from 'lucide-react';
import { useAcademyId } from '@/hooks/useAcademy';
import apiClient from '@/lib/api/client';
import { ENDPOINTS } from '@/lib/api/endpoints';
import { formatDateTime } from '@/lib/utils/date';
import { getCapacityColor } from '@/lib/utils/capacity';
import { CLASS_TYPE_CONFIG } from '@/lib/utils/class-type';
import { getFullName } from '@/lib/utils/user';
import type { AthleteProfile, ClassType, PaginatedResponse, TrainingClass } from '@/types/api';
import { EmptyState } from '@/components/shared/EmptyState';
import { PageHeader } from '@/components/shared/PageHeader';
import { Button } from '@/components/ui/button';
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

// ─────────────────────────────────────────────────────────────────────────────
// QR panel
// ─────────────────────────────────────────────────────────────────────────────

interface QrData {
  qr_image_url?: string;
  qr_code?: string;
}

function QrPanel({ classId }: { classId: number }) {
  const [qrData, setQrData] = useState<QrData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function generateQr() {
    setLoading(true);
    setError(null);
    try {
      const { data } = await apiClient.post<QrData>(
        ENDPOINTS.CLASSES.GENERATE_QR(classId),
      );
      setQrData(data);
    } catch {
      setError('No se pudo generar el QR.');
    } finally {
      setLoading(false);
    }
  }

  if (qrData) {
    const src = qrData.qr_image_url ?? qrData.qr_code;
    return (
      <div className="flex flex-col items-center gap-3 pt-2">
        {src ? (
          <img src={src} alt="QR check-in" className="h-40 w-40 rounded-lg" />
        ) : (
          <p className="text-xs text-muted-foreground">QR generado — usa la app móvil para escanearlo.</p>
        )}
        <Button size="sm" variant="ghost" onClick={() => setQrData(null)}>
          Cerrar
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-start gap-2 pt-2">
      {error && <p className="text-xs text-red-400">{error}</p>}
      <Button size="sm" variant="outline" onClick={generateQr} disabled={loading}>
        {loading ? (
          <><Loader2 className="h-4 w-4 animate-spin" />Generando…</>
        ) : (
          <><QrCode className="h-4 w-4" />Generar QR de acceso</>
        )}
      </Button>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Manual check-in panel
// ─────────────────────────────────────────────────────────────────────────────

function ManualCheckinPanel({
  classId,
  academyId,
}: {
  classId: number;
  academyId: number;
}) {
  const queryClient = useQueryClient();
  const [athleteSearch, setAthleteSearch] = useState('');
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [success, setSuccess] = useState(false);

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

  const checkinMutation = useMutation({
    mutationFn: async () => {
      await apiClient.post(ENDPOINTS.CLASSES.CHECKIN_MANUAL, {
        athlete_id: selectedId,
        training_class_id: classId,
        method: 'MANUAL',
      });
    },
    onSuccess: () => {
      setSuccess(true);
      setSelectedId(null);
      setAthleteSearch('');
      queryClient.invalidateQueries({ queryKey: ['classes', 'list'] });
      setTimeout(() => setSuccess(false), 3000);
    },
  });

  const athletes = athletesPage?.results ?? [];
  const q = athleteSearch.trim().toLowerCase();
  const filtered = q
    ? athletes.filter(
        (a) =>
          getFullName(a.user).toLowerCase().includes(q) ||
          a.user.username.toLowerCase().includes(q),
      )
    : athletes.slice(0, 8);

  const selected = athletes.find((a) => a.id === selectedId);

  return (
    <div className="space-y-2 pt-2">
      {success && (
        <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/[0.07] px-3 py-2">
          <p className="text-xs text-emerald-400">Check-in registrado correctamente.</p>
        </div>
      )}
      {checkinMutation.isError && (
        <p className="text-xs text-red-400">No se pudo registrar el check-in.</p>
      )}
      <Input
        placeholder="Buscar atleta…"
        value={athleteSearch}
        onChange={(e) => {
          setAthleteSearch(e.target.value);
          setSelectedId(null);
        }}
        className="h-8 text-xs"
      />
      {!selected && filtered.length > 0 && (
        <div className="max-h-36 overflow-y-auto space-y-1 rounded-lg border border-white/[0.06] bg-black/20 p-1">
          {filtered.map((a) => (
            <button
              key={a.id}
              className="w-full rounded px-2 py-1 text-left text-xs text-foreground hover:bg-white/[0.05] transition-colors"
              onClick={() => {
                setSelectedId(a.id);
                setAthleteSearch(getFullName(a.user));
              }}
            >
              {getFullName(a.user)}{' '}
              <span className="text-muted-foreground">@{a.user.username}</span>
            </button>
          ))}
        </div>
      )}
      <Button
        size="sm"
        onClick={() => checkinMutation.mutate()}
        disabled={!selectedId || checkinMutation.isPending}
      >
        {checkinMutation.isPending ? (
          <><Loader2 className="h-4 w-4 animate-spin" />Registrando…</>
        ) : (
          <><UserCheck className="h-4 w-4" />Confirmar check-in</>
        )}
      </Button>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Class row with expandable actions
// ─────────────────────────────────────────────────────────────────────────────

type PanelMode = 'none' | 'qr' | 'checkin';

function ClassRow({
  cls,
  academyId,
}: {
  cls: TrainingClass;
  academyId: number;
}) {
  const [panel, setPanel] = useState<PanelMode>('none');
  const cfg = CLASS_TYPE_CONFIG[cls.class_type] ?? {
    label: cls.class_type,
    className: 'border-white/10 text-muted-foreground',
    accentClass: 'bg-white/20',
  };

  function toggle(mode: PanelMode) {
    setPanel((p) => (p === mode ? 'none' : mode));
  }

  return (
    <div className="rounded-xl border border-white/[0.06] bg-card transition-all duration-200 hover:border-white/[0.1]">
      <div className="flex items-center gap-4 px-4 py-3.5">
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

        <div className="flex shrink-0 items-center gap-2">
          <div className="flex flex-col items-end gap-0.5">
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
            <span className="text-[10px] text-muted-foreground/60">asistentes</span>
          </div>

          {/* Action toggles */}
          <div className="flex gap-1">
            <button
              onClick={() => toggle('qr')}
              title="Generar QR"
              className={cn(
                'rounded-lg p-1.5 transition-colors',
                panel === 'qr'
                  ? 'bg-blue-500/10 text-blue-400'
                  : 'text-muted-foreground hover:text-foreground',
              )}
            >
              <QrCode className="h-4 w-4" />
            </button>
            <button
              onClick={() => toggle('checkin')}
              title="Check-in manual"
              className={cn(
                'rounded-lg p-1.5 transition-colors',
                panel === 'checkin'
                  ? 'bg-emerald-500/10 text-emerald-400'
                  : 'text-muted-foreground hover:text-foreground',
              )}
            >
              <UserCheck className="h-4 w-4" />
            </button>
            <button
              onClick={() => setPanel('none')}
              className={cn(
                'rounded-lg p-1.5 transition-colors text-muted-foreground hover:text-foreground',
                panel === 'none' && 'opacity-0 pointer-events-none',
              )}
            >
              {panel !== 'none' ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Expandable panel */}
      {panel !== 'none' && (
        <div className="border-t border-white/[0.05] px-4 pb-4">
          {panel === 'qr' && <QrPanel classId={cls.id} />}
          {panel === 'checkin' && (
            <ManualCheckinPanel classId={cls.id} academyId={academyId} />
          )}
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Page
// ─────────────────────────────────────────────────────────────────────────────

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
          {filtered.map((cls) => (
            <ClassRow key={cls.id} cls={cls} academyId={academyId!} />
          ))}
        </div>
      )}
    </div>
  );
}
