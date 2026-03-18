'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  BarChart3,
  BookOpen,
  CalendarDays,
  CreditCard,
  LayoutDashboard,
  MessageSquare,
  Shield,
  Swords,
  Timer,
  Users,
} from 'lucide-react';
import { AcademySelector } from './AcademySelector';
import { cn } from '@/lib/utils';

const NAV_ITEMS = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/athletes', label: 'Atletas', icon: Users },
  { href: '/classes', label: 'Clases', icon: CalendarDays },
  { href: '/matches', label: 'Combates', icon: Swords },
  { href: '/tatami', label: 'Tatami', icon: Timer },
  { href: '/membership', label: 'Membresías', icon: CreditCard },
  { href: '/learning', label: 'Aprendizaje', icon: BookOpen },
  { href: '/community', label: 'Comunidad', icon: MessageSquare },
] as const;

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed inset-y-0 left-0 z-30 flex w-[240px] flex-col border-r border-white/[0.06] bg-[#111111]">
      {/* Logo */}
      <div className="flex h-14 items-center gap-2.5 border-b border-white/[0.06] px-4">
        <div className="flex h-7 w-7 items-center justify-center rounded-[6px] bg-primary">
          <Shield className="h-4 w-4 text-white" />
        </div>
        <span className="text-sm font-semibold tracking-tight text-foreground">
          FlowRoll
        </span>
      </div>

      {/* Academy selector */}
      <div className="border-b border-white/[0.06] px-3 py-3">
        <AcademySelector />
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-2 py-3">
        <ul className="space-y-0.5">
          {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
            const isActive =
              pathname === href || pathname.startsWith(`${href}/`);
            return (
              <li key={href}>
                <Link
                  href={href}
                  className={cn(
                    'group flex h-8 items-center gap-2.5 rounded-[6px] px-2.5 text-sm transition-colors',
                    isActive
                      ? 'bg-primary/10 font-medium text-primary'
                      : 'text-muted-foreground hover:bg-white/5 hover:text-foreground',
                  )}
                >
                  <Icon
                    className={cn(
                      'h-4 w-4 shrink-0',
                      isActive
                        ? 'text-primary'
                        : 'text-muted-foreground group-hover:text-foreground',
                    )}
                  />
                  {label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Footer */}
      <div className="border-t border-white/[0.06] px-3 py-3">
        <div className="flex items-center gap-2 px-1">
          <BarChart3 className="h-3.5 w-3.5 text-muted-foreground" />
          <span className="text-xs text-muted-foreground">v0.1.0</span>
        </div>
      </div>
    </aside>
  );
}
