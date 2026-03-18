'use client';

import type { Technique } from '@/types/technique';

export const TechniqueCard = ({ technique }: { technique: Technique }) => {
  return (
    <div className="rounded-[6px] border border-white/10 bg-card p-4">
      <p className="text-sm font-medium text-foreground">{technique.name}</p>
      {technique.description && (
        <p className="mt-1 text-xs text-muted-foreground">{technique.description}</p>
      )}
    </div>
  );
};
