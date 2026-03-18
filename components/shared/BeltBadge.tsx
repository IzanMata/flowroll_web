import { cn } from '@/lib/utils';
import type { BeltColor } from '@/types/api';

interface BeltBadgeProps {
  color: BeltColor;
  stripes?: number;
  size?: 'sm' | 'md';
  className?: string;
}

const BELT_STYLES: Record<BeltColor, string> = {
  WHITE: 'bg-white text-black',
  BLUE: 'bg-blue-600 text-white',
  PURPLE: 'bg-purple-600 text-white',
  BROWN: 'bg-amber-900 text-white',
  BLACK: 'bg-neutral-900 text-white border border-white/20',
};

const BELT_LABELS: Record<BeltColor, string> = {
  WHITE: 'Blanca',
  BLUE: 'Azul',
  PURPLE: 'Morada',
  BROWN: 'Marrón',
  BLACK: 'Negra',
};

export function BeltBadge({
  color,
  stripes = 0,
  size = 'sm',
  className,
}: BeltBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-[4px] font-semibold',
        size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-3 py-1 text-sm',
        BELT_STYLES[color],
        className,
      )}
    >
      {BELT_LABELS[color]}
      {stripes > 0 && (
        <span className="flex gap-0.5">
          {Array.from({ length: stripes }).map((_, i) => (
            <span
              key={i}
              className="inline-block h-2.5 w-0.5 rounded-full bg-current opacity-70"
            />
          ))}
        </span>
      )}
    </span>
  );
}
