/**
 * Proyección isométrica de 30° compartida por edificios, zonas, pines y rutas.
 *
 * Coordenadas de planta: `x` crece hacia el oriente y `y` hacia el sur (igual que
 * en los planos de pisos.pdf). La cámara mira desde el suroccidente, de modo que
 * la Entrada Principal queda abajo a la izquierda y el Bloque E (el más alto) al fondo.
 */
export const COS30 = Math.cos(Math.PI / 6);
export const SIN30 = 0.5;

/** Altura de un piso en unidades de planta. */
export const FLOOR_H = 5;

export interface ScreenPt {
  x: number;
  y: number;
}

export interface WorldPt {
  x: number;
  y: number;
  z: number;
}

export function isoToScreen(x: number, y: number, z = 0): ScreenPt {
  return { x: (x + y) * COS30, y: (y - x) * SIN30 - z };
}

/** Inversa de `isoToScreen` para un plano horizontal de altura `z`. */
export function screenToIso(sx: number, sy: number, z = 0): { x: number; y: number } {
  const a = sx / COS30;
  const b = (sy + z) / SIN30;
  return { x: (a - b) / 2, y: (a + b) / 2 };
}

export function levelZ(level: number): number {
  return level * FLOOR_H;
}

export function pointsAttr(pts: ReadonlyArray<readonly [number, number]>, z: number): string {
  return pts
    .map(([x, y]) => {
      const p = isoToScreen(x, y, z);
      return `${p.x.toFixed(2)},${p.y.toFixed(2)}`;
    })
    .join(' ');
}

export function pointInPolygon(
  x: number,
  y: number,
  poly: ReadonlyArray<readonly [number, number]>,
): boolean {
  let inside = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const [xi, yi] = poly[i];
    const [xj, yj] = poly[j];
    if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) inside = !inside;
  }
  return inside;
}

export function centroid(poly: ReadonlyArray<readonly [number, number]>): [number, number] {
  let a = 0;
  let cx = 0;
  let cy = 0;
  for (let i = 0; i < poly.length; i++) {
    const [x0, y0] = poly[i];
    const [x1, y1] = poly[(i + 1) % poly.length];
    const f = x0 * y1 - x1 * y0;
    a += f;
    cx += (x0 + x1) * f;
    cy += (y0 + y1) * f;
  }
  if (Math.abs(a) < 1e-9) return [poly[0][0], poly[0][1]];
  return [cx / (3 * a), cy / (3 * a)];
}
