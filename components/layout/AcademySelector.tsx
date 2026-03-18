'use client';

import { Building2, ChevronsUpDown } from 'lucide-react';
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
      <div className="flex h-9 items-center gap-2 rounded-[6px] border border-white/10 bg-white/5 px-3 text-sm text-muted-foreground">
        <Building2 className="h-4 w-4 shrink-0" />
        <span className="truncate">Sin academia</span>
      </div>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="flex h-9 w-full items-center gap-2 rounded-[6px] border border-white/10 bg-white/5 px-3 text-sm transition-colors hover:bg-white/8 focus:outline-none focus:ring-1 focus:ring-primary">
          <Building2 className="h-4 w-4 shrink-0 text-primary" />
          <span className="flex-1 truncate text-left font-medium text-foreground">
            {activeAcademy.name}
          </span>
          <ChevronsUpDown className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-[220px]">
        <DropdownMenuLabel>Tus academias</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {academies.map((academy) => (
          <DropdownMenuItem
            key={academy.id}
            onClick={() => setActiveAcademy(academy)}
            className={cn(
              activeAcademy.id === academy.id && 'text-primary',
            )}
          >
            <Building2 className="h-4 w-4" />
            <span className="truncate">{academy.name}</span>
            {activeAcademy.id === academy.id && (
              <span className="ml-auto h-1.5 w-1.5 rounded-full bg-primary" />
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
