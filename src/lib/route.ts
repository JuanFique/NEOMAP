import { ENTRADA, PLAZA_FRONTAL_X, pdfY } from '../data/campus';
import { FLOOR_H, type WorldPt } from './iso';
import { PISO_LEVEL, type Espacio } from './types';

export interface Ruta {
  espacioId: string;
  points: WorldPt[];
  resumen: string;
  porEscaleras: boolean;
}

/** Ejes de circulación, en coordenadas de planta. */
const PLAZA_X = PLAZA_FRONTAL_X;
const PASILLO_X = 42;
const CORREDOR_Y = { D: pdfY(20), C: pdfY(40), B: pdfY(60) } as const;
const CORREDOR_E_X = 102;
const CORREDOR_A_Y = 148.5;
const ESCALERA_OESTE = { D: pdfY(13.5), C: pdfY(53.5), B: pdfY(53.5) } as const;
const ESCALERA_OESTE_X = 30;
const ESCALERA_E = { x: 89.5, y: pdfY(53.5) };
const ESCALERA_A_X = 28;

/**
 * Ruta general y fija desde la Entrada Principal hasta el bloque y piso del
 * espacio (sin navegación interior detallada): cruza la portería, avanza por la plazoleta frontal,
 * entra por el acceso del bloque, sube o baja por el núcleo de escaleras más
 * cercano y termina en el pin del espacio.
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
  // Cruza la portería y la plazoleta occidental hasta la plazoleta frontal.
  add(PLAZA_X, ENTRADA[1], 0);

  if (espacio.bloque_id === 'A') {
    add(PLAZA_X, CORREDOR_A_Y, 0);
    if (porEscaleras) {
      add(ESCALERA_A_X, CORREDOR_A_Y, 0);
      add(ESCALERA_A_X, CORREDOR_A_Y, z);
    }
    add(px, CORREDOR_A_Y, z);
  } else if (espacio.bloque_id === 'E') {
    add(PLAZA_X, CORREDOR_Y.C, 0);
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
    if (porEscaleras) {
      const ys = ESCALERA_OESTE[id];
      add(PLAZA_X, ys, 0);
      add(ESCALERA_OESTE_X, ys, 0);
      add(ESCALERA_OESTE_X, ys, z);
      add(PASILLO_X, ys, z);
    } else {
      add(PLAZA_X, CORREDOR_Y[id], 0);
      add(PASILLO_X, CORREDOR_Y[id], 0);
    }
    if (px < 47) {
      // Espacios dentro del propio Pasillo (p. ej. Sala de Sistemas).
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
