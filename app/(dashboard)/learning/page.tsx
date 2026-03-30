'use client';

import { useQuery } from '@tanstack/react-query';
import { BookOpen, MessageSquare } from 'lucide-react';
import apiClient from '@/lib/api/client';
import { ENDPOINTS } from '@/lib/api/endpoints';
import type { PaginatedResponse, SparringNote, TechniqueNote } from '@/types/api';
import { EmptyState } from '@/components/shared/EmptyState';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

// ─── Rating ───────────────────────────────────────────────────────────────────

function RatingStars({ rating }: { rating: number }) {
  return (
    <span className="flex items-center gap-0.5" title={`${rating}/5`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <span
          key={i}
          className={cn('text-[10px]', i < rating ? 'text-amber-400' : 'text-white/10')}
        >
          ★
        </span>
      ))}
    </span>
  );
}

// ─── Technique Notes ──────────────────────────────────────────────────────────

function TechniqueNoteSkeleton() {
  return (
    <div className="flex flex-col gap-2 rounded-xl border border-white/[0.06] bg-card px-4 py-3.5">
      <div className="flex items-center justify-between gap-2">
        <Skeleton className="h-3.5 w-40" />
        <Skeleton className="h-3 w-20" />
      </div>
      <Skeleton className="h-3 w-full" />
      <Skeleton className="h-3 w-3/4" />
    </div>
  );
}

function TechniqueNoteCard({ note }: { note: TechniqueNote }) {
  const drilledDate = new Date(note.drilled_at).toLocaleDateString('es-ES', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
  return (
    <div className="flex flex-col gap-2 rounded-xl border border-white/[0.06] bg-card px-4 py-3.5 transition-all duration-200 hover:border-white/[0.1] hover:bg-white/[0.03]">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-sm font-medium text-foreground">
            {note.technique.name}
          </p>
          <p className="text-xs text-muted-foreground">{drilledDate}</p>
        </div>
        <RatingStars rating={note.rating} />
      </div>
      {note.note && (
        <p className="text-xs text-muted-foreground leading-relaxed line-clamp-3">
          {note.note}
        </p>
      )}
    </div>
  );
}

// ─── Sparring Notes ───────────────────────────────────────────────────────────

function SparringNoteSkeleton() {
  return (
    <div className="flex flex-col gap-2 rounded-xl border border-white/[0.06] bg-card px-4 py-3.5">
      <div className="flex items-center justify-between gap-2">
        <Skeleton className="h-3.5 w-32" />
        <Skeleton className="h-3 w-20" />
      </div>
      <Skeleton className="h-3 w-full" />
    </div>
  );
}

function SparringNoteCard({ note }: { note: SparringNote }) {
  const noteDate = new Date(note.date).toLocaleDateString('es-ES', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
  const partnerName = note.partner
    ? [note.partner.user.first_name, note.partner.user.last_name]
        .filter(Boolean)
        .join(' ') || note.partner.user.username
    : null;

  return (
    <div className="flex flex-col gap-2 rounded-xl border border-white/[0.06] bg-card px-4 py-3.5 transition-all duration-200 hover:border-white/[0.1] hover:bg-white/[0.03]">
      <div>
        <p className="text-sm font-medium text-foreground">
          {partnerName ? `Sparring con ${partnerName}` : 'Sparring'}
        </p>
        <p className="text-xs text-muted-foreground">{noteDate}</p>
      </div>
      {note.notes && (
        <p className="text-xs text-muted-foreground leading-relaxed line-clamp-3">
          {note.notes}
        </p>
      )}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function LearningPage() {
  const { data: techNotesPage, isLoading: loadingTechNotes } = useQuery<
    PaginatedResponse<TechniqueNote>
  >({
    queryKey: ['learning', 'technique-notes'],
    queryFn: async () => {
      const { data } = await apiClient.get<PaginatedResponse<TechniqueNote>>(
        ENDPOINTS.LEARNING.TECHNIQUE_NOTES,
        { params: { ordering: '-drilled_at', page_size: 50 } },
      );
      return data;
    },
  });

  const { data: sparringNotesPage, isLoading: loadingSparring } = useQuery<
    PaginatedResponse<SparringNote>
  >({
    queryKey: ['learning', 'sparring-notes'],
    queryFn: async () => {
      const { data } = await apiClient.get<PaginatedResponse<SparringNote>>(
        ENDPOINTS.LEARNING.SPARRING_NOTES,
        { params: { ordering: '-date', page_size: 50 } },
      );
      return data;
    },
  });

  const techNotes = techNotesPage?.results ?? [];
  const sparringNotes = sparringNotesPage?.results ?? [];

  return (
    <div className="space-y-10 animate-fade-in">
      <div>
        <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          Diario
        </p>
        <h2 className="mt-1 text-2xl font-semibold tracking-tight text-foreground">
          Aprendizaje
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Tus notas de entrenamiento
        </p>
      </div>

      {/* Technique Notes */}
      <section className="space-y-4">
        <h3 className="text-sm font-medium text-foreground">Notas de técnica</h3>
        {loadingTechNotes ? (
          <div className="grid gap-3 sm:grid-cols-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <TechniqueNoteSkeleton key={i} />
            ))}
          </div>
        ) : techNotes.length === 0 ? (
          <EmptyState
            icon={BookOpen}
            title="Sin notas de técnica"
            description="Aún no has registrado ninguna nota de técnica."
          />
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {techNotes.map((n) => (
              <TechniqueNoteCard key={n.id} note={n} />
            ))}
          </div>
        )}
      </section>

      {/* Sparring Notes */}
      <section className="space-y-4">
        <h3 className="text-sm font-medium text-foreground">Notas de sparring</h3>
        {loadingSparring ? (
          <div className="grid gap-3 sm:grid-cols-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <SparringNoteSkeleton key={i} />
            ))}
          </div>
        ) : sparringNotes.length === 0 ? (
          <EmptyState
            icon={MessageSquare}
            title="Sin notas de sparring"
            description="Aún no has registrado ninguna sesión de sparring."
          />
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {sparringNotes.map((n) => (
              <SparringNoteCard key={n.id} note={n} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
