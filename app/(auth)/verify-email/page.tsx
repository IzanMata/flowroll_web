'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { CheckCircle, Loader2, Mail, Shield, XCircle } from 'lucide-react';
import apiClient from '@/lib/api/client';
import { ENDPOINTS } from '@/lib/api/endpoints';
import { Button } from '@/components/ui/button';

type PageState = 'pending_token' | 'verifying' | 'success' | 'error' | 'check_email';

export default function VerifyEmailPage() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const email = searchParams.get('email');

  const [state, setState] = useState<PageState>(
    token ? 'verifying' : 'check_email',
  );
  const [resending, setResending] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);
  const [resendError, setResendError] = useState<string | null>(null);

  // Auto-verify when token is in URL
  useEffect(() => {
    if (!token) return;

    setState('verifying');
    apiClient
      .post(ENDPOINTS.AUTH.VERIFY_EMAIL, { token })
      .then(() => setState('success'))
      .catch(() => setState('error'));
  }, [token]);

  async function handleResend() {
    if (!email) return;
    setResending(true);
    setResendError(null);
    setResendSuccess(false);
    try {
      await apiClient.post(ENDPOINTS.AUTH.RESEND_VERIFICATION, { email });
      setResendSuccess(true);
    } catch {
      setResendError('No se pudo reenviar el email. Inténtalo más tarde.');
    } finally {
      setResending(false);
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

      <div className="relative w-full max-w-[400px] animate-slide-up px-5">
        {/* Logo */}
        <div className="mb-8 flex justify-center">
          <div className="relative flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-blue-700 shadow-glow-blue">
            <Shield className="h-7 w-7 text-white" />
            <div className="absolute inset-0 rounded-2xl ring-1 ring-white/20" />
          </div>
        </div>

        <div className="rounded-2xl border border-white/[0.07] bg-white/[0.025] p-8 shadow-[0_8px_40px_rgba(0,0,0,0.5)] backdrop-blur-sm text-center">
          {state === 'verifying' && (
            <div className="flex flex-col items-center gap-4">
              <Loader2 className="h-10 w-10 animate-spin text-blue-400" />
              <p className="text-sm text-muted-foreground">Verificando tu email…</p>
            </div>
          )}

          {state === 'success' && (
            <div className="flex flex-col items-center gap-4">
              <CheckCircle className="h-10 w-10 text-emerald-400" />
              <div>
                <h2 className="text-lg font-semibold text-foreground">
                  Email verificado
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Tu cuenta está activa. Ya puedes iniciar sesión.
                </p>
              </div>
              <Button asChild className="w-full">
                <Link href="/login">Iniciar sesión</Link>
              </Button>
            </div>
          )}

          {state === 'error' && (
            <div className="flex flex-col items-center gap-4">
              <XCircle className="h-10 w-10 text-red-400" />
              <div>
                <h2 className="text-lg font-semibold text-foreground">
                  Enlace inválido
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  El enlace de verificación ha expirado o no es válido.
                </p>
              </div>
              {email ? (
                <div className="w-full space-y-3">
                  {resendSuccess ? (
                    <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/[0.07] px-4 py-3">
                      <p className="text-sm text-emerald-400">
                        Email reenviado. Revisa tu bandeja de entrada.
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
                        className="w-full"
                        variant="outline"
                        onClick={handleResend}
                        disabled={resending}
                      >
                        {resending ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Reenviando…
                          </>
                        ) : (
                          'Reenviar email de verificación'
                        )}
                      </Button>
                    </>
                  )}
                  <Button asChild variant="ghost" className="w-full">
                    <Link href="/login">Volver al inicio de sesión</Link>
                  </Button>
                </div>
              ) : (
                <Button asChild variant="outline" className="w-full">
                  <Link href="/login">Volver al inicio de sesión</Link>
                </Button>
              )}
            </div>
          )}

          {state === 'check_email' && (
            <div className="flex flex-col items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-blue-500/10">
                <Mail className="h-7 w-7 text-blue-400" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-foreground">
                  Revisa tu email
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  {email ? (
                    <>
                      Te hemos enviado un enlace de verificación a{' '}
                      <span className="font-medium text-foreground">{email}</span>.
                    </>
                  ) : (
                    'Te hemos enviado un enlace de verificación a tu email.'
                  )}
                </p>
              </div>

              {email && (
                <div className="w-full space-y-3">
                  {resendSuccess ? (
                    <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/[0.07] px-4 py-3">
                      <p className="text-sm text-emerald-400">
                        Email reenviado. Revisa tu bandeja de entrada.
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
                        className="w-full"
                        variant="outline"
                        onClick={handleResend}
                        disabled={resending}
                      >
                        {resending ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Reenviando…
                          </>
                        ) : (
                          'Reenviar email'
                        )}
                      </Button>
                    </>
                  )}
                </div>
              )}

              <Button asChild variant="ghost" className="w-full">
                <Link href="/login">Volver al inicio de sesión</Link>
              </Button>
            </div>
          )}
        </div>

        <p className="mt-6 text-center text-xs text-muted-foreground/50">
          FlowRoll &copy; {new Date().getFullYear()}
        </p>
      </div>
    </div>
  );
}
