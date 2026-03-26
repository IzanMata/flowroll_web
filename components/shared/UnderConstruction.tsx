import { Construction } from 'lucide-react';

interface UnderConstructionProps {
  title: string;
}

export function UnderConstruction({ title }: UnderConstructionProps) {
  return (
    <div className="flex min-h-[40vh] flex-col items-center justify-center gap-3 text-center">
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10">
        <Construction className="h-5 w-5 text-amber-400" />
      </div>
      <div>
        <h2 className="text-lg font-semibold text-foreground">{title}</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Módulo en desarrollo.
        </p>
      </div>
    </div>
  );
}
