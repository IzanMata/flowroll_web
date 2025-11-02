import './globals.css';
import { ReactNode } from 'react';

export const metadata = {
  title: 'FlowRoll - Techniques',
  description: 'Catálogo de Techniques de Jiu Jitsu',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="es">
      <body>
        <div className="min-h-screen">
          <header className="bg-white shadow">
            <div className="container mx-auto px-4 py-4">
              <h1 className="text-xl font-semibold">FlowRoll — Techniques</h1>
            </div>
          </header>
          <main className="container mx-auto px-4 py-6">{children}</main>
          <footer className="text-sm text-center py-6 text-gray-500">
            © FlowRoll
          </footer>
        </div>
      </body>
    </html>
  );
}
