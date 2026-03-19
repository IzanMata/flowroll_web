'use client';

import { Building2, ChevronsUpDown, Check } from 'lucide-react';
import { useAcademy } from '@/hooks/useAcademy';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

export function AcademySelector() {
  const { activeAcademy, academies, isLoading, setActiveAcademy } =
    useAcademy();

  if (isLoading) {
    return <Skeleton className="h-9 w-full" />;
  }

  if (!activeAcademy) {
    return (
      <div className="flex h-9 items-center gap-2 rounded-lg border border-white/[0.07] bg-white/[0.03] px-3 text-sm text-muted-foreground">
        <Building2 className="h-3.5 w-3.5 shrink-0" />
        <span className="truncate">Sin academia</span>
      </div>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="flex h-9 w-full items-center gap-2 rounded-lg border border-white/[0.07] bg-white/[0.03] px-3 text-sm transition-all duration-200 hover:border-white/[0.12] hover:bg-white/[0.06] focus:outline-none focus:ring-2 focus:ring-primary/20">
          <Building2 className="h-3.5 w-3.5 shrink-0 text-blue-400" />
          <span className="flex-1 truncate text-left font-medium text-foreground">
            {activeAcademy.name}
          </span>
          <ChevronsUpDown className="h-3 w-3 shrink-0 text-muted-foreground/60" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-[220px]">
        <DropdownMenuLabel className="text-xs text-muted-foreground">
          Tus academias
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {academies.map((academy) => (
          <DropdownMenuItem
            key={academy.id}
            onClick={() => setActiveAcademy(academy)}
            className={cn(
              'cursor-pointer',
              activeAcademy.id === academy.id && 'text-primary',
            )}
          >
            <Building2 className="h-4 w-4 shrink-0" />
            <span className="flex-1 truncate">{academy.name}</span>
            {activeAcademy.id === academy.id && (
              <Check className="h-3.5 w-3.5 text-primary" />
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
