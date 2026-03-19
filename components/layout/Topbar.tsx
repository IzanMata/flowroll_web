'use client';

import { LogOut, Settings, User } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

function getInitials(username: string): string {
  return username.slice(0, 2).toUpperCase();
}

interface TopbarProps {
  title?: string;
}

export function Topbar({ title }: TopbarProps) {
  const { user, logout } = useAuth();

  return (
    <header className="sticky top-0 z-20 flex h-14 items-center justify-between border-b border-white/[0.05] bg-[#080808]/80 px-6 backdrop-blur-md">
      <div className="flex items-center">
        {title && (
          <h1 className="text-sm font-medium text-foreground">{title}</h1>
        )}
      </div>

      <div className="ml-auto flex items-center">
        {user && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-2.5 rounded-lg px-2 py-1.5 transition-all duration-200 hover:bg-white/[0.05] focus:outline-none">
                <Avatar className="h-7 w-7 ring-1 ring-white/10">
                  <AvatarFallback className="bg-gradient-to-br from-blue-600/30 to-blue-800/20 text-xs font-semibold text-blue-300">
                    {getInitials(user.username)}
                  </AvatarFallback>
                </Avatar>
                <span className="text-sm text-foreground/80">
                  {user.username}
                </span>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-0.5">
                  <p className="text-sm font-medium text-foreground">
                    {user.username}
                  </p>
                  <p className="text-xs text-muted-foreground">ID #{user.id}</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <User className="h-4 w-4" />
                Perfil
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Settings className="h-4 w-4" />
                Ajustes
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-destructive focus:text-destructive"
                onClick={logout}
              >
                <LogOut className="h-4 w-4" />
                Cerrar sesión
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </header>
  );
}
