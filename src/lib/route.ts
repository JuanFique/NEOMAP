import { ENTRADA } from '../data/campus';
import { FLOOR_H, type WorldPt } from './iso';
import { PISO_LEVEL, type Espacio } from './types';

export interface Ruta {
  espacioId: string;
  points: WorldPt[];
  resumen: string;
  porEscaleras: boolean;
}

/** Eje del Pasillo occidental y corredores internos de cada bloque. */
const PASILLO_X = 42;
const CORREDOR_Y = { D: 20, C: 40, B: 60 } as const;
const CORREDOR_E_X = 102;
const CORREDOR_A_Y = 109.5;
const ESCALERA_OESTE = { D: 13.5, C: 53.5, B: 53.5 } as const;
const ESCALERA_E = { x: 89, y: 53.5 };
const ESCALERA_A = { x: -3, y: 107 };

/**
 * Ruta general y fija desde la Entrada Principal hasta el bloque y piso del
 * espacio (sin navegación interior detallada): recorre el Pasillo, sube o baja
 * por el núcleo de escaleras más cercano y termina en el pin del espacio.
 */
export function buildRoute(espacio: Espacio): Ruta {
  const z = PISO_LEVEL[espacio.piso] * FLOOR_H;
  const px = espacio.coord_x;
  const py = espacio.coord_y;
  const porEscaleras = z !== 0;
  const pts: WorldPt[] = [];
  const add = (x: number, y: number, zz: number) => {
    const last = pts[pts.length - 1];
    if (last && last.x === x && last.y === y && last.z === zz) return;
    pts.push({ x, y, z: zz });
  };

  add(ENTRADA[0], ENTRADA[1], 0);

  if (espacio.bloque_id === 'A') {
    if (porEscaleras) {
      add(ESCALERA_A.x, ENTRADA[1], 0);
      add(ESCALERA_A.x, ESCALERA_A.y, 0);
      add(ESCALERA_A.x, ESCALERA_A.y, z);
      add(ESCALERA_A.x, CORREDOR_A_Y, z);
    } else {
      add(PASILLO_X, ENTRADA[1], 0);
      add(PASILLO_X, CORREDOR_A_Y, 0);
    }
    add(px, CORREDOR_A_Y, z);
  } else if (espacio.bloque_id === 'E') {
    add(PASILLO_X, ENTRADA[1], 0);
    add(PASILLO_X, CORREDOR_Y.C, 0);
    if (porEscaleras) {
      add(ESCALERA_E.x, CORREDOR_Y.C, 0);
      add(ESCALERA_E.x, ESCALERA_E.y, 0);
      add(ESCALERA_E.x, ESCALERA_E.y, z);
      add(CORREDOR_E_X, ESCALERA_E.y, z);
    } else {
      add(CORREDOR_E_X, CORREDOR_Y.C, 0);
    }
    add(CORREDOR_E_X, py, z);
  } else {
    const id = espacio.bloque_id;
    add(PASILLO_X, ENTRADA[1], 0);
    if (porEscaleras) {
      const ys = ESCALERA_OESTE[id];
      add(PASILLO_X, ys, 0);
      add(29, ys, 0);
      add(29, ys, z);
      add(PASILLO_X, ys, z);
    }
    if (px < 47) {
      // Espacios sobre el propio Pasillo (p. ej. Sala de Sistemas).
      add(PASILLO_X, py, z);
    } else {
      add(PASILLO_X, CORREDOR_Y[id], z);
      add(px, CORREDOR_Y[id], z);
    }
  }

  add(px, py, z);

  const acceso = porEscaleras ? 'Acceso por escaleras' : 'Acceso a nivel';
  return {
    espacioId: espacio.id,
    points: pts,
    resumen: `Origen: Entrada Principal → Bloque ${espacio.bloque_id} · ${espacio.piso} (${acceso})`,
    porEscaleras,
  };
}
