import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
} from 'react';
import { CATEGORIA_META } from '@/data/categories';
import {
  ARBOLES_FONDO,
  ARBOLES_FRENTE,
  CANCHAS,
  COMPLEJO,
  EDIFICIOS,
  ENTRADA,
  ESCALERAS,
  ESCENA,
  PARQUEO,
  SUELOS,
  zonasDePiso,
  type Estructura,
  type Pt,
  type Zona,
} from '@/data/campus';
import {
  FLOOR_H,
  centroid,
  isoToScreen,
  pointInPolygon,
  pointsAttr,
  screenToIso,
  type WorldPt,
} from '@/lib/iso';
import type { Ruta } from '@/lib/route';
import { PISO_LEVEL, PISO_SHORT, type Espacio, type Piso } from '@/lib/types';
import { clamp } from '@/lib/utils';
import {
  Callout,
  DoorSign,
  GhostPrism,
  Pill,
  Pin,
  PitWalls,
  SolidPrism,
  StairSymbol,
  Tree,
  planeMatrix,
} from './primitives';

export const MIN_ZOOM = 0.6;
export const MAX_ZOOM = 3;

export interface FitOptions {
  maxZoom?: number;
  /** Píxeles tapados por paneles flotantes, para centrar en el área libre. */
  padRight?: number;
  padBottom?: number;
  padTop?: number;
}

export interface CampusMapHandle {
  zoomIn: () => void;
  zoomOut: () => void;
  reset: () => void;
  fitWorld: (points: WorldPt[], options?: FitOptions) => void;
}

interface Props {
  espacios: Espacio[];
  activeFloor: Piso | null;
  selectedId: string | null;
  /** Ids que cumplen búsqueda/filtros; `null` cuando no hay filtro activo. */
  matchIds: Set<string> | null;
  route: Ruta | null;
  onSelect: (espacio: Espacio) => void;
  onBackgroundClick?: () => void;
}

interface Cam {
  k: number;
  cx: number;
  cy: number;
}

/* Encuadre general del campus en coordenadas de pantalla isométrica. */
const BOUNDS = (() => {
  const pts = [
    isoToScreen(-58, 11),
    isoToScreen(-66, 146),
    isoToScreen(17, 182),
    isoToScreen(124, 172),
    isoToScreen(122, 10),
    isoToScreen(27, 10),
    isoToScreen(117, 10, 5 * FLOOR_H),
    isoToScreen(87, 10, 5 * FLOOR_H),
  ];
  const xs = pts.map((p) => p.x);
  const ys = pts.map((p) => p.y);
  const x0 = Math.min(...xs);
  const x1 = Math.max(...xs);
  const y0 = Math.min(...ys);
  const y1 = Math.max(...ys);
  return { w: x1 - x0, h: y1 - y0, cx: (x0 + x1) / 2, cy: (y0 + y1) / 2 };
})();

const HOME: Cam = { k: 1, cx: BOUNDS.cx, cy: BOUNDS.cy };

/** Rótulos sobre la cubierta en la vista completa del campus. */
const LABEL_AT: Record<string, Pt | undefined> = {
  A: [43.5, 148.5],
  B: [67, 106],
  C: [67, 64],
  D: [67, 22],
  E: [102, 52],
  Pasillo: [37, 88],
};

/** Con un piso en corte los rótulos salen del edificio para no tapar salas ni pines. */
const LABEL_AT_CORTE: Record<string, Pt | undefined> = {
  A: [43.5, 166],
  B: [20, 100],
  C: [20, 64],
  D: [20, 28],
  E: [122, 52],
  Pasillo: [37, 123],
};

function niveles(e: Estructura): number[] {
  return e.pisos.map((p) => PISO_LEVEL[p]);
}

/** Vértice más cercano a la cámara, donde se rotulan los niveles. */
function frontVertex(poly: Pt[]): Pt {
  return poly.reduce((best, p) => (p[1] - p[0] > best[1] - best[0] ? p : best), poly[0]);
}

function divisores(from: number, to: number): number[] {
  const out: number[] = [];
  for (let l = from; l < to; l++) out.push(l * FLOOR_H);
  return out;
}

/** Silueta exterior completa: alas, patios cubiertos y cubiertas. */
function Exterior({ e, opacity = 1 }: { e: Estructura; opacity?: number }) {
  const maxL = Math.max(...niveles(e));
  const volumenes = e.exterior ?? [{ poly: e.poly, alto: e.alto ?? maxL + 1, palette: e.palette }];
  return (
    <g opacity={opacity}>
      {volumenes.map((v, i) => (
        <SolidPrism
          key={i}
          poly={v.poly}
          z0={0}
          z1={v.alto * FLOOR_H}
          palette={v.palette}
          lines={divisores(1, Math.ceil(v.alto))}
        />
      ))}
    </g>
  );
}

function EstructuraView({ e, activeLevel }: { e: Estructura; activeLevel: number | null }) {
  const levels = niveles(e);
  const minL = Math.min(...levels);
  const maxL = Math.max(...levels);
  const topL = (e.alto ?? maxL + 1) - 1;

  if (activeLevel === null) return <Exterior e={e} />;
  if (activeLevel > maxL) return <Exterior e={e} opacity={e.zona === 'frontal' ? 0.3 : 0.45} />;
  if (activeLevel < minL) {
    // El edificio no baja hasta este nivel y taparía el corte: solo su silueta.
    if (e.zona === 'complejo') return <GhostPrism poly={e.poly} z0={0} z1={(topL + 1) * FLOOR_H} opacity={0.4} />;
    return <Exterior e={e} opacity={0.3} />;
  }

  const z = activeLevel * FLOOR_H;
  const ghosts: number[] = [];
  for (let l = activeLevel + 1; l <= topL; l++) ghosts.push(l);
  return (
    <g>
      {activeLevel > 0 && (
        <SolidPrism poly={e.poly} z0={0} z1={z} palette={e.palette} lines={divisores(1, activeLevel)} />
      )}
      <polygon
        points={pointsAttr(e.poly, z)}
        fill={e.palette.floor}
        stroke="#043074"
        strokeWidth={2}
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
      />
      {ghosts.map((l) => (
        <GhostPrism key={l} poly={e.poly} z0={l * FLOOR_H} z1={(l + 1) * FLOOR_H} />
      ))}
    </g>
  );
}

function linea(a: Pt, b: Pt): { x1: number; y1: number; x2: number; y2: number } {
  const p = isoToScreen(a[0], a[1], 0);
  const q = isoToScreen(b[0], b[1], 0);
  return { x1: p.x, y1: p.y, x2: q.x, y2: q.y };
}

/** Superficies del entorno: vías, plazoletas, canchas y parqueadero. */
function Suelo() {
  return (
    <g pointerEvents="none">
      {SUELOS.map((sup, i) => (
        <polygon
          key={i}
          points={pointsAttr(sup.poly, 0)}
          fill={sup.fill}
          stroke={sup.stroke ?? sup.fill}
          strokeWidth={0.4}
          strokeLinejoin="round"
        />
      ))}
      {/* Carriles de las avenidas */}
      <line {...linea([-93, -14], [-93, 190])} stroke="#F4F5F6" strokeWidth={0.5} strokeDasharray="3 3" />
      <line {...linea([-82, 199], [176, 199])} stroke="#F4F5F6" strokeWidth={0.5} strokeDasharray="3 3" />
      {/* Trama diagonal de la plazoleta occidental */}
      {[-60, -44, -28, -12].map((x) => (
        <g key={x} stroke="#DCC6B2" strokeWidth={0.35}>
          <line {...linea([x, 54], [x + 12, 100])} />
          <line {...linea([x + 12, 54], [x, 100])} />
        </g>
      ))}
      {CANCHAS.map((c, i) => {
        const [x0, y0] = c[0];
        const [x1, y1] = c[2];
        const my = (y0 + y1) / 2;
        return (
          <g key={i}>
            <polygon points={pointsAttr(c, 0)} fill="#5AA9DD" stroke="#FFFFFF" strokeWidth={0.5} />
            <polygon
              points={pointsAttr([[x0 + 2, y0 + 2], [x1 - 2, y0 + 2], [x1 - 2, y1 - 2], [x0 + 2, y1 - 2]], 0)}
              fill="#3F8FCB"
              stroke="#FFFFFF"
              strokeWidth={0.35}
            />
            <line {...linea([x0 + 2, my], [x1 - 2, my])} stroke="#FFFFFF" strokeWidth={0.35} />
          </g>
        );
      })}
      {PARQUEO.map((fila) => {
        const cupos: number[] = [];
        for (let x = fila.x0; x <= fila.x1; x += 4) cupos.push(x);
        return (
          <g key={fila.y} stroke="#E9EBED" strokeWidth={0.3}>
            <line {...linea([fila.x0, fila.y], [fila.x1, fila.y])} />
            {cupos.map((x) => (
              <line key={x} {...linea([x, fila.y - 3.5], [x, fila.y + 3.5])} />
            ))}
          </g>
        );
      })}
    </g>
  );
}

function ZoneLabel({ zona, z }: { zona: Zona; z: number }) {
  if (!zona.label) return null;
  const xs = zona.poly.map((p) => p[0]);
  const ys = zona.poly.map((p) => p[1]);
  const w = Math.max(...xs) - Math.min(...xs);
  const h = Math.max(...ys) - Math.min(...ys);
  const along: 'x' | 'y' = h > w * 1.25 ? 'y' : 'x';
  const span = (along === 'x' ? w : h) * (zona.poly.length === 3 ? 0.55 : 0.9);
  const size = clamp(span / (zona.label.length * 0.56), 0.85, 1.9);
  const [cx, cy] = centroid(zona.poly);
  return (
    <text
      transform={planeMatrix(cx, cy, z, along)}
      fontSize={size}
      fontWeight={600}
      textAnchor="middle"
      dominantBaseline="central"
      fill="#334155"
      pointerEvents="none"
    >
      {zona.label}
    </text>
  );
}

const CampusMap = forwardRef<CampusMapHandle, Props>(function CampusMap(
  { espacios, activeFloor, selectedId, matchIds, route, onSelect, onBackgroundClick },
  ref,
) {
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const [size, setSize] = useState({ w: 0, h: 0 });
  const [cam, setCam] = useState<Cam>(HOME);

  const base = useMemo(() => {
    if (!size.w || !size.h) return 1;
    return Math.max(Math.min(size.w / BOUNDS.w, size.h / BOUNDS.h) * 0.92, 1.9);
  }, [size]);
  const s = base * cam.k;
  const inv = 1 / s;
  const tx = size.w / 2 - cam.cx * s;
  const ty = size.h / 2 - cam.cy * s;

  // Valores vivos para los manejadores de eventos y la animación.
  const live = useRef({ cam, base, size });
  live.current = { cam, base, size };

  const anim = useRef<number | null>(null);
  const stopAnim = useCallback(() => {
    if (anim.current !== null) cancelAnimationFrame(anim.current);
    anim.current = null;
  }, []);

  const animateTo = useCallback(
    (target: Cam) => {
      stopAnim();
      const from = live.current.cam;
      const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
      if (reduce) {
        setCam(target);
        return;
      }
      const t0 = performance.now();
      const dur = 650;
      const step = (now: number) => {
        const t = clamp((now - t0) / dur, 0, 1);
        const e = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
        setCam({
          k: from.k + (target.k - from.k) * e,
          cx: from.cx + (target.cx - from.cx) * e,
          cy: from.cy + (target.cy - from.cy) * e,
        });
        anim.current = t < 1 ? requestAnimationFrame(step) : null;
      };
      anim.current = requestAnimationFrame(step);
    },
    [stopAnim],
  );

  useEffect(() => stopAnim, [stopAnim]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setSize({ w: el.clientWidth, h: el.clientHeight }));
    ro.observe(el);
    setSize({ w: el.clientWidth, h: el.clientHeight });
    return () => ro.disconnect();
  }, []);

  /** Zoom multiplicativo que mantiene fijo el punto bajo (px, py). */
  const zoomAt = useCallback((factor: number, px: number, py: number) => {
    setCam((c) => {
      const { base: b, size: sz } = live.current;
      const k2 = clamp(c.k * factor, MIN_ZOOM, MAX_ZOOM);
      const s1 = b * c.k;
      const s2 = b * k2;
      const ix = c.cx + (px - sz.w / 2) / s1;
      const iy = c.cy + (py - sz.h / 2) / s1;
      return { k: k2, cx: ix - (px - sz.w / 2) / s2, cy: iy - (py - sz.h / 2) / s2 };
    });
  }, []);

  useImperativeHandle(
    ref,
    () => ({
      zoomIn: () => {
        const c = live.current.cam;
        animateTo({ ...c, k: clamp(c.k * 1.35, MIN_ZOOM, MAX_ZOOM) });
      },
      zoomOut: () => {
        const c = live.current.cam;
        animateTo({ ...c, k: clamp(c.k / 1.35, MIN_ZOOM, MAX_ZOOM) });
      },
      reset: () => animateTo(HOME),
      fitWorld: (points, options) => {
        if (!points.length) return;
        const { base: b, size: sz } = live.current;
        const pts = points.map((p) => isoToScreen(p.x, p.y, p.z));
        const xs = pts.map((p) => p.x);
        const ys = pts.map((p) => p.y);
        const bw = Math.max(...xs) - Math.min(...xs);
        const bh = Math.max(...ys) - Math.min(...ys);
        const padR = options?.padRight ?? 0;
        const padB = options?.padBottom ?? 0;
        const availW = Math.max(sz.w - padR, 120);
        const padT = options?.padTop ?? 0;
        const availH = Math.max(sz.h - padB - padT, 120);
        const fit = Math.min((availW * 0.68) / Math.max(bw * b, 1), (availH * 0.62) / Math.max(bh * b, 1));
        const k = clamp(fit, MIN_ZOOM, options?.maxZoom ?? 2.2);
        const sc = b * k;
        animateTo({
          k,
          cx: (Math.min(...xs) + Math.max(...xs)) / 2 + padR / 2 / sc,
          cy: (Math.min(...ys) + Math.max(...ys)) / 2 + (padB - padT) / 2 / sc - 14 / sc,
        });
      },
    }),
    [animateTo],
  );

  /* ----------------------- Paneo, rueda y pellizco ----------------------- */

  const pointers = useRef(new Map<number, { x: number; y: number }>());
  const gesture = useRef({ moved: false, startX: 0, startY: 0, pinch: 0 });

  const localPoint = (clientX: number, clientY: number) => {
    const r = containerRef.current?.getBoundingClientRect();
    return { x: clientX - (r?.left ?? 0), y: clientY - (r?.top ?? 0) };
  };

  const onPointerDown = (ev: ReactPointerEvent<SVGSVGElement>) => {
    if (ev.pointerType === 'mouse' && ev.button !== 0) return;
    stopAnim();
    pointers.current.set(ev.pointerId, { x: ev.clientX, y: ev.clientY });
    if (pointers.current.size === 1) {
      gesture.current = { moved: false, startX: ev.clientX, startY: ev.clientY, pinch: 0 };
    } else if (pointers.current.size === 2) {
      const [a, b] = [...pointers.current.values()];
      gesture.current.pinch = Math.hypot(a.x - b.x, a.y - b.y);
      gesture.current.moved = true;
    }
  };

  const onPointerMove = (ev: ReactPointerEvent<SVGSVGElement>) => {
    const prev = pointers.current.get(ev.pointerId);
    if (!prev) return;
    const g = gesture.current;
    if (!g.moved && Math.hypot(ev.clientX - g.startX, ev.clientY - g.startY) > 5) {
      g.moved = true;
      svgRef.current?.setPointerCapture(ev.pointerId);
    }
    pointers.current.set(ev.pointerId, { x: ev.clientX, y: ev.clientY });
    if (!g.moved) return;

    if (pointers.current.size >= 2) {
      const [a, b] = [...pointers.current.values()];
      const dist = Math.hypot(a.x - b.x, a.y - b.y);
      if (g.pinch > 0 && dist > 0) {
        const mid = localPoint((a.x + b.x) / 2, (a.y + b.y) / 2);
        zoomAt(dist / g.pinch, mid.x, mid.y);
      }
      g.pinch = dist;
      return;
    }
    const dx = ev.clientX - prev.x;
    const dy = ev.clientY - prev.y;
    setCam((c) => {
      const sc = live.current.base * c.k;
      return { ...c, cx: c.cx - dx / sc, cy: c.cy - dy / sc };
    });
  };

  const onPointerUp = (ev: ReactPointerEvent<SVGSVGElement>) => {
    pointers.current.delete(ev.pointerId);
    if (pointers.current.size < 2) gesture.current.pinch = 0;
  };

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const onWheel = (ev: WheelEvent) => {
      ev.preventDefault();
      stopAnim();
      const r = el.getBoundingClientRect();
      const delta = ev.deltaMode === 1 ? ev.deltaY * 16 : ev.deltaY;
      zoomAt(Math.exp(-delta * 0.0016), ev.clientX - r.left, ev.clientY - r.top);
    };
    el.addEventListener('wheel', onWheel, { passive: false });
    return () => el.removeEventListener('wheel', onWheel);
  }, [zoomAt, stopAnim]);

  /* ------------------------------ Contenido ------------------------------ */

  const activeLevel = activeFloor === null ? null : PISO_LEVEL[activeFloor];
  const floorZ = activeLevel === null ? 0 : activeLevel * FLOOR_H;
  const sotano = activeFloor === 'Sótano';

  const zonas = useMemo(() => (activeFloor ? zonasDePiso(activeFloor) : []), [activeFloor]);
  const espaciosDelPiso = useMemo(
    () => (activeFloor ? espacios.filter((e) => e.piso === activeFloor) : []),
    [espacios, activeFloor],
  );
  const zonaEspacios = useMemo(() => {
    const map = new Map<string, Espacio[]>();
    for (const zona of zonas) {
      map.set(
        zona.id,
        espaciosDelPiso.filter((e) => pointInPolygon(e.coord_x, e.coord_y, zona.poly)),
      );
    }
    return map;
  }, [zonas, espaciosDelPiso]);

  const selected = espacios.find((e) => e.id === selectedId) ?? null;

  const pins = useMemo(() => {
    let list: Espacio[];
    if (activeFloor) list = espaciosDelPiso;
    else if (matchIds) list = espacios.filter((e) => matchIds.has(e.id));
    else list = [];
    if (selected && !list.some((e) => e.id === selected.id) && (!activeFloor || selected.piso === activeFloor)) {
      list = [...list, selected];
    }
    // Los más cercanos a la cámara se pintan al final.
    return [...list].sort((a, b) => a.coord_y - a.coord_x - (b.coord_y - b.coord_x));
  }, [activeFloor, espaciosDelPiso, espacios, matchIds, selected]);

  const onZoneClick = (zona: Zona, clientX: number, clientY: number) => {
    const list = zonaEspacios.get(zona.id) ?? [];
    if (!list.length) return;
    const p = localPoint(clientX, clientY);
    const w = screenToIso((p.x - tx) / s, (p.y - ty) / s, floorZ);
    const nearest = list.reduce((best, e) =>
      Math.hypot(e.coord_x - w.x, e.coord_y - w.y) < Math.hypot(best.coord_x - w.x, best.coord_y - w.y) ? e : best,
    );
    onSelect(nearest);
  };

  const routePoints = route
    ? route.points
        .map((p) => {
          const q = isoToScreen(p.x, p.y, p.z);
          return `${q.x.toFixed(2)},${q.y.toFixed(2)}`;
        })
        .join(' ')
    : '';

  const entrada = isoToScreen(ENTRADA[0], ENTRADA[1], 0);

  return (
    <div ref={containerRef} className="absolute inset-0 select-none overflow-hidden bg-[#DCE8CF]">
      <svg
        ref={svgRef}
        width="100%"
        height="100%"
        className="block touch-none"
        style={{ cursor: 'grab' }}
        role="img"
        aria-label="Mapa isométrico de la sede Calle 100"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        onClickCapture={(ev) => {
          if (gesture.current.moved) {
            ev.stopPropagation();
            gesture.current.moved = false;
          }
        }}
        onClick={() => onBackgroundClick?.()}
      >
        <defs>
          <filter id="neomap-shadow" x="-20%" y="-30%" width="140%" height="180%">
            <feDropShadow dx="0" dy="1.5" stdDeviation="1.8" floodColor="#0F172A" floodOpacity="0.18" />
          </filter>
        </defs>

        {size.w > 0 && (
          <g transform={`translate(${tx},${ty}) scale(${s})`}>
            <Suelo />
            {sotano && (
              <g>
                <PitWalls poly={COMPLEJO} depth={FLOOR_H} />
                <polygon
                  points={pointsAttr(COMPLEJO, -FLOOR_H)}
                  fill="#E8DFD3"
                  stroke="#B5AA95"
                  strokeWidth={0.8}
                  vectorEffect="non-scaling-stroke"
                />
              </g>
            )}

            {ARBOLES_FONDO.map(([x, y]) => (
              <Tree key={`${x}-${y}`} x={x} y={y} />
            ))}

            {/* Edificios y entorno, de fondo a frente */}
            {ESCENA.map((item) =>
              item.tipo === 'edificio' ? (
                <EstructuraView key={item.id} e={item} activeLevel={activeLevel} />
              ) : (
                <SolidPrism
                  key={item.id}
                  poly={item.volumen.poly}
                  z0={0}
                  z1={item.volumen.alto * FLOOR_H}
                  palette={item.volumen.palette}
                  lines={divisores(1, Math.ceil(item.volumen.alto))}
                  opacity={activeLevel === null ? 1 : 0.4}
                />
              ),
            )}

            {/* Particiones del piso activo */}
            {activeFloor &&
              zonas.map((zona) => {
                const list = zonaEspacios.get(zona.id) ?? [];
                const matched = matchIds ? list.some((e) => matchIds.has(e.id)) : true;
                const isSelected = selected ? list.some((e) => e.id === selected.id) : false;
                const tint = list.length ? CATEGORIA_META[list[0].categoria].tint : '#FFFFFF';
                return (
                  <g key={zona.id} opacity={matchIds && !matched ? 0.35 : 1}>
                    <polygon
                      points={pointsAttr(zona.poly, floorZ)}
                      fill={tint}
                      fillOpacity={list.length ? 0.85 : 0.5}
                      stroke={isSelected ? '#043074' : '#94A3B8'}
                      strokeWidth={isSelected ? 2 : 0.8}
                      strokeLinejoin="round"
                      vectorEffect="non-scaling-stroke"
                      style={{ cursor: list.length ? 'pointer' : 'inherit' }}
                      onClick={
                        list.length
                          ? (ev) => {
                              ev.stopPropagation();
                              onZoneClick(zona, ev.clientX, ev.clientY);
                            }
                          : undefined
                      }
                    />
                    <ZoneLabel zona={zona} z={floorZ} />
                  </g>
                );
              })}

            {activeFloor &&
              ESCALERAS.filter((e) => (e.zona === 'frontal' ? activeLevel === 0 || activeLevel === 1 : (activeLevel ?? 0) <= 2 || e.id.startsWith('E'))).map(
                (e) => <StairSymbol key={e.id} x={e.x} y={e.y} len={e.len} z={floorZ} />,
              )}

            {ARBOLES_FRENTE.map(([x, y]) => (
              <Tree key={`${x}-${y}`} x={x} y={y} />
            ))}

            {/* Indicadores de nivel en la arista frontal de cada bloque */}
            {activeLevel !== null &&
              EDIFICIOS.filter((e) => niveles(e).includes(activeLevel)).map((e) => {
                const [vx, vy] = frontVertex(e.poly);
                return e.pisos.map((piso) => {
                  const level = PISO_LEVEL[piso];
                  const on = level === activeLevel;
                  const p = isoToScreen(vx, vy, level * FLOOR_H + (on ? 0 : FLOOR_H / 2));
                  return (
                    <g key={`${e.id}-${piso}`} transform={`translate(${p.x},${p.y}) scale(${inv})`} pointerEvents="none">
                      <rect x={-13} y={-7} width={22} height={14} rx={4} fill={on ? '#043074' : '#FFFFFF'} opacity={on ? 1 : 0.7} stroke={on ? '#FDC600' : '#CBD5E1'} />
                      <text x={-2} y={3.6} textAnchor="middle" fontSize={9} fontWeight={700} fill={on ? '#FFFFFF' : '#64718A'}>
                        {PISO_SHORT[piso]}
                      </text>
                    </g>
                  );
                });
              })}

            {/* Nodo dorado de origen */}
            <g pointerEvents="none">
              <circle className="origin-pulse" cx={entrada.x} cy={entrada.y} r={2.4} fill="#FDC600" />
              <circle cx={entrada.x} cy={entrada.y} r={2} fill="#FDC600" stroke="#043074" strokeWidth={0.7} />
              <circle cx={entrada.x} cy={entrada.y} r={0.75} fill="#043074" />
            </g>

            {/* Ruta */}
            {route && (
              <g fill="none" strokeLinejoin="round" strokeLinecap="round" pointerEvents="none">
                <polyline points={routePoints} stroke="#043074" strokeWidth={8.5} opacity={0.9} vectorEffect="non-scaling-stroke" />
                <polyline points={routePoints} stroke="#FDC600" strokeWidth={5} vectorEffect="non-scaling-stroke" />
                <polyline
                  className="route-flow"
                  points={routePoints}
                  stroke="#043074"
                  strokeWidth={1.6}
                  strokeDasharray="6 12"
                  vectorEffect="non-scaling-stroke"
                />
              </g>
            )}

            {/* Letreros de acceso y rótulos flotantes */}
            {EDIFICIOS.map((e) => {
              if (!e.acceso || sotano) return null;
              const p = isoToScreen(e.acceso.at[0], e.acceso.at[1], 3.2);
              return <DoorSign key={e.id} x={p.x} y={p.y} inv={inv} letra={e.acceso.letra} color={e.acceso.color} />;
            })}
            {EDIFICIOS.map((e) => {
              const levels = niveles(e);
              const has = activeLevel !== null && levels.includes(activeLevel);
              const at = (has ? LABEL_AT_CORTE : LABEL_AT)[e.id];
              if (!at) return null;
              const zLabel = has ? floorZ : (e.alto ?? Math.max(...levels) + 1) * FLOOR_H;
              const p = isoToScreen(at[0], at[1], zLabel);
              // Los edificios que no tienen el piso activo quedan atenuados y sin rótulo.
              if (activeLevel !== null && !has) return null;
              return <Pill key={e.id} x={p.x} y={p.y} inv={inv} text={e.nombre} />;
            })}
            <Pill x={entrada.x} y={entrada.y} inv={inv} text="Entrada principal" dy={-26} />

            {/* Pines */}
            {pins.map((e) => {
              const p = isoToScreen(e.coord_x, e.coord_y, PISO_LEVEL[e.piso] * FLOOR_H);
              const isSel = e.id === selectedId;
              return (
                <Pin
                  key={e.id}
                  x={p.x}
                  y={p.y}
                  inv={inv}
                  color={isSel ? '#043074' : CATEGORIA_META[e.categoria].color}
                  dim={!isSel && matchIds !== null && !matchIds.has(e.id)}
                  selected={isSel}
                  title={e.nombre}
                  onClick={() => onSelect(e)}
                />
              );
            })}

            {selected && (!activeFloor || selected.piso === activeFloor) && (() => {
              const p = isoToScreen(selected.coord_x, selected.coord_y, PISO_LEVEL[selected.piso] * FLOOR_H);
              return (
                <Callout
                  x={p.x}
                  y={p.y}
                  inv={inv}
                  title={selected.nombre}
                  subtitle={`Bloque ${selected.bloque_id} · ${selected.piso}`}
                />
              );
            })()}
          </g>
        )}
      </svg>
    </div>
  );
});

export default CampusMap;
