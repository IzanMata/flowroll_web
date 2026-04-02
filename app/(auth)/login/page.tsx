'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Link from 'next/link';
import { Loader2, Shield } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { isAxiosError } from 'axios';

const loginSchema = z.object({
  username: z
    .string()
    .trim()
    .min(1, 'El usuario es obligatorio')
    .max(150, 'El usuario no puede superar 150 caracteres'),
  password: z
    .string()
    .min(1, 'La contraseña es obligatoria')
    .max(128, 'La contraseña no puede superar 128 caracteres'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const { login } = useAuth();
  const [apiError, setApiError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  async function onSubmit(values: LoginFormValues) {
    setApiError(null);
    try {
      await login(values);
    } catch (err) {
      if (isAxiosError(err) && err.response?.status === 500) {
        setApiError('Error del servidor. Inténtalo de nuevo más tarde.');
      } else {
        setApiError('Credenciales incorrectas. Inténtalo de nuevo.');
      }
    }
  }

  return (
    <div className="relative flex min-h-screen w-full items-center justify-center overflow-hidden bg-[#080808]">
      {/* Ambient background glow */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute left-1/2 top-0 h-[500px] w-[800px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-blue-600/[0.05] blur-[100px]" />
        <div className="absolute bottom-0 left-0 h-[400px] w-[400px] -translate-x-1/2 translate-y-1/2 rounded-full bg-blue-900/[0.07] blur-[80px]" />
      </div>

      {/* Subtle dot grid */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.018]"
        style={{
          backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.8) 1px, transparent 1px)',
          backgroundSize: '32px 32px',
        }}
      />

      {/* Form container */}
      <div className="relative w-full max-w-[360px] animate-slide-up px-5">
        {/* Logo + heading */}
        <div className="mb-8 flex flex-col items-center gap-4">
          <div className="relative flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-blue-700 shadow-glow-blue">
            <Shield className="h-7 w-7 text-white" />
            <div className="absolute inset-0 rounded-2xl ring-1 ring-white/20" />
          </div>
          <div className="text-center">
            <h1 className="text-xl font-semibold tracking-tight text-foreground">
              FlowRoll
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Accede a tu academia
            </p>
          </div>
        </div>

        {/* Card */}
        <div className="rounded-2xl border border-white/[0.07] bg-white/[0.025] p-7 shadow-[0_8px_40px_rgba(0,0,0,0.5)] backdrop-blur-sm">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* Username */}
            <div className="space-y-2">
              <Label
                htmlFor="username"
                className="text-xs font-medium uppercase tracking-wider text-muted-foreground"
              >
                Usuario
              </Label>
              <Input
                id="username"
                type="text"
                placeholder="tu_usuario"
                autoComplete="username"
                autoFocus
                {...register('username')}
              />
              {errors.username && (
                <p className="text-xs text-destructive">
                  {errors.username.message}
                </p>
              )}
            </div>

            {/* Password */}
            <div className="space-y-2">
              <Label
                htmlFor="password"
                className="text-xs font-medium uppercase tracking-wider text-muted-foreground"
              >
                Contraseña
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                autoComplete="current-password"
                {...register('password')}
              />
              {errors.password && (
                <p className="text-xs text-destructive">
                  {errors.password.message}
                </p>
              )}
            </div>

            {/* API error */}
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
                  Iniciando sesión…
                </>
              ) : (
                'Iniciar sesión'
              )}
            </Button>
          </form>

          <div className="mt-4 text-center">
            <Link
              href="/password-reset"
              className="text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              ¿Olvidaste tu contraseña?
            </Link>
          </div>
        </div>

        <p className="mt-5 text-center text-sm text-muted-foreground">
          ¿No tienes cuenta?{' '}
          <Link
            href="/register"
            className="text-blue-400 hover:text-blue-300 transition-colors"
          >
            Crear cuenta
          </Link>
        </p>

        <p className="mt-4 text-center text-xs text-muted-foreground/50">
          FlowRoll &copy; {new Date().getFullYear()}
        </p>
      </div>
    </div>
  );
}
