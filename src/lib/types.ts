export const PISOS = ['Sótano', 'Piso 1', 'Piso 2', 'Piso 3', 'Piso 4', 'Piso 5'] as const;
export type Piso = (typeof PISOS)[number];

/** Nivel vertical de cada piso: el Piso 1 queda a ras de suelo (0) y el Sótano por debajo (-1). */
export const PISO_LEVEL: Record<Piso, number> = {
  'Sótano': -1,
  'Piso 1': 0,
  'Piso 2': 1,
  'Piso 3': 2,
  'Piso 4': 3,
  'Piso 5': 4,
};

export const PISO_SHORT: Record<Piso, string> = {
  'Sótano': 'S',
  'Piso 1': 'P1',
  'Piso 2': 'P2',
  'Piso 3': 'P3',
  'Piso 4': 'P4',
  'Piso 5': 'P5',
};

export const BLOQUE_IDS = ['A', 'B', 'C', 'D', 'E'] as const;
export type BloqueId = (typeof BLOQUE_IDS)[number];

export const CATEGORIAS = [
  'laboratorios',
  'aulas_especiales',
  'oficinas_administrativas',
  'servicios',
] as const;
export type Categoria = (typeof CATEGORIAS)[number];

export interface Espacio {
  id: string;
  codigo: string | null;
  nombre: string;
  bloque_id: BloqueId;
  piso: Piso;
  categoria: Categoria;
  descripcion: string | null;
  imagen_url: string | null;
  coord_x: number;
  coord_y: number;
  created_at: string;
  updated_at: string;
}

export type EspacioInput = Omit<Espacio, 'id' | 'created_at' | 'updated_at'>;
