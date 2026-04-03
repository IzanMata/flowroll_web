'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  CheckCircle,
  KeyRound,
  Loader2,
  Mail,
  ShieldCheck,
  User,
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import apiClient from '@/lib/api/client';
import { ENDPOINTS } from '@/lib/api/endpoints';
import { PageHeader } from '@/components/shared/PageHeader';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

// ─────────────────────────────────────────────────────────────────────────────
// Change password form
// ─────────────────────────────────────────────────────────────────────────────

const passwordSchema = z
  .object({
    current_password: z.string().min(1, 'Introduce tu contraseña actual'),
    new_password: z
      .string()
      .min(8, 'La nueva contraseña debe tener al menos 8 caracteres')
      .max(128),
    new_password_confirm: z.string().min(1, 'Confirma la nueva contraseña'),
  })
  .refine((d) => d.new_password === d.new_password_confirm, {
    message: 'Las contraseñas no coinciden',
    path: ['new_password_confirm'],
  });

type PasswordFormValues = z.infer<typeof passwordSchema>;

function ChangePasswordCard() {
  const [success, setSuccess] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<PasswordFormValues>({ resolver: zodResolver(passwordSchema) });

  async function onSubmit(values: PasswordFormValues) {
    setApiError(null);
    setSuccess(false);
    try {
      await apiClient.post(ENDPOINTS.AUTH.CHANGE_PASSWORD, {
        current_password: values.current_password,
        new_password: values.new_password,
      });
      setSuccess(true);
      reset();
    } catch (err: unknown) {
      if (typeof err === 'object' && err !== null && 'response' in err) {
        const axiosErr = err as { response?: { data?: Record<string, unknown> } };
        const data = axiosErr.response?.data;
        if (data) {
          const first = Object.values(data)[0];
          const msg = Array.isArray(first) ? first[0] : String(first);
          setApiError(String(msg));
          return;
        }
      }
      setApiError('No se pudo cambiar la contraseña. Inténtalo de nuevo.');
    }
  }

  return (
    <Card>
      <CardHeader className="pb-3 pt-5 px-5">
        <CardTitle className="flex items-center gap-2 text-sm font-semibold">
          <KeyRound className="h-4 w-4 text-muted-foreground" />
          Cambiar contraseña
        </CardTitle>
      </CardHeader>
      <CardContent className="px-5 pb-5">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 max-w-sm">
          <div className="space-y-2">
            <Label
              htmlFor="current_password"
              className="text-xs font-medium uppercase tracking-wider text-muted-foreground"
            >
              Contraseña actual
            </Label>
            <Input
              id="current_password"
              type="password"
              placeholder="••••••••"
              autoComplete="current-password"
              {...register('current_password')}
            />
            {errors.current_password && (
              <p className="text-xs text-destructive">
                {errors.current_password.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label
              htmlFor="new_password"
              className="text-xs font-medium uppercase tracking-wider text-muted-foreground"
            >
              Nueva contraseña
            </Label>
            <Input
              id="new_password"
              type="password"
              placeholder="••••••••"
              autoComplete="new-password"
              {...register('new_password')}
            />
            {errors.new_password && (
              <p className="text-xs text-destructive">
                {errors.new_password.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label
              htmlFor="new_password_confirm"
              className="text-xs font-medium uppercase tracking-wider text-muted-foreground"
            >
              Confirmar contraseña
            </Label>
            <Input
              id="new_password_confirm"
              type="password"
              placeholder="••••••••"
              autoComplete="new-password"
              {...register('new_password_confirm')}
            />
            {errors.new_password_confirm && (
              <p className="text-xs text-destructive">
                {errors.new_password_confirm.message}
              </p>
            )}
          </div>

          {success && (
            <div className="flex items-center gap-2 rounded-lg border border-emerald-500/20 bg-emerald-500/[0.07] px-4 py-3">
              <CheckCircle className="h-4 w-4 shrink-0 text-emerald-400" />
              <p className="text-sm text-emerald-400">
                Contraseña actualizada correctamente.
              </p>
            </div>
          )}

          {apiError && (
            <div className="rounded-lg border border-red-500/20 bg-red-500/[0.07] px-4 py-3">
              <p className="text-sm text-red-400">{apiError}</p>
            </div>
          )}

          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Guardando…
              </>
            ) : (
              'Guardar contraseña'
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Email verification card
// ─────────────────────────────────────────────────────────────────────────────

function EmailVerificationCard() {
  const { user } = useAuth();
  const [resending, setResending] = useState(false);
  const [resendDone, setResendDone] = useState(false);
  const [resendError, setResendError] = useState<string | null>(null);

  async function handleResend() {
    if (!user?.email) return;
    setResending(true);
    setResendError(null);
    setResendDone(false);
    try {
      await apiClient.post(ENDPOINTS.AUTH.RESEND_VERIFICATION, {
        email: user.email,
      });
      setResendDone(true);
    } catch {
      setResendError('No se pudo enviar el email. Inténtalo más tarde.');
    } finally {
      setResending(false);
    }
  }

  const isVerified = user?.email_verified ?? false;

  return (
    <Card>
      <CardHeader className="pb-3 pt-5 px-5">
        <CardTitle className="flex items-center gap-2 text-sm font-semibold">
          <Mail className="h-4 w-4 text-muted-foreground" />
          Verificación de email
        </CardTitle>
      </CardHeader>
      <CardContent className="px-5 pb-5 space-y-4">
        <div className="flex items-center gap-3">
          {isVerified ? (
            <ShieldCheck className="h-5 w-5 shrink-0 text-emerald-400" />
          ) : (
            <Mail className="h-5 w-5 shrink-0 text-amber-400" />
          )}
          <div>
            <p className="text-sm font-medium text-foreground">
              {user?.email ?? '—'}
            </p>
            <p
              className={`text-xs ${isVerified ? 'text-emerald-400' : 'text-amber-400'}`}
            >
              {isVerified ? 'Email verificado' : 'Pendiente de verificación'}
            </p>
          </div>
        </div>

        {!isVerified && (
          <div className="space-y-3">
            {resendDone ? (
              <div className="flex items-center gap-2 rounded-lg border border-emerald-500/20 bg-emerald-500/[0.07] px-4 py-3">
                <CheckCircle className="h-4 w-4 shrink-0 text-emerald-400" />
                <p className="text-sm text-emerald-400">
                  Email de verificación reenviado.
                </p>
              </div>
            ) : (
              <>
                {resendError && (
                  <div className="rounded-lg border border-red-500/20 bg-red-500/[0.07] px-4 py-3">
                    <p className="text-sm text-red-400">{resendError}</p>
                  </div>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleResend}
                  disabled={resending}
                >
                  {resending ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Enviando…
                    </>
                  ) : (
                    'Reenviar email de verificación'
                  )}
                </Button>
              </>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Profile info card
// ─────────────────────────────────────────────────────────────────────────────

function ProfileInfoCard() {
  const { user } = useAuth();

  const fields = [
    { label: 'Usuario', value: user?.username },
    { label: 'Nombre', value: user?.first_name },
    { label: 'Apellidos', value: user?.last_name },
    { label: 'Email', value: user?.email },
  ];

  return (
    <Card>
      <CardHeader className="pb-3 pt-5 px-5">
        <CardTitle className="flex items-center gap-2 text-sm font-semibold">
          <User className="h-4 w-4 text-muted-foreground" />
          Información del perfil
        </CardTitle>
      </CardHeader>
      <CardContent className="px-5 pb-5">
        <dl className="space-y-3">
          {fields.map(({ label, value }) => (
            <div key={label} className="grid grid-cols-[120px_1fr] gap-2">
              <dt className="text-xs font-medium uppercase tracking-wider text-muted-foreground pt-0.5">
                {label}
              </dt>
              <dd className="text-sm text-foreground truncate">
                {value || <span className="text-muted-foreground">—</span>}
              </dd>
            </div>
          ))}
        </dl>
      </CardContent>
    </Card>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Settings page
// ─────────────────────────────────────────────────────────────────────────────

export default function SettingsPage() {
  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        eyebrow="Cuenta"
        title="Configuración"
        subtitle="Gestiona tu perfil y seguridad"
      />

      <div className="grid gap-4 lg:grid-cols-2">
        <ProfileInfoCard />
        <EmailVerificationCard />
      </div>

      <ChangePasswordCard />
    </div>
  );
}
