'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2, Shield } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { isAxiosError } from 'axios';

const loginSchema = z.object({
  username: z.string().min(1, 'El usuario es obligatorio'),
  password: z.string().min(1, 'La contraseña es obligatoria'),
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
      if (isAxiosError(err)) {
        const detail = err.response?.data?.detail as string | undefined;
        setApiError(
          detail ?? 'Credenciales incorrectas. Inténtalo de nuevo.',
        );
      } else {
        setApiError('Error inesperado. Inténtalo de nuevo.');
      }
    }
  }

  return (
    <div className="w-full max-w-[360px] space-y-8 px-4">
      {/* Logo */}
      <div className="flex flex-col items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-[6px] bg-primary shadow-[0_0_24px_rgba(59,130,246,0.3)]">
          <Shield className="h-6 w-6 text-white" />
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

      {/* Form card */}
      <div className="rounded-[6px] bg-card p-6 shadow-[0_0_0_1px_rgba(255,255,255,0.06)]">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="username">Usuario</Label>
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

          <div className="space-y-1.5">
            <Label htmlFor="password">Contraseña</Label>
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

          {apiError && (
            <div className="rounded-[4px] border border-destructive/30 bg-destructive/10 px-3 py-2">
              <p className="text-xs text-destructive">{apiError}</p>
            </div>
          )}

          <Button type="submit" className="w-full" disabled={isSubmitting}>
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
      </div>

      <p className="text-center text-xs text-muted-foreground">
        FlowRoll &copy; {new Date().getFullYear()}
      </p>
    </div>
  );
}
