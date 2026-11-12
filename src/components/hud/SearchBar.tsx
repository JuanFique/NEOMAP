import { Search, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { CategoriaBadge } from '@/components/ui/badge';
import type { Espacio } from '@/lib/types';

interface Props {
  query: string;
  onQueryChange: (value: string) => void;
  results: Espacio[];
  onPick: (espacio: Espacio) => void;
}

export function SearchBar({ query, onQueryChange, results, onPick }: Props) {
  const [open, setOpen] = useState(false);
  const boxRef = useRef<HTMLDivElement>(null);
  const trimmed = query.trim();

  useEffect(() => {
    const onDown = (ev: PointerEvent) => {
      if (boxRef.current && !boxRef.current.contains(ev.target as Node)) setOpen(false);
    };
    document.addEventListener('pointerdown', onDown);
    return () => document.removeEventListener('pointerdown', onDown);
  }, []);

  return (
    <div ref={boxRef} className="relative">
      <div className="flex h-11 items-center gap-2 rounded-full border border-umng-blue/15 bg-white px-4 shadow-md focus-within:border-umng-blue focus-within:ring-2 focus-within:ring-umng-blue/20">
        <Search className="h-4 w-4 shrink-0 text-umng-blue" aria-hidden />
        <input
          value={query}
          onChange={(ev) => {
            onQueryChange(ev.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={(ev) => {
            if (ev.key === 'Escape') setOpen(false);
            if (ev.key === 'Enter' && results[0]) {
              onPick(results[0]);
              setOpen(false);
            }
          }}
          placeholder="Buscar aula, laboratorio, oficina o servicio..."
          aria-label="Buscar espacios"
          className="h-full min-w-0 flex-1 bg-transparent text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none"
        />
        {query && (
          <button
            type="button"
            onClick={() => onQueryChange('')}
            className="rounded-md p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
            aria-label="Borrar búsqueda"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {open && trimmed && (
        <div className="absolute inset-x-0 top-full z-20 mt-2 max-h-[50dvh] overflow-y-auto rounded-2xl border border-umng-blue/15 bg-white py-1 shadow-lg">
          {results.length === 0 ? (
            <p className="px-4 py-5 text-center text-sm text-slate-500">
              No se encontraron espacios para '{trimmed}'
            </p>
          ) : (
            <ul>
              {results.slice(0, 8).map((e) => (
                <li key={e.id}>
                  <button
                    type="button"
                    onClick={() => {
                      onPick(e);
                      setOpen(false);
                    }}
                    className="flex w-full flex-col gap-1 px-4 py-2.5 text-left hover:bg-umng-ice"
                  >
                    <span className="text-sm font-semibold text-umng-blue">{e.nombre}</span>
                    <span className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                      <CategoriaBadge categoria={e.categoria} className="px-2 py-0 text-[11px]" />
                      Bloque {e.bloque_id} · {e.piso}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
