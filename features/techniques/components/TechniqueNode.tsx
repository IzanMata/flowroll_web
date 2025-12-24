'use client';

import { Technique } from '@/types/technique';

export function TechniqueNode({ technique }: { technique: Technique }) {
  return (
    <div className="w-32 h-32 bg-blue-500 text-white rounded-full flex items-center justify-center shadow-lg hover:scale-105 transition">
      {technique.name} {technique.id}
    </div>
  );
}
