'use client';

import { useState } from 'react';
import { BookOpen, Star } from 'lucide-react';
import { useTechniques } from '@/features/techniques/hooks/useTechniques';
import { BeltBadge } from '@/components/shared/BeltBadge';
import { EmptyState } from '@/components/shared/EmptyState';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import type { Technique } from '@/types/api';

// ─────────────────────────────────────────────────────────────────────────────
// Difficulty indicator — filled dots out of 5
// ─────────────────────────────────────────────────────────────────────────────

function DifficultyDots({ difficulty }: { difficulty?: number }) {
  if (!difficulty) return null;
  return (
    <span className="flex items-center gap-0.5" title={`Dificultad ${difficulty}/5`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <span
          key={i}
          className={cn(
            'inline-block h-1.5 w-1.5 rounded-full',
            i < difficulty ? 'bg-amber-400' : 'bg-white/10',
          )}
        />
      ))}
    </span>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Technique card
// ─────────────────────────────────────────────────────────────────────────────

function TechniqueCard({ technique }: { technique: Technique }) {
  return (
    <div className="group flex flex-col gap-3 rounded-xl border border-white/[0.06] bg-card p-4 transition-all duration-200 hover:border-white/[0.1] hover:bg-white/[0.03]">
      <div className="flex items-start justify-between gap-2">
        <h3 className="text-sm font-medium text-foreground leading-snug">
          {technique.name}
        </h3>
        <DifficultyDots difficulty={technique.difficulty} />
      </div>

      {technique.description && (
        <p className="text-xs text-muted-foreground line-clamp-2">
          {technique.description}
        </p>
      )}

      <div className="flex flex-wrap items-center gap-1.5 mt-auto">
        {technique.min_belt && (
          <BeltBadge color={technique.min_belt.color} size="sm" />
        )}
        {technique.categories.map((cat) => (
          <span
            key={cat.id}
            className="inline-flex items-center rounded px-1.5 py-0.5 text-[11px] font-medium border border-white/10 text-muted-foreground"
          >
            {cat.name}
          </span>
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Skeleton card (loading state)
// ─────────────────────────────────────────────────────────────────────────────

function TechniqueCardSkeleton() {
  return (
    <div className="flex flex-col gap-3 rounded-xl border border-white/[0.06] bg-card p-4">
      <div className="flex items-start justify-between gap-2">
        <Skeleton className="h-4 w-40" />
        <Skeleton className="h-3 w-14" />
      </div>
      <Skeleton className="h-3 w-full" />
      <Skeleton className="h-3 w-2/3" />
      <div className="flex gap-1.5 mt-1">
        <Skeleton className="h-5 w-16 rounded" />
        <Skeleton className="h-5 w-20 rounded" />
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Page
// ─────────────────────────────────────────────────────────────────────────────

export default function TechniquesPage() {
  const { data: techniques, isLoading } = useTechniques();
  const [search, setSearch] = useState('');

  const filtered = search.trim()
    ? techniques.filter((t) =>
        t.name.toLowerCase().includes(search.toLowerCase()) ||
        t.description?.toLowerCase().includes(search.toLowerCase()) ||
        t.categories.some((c) =>
          c.name.toLowerCase().includes(search.toLowerCase()),
        ),
      )
    : techniques;

  return (
    <div className="space-y-6 p-6 animate-fade-in">
      {/* Header */}
      <div>
        <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          Biblioteca
        </p>
        <h2 className="mt-1 text-2xl font-semibold tracking-tight text-foreground">
          Técnicas
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Catálogo de técnicas de BJJ
        </p>
      </div>

      {/* Search */}
      <div className="max-w-sm">
        <Input
          placeholder="Buscar técnicas…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Grid */}
      {isLoading ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <TechniqueCardSkeleton key={i} />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={search ? Star : BookOpen}
          title={search ? 'Sin resultados' : 'Sin técnicas'}
          description={
            search
              ? `No se encontraron técnicas para "${search}".`
              : 'No hay técnicas en el catálogo todavía.'
          }
        />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((technique) => (
            <TechniqueCard key={technique.id} technique={technique} />
          ))}
        </div>
      )}
    </div>
  );
}
