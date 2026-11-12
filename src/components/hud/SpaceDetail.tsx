import { Building2, Layers, Route, X } from 'lucide-react';
import { Badge, CategoriaBadge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import type { Espacio } from '@/lib/types';
import { EntrancePhoto } from './EntrancePhoto';

interface Props {
  espacio: Espacio;
  routeActive: boolean;
  /** Resumen de la ruta activa; en móvil se muestra dentro del panel. */
  resumen?: string;
  onTrace: () => void;
  onClearRoute: () => void;
  onClose: () => void;
}

/** Panel de detalle: hoja inferior en móvil, tarjeta lateral en escritorio. */
export function SpaceDetail({ espacio, routeActive, resumen, onTrace, onClearRoute, onClose }: Props) {
  return (
    <aside
      className="pointer-events-auto absolute inset-x-0 bottom-0 z-30 max-h-[40dvh] overflow-y-auto rounded-t-2xl border border-slate-200 bg-white shadow-xl sm:inset-x-auto sm:bottom-auto sm:right-4 sm:top-4 sm:max-h-[calc(100dvh-6.5rem)] sm:w-[22rem] sm:rounded-2xl"
      aria-label={`Detalle de ${espacio.nombre}`}
    >
      <div className="sticky top-0 z-10 flex items-start gap-3 bg-white px-4 pb-2 pt-4">
        <div className="min-w-0 flex-1">
          {espacio.codigo && (
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">{espacio.codigo}</p>
          )}
          <h2 className="text-base font-bold leading-snug text-slate-900">{espacio.nombre}</h2>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="rounded-md p-1.5 text-slate-500 hover:bg-slate-100"
          aria-label="Cerrar detalle"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="space-y-3 px-4 pb-4">
        <div className="flex flex-wrap items-center gap-1.5">
          <Badge className="gap-1">
            <Building2 className="h-3 w-3" aria-hidden />
            Bloque {espacio.bloque_id}
          </Badge>
          <Badge className="gap-1">
            <Layers className="h-3 w-3" aria-hidden />
            {espacio.piso}
          </Badge>
          <CategoriaBadge categoria={espacio.categoria} />
        </div>

        {resumen && (
          <p className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-1.5 text-[11px] font-semibold text-slate-700 sm:hidden">
            {resumen}
          </p>
        )}

        <EntrancePhoto url={espacio.imagen_url} alt={`Entrada de ${espacio.nombre}`} />

        {espacio.descripcion && <p className="text-sm leading-relaxed text-slate-600">{espacio.descripcion}</p>}

        {routeActive ? (
          <Button variant="outline" className="w-full" onClick={onClearRoute}>
            <X className="h-4 w-4" aria-hidden />
            Limpiar ruta
          </Button>
        ) : (
          <Button variant="gold" className="w-full" onClick={onTrace}>
            <Route className="h-4 w-4" aria-hidden />
            Trazar ruta desde Entrada Principal
          </Button>
        )}
      </div>
    </aside>
  );
}
