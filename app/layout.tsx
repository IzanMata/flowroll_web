import type { Metadata } from 'next';
import { GeistSans } from 'geist/font/sans';
import { GeistMono } from 'geist/font/mono';
import { headers } from 'next/headers';
import QueryProvider from '@/providers/QueryProvider';
import { AuthProvider } from '@/providers/AuthProvider';
import './globals.css';

export const metadata: Metadata = {
  title: 'FlowRoll — BJJ Academy Management',
  description: 'Multi-tenant SaaS para la gestión de academias de BJJ',
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Reading x-nonce causes Next.js to inject the per-request nonce into its
  // own inline bootstrap scripts, enabling nonce-based CSP without unsafe-inline.
  // The nonce is generated and set in middleware.ts.
  const nonce = (await headers()).get('x-nonce') ?? '';
  return (
    <html
      lang="es"
      className={`${GeistSans.variable} ${GeistMono.variable} dark`}
      suppressHydrationWarning
    >
      <body className="min-h-screen bg-background font-sans antialiased">
        <QueryProvider>
          <AuthProvider>{children}</AuthProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
