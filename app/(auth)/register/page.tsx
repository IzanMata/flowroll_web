'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2, Shield } from 'lucide-react';
import apiClient from '@/lib/api/client';
import { ENDPOINTS } from '@/lib/api/endpoints';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const registerSchema = z
  .object({
    username: z
      .string()
      .trim()
      .min(3, 'El usuario debe tener al menos 3 caracteres')
      .max(150, 'El usuario no puede superar 150 caracteres')
      .regex(
        /^[a-zA-Z0-9_]+$/,
        'Solo letras, números y guiones bajos',
      ),
    email: z
      .string()
      .trim()
      .min(1, 'El email es obligatorio')
      .email('Introduce un email válido'),
    first_name: z.string().trim().max(150).optional(),
    last_name: z.string().trim().max(150).optional(),
    password: z
      .string()
      .min(8, 'La contraseña debe tener al menos 8 caracteres')
      .max(128, 'La contraseña no puede superar 128 caracteres'),
    password_confirm: z.string().min(1, 'Confirma tu contraseña'),
  })
  .refine((d) => d.password === d.password_confirm, {
    message: 'Las contraseñas no coinciden',
    path: ['password_confirm'],
  });

type RegisterFormValues = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const router = useRouter();
  const [apiError, setApiError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormValues>({ resolver: zodResolver(registerSchema) });

  async function onSubmit(values: RegisterFormValues) {
    setApiError(null);
    try {
      await apiClient.post(ENDPOINTS.AUTH.REGISTER, {
        username: values.username,
        email: values.email,
        first_name: values.first_name ?? '',
        last_name: values.last_name ?? '',
        password: values.password,
      });
      router.push(
        `/verify-email?email=${encodeURIComponent(values.email)}`,
      );
    } catch (err: unknown) {
      if (
        typeof err === 'object' &&
        err !== null &&
        'response' in err
      ) {
        const axiosErr = err as { response?: { data?: Record<string, unknown> } };
        const data = axiosErr.response?.data;
        if (data) {
          const first = Object.values(data)[0];
          const msg = Array.isArray(first) ? first[0] : String(first);
          setApiError(String(msg));
          return;
        }
      }
      setApiError('Error al crear la cuenta. Inténtalo de nuevo.');
    }
  }

  return (
    <div className="relative flex min-h-screen w-full items-center justify-center overflow-hidden bg-[#080808]">
      {/* Background */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute left-1/2 top-0 h-[500px] w-[800px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-blue-600/[0.05] blur-[100px]" />
        <div className="absolute bottom-0 right-0 h-[400px] w-[400px] translate-x-1/2 translate-y-1/2 rounded-full bg-blue-900/[0.07] blur-[80px]" />
      </div>
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.018]"
        style={{
          backgroundImage:
            'radial-gradient(circle, rgba(255,255,255,0.8) 1px, transparent 1px)',
          backgroundSize: '32px 32px',
        }}
      />

      <div className="relative w-full max-w-[400px] animate-slide-up px-5 py-8">
        {/* Logo */}
        <div className="mb-8 flex flex-col items-center gap-4">
          <div className="relative flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-blue-700 shadow-glow-blue">
            <Shield className="h-7 w-7 text-white" />
            <div className="absolute inset-0 rounded-2xl ring-1 ring-white/20" />
          </div>
          <div className="text-center">
            <h1 className="text-xl font-semibold tracking-tight text-foreground">
              Crear cuenta
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Únete a FlowRoll hoy
            </p>
          </div>
        </div>

        {/* Card */}
        <div className="rounded-2xl border border-white/[0.07] bg-white/[0.025] p-7 shadow-[0_8px_40px_rgba(0,0,0,0.5)] backdrop-blur-sm">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Name row */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label
                  htmlFor="first_name"
                  className="text-xs font-medium uppercase tracking-wider text-muted-foreground"
                >
                  Nombre
                </Label>
                <Input
                  id="first_name"
                  placeholder="Juan"
                  autoComplete="given-name"
                  {...register('first_name')}
                />
              </div>
              <div className="space-y-2">
                <Label
                  htmlFor="last_name"
                  className="text-xs font-medium uppercase tracking-wider text-muted-foreground"
                >
                  Apellidos
                </Label>
                <Input
                  id="last_name"
                  placeholder="García"
                  autoComplete="family-name"
                  {...register('last_name')}
                />
              </div>
            </div>

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

            {/* Email */}
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
                {...register('email')}
              />
              {errors.email && (
                <p className="text-xs text-destructive">
                  {errors.email.message}
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
                autoComplete="new-password"
                {...register('password')}
              />
              {errors.password && (
                <p className="text-xs text-destructive">
                  {errors.password.message}
                </p>
              )}
            </div>

            {/* Confirm password */}
            <div className="space-y-2">
              <Label
                htmlFor="password_confirm"
                className="text-xs font-medium uppercase tracking-wider text-muted-foreground"
              >
                Confirmar contraseña
              </Label>
              <Input
                id="password_confirm"
                type="password"
                placeholder="••••••••"
                autoComplete="new-password"
                {...register('password_confirm')}
              />
              {errors.password_confirm && (
                <p className="text-xs text-destructive">
                  {errors.password_confirm.message}
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
                  Creando cuenta…
                </>
              ) : (
                'Crear cuenta'
              )}
            </Button>
          </form>
        </div>

        <p className="mt-5 text-center text-sm text-muted-foreground">
          ¿Ya tienes cuenta?{' '}
          <Link
            href="/login"
            className="text-blue-400 hover:text-blue-300 transition-colors"
          >
            Inicia sesión
          </Link>
        </p>

        <p className="mt-4 text-center text-xs text-muted-foreground/50">
          FlowRoll &copy; {new Date().getFullYear()}
        </p>
      </div>
    </div>
  );
}
