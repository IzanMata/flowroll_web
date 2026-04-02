'use client';

import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Crown,
  Loader2,
  MoreHorizontal,
  Shield,
  Trash2,
  UserPlus,
  Users,
} from 'lucide-react';
import { useAcademyId } from '@/hooks/useAcademy';
import { useAuth } from '@/hooks/useAuth';
import apiClient from '@/lib/api/client';
import { ENDPOINTS } from '@/lib/api/endpoints';
import type { AcademyMember, AcademyRole, PaginatedResponse } from '@/types/api';
import { EmptyState } from '@/components/shared/EmptyState';
import { PageHeader } from '@/components/shared/PageHeader';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';

const ROLE_LABELS: Record<AcademyRole, string> = {
  OWNER: 'Propietario',
  INSTRUCTOR: 'Instructor',
  ATHLETE: 'Atleta',
};

const ROLE_ICONS: Record<AcademyRole, React.ElementType> = {
  OWNER: Crown,
  INSTRUCTOR: Shield,
  ATHLETE: Users,
};

const ROLE_COLORS: Record<AcademyRole, string> = {
  OWNER: 'text-amber-400',
  INSTRUCTOR: 'text-blue-400',
  ATHLETE: 'text-muted-foreground',
};

function MemberSkeleton() {
  return (
    <div className="flex items-center gap-4 rounded-xl border border-white/[0.06] bg-card px-4 py-3.5">
      <Skeleton className="h-9 w-9 rounded-full shrink-0" />
      <div className="flex-1 space-y-1.5">
        <Skeleton className="h-3.5 w-40" />
        <Skeleton className="h-3 w-28" />
      </div>
      <Skeleton className="h-5 w-20 rounded" />
    </div>
  );
}

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

// ─────────────────────────────────────────────────────────────────────────────
// Add member form
// ─────────────────────────────────────────────────────────────────────────────

function AddMemberForm({ academyId }: { academyId: number }) {
  const queryClient = useQueryClient();
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<AcademyRole>('ATHLETE');
  const [error, setError] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: async () => {
      await apiClient.post(ENDPOINTS.ACADEMIES.MEMBERS(academyId), {
        email,
        role,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['academy', 'members', academyId],
      });
      setEmail('');
      setRole('ATHLETE');
      setError(null);
    },
    onError: (err: unknown) => {
      if (typeof err === 'object' && err !== null && 'response' in err) {
        const axiosErr = err as { response?: { data?: Record<string, unknown> } };
        const data = axiosErr.response?.data;
        if (data) {
          const first = Object.values(data)[0];
          setError(Array.isArray(first) ? String(first[0]) : String(first));
          return;
        }
      }
      setError('No se pudo añadir el miembro. Inténtalo de nuevo.');
    },
  });

  return (
    <div className="rounded-xl border border-white/[0.06] bg-card p-4 space-y-4">
      <p className="text-sm font-medium text-foreground flex items-center gap-2">
        <UserPlus className="h-4 w-4 text-muted-foreground" />
        Añadir miembro
      </p>

      <div className="flex gap-3 flex-wrap">
        <div className="flex-1 min-w-[200px] space-y-2">
          <Label
            htmlFor="member-email"
            className="text-xs font-medium uppercase tracking-wider text-muted-foreground"
          >
            Email
          </Label>
          <Input
            id="member-email"
            type="email"
            placeholder="atleta@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div className="space-y-2 min-w-[140px]">
          <Label
            htmlFor="member-role"
            className="text-xs font-medium uppercase tracking-wider text-muted-foreground"
          >
            Rol
          </Label>
          <select
            id="member-role"
            value={role}
            onChange={(e) => setRole(e.target.value as AcademyRole)}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            <option value="ATHLETE">Atleta</option>
            <option value="INSTRUCTOR">Instructor</option>
          </select>
        </div>

        <div className="flex items-end">
          <Button
            onClick={() => mutation.mutate()}
            disabled={!email.trim() || mutation.isPending}
          >
            {mutation.isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Añadiendo…
              </>
            ) : (
              <>
                <UserPlus className="h-4 w-4" />
                Añadir
              </>
            )}
          </Button>
        </div>
      </div>

      {error && (
        <div className="rounded-lg border border-red-500/20 bg-red-500/[0.07] px-4 py-3">
          <p className="text-sm text-red-400">{error}</p>
        </div>
      )}

      {mutation.isSuccess && (
        <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/[0.07] px-4 py-3">
          <p className="text-sm text-emerald-400">Miembro añadido correctamente.</p>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Member row
// ─────────────────────────────────────────────────────────────────────────────

function MemberRow({
  member,
  academyId,
  canManage,
  currentUserId,
}: {
  member: AcademyMember;
  academyId: number;
  canManage: boolean;
  currentUserId?: number;
}) {
  const queryClient = useQueryClient();
  const RoleIcon = ROLE_ICONS[member.role];
  const fullName =
    [member.first_name, member.last_name].filter(Boolean).join(' ') ||
    member.username;

  const isSelf = member.user_id === currentUserId;

  const changeRoleMutation = useMutation({
    mutationFn: async (newRole: AcademyRole) => {
      await apiClient.patch(
        ENDPOINTS.ACADEMIES.MEMBER_DETAIL(academyId, member.user_id),
        { role: newRole },
      );
    },
    onSuccess: () =>
      queryClient.invalidateQueries({
        queryKey: ['academy', 'members', academyId],
      }),
  });

  const removeMutation = useMutation({
    mutationFn: async () => {
      await apiClient.delete(
        ENDPOINTS.ACADEMIES.MEMBER_DETAIL(academyId, member.user_id),
      );
    },
    onSuccess: () =>
      queryClient.invalidateQueries({
        queryKey: ['academy', 'members', academyId],
      }),
  });

  return (
    <div className="flex items-center gap-4 rounded-xl border border-white/[0.06] bg-card px-4 py-3.5 transition-all duration-200 hover:border-white/[0.1]">
      <AvatarInitials name={fullName} />

      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-foreground">
          {fullName}
          {isSelf && (
            <span className="ml-2 text-xs text-muted-foreground">(tú)</span>
          )}
        </p>
        <p className="text-xs text-muted-foreground">
          @{member.username} · {member.email}
        </p>
      </div>

      <div
        className={`flex items-center gap-1.5 text-xs font-medium ${ROLE_COLORS[member.role]}`}
      >
        <RoleIcon className="h-3.5 w-3.5" />
        {ROLE_LABELS[member.role]}
      </div>

      {canManage && !isSelf && member.role !== 'OWNER' && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {member.role !== 'INSTRUCTOR' && (
              <DropdownMenuItem
                onClick={() => changeRoleMutation.mutate('INSTRUCTOR')}
                disabled={changeRoleMutation.isPending}
              >
                <Shield className="h-4 w-4" />
                Promover a instructor
              </DropdownMenuItem>
            )}
            {member.role !== 'ATHLETE' && (
              <DropdownMenuItem
                onClick={() => changeRoleMutation.mutate('ATHLETE')}
                disabled={changeRoleMutation.isPending}
              >
                <Users className="h-4 w-4" />
                Cambiar a atleta
              </DropdownMenuItem>
            )}
            <DropdownMenuItem
              className="text-red-400 focus:text-red-400"
              onClick={() => removeMutation.mutate()}
              disabled={removeMutation.isPending}
            >
              <Trash2 className="h-4 w-4" />
              Expulsar
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Page
// ─────────────────────────────────────────────────────────────────────────────

export default function AcademyMembersPage() {
  const academyId = useAcademyId();
  const { user } = useAuth();

  const { data, isLoading, isError } = useQuery<PaginatedResponse<AcademyMember>>({
    queryKey: ['academy', 'members', academyId],
    queryFn: async () => {
      const { data } = await apiClient.get<PaginatedResponse<AcademyMember>>(
        ENDPOINTS.ACADEMIES.MEMBERS(academyId!),
      );
      return data;
    },
    enabled: !!academyId,
  });

  const members = data?.results ?? [];

  // Determine if current user can manage members (OWNER or INSTRUCTOR)
  const userRole = user?.academies?.find((a) => a.id === academyId)?.role;
  const canManage = userRole === 'OWNER' || userRole === 'INSTRUCTOR';

  const subtitle = isLoading
    ? '…'
    : isError
      ? 'No se pudo cargar los miembros'
      : `${data?.count ?? 0} miembro${data?.count !== 1 ? 's' : ''}`;

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        eyebrow="Academia"
        title="Miembros"
        subtitle={subtitle}
      />

      {canManage && academyId && <AddMemberForm academyId={academyId} />}

      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <MemberSkeleton key={i} />
          ))}
        </div>
      ) : members.length === 0 ? (
        <EmptyState
          icon={Users}
          title="Sin miembros"
          description="Esta academia todavía no tiene miembros."
        />
      ) : (
        <div className="space-y-2">
          {members.map((member) => (
            <MemberRow
              key={member.user_id}
              member={member}
              academyId={academyId!}
              canManage={canManage}
              currentUserId={user?.id}
            />
          ))}
        </div>
      )}
    </div>
  );
}
