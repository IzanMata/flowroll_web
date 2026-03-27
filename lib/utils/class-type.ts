import type { ClassType } from '@/types/api';

interface ClassTypeConfig {
  label: string;
  className: string;
  accentClass: string;
}

export const CLASS_TYPE_CONFIG: Record<ClassType, ClassTypeConfig> = {
  GI: {
    label: 'Gi',
    className: 'border-blue-500/30 bg-blue-500/10 text-blue-400',
    accentClass: 'bg-blue-500',
  },
  NOGI: {
    label: 'NoGi',
    className: 'border-purple-500/30 bg-purple-500/10 text-purple-400',
    accentClass: 'bg-purple-500',
  },
  KIDS: {
    label: 'Kids',
    className: 'border-amber-500/30 bg-amber-500/10 text-amber-400',
    accentClass: 'bg-amber-500',
  },
  COMPETITION: {
    label: 'Competición',
    className: 'border-red-500/30 bg-red-500/10 text-red-400',
    accentClass: 'bg-red-500',
  },
  OPEN_MAT: {
    label: 'Open Mat',
    className: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400',
    accentClass: 'bg-emerald-500',
  },
};
