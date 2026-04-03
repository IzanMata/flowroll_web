'use client';

import { Suspense, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { CheckCircle, Loader2, Shield, XCircle } from 'lucide-react';
import apiClient from '@/lib/api/client';
import { ENDPOINTS } from '@/lib/api/endpoints';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const schema = z
  .object({
    new_password: z
      .string()
      .min(8, 'La contraseña debe tener al menos 8 caracteres')
      .max(128, 'La contraseña no puede superar 128 caracteres'),
    new_password_confirm: z.string().min(1, 'Confirma tu nueva contraseña'),
  })
  .refine((d) => d.new_password === d.new_password_confirm, {
    message: 'Las contraseñas no coinciden',
    path: ['new_password_confirm'],
  });

type FormValues = z.infer<typeof schema>;

function PasswordResetConfirmContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const uid = searchParams.get('uid');
  const token = searchParams.get('token');

  const [apiError, setApiError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  if (!uid || !token) {
    return (
      <div className="rounded-2xl border border-white/[0.07] bg-white/[0.025] p-8 shadow-[0_8px_40px_rgba(0,0,0,0.5)] text-center">
        <XCircle className="mx-auto mb-4 h-10 w-10 text-red-400" />
        <h2 className="font-semibold text-foreground">Enlace inválido</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Este enlace de restablecimiento no es válido o ha expirado.
        </p>
        <Button asChild variant="outline" className="mt-4 w-full">
          <Link href="/password-reset">Solicitar nuevo enlace</Link>
        </Button>
      </div>
    );
  }

  async function onSubmit(values: FormValues) {
    setApiError(null);
    try {
      await apiClient.post(ENDPOINTS.AUTH.PASSWORD_RESET_CONFIRM, {
        uid,
        token,
        new_password: values.new_password,
      });
      setSuccess(true);
      setTimeout(() => router.push('/login'), 2500);
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
      setApiError('El enlace ha expirado o no es válido. Solicita uno nuevo.');
    }
  }

  return (
    <div className="rounded-2xl border border-white/[0.07] bg-white/[0.025] p-7 shadow-[0_8px_40px_rgba(0,0,0,0.5)] backdrop-blur-sm">
      {success ? (
        <div className="flex flex-col items-center gap-4 text-center">
          <CheckCircle className="h-10 w-10 text-emerald-400" />
          <div>
            <p className="font-medium text-foreground">Contraseña restablecida</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Redirigiendo al inicio de sesión…
            </p>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
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
              autoFocus
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

          {apiError && (
            <div className="rounded-lg border border-red-500/20 bg-red-500/[0.07] px-4 py-3">
              <p className="text-sm text-red-400">{apiError}</p>
            </div>
          )}

          <Button
            type="submit"
            className="mt-1 w-full"
            size="lg"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Guardando…
              </>
            ) : (
              'Restablecer contraseña'
            )}
          </Button>
        </form>
      )}
    </div>
  );
}

export default function PasswordResetConfirmPage() {
  return (
    <div className="relative flex min-h-screen w-full items-center justify-center overflow-hidden bg-[#080808]">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute left-1/2 top-0 h-[500px] w-[800px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-blue-600/[0.05] blur-[100px]" />
      </div>
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.018]"
        style={{
          backgroundImage:
            'radial-gradient(circle, rgba(255,255,255,0.8) 1px, transparent 1px)',
          backgroundSize: '32px 32px',
        }}
      />

      <div className="relative w-full max-w-[360px] animate-slide-up px-5">
        <div className="mb-8 flex flex-col items-center gap-4">
          <div className="relative flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-blue-700 shadow-glow-blue">
            <Shield className="h-7 w-7 text-white" />
            <div className="absolute inset-0 rounded-2xl ring-1 ring-white/20" />
          </div>
          <div className="text-center">
            <h1 className="text-xl font-semibold tracking-tight text-foreground">
              Nueva contraseña
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Elige una contraseña segura
            </p>
          </div>
        </div>

        <Suspense
          fallback={
            <div className="rounded-2xl border border-white/[0.07] bg-white/[0.025] p-8 text-center">
              <Loader2 className="mx-auto h-8 w-8 animate-spin text-blue-400" />
            </div>
          }
        >
          <PasswordResetConfirmContent />
        </Suspense>

        <p className="mt-5 text-center text-sm text-muted-foreground">
          <Link
            href="/login"
            className="text-blue-400 hover:text-blue-300 transition-colors"
          >
            ← Volver al inicio de sesión
          </Link>
        </p>

        <p className="mt-4 text-center text-xs text-muted-foreground/50">
          FlowRoll &copy; {new Date().getFullYear()}
        </p>
      </div>
    </div>
  );
}
