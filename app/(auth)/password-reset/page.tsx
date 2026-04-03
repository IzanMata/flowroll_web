'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { CheckCircle, Loader2, Shield } from 'lucide-react';
import apiClient from '@/lib/api/client';
import { ENDPOINTS } from '@/lib/api/endpoints';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const schema = z.object({
  email: z
    .string()
    .trim()
    .min(1, 'El email es obligatorio')
    .email('Introduce un email válido'),
});

type FormValues = z.infer<typeof schema>;

export default function PasswordResetPage() {
  const [sent, setSent] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  async function onSubmit(values: FormValues) {
    setApiError(null);
    try {
      await apiClient.post(ENDPOINTS.AUTH.PASSWORD_RESET, { email: values.email });
      setSent(true);
    } catch {
      // Always show success to prevent user enumeration
      setSent(true);
    }
  }

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
        {/* Logo */}
        <div className="mb-8 flex flex-col items-center gap-4">
          <div className="relative flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-blue-700 shadow-glow-blue">
            <Shield className="h-7 w-7 text-white" />
            <div className="absolute inset-0 rounded-2xl ring-1 ring-white/20" />
          </div>
          <div className="text-center">
            <h1 className="text-xl font-semibold tracking-tight text-foreground">
              Recuperar contraseña
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Te enviaremos un enlace para restablecerla
            </p>
          </div>
        </div>

        <div className="rounded-2xl border border-white/[0.07] bg-white/[0.025] p-7 shadow-[0_8px_40px_rgba(0,0,0,0.5)] backdrop-blur-sm">
          {sent ? (
            <div className="flex flex-col items-center gap-4 text-center">
              <CheckCircle className="h-10 w-10 text-emerald-400" />
              <div>
                <p className="font-medium text-foreground">Revisa tu email</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Si{' '}
                  <span className="font-medium text-foreground">
                    {getValues('email')}
                  </span>{' '}
                  está registrado, recibirás un enlace en breve.
                </p>
              </div>
              <Button asChild variant="outline" className="w-full">
                <Link href="/login">Volver al inicio de sesión</Link>
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <div className="space-y-2">
                <Label
                  htmlFor="email"
                  className="text-xs font-medium uppercase tracking-wider text-muted-foreground"
                >
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="tu@email.com"
                  autoComplete="email"
                  autoFocus
                  {...register('email')}
                />
                {errors.email && (
                  <p className="text-xs text-destructive">{errors.email.message}</p>
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
                    Enviando…
                  </>
                ) : (
                  'Enviar enlace'
                )}
              </Button>
            </form>
          )}
        </div>

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
