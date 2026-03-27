export function getCapacityColor(count: number, max: number): string {
  if (max === 0) return 'text-muted-foreground';
  const ratio = count / max;
  if (ratio >= 0.9) return 'text-red-400';
  if (ratio >= 0.7) return 'text-amber-400';
  return 'text-emerald-400';
}
