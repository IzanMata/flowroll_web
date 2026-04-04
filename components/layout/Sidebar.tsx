'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  BarChart2,
  BookOpen,
  CalendarDays,
  CreditCard,
  LayoutDashboard,
  MessageSquare,
  Settings,
  Shield,
  Swords,
  Timer,
  Trophy,
  Users,
  Zap,
} from 'lucide-react';
import { AcademySelector } from './AcademySelector';
import { cn } from '@/lib/utils';

const NAV_ITEMS = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/athletes', label: 'Atletas', icon: Users },
  { href: '/classes', label: 'Clases', icon: CalendarDays },
  { href: '/matches', label: 'Combates', icon: Swords },
  { href: '/competitions', label: 'Competiciones', icon: Trophy },
  { href: '/stats', label: 'Estadísticas', icon: BarChart2 },
  { href: '/tatami', label: 'Tatami', icon: Timer },
  { href: '/membership', label: 'Membresías', icon: CreditCard },
  { href: '/learning', label: 'Aprendizaje', icon: BookOpen },
  { href: '/community', label: 'Comunidad', icon: MessageSquare },
  { href: '/settings', label: 'Configuración', icon: Settings },
] as const;

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed inset-y-0 left-0 z-30 flex w-[240px] flex-col border-r border-white/[0.05] bg-[#080808]">
      {/* Logo */}
      <div className="flex h-14 items-center gap-3 border-b border-white/[0.05] px-4">
        <div className="relative flex h-7 w-7 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 shadow-glow-blue-sm">
          <Shield className="h-3.5 w-3.5 text-white" />
          <div className="absolute inset-0 rounded-xl ring-1 ring-white/20" />
        </div>
        <span className="text-sm font-semibold tracking-tight text-foreground">
          FlowRoll
        </span>
      </div>

      {/* Academy selector */}
      <div className="border-b border-white/[0.05] px-3 py-3">
        <AcademySelector />
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-2 py-4">
        <ul className="space-y-0.5">
          {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
            const isActive =
              pathname === href || pathname.startsWith(`${href}/`);
            return (
              <li key={href}>
                <Link
                  href={href}
                  className={cn(
                    'group relative flex h-9 items-center gap-2.5 rounded-lg px-2.5 text-sm transition-all duration-200',
                    isActive
                      ? 'bg-blue-500/[0.1] font-medium text-blue-400'
                      : 'text-muted-foreground hover:bg-white/[0.04] hover:text-foreground',
                  )}
                >
                  {isActive && (
                    <span className="absolute left-0 top-1/2 h-5 w-0.5 -translate-y-1/2 rounded-full bg-blue-500" />
                  )}
                  <Icon
                    className={cn(
                      'h-4 w-4 shrink-0 transition-colors duration-200',
                      isActive
                        ? 'text-blue-400'
                        : 'text-muted-foreground/60 group-hover:text-foreground',
                    )}
                  />
                  <span className="truncate">{label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Footer */}
      <div className="border-t border-white/[0.05] px-4 py-3">
        <div className="flex items-center gap-2">
          <Zap className="h-3 w-3 text-emerald-500" />
          <span className="text-xs text-muted-foreground">v0.1.0</span>
        </div>
      </div>
    </aside>
  );
}
