import type { BloqueId, Piso } from '../lib/types';

/**
 * Geometría del campus en coordenadas de planta (x → oriente, y → sur).
 * Las medidas salen de pisos.pdf: 1 unidad ≈ 10 px de las láminas de piso del
 * complejo B/C/D/E; la zona frontal (Bloque A y Scale Up A) se escaló con la
 * lámina general para conservar la posición y el tamaño relativos.
 */
export type Pt = readonly [number, number];

export const rect = (x0: number, y0: number, x1: number, y1: number): Pt[] => [
  [x0, y0],
  [x1, y0],
  [x1, y1],
  [x0, y1],
];

export interface BlockPart {
  id: string;
  nombre: string;
  poly: Pt[];
  /** Pisos de esta ala cuando difieren de los del bloque. */
  pisos?: Piso[];
}

export interface Bloque {
  id: BloqueId;
  nombre: string;
  descripcion: string;
  pisos: Piso[];
  zona: 'frontal' | 'complejo';
  palette: 'sand' | 'slate';
  parts: BlockPart[];
}

export const PALETTES = {
  sand: { roof: '#EDE4D3', left: '#DFD3BE', right: '#CFC1A8', line: '#B9AA8E' },
  slate: { roof: '#F4F7FB', left: '#DCE6F2', right: '#C5D5E8', line: '#A9BCD4' },
} as const;

/** Huella completa del complejo principal (incluye el Pasillo y la esquina achaflanada). */
export const COMPLEJO: Pt[] = [
  [27, 10],
  [117, 10],
  [117, 58],
  [98, 70],
  [27, 70],
];

export const PASILLO_LABEL_AT: Pt = [37, 66];

/** Corredor exterior en L de la zona frontal, que conecta la entrada con el Pasillo. */
export const CORREDOR_A: Pt[] = [
  [27, 70],
  [61, 70],
  [61, 104],
  [128, 104],
  [128, 115],
  [27, 115],
];

export const PLAZA_ENTRADA: Pt[] = rect(-7, 84, 27, 104);
export const ENTRADA: Pt = [4, 94];

export const BLOQUES: Bloque[] = [
  {
    id: 'A',
    nombre: 'Bloque A',
    descripcion: 'Zona frontal junto a la Entrada Principal; incluye el ala Scale Up A.',
    pisos: ['Piso 1', 'Piso 2'],
    zona: 'frontal',
    palette: 'sand',
    parts: [
      { id: 'A-main', nombre: 'Bloque A', poly: rect(61, 70, 128, 104) },
      { id: 'A-scale', nombre: 'Scale Up A', poly: rect(27, 115, 128, 137) },
      { id: 'A-small', nombre: 'Bloque A', poly: rect(-7, 104, 27, 137) },
    ],
  },
  {
    id: 'B',
    nombre: 'Bloque B',
    descripcion: 'Ala sur del complejo principal.',
    pisos: ['Piso 1', 'Piso 2', 'Piso 3'],
    zona: 'complejo',
    palette: 'slate',
    parts: [{ id: 'B', nombre: 'Bloque B', poly: rect(47, 50, 87, 70) }],
  },
  {
    id: 'C',
    nombre: 'Bloque C',
    descripcion: 'Ala central del complejo principal.',
    pisos: ['Sótano', 'Piso 1', 'Piso 2', 'Piso 3'],
    zona: 'complejo',
    palette: 'slate',
    parts: [
      { id: 'C', nombre: 'Bloque C', poly: rect(47, 30, 87, 50) },
      {
        id: 'C-pasillo',
        nombre: 'Pasillo',
        poly: rect(27, 17, 37, 50),
        pisos: ['Piso 1', 'Piso 2', 'Piso 3'],
      },
    ],
  },
  {
    id: 'D',
    nombre: 'Bloque D',
    descripcion: 'Ala norte del complejo principal.',
    pisos: ['Sótano', 'Piso 1', 'Piso 2', 'Piso 3'],
    zona: 'complejo',
    palette: 'slate',
    parts: [{ id: 'D', nombre: 'Bloque D', poly: rect(47, 10, 87, 30) }],
  },
  {
    id: 'E',
    nombre: 'Bloque E',
    descripcion: 'Torre oriental de cinco pisos con la esquina suroriental achaflanada.',
    pisos: ['Sótano', 'Piso 1', 'Piso 2', 'Piso 3', 'Piso 4', 'Piso 5'],
    zona: 'complejo',
    palette: 'slate',
    parts: [
      {
        id: 'E',
        nombre: 'Bloque E',
        poly: [
          [87, 10],
          [117, 10],
          [117, 58],
          [98, 70],
          [87, 70],
        ],
      },
    ],
  },
];

export const BLOQUE_BY_ID = Object.fromEntries(BLOQUES.map((b) => [b.id, b])) as Record<
  BloqueId,
  Bloque
>;

/** Orden de pintado de fondo a frente para la cámara suroccidental. */
export const DRAW_ORDER = ['E', 'D', 'C', 'B', 'C-pasillo', 'A-main', 'A-scale', 'A-small'];

export const PARTS: { part: BlockPart; bloque: Bloque }[] = DRAW_ORDER.map((id) => {
  for (const bloque of BLOQUES) {
    const part = bloque.parts.find((p) => p.id === id);
    if (part) return { part, bloque };
  }
  throw new Error(`Parte desconocida: ${id}`);
});

export function pisosDeBloque(id: BloqueId): Piso[] {
  return BLOQUE_BY_ID[id].pisos;
}

/* ------------------------------------------------------------------ */
/* Zonas internas (particiones de cada piso)                           */
/* ------------------------------------------------------------------ */

export interface Zona {
  id: string;
  piso: Piso;
  bloque: BloqueId;
  poly: Pt[];
  label?: string;
}

const zonas: Zona[] = [];

function z(piso: Piso, bloque: BloqueId, poly: Pt[], label?: string): void {
  zonas.push({ id: `${piso}-${bloque}-${zonas.length}`, piso, bloque, poly, label });
}

/** Divide un rectángulo en franjas iguales a lo largo de `axis`. */
function split(
  piso: Piso,
  bloque: BloqueId,
  r: [number, number, number, number],
  axis: 'x' | 'y',
  labels: (string | undefined)[],
): void {
  const [x0, y0, x1, y1] = r;
  const n = labels.length;
  labels.forEach((label, i) => {
    if (axis === 'x') {
      const w = (x1 - x0) / n;
      z(piso, bloque, rect(x0 + w * i, y0, x0 + w * (i + 1), y1), label);
    } else {
      const h = (y1 - y0) / n;
      z(piso, bloque, rect(x0, y0 + h * i, x1, y0 + h * (i + 1)), label);
    }
  });
}

const TRI_ESQUINA: Pt[] = [
  [117, 58],
  [117, 70],
  [98, 70],
];

// --- Sótano ---------------------------------------------------------
z('Sótano', 'D', rect(47, 10, 77, 17), 'Calidad de Aguas');
z('Sótano', 'D', rect(77, 10, 87, 30), 'Coordinación');
split('Sótano', 'D', [47, 22.5, 77, 30], 'x', ['Fís. Mec.', 'Calor', 'Elec.', 'Óptica']);
z('Sótano', 'C', rect(47, 30, 87, 37), 'Inglés | Música');
z('Sótano', 'C', rect(47, 42.5, 87, 50), 'Enfermería');
z('Sótano', 'C', rect(47, 50, 87, 70), 'Área común');
z('Sótano', 'C', rect(27, 17, 37, 25), 'Tienda');
z('Sótano', 'C', rect(27, 50, 37, 57), 'Tienda FEUM');
split('Sótano', 'E', [87, 17, 97, 50], 'y', ['Química', 'Trat. Aguas', 'Química I', 'Simulación IA']);
split('Sótano', 'E', [107, 17, 117, 58], 'y', [
  'Térmica',
  'Robótica IA',
  'Multimedia I',
  'Automatización',
  'Comunicaciones',
  'Química II',
]);
z(
  'Sótano',
  'E',
  [
    [87, 58],
    [117, 58],
    [98, 70],
    [87, 70],
  ],
  'Almacén y Seguridad',
);

// --- Piso 1 ---------------------------------------------------------
split('Piso 1', 'D', [47, 10, 87, 17], 'x', ['Decanatura Ing.', 'Posgrados Ing.', 'Ing. Industrial']);
z('Piso 1', 'C', rect(47, 22.5, 87, 30), 'Biblioteca | Programa de Ingeniería');
z('Piso 1', 'C', rect(47, 30, 87, 37), 'Inglés | Música');
z('Piso 1', 'C', rect(47, 42.5, 87, 50), 'Enfermería');
z('Piso 1', 'B', rect(47, 50, 77, 57), 'Decanatura · Vicerrectoría · Procesos');
z('Piso 1', 'B', rect(77, 50, 87, 57), 'C. Experiencia');
z('Piso 1', 'B', rect(47, 62.5, 87, 70), 'B101 Derecho');
split('Piso 1', 'C', [87, 22.5, 97, 37], 'y', ['Rel. Internac.', 'Protección']);
z('Piso 1', 'C', rect(87, 42.5, 97, 50), 'CORSE');
split('Piso 1', 'E', [107, 10, 117, 57], 'y', [
  'Consultorio CI',
  'Sala Prof.',
  'Prog. Multimedia',
  'Prog. Teleco',
  'Adm. Empresas',
  'E102',
  'E101',
  'Medios y TIC',
]);
z('Piso 1', 'E', TRI_ESQUINA, 'Bancos');
z('Piso 1', 'C', rect(27, 17, 37, 50), 'P');

// --- Piso 2 (complejo) ----------------------------------------------
z('Piso 2', 'D', rect(47, 10, 87, 17), 'Decanatura y Posgrados');
z('Piso 2', 'C', rect(47, 22.5, 87, 30), 'Biblioteca | Programa de Ingeniería');
z('Piso 2', 'C', rect(47, 30, 87, 37));
z('Piso 2', 'C', rect(47, 42.5, 87, 50), 'C201');
z('Piso 2', 'B', rect(47, 50, 87, 57), 'Auditorio | Audiovisual | AE B202');
z('Piso 2', 'B', rect(47, 62.5, 87, 70), 'B201 – B206');
z('Piso 2', 'C', rect(87, 22.5, 97, 37), 'C201 – C204');
z('Piso 2', 'C', rect(87, 42.5, 97, 50));
z('Piso 2', 'E', rect(107, 10, 117, 57), 'E205 – E211');
z('Piso 2', 'E', TRI_ESQUINA, 'Auditorio');
z('Piso 2', 'C', rect(27, 17, 37, 50), 'Sala de Sistemas');

// --- Piso 3 ---------------------------------------------------------
z('Piso 3', 'D', rect(47, 10, 87, 17));
z('Piso 3', 'D', rect(47, 22.5, 87, 30), '301 – 312');
z('Piso 3', 'C', rect(47, 30, 87, 37));
z('Piso 3', 'C', rect(47, 42.5, 87, 50), 'C301 – C312');
z('Piso 3', 'B', rect(47, 50, 87, 57));
z('Piso 3', 'B', rect(47, 62.5, 87, 70), 'B301 – B312');
z('Piso 3', 'C', rect(87, 22.5, 97, 37), '301');
z('Piso 3', 'C', rect(87, 42.5, 97, 50));
z('Piso 3', 'E', rect(107, 10, 117, 57), 'E311');
z('Piso 3', 'C', rect(27, 17, 37, 50));

// --- Pisos 4 y 5 (solo Bloque E) --------------------------------------
const TRI_E_ALTO: Pt[] = [
  [98, 58],
  [117, 58],
  [98, 70],
];
z('Piso 4', 'E', rect(87, 10, 98, 17.4));
z('Piso 4', 'E', rect(87, 17.4, 98, 50.6), 'Baños');
z('Piso 4', 'E', rect(87, 50.6, 98, 70));
z('Piso 4', 'E', rect(105, 10, 117, 40), 'E401 – E411');
z('Piso 4', 'E', rect(105, 40, 117, 58), 'Rama IEEE');
z('Piso 4', 'E', TRI_E_ALTO, 'Asuntos Discipl.');

z('Piso 5', 'E', rect(87, 10, 98, 17.4));
split('Piso 5', 'E', [87, 17.4, 98, 50.6], 'y', ['E501 – E508', 'Realidad Virtual', 'Redes Teleco']);
z('Piso 5', 'E', rect(87, 50.6, 98, 70));
split('Piso 5', 'E', [105, 10, 117, 58], 'y', ['Multimedia 2', 'Multimedia 3', 'Electrónica', 'Doc. Innovación']);
z('Piso 5', 'E', TRI_E_ALTO, 'Sala Prof. Ing.');

// --- Zona frontal: Bloque A y Scale Up A -------------------------------
z('Piso 1', 'A', rect(61, 70, 128, 104), 'Aulas Bloque A');
z('Piso 1', 'A', rect(27, 115, 128, 137), 'Scale Up A');
z('Piso 1', 'A', rect(-7, 104, 27, 137), 'Bloque A');

z('Piso 2', 'A', rect(61, 70, 94.5, 82), 'Acreditación Institucional');
z('Piso 2', 'A', rect(94.5, 70, 128, 82));
z('Piso 2', 'A', rect(61, 92, 128, 104), 'División Logística | Vicerrectoría');
z('Piso 2', 'A', rect(27, 115, 77.5, 126), 'Oficina TIC');
z('Piso 2', 'A', rect(77.5, 115, 128, 126));
z('Piso 2', 'A', rect(27, 126, 77.5, 137));
z('Piso 2', 'A', rect(77.5, 126, 103, 137), 'Vic. Investigaciones');
z('Piso 2', 'A', rect(103, 126, 128, 137), 'Notas · Recibos · Finanzas');
z('Piso 2', 'A', rect(-7, 104, 27, 137));

export const ZONAS: Zona[] = zonas;

export function zonasDePiso(piso: Piso): Zona[] {
  return ZONAS.filter((zona) => zona.piso === piso);
}

/* ------------------------------------------------------------------ */
/* Escaleras, árboles y césped                                         */
/* ------------------------------------------------------------------ */

export interface Escalera {
  id: string;
  x: number;
  y: number;
  /** Largo del símbolo a lo largo de `y`. */
  len: number;
  zona: 'frontal' | 'complejo';
}

export const ESCALERAS: Escalera[] = [
  { id: 'O-N', x: 27.6, y: 10.5, len: 6, zona: 'complejo' },
  { id: 'O-S', x: 27.6, y: 50.5, len: 6, zona: 'complejo' },
  { id: 'E-N', x: 87.4, y: 10.5, len: 6, zona: 'complejo' },
  { id: 'E-S', x: 87.4, y: 50.5, len: 6, zona: 'complejo' },
  { id: 'A', x: -6, y: 104.8, len: 5, zona: 'frontal' },
];

export const ARBOLES_FONDO: Pt[] = [
  [36, 4],
  [52, 4],
  [68, 4],
  [84, 4],
  [100, 4],
  [116, 4],
  [123, 16],
  [123, 30],
  [123, 44],
  [124, 60],
  [108, 68],
];

export const ARBOLES_FRENTE: Pt[] = [
  [21, 14],
  [21, 27],
  [21, 40],
  [21, 53],
  [21, 66],
  [-13, 86],
  [-13, 99],
  [8, 79],
  [19, 78],
  [134, 78],
  [134, 94],
  [134, 110],
  [134, 126],
  [6, 143],
  [28, 143],
  [50, 143],
  [72, 143],
  [94, 143],
  [116, 143],
];

export const CESPED: Pt[][] = [
  rect(30, -2, 122, 7),
  rect(119, 8, 130, 66),
  rect(-18, 76, 24, 82),
  rect(-2, 140, 124, 147),
  rect(130, 72, 139, 134),
  rect(14, 8, 25, 70),
];

/** Rectángulo de planta que encierra el campus (para encuadres y lienzos 2D). */
export const VISTAS = {
  complejo: { x0: 24, y0: 7, x1: 120, y1: 73 },
  frontal: { x0: -10, y0: 67, x1: 131, y1: 140 },
} as const;
