import { FilterX } from 'lucide-react';
import { CATEGORIA_META } from '@/data/categories';
import { CATEGORIAS, type Categoria } from '@/lib/types';
import { cn } from '@/lib/utils';

interface Props {
  active: Set<Categoria>;
  onToggle: (categoria: Categoria) => void;
  showClear: boolean;
  onClear: () => void;
}

export function CategoryFilters({ active, onToggle, showClear, onClear }: Props) {
  return (
    <div className="-mx-3 flex gap-2 overflow-x-auto px-3 pb-1 sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0">
      {CATEGORIAS.map((categoria) => {
        const meta = CATEGORIA_META[categoria];
        const on = active.has(categoria);
        return (
          <button
            key={categoria}
            type="button"
            aria-pressed={on}
            onClick={() => onToggle(categoria)}
            className={cn(
              'flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold shadow-sm transition-colors',
              on ? meta.pillOn : meta.pillOff,
            )}
          >
            <span
              className="h-2 w-2 rounded-full"
              style={{ backgroundColor: on ? '#FFFFFF' : meta.color }}
              aria-hidden
            />
            {meta.label}
          </button>
        );
      })}
      {showClear && (
        <button
          type="button"
          onClick={onClear}
          className="flex shrink-0 items-center gap-1.5 rounded-full border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-sm hover:bg-slate-50"
        >
          <FilterX className="h-3.5 w-3.5" aria-hidden />
          Limpiar filtros
        </button>
      )}
    </div>
  );
}
