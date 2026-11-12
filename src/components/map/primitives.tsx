import type { Palette, Pt } from '@/data/campus';
import { COS30, SIN30, isoToScreen, pointsAttr } from '@/lib/iso';

interface Edge {
  a: Pt;
  b: Pt;
  kind: 'left' | 'right';
}

/**
 * Aristas cuya cara exterior mira a la cámara (suroccidente). Con `front = false`
 * devuelve las opuestas, que son las paredes interiores visibles de un foso.
 */
export function facingEdges(poly: Pt[], front = true): Edge[] {
  let area = 0;
  for (let i = 0; i < poly.length; i++) {
    const [x0, y0] = poly[i];
    const [x1, y1] = poly[(i + 1) % poly.length];
    area += x0 * y1 - x1 * y0;
  }
  const sign = area >= 0 ? 1 : -1;
  const edges: Edge[] = [];
  for (let i = 0; i < poly.length; i++) {
    const a = poly[i];
    const b = poly[(i + 1) % poly.length];
    const nx = (b[1] - a[1]) * sign;
    const ny = -(b[0] - a[0]) * sign;
    const facing = -nx + ny;
    if (front ? facing > 1e-9 : facing < -1e-9) {
      const westish = front ? nx < 0 && Math.abs(nx) >= Math.abs(ny) : ny < 0;
      edges.push({ a, b, kind: westish ? 'left' : 'right' });
    }
  }
  return edges;
}

function quad(a: Pt, b: Pt, z0: number, z1: number): string {
  const p = [isoToScreen(a[0], a[1], z0), isoToScreen(b[0], b[1], z0), isoToScreen(b[0], b[1], z1), isoToScreen(a[0], a[1], z1)];
  return p.map((q) => `${q.x.toFixed(2)},${q.y.toFixed(2)}`).join(' ');
}

interface SolidProps {
  poly: Pt[];
  z0: number;
  z1: number;
  palette: Palette;
  /** Alturas de las líneas divisorias entre pisos. */
  lines?: number[];
  opacity?: number;
}

export function SolidPrism({ poly, z0, z1, palette, lines = [], opacity = 1 }: SolidProps) {
  const edges = facingEdges(poly);
  return (
    <g opacity={opacity}>
      {edges.map((e, i) => (
        <g key={i}>
          <polygon
            points={quad(e.a, e.b, z0, z1)}
            fill={e.kind === 'left' ? palette.left : palette.right}
            stroke={palette.line}
            strokeWidth={0.8}
            strokeLinejoin="round"
            vectorEffect="non-scaling-stroke"
          />
          {lines.map((lz) => {
            const p = isoToScreen(e.a[0], e.a[1], lz);
            const q = isoToScreen(e.b[0], e.b[1], lz);
            return (
              <line
                key={lz}
                x1={p.x}
                y1={p.y}
                x2={q.x}
                y2={q.y}
                stroke={palette.line}
                strokeWidth={0.7}
                opacity={0.8}
                vectorEffect="non-scaling-stroke"
              />
            );
          })}
        </g>
      ))}
      <polygon
        points={pointsAttr(poly, z1)}
        fill={palette.roof}
        stroke={palette.line}
        strokeWidth={0.8}
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
      />
    </g>
  );
}

/** Contorno fantasma (alambre punteado) de un piso que queda por encima del corte. */
export function GhostPrism({ poly, z0, z1, opacity = 0.55 }: { poly: Pt[]; z0: number; z1: number; opacity?: number }) {
  return (
    <g
      fill="none"
      stroke="#94A3B8"
      strokeWidth={1}
      strokeDasharray="4 4"
      opacity={opacity}
      pointerEvents="none"
    >
      <polygon points={pointsAttr(poly, z1)} vectorEffect="non-scaling-stroke" />
      {poly.map(([x, y], i) => {
        const p = isoToScreen(x, y, z0);
        const q = isoToScreen(x, y, z1);
        return <line key={i} x1={p.x} y1={p.y} x2={q.x} y2={q.y} vectorEffect="non-scaling-stroke" />;
      })}
    </g>
  );
}

/** Paredes interiores del foso del Sótano. */
export function PitWalls({ poly, depth }: { poly: Pt[]; depth: number }) {
  return (
    <g>
      {facingEdges(poly, false).map((e, i) => (
        <polygon
          key={i}
          points={quad(e.a, e.b, -depth, 0)}
          fill={e.kind === 'left' ? '#D3CABA' : '#C6BCA9'}
          stroke="#B5AA95"
          strokeWidth={0.8}
          vectorEffect="non-scaling-stroke"
        />
      ))}
    </g>
  );
}

/** Matriz SVG que acuesta un texto sobre el plano del piso, a lo largo de x o de y. */
export function planeMatrix(x: number, y: number, z: number, along: 'x' | 'y'): string {
  const p = isoToScreen(x, y, z);
  return along === 'x'
    ? `matrix(${COS30},${-SIN30},${COS30},${SIN30},${p.x},${p.y})`
    : `matrix(${COS30},${SIN30},${-COS30},${SIN30},${p.x},${p.y})`;
}

interface PillProps {
  x: number;
  y: number;
  inv: number;
  text: string;
  dy?: number;
}

/** Etiqueta flotante blanca tipo píldora; mantiene su tamaño al hacer zoom. */
export function Pill({ x, y, inv, text, dy = 0 }: PillProps) {
  const w = text.length * 6.9 + 24;
  return (
    <g transform={`translate(${x},${y}) scale(${inv})`} pointerEvents="none">
      <g transform={`translate(0,${dy})`} filter="url(#neomap-shadow)">
        <rect x={-w / 2} y={-12} width={w} height={24} rx={12} fill="#FFFFFF" stroke="#D5DCEA" />
        <text
          y={4}
          textAnchor="middle"
          fontSize={12}
          fontWeight={600}
          fill="#043074"
          style={{ fontFamily: 'inherit' }}
        >
          {text}
        </text>
      </g>
    </g>
  );
}

interface PinProps {
  x: number;
  y: number;
  inv: number;
  color: string;
  dim?: boolean;
  selected?: boolean;
  title: string;
  onClick?: () => void;
}

export function Pin({ x, y, inv, color, dim, selected, title, onClick }: PinProps) {
  const k = selected ? 1.3 : 1;
  return (
    <g
      transform={`translate(${x},${y}) scale(${inv * k})`}
      opacity={dim ? 0.22 : 1}
      style={{ cursor: 'pointer' }}
      onClick={(ev) => {
        ev.stopPropagation();
        onClick?.();
      }}
      role="button"
      aria-label={title}
    >
      <title>{title}</title>
      <ellipse cx={0} cy={0} rx={5} ry={2.2} fill="#0F172A" opacity={0.18} />
      <path
        d="M0,0 C-6,-8 -9.500,-12.500 -9.500,-17.500 A9.500,9.500 0 1 1 9.500,-17.500 C9.500,-12.500 6,-8 0,0 Z"
        fill={color}
        stroke="#FFFFFF"
        strokeWidth={1.6}
      />
      <circle cx={0} cy={-17.5} r={3.4} fill="#FFFFFF" />
      {/* Área táctil ampliada */}
      <rect x={-14} y={-30} width={28} height={34} fill="transparent" />
    </g>
  );
}

interface CalloutProps {
  x: number;
  y: number;
  inv: number;
  title: string;
  subtitle: string;
}

/** Globo azul marino anclado sobre el pin de destino. */
export function Callout({ x, y, inv, title, subtitle }: CalloutProps) {
  const t = title.length > 34 ? `${title.slice(0, 33)}…` : title;
  const w = Math.max(t.length * 7.1, subtitle.length * 6.2) + 28;
  const h = 44;
  const top = -40 - h;
  return (
    <g transform={`translate(${x},${y}) scale(${inv})`} pointerEvents="none">
      <g filter="url(#neomap-shadow)">
        <rect x={-w / 2} y={top} width={w} height={h} rx={10} fill="#043074" />
        <rect x={-w / 2 + 10} y={top + h - 3} width={w - 20} height={3} rx={1.5} fill="#FDC600" />
        <path d={`M-7,${top + h - 1} L0,${top + h + 8} L7,${top + h - 1} Z`} fill="#043074" />
      </g>
      <text x={0} y={top + 19} textAnchor="middle" fontSize={13} fontWeight={700} fill="#FFFFFF">
        {t}
      </text>
      <text x={0} y={top + 35} textAnchor="middle" fontSize={11} fontWeight={600} fill="#FDC600">
        {subtitle}
      </text>
    </g>
  );
}

export function Tree({ x, y }: { x: number; y: number }) {
  const base = isoToScreen(x, y, 0);
  const top = isoToScreen(x, y, 4.6);
  return (
    <g pointerEvents="none">
      <ellipse cx={base.x} cy={base.y} rx={2.6} ry={1.2} fill="#0F172A" opacity={0.1} />
      <line x1={base.x} y1={base.y} x2={top.x} y2={top.y + 1} stroke="#6B5545" strokeWidth={0.5} strokeLinecap="round" />
      <circle cx={top.x} cy={top.y} r={2.6} fill="#4F8F5B" />
      <circle cx={top.x + 0.9} cy={top.y + 0.8} r={2.6} fill="#3B7548" opacity={0.4} />
      <circle cx={top.x - 0.8} cy={top.y - 0.9} r={1.1} fill="#7DB786" opacity={0.75} />
    </g>
  );
}

/** Símbolo de escaleras: tres trazos paralelos decrecientes, como en los planos. */
export function StairSymbol({ x, y, len, z }: { x: number; y: number; len: number; z: number }) {
  const lines = [
    { dx: 0, l: len, w: 2.4 },
    { dx: 1, l: len * 0.78, w: 2 },
    { dx: 2, l: len * 0.5, w: 1.6 },
  ];
  return (
    <g pointerEvents="none">
      {lines.map((ln, i) => {
        const off = (len - ln.l) / 2;
        const p = isoToScreen(x + ln.dx, y + off, z);
        const q = isoToScreen(x + ln.dx, y + off + ln.l, z);
        return (
          <line
            key={i}
            x1={p.x}
            y1={p.y}
            x2={q.x}
            y2={q.y}
            stroke="#334155"
            strokeWidth={ln.w}
            strokeLinecap="butt"
            vectorEffect="non-scaling-stroke"
          />
        );
      })}
    </g>
  );
}

/** Letrero cuadrado con la letra del bloque, sobre la fachada de acceso. */
export function DoorSign({ x, y, inv, letra, color }: { x: number; y: number; inv: number; letra: string; color: string }) {
  return (
    <g transform={`translate(${x},${y}) scale(${inv})`} pointerEvents="none">
      <rect x={-8} y={-8} width={16} height={16} rx={3} fill={color} stroke="#FFFFFF" strokeWidth={1.5} />
      <text y={4} textAnchor="middle" fontSize={11} fontWeight={800} fill="#FFFFFF">
        {letra}
      </text>
    </g>
  );
}
