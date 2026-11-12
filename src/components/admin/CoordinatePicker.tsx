import { useRef, type MouseEvent } from 'react';
import {
  BLOQUES,
  BLOQUE_BY_ID,
  COMPLEJO,
  VISTAS,
  zonasDePiso,
  type Pt,
} from '@/data/campus';
import { centroid } from '@/lib/iso';
import type { BloqueId, Piso } from '@/lib/types';

interface Props {
  bloque: BloqueId;
  piso: Piso;
  x: number;
  y: number;
  color: string;
  onPick: (x: number, y: number) => void;
}

const pts = (poly: Pt[]) => poly.map(([px, py]) => `${px},${py}`).join(' ');

/**
 * Plano en planta del bloque y piso elegidos. Un clic fija (coord_x, coord_y)
 * en las mismas coordenadas que usa el mapa isométrico.
 */
export function CoordinatePicker({ bloque, piso, x, y, color, onPick }: Props) {
  const svgRef = useRef<SVGSVGElement>(null);
  const info = BLOQUE_BY_ID[bloque];
  const vista = VISTAS[info.zona];
  const zonas = zonasDePiso(piso).filter((z) => BLOQUE_BY_ID[z.bloque].zona === info.zona);
  const vecinos = BLOQUES.filter((b) => b.zona === info.zona && b.id !== bloque);

  const onClick = (ev: MouseEvent<SVGSVGElement>) => {
    const svg = svgRef.current;
    const ctm = svg?.getScreenCTM();
    if (!svg || !ctm) return;
    const p = svg.createSVGPoint();
    p.x = ev.clientX;
    p.y = ev.clientY;
    const w = p.matrixTransform(ctm.inverse());
    onPick(Math.round(w.x * 10) / 10, Math.round(w.y * 10) / 10);
  };

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-[#DCE8CF]">
      <svg
        ref={svgRef}
        viewBox={`${vista.x0} ${vista.y0} ${vista.x1 - vista.x0} ${vista.y1 - vista.y0}`}
        className="mx-auto block max-h-[26rem] w-full cursor-crosshair"
        onClick={onClick}
        role="img"
        aria-label={`Plano del Bloque ${bloque}, ${piso}. Haz clic para ubicar el espacio.`}
      >
        {info.zona === 'complejo' ? (
          <polygon points={pts(COMPLEJO)} fill="#F1E9DF" stroke="#D3CABA" strokeWidth={0.3} />
        ) : (
          <rect x={vista.x0} y={vista.y0} width={vista.x1 - vista.x0} height={vista.y1 - vista.y0} fill="#E3C2A8" />
        )}

        {vecinos.flatMap((b) =>
          b.parts.map((part) => (
            <polygon key={part.id} points={pts(part.poly)} fill="#F8FAFC" stroke="#CBD5E1" strokeWidth={0.3} opacity={0.8} />
          )),
        )}
        {info.parts.map((part) => (
          <polygon key={part.id} points={pts(part.poly)} fill="#FFFFFF" stroke="#043074" strokeWidth={0.7} />
        ))}

        {zonas.map((zona) => {
          const [cx, cy] = centroid(zona.poly);
          const xs = zona.poly.map((p) => p[0]);
          const w = Math.max(...xs) - Math.min(...xs);
          const own = zona.bloque === bloque;
          const size = zona.label ? Math.min(2.2, Math.max(1, (w * 0.9) / (zona.label.length * 0.55))) : 0;
          return (
            <g key={zona.id} opacity={own ? 1 : 0.55} pointerEvents="none">
              <polygon points={pts(zona.poly)} fill={own ? '#EFF6FF' : 'none'} stroke="#94A3B8" strokeWidth={0.25} />
              {zona.label && (
                <text x={cx} y={cy} fontSize={size} textAnchor="middle" dominantBaseline="central" fill="#475569" fontWeight={600}>
                  {zona.label}
                </text>
              )}
            </g>
          );
        })}

        {vecinos.map((b) => {
          const [cx, cy] = centroid(b.parts[0].poly);
          return (
            <text key={b.id} x={cx} y={cy} fontSize={3} textAnchor="middle" dominantBaseline="central" fill="#94A3B8" fontWeight={700} opacity={zonas.length ? 0 : 1} pointerEvents="none">
              {b.id}
            </text>
          );
        })}

        {/* Pin de vista previa */}
        <g transform={`translate(${x},${y})`} pointerEvents="none">
          <circle r={3.4} fill={color} opacity={0.2} />
          <path d="M0,0 C-1.300,-1.800 -2.100,-2.800 -2.100,-3.900 A2.100,2.100 0 1 1 2.100,-3.900 C2.100,-2.800 1.300,-1.800 0,0 Z" fill={color} stroke="#FFFFFF" strokeWidth={0.35} />
          <circle cy={-3.9} r={0.75} fill="#FFFFFF" />
        </g>
      </svg>
      <p className="border-t border-slate-200 bg-white px-3 py-1.5 text-[11px] text-slate-500">
        Haz clic en el plano para ubicar el pin · x: <b>{x.toFixed(1)}</b> · y: <b>{y.toFixed(1)}</b>
      </p>
    </div>
  );
}
