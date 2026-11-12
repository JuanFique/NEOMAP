import type { BloqueId, Piso } from '../lib/types';

/**
 * Geometría del campus en coordenadas de planta (x → oriente, y → sur).
 *
 * La implantación sigue la vista aérea de la sede: 1 unidad ≈ 5 px de esa foto.
 * El complejo principal es una barra frontal (el Pasillo) sobre la plazoleta
 * occidental, tres alas perpendiculares (D, C y B, de norte a sur) separadas por
 * patios cubiertos y la barra oriental (E) con su esquina achaflanada. El
 * Bloque A es la torre aislada al sur. La Entrada Principal es la portería
 * octogonal de cubierta verde, sobre la avenida occidental.
 *
 * pisos.pdf dibuja el complejo comprimido en el eje norte-sur; `pdfY` lleva
 * sus medidas a la proporción real.
 */
export type Pt = readonly [number, number];

export const rect = (x0: number, y0: number, x1: number, y1: number): Pt[] => [
  [x0, y0],
  [x1, y0],
  [x1, y1],
  [x0, y1],
];

const PDF_Y0 = 10;
const PDF_ESCALA_Y = 1.8;

/** Convierte una coordenada `y` de pisos.pdf (complejo B/C/D/E) a planta real. */
export function pdfY(y: number): number {
  return Math.round((PDF_Y0 + (y - PDF_Y0) * PDF_ESCALA_Y) * 10) / 10;
}

const aReal = (poly: Pt[]): Pt[] => poly.map(([x, y]) => [x, pdfY(y)] as const);

export interface BlockPart {
  id: string;
  nombre: string;
  poly: Pt[];
}

export interface Bloque {
  id: BloqueId;
  nombre: string;
  descripcion: string;
  pisos: Piso[];
  zona: 'frontal' | 'complejo';
  parts: BlockPart[];
}

export interface Palette {
  roof: string;
  left: string;
  right: string;
  line: string;
  /** Color de la losa cuando el piso se muestra en corte. */
  floor: string;
}

export const PALETTES = {
  /** Ladrillo a la vista con cubierta gris, como los edificios de la sede. */
  brick: { roof: '#D9DADC', left: '#C9704A', right: '#AD5836', line: '#8C4428', floor: '#FBF7F2' },
  /** Barra oriental: cubierta clara. */
  brickLight: { roof: '#ECEDEE', left: '#C9704A', right: '#AD5836', line: '#8C4428', floor: '#FBF7F2' },
  pasillo: { roof: '#CFD1D4', left: '#C9704A', right: '#AD5836', line: '#8C4428', floor: '#F1E9DF' },
  glass: { roof: '#4A5663', left: '#5E6B78', right: '#4F5B67', line: '#3B4550', floor: '#FBF7F2' },
  canopy: { roof: '#FAFAFA', left: '#E3E4E6', right: '#D2D4D7', line: '#B9BCC0', floor: '#FBF7F2' },
  green: { roof: '#3E8A5B', left: '#C9704A', right: '#AD5836', line: '#2C6843', floor: '#FBF7F2' },
} satisfies Record<string, Palette>;

/** Huella completa del complejo principal (incluye el Pasillo y la esquina achaflanada). */
export const COMPLEJO: Pt[] = aReal([
  [27, 10],
  [117, 10],
  [117, 58],
  [98, 70],
  [27, 70],
]);

const HUELLA_E: Pt[] = aReal([
  [87, 10],
  [117, 10],
  [117, 58],
  [98, 70],
  [87, 70],
]);
const HUELLA_A: Pt[] = rect(25, 137, 62, 160);

/**
 * Origen de todas las rutas: el acceso peatonal sobre la avenida occidental,
 * que atraviesa la portería octogonal de cubierta verde.
 */
export const ENTRADA: Pt = [-69, 83.5];

/** Eje de la plazoleta frontal, por donde se camina hacia los accesos de cada bloque. */
export const PLAZA_FRONTAL_X = 17;

/**
 * Cerramiento perimetral. La portería octogonal interrumpe el tramo occidental
 * y es el único paso.
 */
export const CERCA_FONDO: Pt[][] = [
  [
    [-66, 4],
    [160, 4],
  ],
];
export const CERCA_FRENTE: Pt[][] = [
  [
    [-66, 4],
    [-66, 74],
    [-63, 77],
  ],
  [
    [-63, 90],
    [-66, 93],
    [-66, 181.5],
    [160, 181.5],
  ],
];

export const BLOQUES: Bloque[] = [
  {
    id: 'A',
    nombre: 'Bloque A',
    descripcion: 'Torre al sur del complejo principal; incluye el espacio Scale Up A.',
    pisos: ['Piso 1', 'Piso 2'],
    zona: 'frontal',
    parts: [{ id: 'A', nombre: 'Bloque A', poly: HUELLA_A }],
  },
  {
    id: 'B',
    nombre: 'Bloque B',
    descripcion: 'Ala sur del complejo principal.',
    pisos: ['Piso 1', 'Piso 2', 'Piso 3'],
    zona: 'complejo',
    parts: [{ id: 'B', nombre: 'Bloque B', poly: aReal(rect(47, 50, 87, 70)) }],
  },
  {
    id: 'C',
    nombre: 'Bloque C',
    descripcion: 'Ala central del complejo principal.',
    pisos: ['Sótano', 'Piso 1', 'Piso 2', 'Piso 3'],
    zona: 'complejo',
    parts: [{ id: 'C', nombre: 'Bloque C', poly: aReal(rect(47, 30, 87, 50)) }],
  },
  {
    id: 'D',
    nombre: 'Bloque D',
    descripcion: 'Ala norte del complejo principal.',
    pisos: ['Sótano', 'Piso 1', 'Piso 2', 'Piso 3'],
    zona: 'complejo',
    parts: [{ id: 'D', nombre: 'Bloque D', poly: aReal(rect(47, 10, 87, 30)) }],
  },
  {
    id: 'E',
    nombre: 'Bloque E',
    descripcion: 'Barra oriental de cinco pisos con la esquina suroriental achaflanada.',
    pisos: ['Sótano', 'Piso 1', 'Piso 2', 'Piso 3', 'Piso 4', 'Piso 5'],
    zona: 'complejo',
    parts: [{ id: 'E', nombre: 'Bloque E', poly: HUELLA_E }],
  },
];

export const BLOQUE_BY_ID = Object.fromEntries(BLOQUES.map((b) => [b.id, b])) as Record<
  BloqueId,
  Bloque
>;

export function pisosDeBloque(id: BloqueId): Piso[] {
  return BLOQUE_BY_ID[id].pisos;
}

/* ------------------------------------------------------------------ */
/* Volúmenes que se dibujan                                            */
/* ------------------------------------------------------------------ */

export interface Volumen {
  poly: Pt[];
  /** Altura en pisos. */
  alto: number;
  palette: Palette;
}

/** Edificio navegable: se puede cortar por piso. */
export interface Estructura {
  tipo: 'edificio';
  id: string;
  nombre: string;
  /** Huella de las losas en el corte por piso. */
  poly: Pt[];
  pisos: Piso[];
  zona: 'frontal' | 'complejo';
  palette: Palette;
  /** Pisos sobre el suelo de la silueta exterior, si supera a los navegables. */
  alto?: number;
  /** Volumetría exterior cuando difiere de la huella (alas y patios cubiertos). */
  exterior?: Volumen[];
  /** Letrero de acceso sobre la fachada, como los de la sede. */
  acceso?: { at: Pt; letra: string; color: string };
}

/** Edificio o cubierta del entorno: solo da contexto, no se corta. */
export interface Contexto {
  tipo: 'contexto';
  id: string;
  volumen: Volumen;
}

const OCTAGONO: Pt[] = [
  [-57, 70],
  [-44, 70],
  [-38, 77],
  [-38, 90],
  [-44, 97],
  [-57, 97],
  [-63, 90],
  [-63, 77],
];

/** Orden de pintado de fondo a frente para la cámara suroccidental. */
export const ESCENA: (Estructura | Contexto)[] = [
  { tipo: 'contexto', id: 'ctx-ne', volumen: { poly: rect(122, 10, 156, 50), alto: 3, palette: PALETTES.brick } },
  {
    tipo: 'edificio',
    id: 'E',
    nombre: 'Bloque E',
    poly: HUELLA_E,
    pisos: BLOQUE_BY_ID.E.pisos,
    zona: 'complejo',
    palette: PALETTES.brickLight,
  },
  {
    tipo: 'edificio',
    id: 'D',
    nombre: 'Bloque D',
    poly: BLOQUE_BY_ID.D.parts[0].poly,
    pisos: BLOQUE_BY_ID.D.pisos,
    zona: 'complejo',
    palette: PALETTES.brick,
    exterior: [
      { poly: rect(47, 10, 87, 34.5), alto: 3, palette: PALETTES.brick },
      { poly: rect(47, 34.5, 87, 51.5), alto: 2.5, palette: PALETTES.glass },
    ],
    acceso: { at: [27, 28], letra: 'D', color: '#EE3124' },
  },
  {
    tipo: 'edificio',
    id: 'C',
    nombre: 'Bloque C',
    poly: BLOQUE_BY_ID.C.parts[0].poly,
    pisos: BLOQUE_BY_ID.C.pisos,
    zona: 'complejo',
    palette: PALETTES.brick,
    exterior: [
      { poly: rect(47, 51.5, 87, 76.5), alto: 3, palette: PALETTES.brick },
      { poly: rect(47, 76.5, 87, 93.5), alto: 2.5, palette: PALETTES.glass },
    ],
    acceso: { at: [27, 64], letra: 'C', color: '#FDC600' },
  },
  {
    tipo: 'edificio',
    id: 'B',
    nombre: 'Bloque B',
    poly: BLOQUE_BY_ID.B.parts[0].poly,
    pisos: BLOQUE_BY_ID.B.pisos,
    zona: 'complejo',
    palette: PALETTES.brick,
    exterior: [{ poly: rect(47, 93.5, 87, 118), alto: 3, palette: PALETTES.brick }],
    acceso: { at: [27, 100], letra: 'B', color: '#7AB648' },
  },
  {
    tipo: 'edificio',
    id: 'Pasillo',
    nombre: 'Pasillo',
    poly: rect(27, 10, 47, 118),
    pisos: ['Sótano', 'Piso 1', 'Piso 2', 'Piso 3'],
    zona: 'complejo',
    palette: PALETTES.pasillo,
  },
  { tipo: 'contexto', id: 'ctx-carpa', volumen: { poly: rect(31, 120, 62, 134), alto: 0.7, palette: PALETTES.canopy } },
  {
    tipo: 'edificio',
    id: 'A',
    nombre: 'Bloque A',
    poly: HUELLA_A,
    pisos: BLOQUE_BY_ID.A.pisos,
    zona: 'frontal',
    palette: PALETTES.brick,
    alto: 6,
    acceso: { at: [25, 148.5], letra: 'A', color: '#6EC1E4' },
  },
  { tipo: 'contexto', id: 'ctx-aula', volumen: { poly: rect(-55, 11, -15, 50), alto: 2.6, palette: PALETTES.brick } },
  { tipo: 'contexto', id: 'ctx-octagono', volumen: { poly: OCTAGONO, alto: 1.4, palette: PALETTES.green } },
];

export const EDIFICIOS: Estructura[] = ESCENA.filter((e): e is Estructura => e.tipo === 'edificio');

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

/** Las zonas del complejo se digitan con las medidas de pisos.pdf. */
function z(piso: Piso, bloque: BloqueId, poly: Pt[], label?: string, real = false): void {
  zonas.push({
    id: `${piso}-${bloque}-${zonas.length}`,
    piso,
    bloque,
    poly: real ? poly : aReal(poly),
    label,
  });
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

// --- Bloque A (coordenadas reales de la torre) -------------------------
z('Piso 1', 'A', rect(25, 137, 62, 148), 'Aulas Bloque A', true);
z('Piso 1', 'A', rect(25, 148, 62, 160), 'Scale Up A', true);

z('Piso 2', 'A', rect(25, 137, 43.5, 146), 'Acreditación', true);
z('Piso 2', 'A', rect(43.5, 137, 62, 146), 'Logística | Vicerrectoría', true);
z('Piso 2', 'A', rect(25, 151, 37, 160), 'Oficina TIC', true);
z('Piso 2', 'A', rect(37, 151, 49.5, 160), 'Vic. Investig.', true);
z('Piso 2', 'A', rect(49.5, 151, 62, 160), 'Notas · Finanzas', true);

export const ZONAS: Zona[] = zonas;

export function zonasDePiso(piso: Piso): Zona[] {
  return ZONAS.filter((zona) => zona.piso === piso);
}

/* ------------------------------------------------------------------ */
/* Escaleras, suelo y arbolado                                         */
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
  { id: 'O-N', x: 27.8, y: pdfY(10.6), len: 10, zona: 'complejo' },
  { id: 'O-S', x: 27.8, y: pdfY(50.6), len: 10, zona: 'complejo' },
  { id: 'E-N', x: 87.6, y: pdfY(10.6), len: 10, zona: 'complejo' },
  { id: 'E-S', x: 87.6, y: pdfY(50.6), len: 10, zona: 'complejo' },
  { id: 'A', x: 25.6, y: 146.4, len: 4.2, zona: 'frontal' },
];

export interface Suelo {
  poly: Pt[];
  fill: string;
  stroke?: string;
}

/** Superficies a ras de suelo, de abajo hacia arriba. */
export const SUELOS: Suelo[] = [
  // Avenidas y andenes perimetrales
  { poly: rect(-104, -14, -82, 208), fill: '#A9AEB4' },
  { poly: rect(-104, 190, 176, 208), fill: '#A9AEB4' },
  { poly: rect(-82, -14, -72, 190), fill: '#E6DDD3' },
  { poly: rect(-72, 183, 176, 190), fill: '#E6DDD3' },
  // Césped
  { poly: rect(-70, 148, -2, 181), fill: '#CFE0BF' },
  { poly: rect(22, -6, 160, 6), fill: '#CFE0BF' },
  { poly: rect(121, 56, 158, 122), fill: '#CFE0BF' },
  { poly: rect(27, 165, 66, 181), fill: '#CFE0BF' },
  // Plazoleta occidental, canchas y vía interna
  { poly: rect(-70, 4, 0, 102), fill: '#EBD9C9', stroke: '#DCC6B2' },
  { poly: rect(-70, 102, -2, 147), fill: '#DCE3E8' },
  { poly: rect(0, -6, 7, 183), fill: '#B4B9BF' },
  // Plazoleta frontal de ladrillo y parqueadero
  { poly: rect(7, 4, 27, 183), fill: '#E3C2A8', stroke: '#D3AE92' },
  { poly: rect(27, 118, 68, 165), fill: '#E3C2A8', stroke: '#D3AE92' },
  { poly: rect(68, 124, 136, 183), fill: '#B4B9BF' },
];

export const CANCHAS: Pt[][] = [rect(-64, 106, -37, 144), rect(-33, 106, -6, 144)];

/** Franjas de parqueo (x inicial, y) para las líneas de los cupos. */
export const PARQUEO: { x0: number; x1: number; y: number }[] = [
  { x0: 72, x1: 132, y: 132 },
  { x0: 72, x1: 132, y: 148 },
  { x0: 72, x1: 132, y: 164 },
  { x0: 72, x1: 132, y: 178 },
];

export const ARBOLES_FONDO: Pt[] = [
  [34, 0],
  [52, 0],
  [70, 0],
  [88, 0],
  [106, 0],
  [124, 0],
  [142, 0],
  [127, 62],
  [140, 70],
  [128, 82],
  [144, 92],
  [130, 104],
  [146, 114],
  [100, 122],
];

export const ARBOLES_FRENTE: Pt[] = [
  // Plazoleta frontal
  [12, 20],
  [12, 46],
  [12, 82],
  [12, 116],
  [12, 140],
  // Jardín junto al Bloque A
  [34, 172],
  [46, 174],
  [58, 172],
  // Parque suroccidental
  [-62, 154],
  [-50, 160],
  [-38, 153],
  [-26, 162],
  [-14, 154],
  [-56, 172],
  [-42, 174],
  [-28, 175],
  [-12, 172],
  // Andén occidental
  [-77, 20],
  [-77, 50],
  [-77, 110],
  [-77, 140],
  [-77, 170],
  // Andén sur
  [80, 186.5],
  [100, 186.5],
  [120, 186.5],
  [140, 186.5],
];

/** Rectángulos de planta para los lienzos 2D del panel administrativo. */
export const VISTAS = {
  complejo: { x0: 23, y0: 6, x1: 121, y1: 122 },
  frontal: { x0: 5, y0: 128, x1: 72, y1: 170 },
} as const;
