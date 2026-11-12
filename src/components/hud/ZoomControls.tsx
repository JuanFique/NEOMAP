import { LocateFixed, Minus, Plus } from 'lucide-react';

interface Props {
  onZoomIn: () => void;
  onZoomOut: () => void;
  onReset: () => void;
}

export function ZoomControls({ onZoomIn, onZoomOut, onReset }: Props) {
  const btn = 'flex h-9 w-9 items-center justify-center rounded-full text-umng-blue hover:bg-umng-ice';
  return (
    <div className="flex items-center gap-0.5 rounded-full border border-umng-blue/15 bg-white p-1 shadow-md">
      <button type="button" className={btn} onClick={onZoomOut} aria-label="Alejar" title="Alejar">
        <Minus className="h-4 w-4" />
      </button>
      <button type="button" className={btn} onClick={onZoomIn} aria-label="Acercar" title="Acercar">
        <Plus className="h-4 w-4" />
      </button>
      <span className="mx-0.5 h-5 w-px bg-slate-200" aria-hidden />
      <button type="button" className={btn} onClick={onReset} aria-label="Centrar mapa" title="Centrar mapa">
        <LocateFixed className="h-4 w-4" />
      </button>
    </div>
  );
}
