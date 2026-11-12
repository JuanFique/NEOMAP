import { Layers } from 'lucide-react';
import { PISOS, PISO_SHORT, type Piso } from '@/lib/types';
import { cn } from '@/lib/utils';

interface Props {
  active: Piso | null;
  onChange: (piso: Piso | null) => void;
  /** En móvil se muestra como barra horizontal compacta. */
  horizontal?: boolean;
}

/** Selector flotante de piso; "Campus" muestra los edificios completos. */
export function FloorSelector({ active, onChange, horizontal = false }: Props) {
  const item = cn(
    'flex h-9 items-center justify-center rounded-full px-3 text-[11px] font-bold uppercase tracking-wide transition-colors',
    horizontal && 'min-w-0 flex-1',
  );
  const pisos = horizontal ? PISOS : [...PISOS].reverse();
  return (
    <div
      className={cn(
        'flex gap-1 rounded-3xl border border-umng-blue/15 bg-white p-1.5 shadow-md',
        horizontal ? 'flex-row' : 'flex-col',
      )}
      role="group"
      aria-label="Selector de piso"
    >
      <button
        type="button"
        aria-pressed={active === null}
        onClick={() => onChange(null)}
        className={cn(item, 'gap-1', active === null ? 'bg-umng-yellow text-umng-blue' : 'text-umng-blue hover:bg-umng-ice')}
        title="Vista completa del campus"
      >
        <Layers className="h-3.5 w-3.5" aria-hidden />
        <span className="hidden sm:inline">Campus</span>
      </button>
      {pisos.map((piso) => (
        <button
          key={piso}
          type="button"
          aria-pressed={active === piso}
          onClick={() => onChange(piso)}
          className={cn(item, active === piso ? 'bg-umng-blue text-white' : 'text-umng-blue hover:bg-umng-ice')}
          title={piso}
        >
          <span className="sm:hidden">{PISO_SHORT[piso]}</span>
          <span className="hidden sm:inline">{piso}</span>
        </button>
      ))}
    </div>
  );
}
