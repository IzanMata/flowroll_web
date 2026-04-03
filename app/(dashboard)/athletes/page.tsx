'use client';

import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Loader2, QrCode, TrendingUp, Users } from 'lucide-react';
import { useAcademyId } from '@/hooks/useAcademy';
import apiClient from '@/lib/api/client';
import { ENDPOINTS } from '@/lib/api/endpoints';
import { getFullName } from '@/lib/utils/user';
import type { AthleteProfile, BeltColor, PaginatedResponse } from '@/types/api';
import { BeltBadge } from '@/components/shared/BeltBadge';
import { EmptyState } from '@/components/shared/EmptyState';
import { PageHeader } from '@/components/shared/PageHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

// ─────────────────────────────────────────────────────────────────────────────
// Belt promotion panel
// ─────────────────────────────────────────────────────────────────────────────

const BELT_ORDER: BeltColor[] = ['WHITE', 'BLUE', 'PURPLE', 'BROWN', 'BLACK'];
const BELT_LABELS: Record<BeltColor, string> = {
  WHITE: 'Blanco',
  BLUE: 'Azul',
  PURPLE: 'Morado',
  BROWN: 'Marrón',
  BLACK: 'Negro',
};

function PromotePanel({
  athlete,
  onClose,
}: {
  athlete: AthleteProfile;
  onClose: () => void;
}) {
  const queryClient = useQueryClient();
  const currentIdx = BELT_ORDER.indexOf(athlete.belt.color);
  const nextBelt = BELT_ORDER[currentIdx + 1] ?? null;

  const [targetColor, setTargetColor] = useState<BeltColor>(
    nextBelt ?? athlete.belt.color,
  );
  const [targetStripes, setTargetStripes] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const promoteMutation = useMutation({
    mutationFn: async () => {
      await apiClient.post(ENDPOINTS.ATHLETES.PROMOTE(athlete.id), {
        to_belt_color: targetColor,
        to_belt_stripes: targetStripes,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['athletes', 'list'] });
      onClose();
    },
    onError: () => setError('No se pudo registrar la promoción.'),
  });

  return (
    <div className="space-y-3 border-t border-white/[0.05] px-4 pb-4 pt-3">
      <p className="text-xs text-muted-foreground font-medium">Promover cinturón</p>

      <div className="flex flex-wrap gap-2">
        {BELT_ORDER.map((color, idx) => (
          <button
            key={color}
            onClick={() => setTargetColor(color)}
            disabled={idx <= currentIdx - 1}
            className={cn(
              'rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors',
              targetColor === color
                ? 'border-blue-500/40 bg-blue-500/10 text-blue-400'
                : 'border-white/[0.07] text-muted-foreground hover:text-foreground disabled:opacity-30',
            )}
          >
            {BELT_LABELS[color]}
          </button>
        ))}
      </div>

      <div className="flex items-center gap-3">
        <p className="text-xs text-muted-foreground">Galones:</p>
        {[0, 1, 2, 3, 4].map((s) => (
          <button
            key={s}
            onClick={() => setTargetStripes(s)}
            className={cn(
              'h-7 w-7 rounded-lg border text-xs font-medium transition-colors',
              targetStripes === s
                ? 'border-amber-500/40 bg-amber-500/10 text-amber-400'
                : 'border-white/[0.07] text-muted-foreground hover:text-foreground',
            )}
          >
            {s}
          </button>
        ))}
      </div>

      {error && <p className="text-xs text-red-400">{error}</p>}

      <div className="flex gap-2">
        <Button
          size="sm"
          onClick={() => promoteMutation.mutate()}
          disabled={promoteMutation.isPending}
        >
          {promoteMutation.isPending ? (
            <><Loader2 className="h-4 w-4 animate-spin" />Guardando…</>
          ) : (
            <>
              <TrendingUp className="h-4 w-4" />
              Confirmar promoción
            </>
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
// QR panel
// ─────────────────────────────────────────────────────────────────────────────

interface QrTokenData {
  qr_token?: string;
  qr_image_url?: string;
}

function QrPanel({
  athlete,
  onClose,
}: {
  athlete: AthleteProfile;
  onClose: () => void;
}) {
  const [data, setData] = useState<QrTokenData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function loadQr() {
    setLoading(true);
    setError(null);
    try {
      const { data: res } = await apiClient.get<QrTokenData>(
        ENDPOINTS.ATHLETES.QR_TOKEN(athlete.id),
      );
      setData(res);
    } catch {
      setError('No se pudo obtener el QR.');
    } finally {
      setLoading(false);
    }
  }

  // Auto-load on mount
  if (!data && !loading && !error) {
    loadQr();
  }

  return (
    <div className="flex flex-col items-start gap-3 border-t border-white/[0.05] px-4 pb-4 pt-3">
      <p className="text-xs text-muted-foreground font-medium">
        QR de check-in — {getFullName(athlete.user)}
      </p>
      {loading && (
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />Cargando QR…
        </div>
      )}
      {error && <p className="text-xs text-red-400">{error}</p>}
      {data && (
        <>
          {data.qr_image_url ? (
            <img
              src={data.qr_image_url}
              alt="QR del atleta"
              className="h-36 w-36 rounded-lg border border-white/[0.07]"
            />
          ) : data.qr_token ? (
            <div className="rounded-lg border border-white/[0.07] bg-white/[0.03] px-3 py-2">
              <p className="font-mono text-xs text-foreground break-all">
                {data.qr_token}
              </p>
            </div>
          ) : null}
        </>
      )}
      <Button size="sm" variant="ghost" onClick={onClose}>
        Cerrar
      </Button>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Athlete row
// ─────────────────────────────────────────────────────────────────────────────

type PanelMode = 'none' | 'promote' | 'qr';

function AvatarInitials({ name }: { name: string }) {
  const initials = name
    .split(' ')
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? '')
    .join('');
  return (
    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/[0.06] text-xs font-semibold text-muted-foreground">
      {initials || '?'}
    </div>
  );
}

function AthleteRow({ athlete }: { athlete: AthleteProfile }) {
  const [panel, setPanel] = useState<PanelMode>('none');

  function toggle(mode: PanelMode) {
    setPanel((p) => (p === mode ? 'none' : mode));
  }

  const fullName = getFullName(athlete.user);

  return (
    <div className="rounded-xl border border-white/[0.06] bg-card transition-all duration-200 hover:border-white/[0.1]">
      <div className="flex items-center gap-4 px-4 py-3.5">
        <AvatarInitials name={fullName} />

        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-foreground">{fullName}</p>
          <p className="text-xs text-muted-foreground">
            @{athlete.user.username}
            {athlete.weight_class && ` · ${athlete.weight_class}`}
          </p>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <BeltBadge
            color={athlete.belt.color}
            stripes={athlete.belt.stripes}
            size="sm"
          />

          {/* Action buttons */}
          <button
            onClick={() => toggle('promote')}
            title="Promover cinturón"
            className={cn(
              'rounded-lg p-1.5 transition-colors',
              panel === 'promote'
                ? 'bg-amber-500/10 text-amber-400'
                : 'text-muted-foreground hover:text-foreground',
            )}
          >
            <TrendingUp className="h-4 w-4" />
          </button>
          <button
            onClick={() => toggle('qr')}
            title="Ver QR"
            className={cn(
              'rounded-lg p-1.5 transition-colors',
              panel === 'qr'
                ? 'bg-blue-500/10 text-blue-400'
                : 'text-muted-foreground hover:text-foreground',
            )}
          >
            <QrCode className="h-4 w-4" />
          </button>
        </div>
      </div>

      {panel === 'promote' && (
        <PromotePanel athlete={athlete} onClose={() => setPanel('none')} />
      )}
      {panel === 'qr' && (
        <QrPanel athlete={athlete} onClose={() => setPanel('none')} />
      )}
    </div>
  );
}

function AthleteRowSkeleton() {
  return (
    <div className="flex items-center gap-4 rounded-xl border border-white/[0.06] bg-card px-4 py-3.5">
      <Skeleton className="h-9 w-9 rounded-full shrink-0" />
      <div className="flex-1 space-y-1.5">
        <Skeleton className="h-3.5 w-36" />
        <Skeleton className="h-3 w-24" />
      </div>
      <Skeleton className="h-5 w-14 rounded" />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Page
// ─────────────────────────────────────────────────────────────────────────────

export default function AthletesPage() {
  const academyId = useAcademyId();
  const [search, setSearch] = useState('');

  const { data: page, isLoading, isError } = useQuery<PaginatedResponse<AthleteProfile>>({
    queryKey: ['athletes', 'list', academyId],
    queryFn: async () => {
      const { data } = await apiClient.get<PaginatedResponse<AthleteProfile>>(
        ENDPOINTS.ATHLETES.LIST,
        { params: { academy: academyId, page_size: 100 } },
      );
      return data;
    },
    enabled: !!academyId,
  });

  const athletes = page?.results ?? [];
  const q = search.trim().toLowerCase();
  const filtered = q
    ? athletes.filter((a) => {
        const full = getFullName(a.user).toLowerCase();
        return full.includes(q) || a.user.username.toLowerCase().includes(q);
      })
    : athletes;

  const subtitle = isLoading
    ? '…'
    : isError
      ? 'No se pudo cargar la lista'
      : `${page?.count ?? 0} atleta${page?.count !== 1 ? 's' : ''} registrados`;

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader eyebrow="Academia" title="Atletas" subtitle={subtitle} />

      <div className="max-w-sm">
        <Input
          placeholder="Buscar atletas…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <AthleteRowSkeleton key={i} />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={Users}
          title={search ? 'Sin resultados' : 'Sin atletas'}
          description={
            search
              ? `No se encontraron atletas para "${search}".`
              : 'No hay atletas registrados en esta academia.'
          }
        />
      ) : (
        <div className="space-y-2">
          {filtered.map((athlete) => (
            <AthleteRow key={athlete.id} athlete={athlete} />
          ))}
        </div>
      )}
    </div>
  );
}
