/**
 * Genera supabase/seed.sql a partir del mismo catálogo que usa el modo demo,
 * para que la base de datos y el respaldo local nunca se desincronicen.
 * Uso: npm run seed:sql
 */
import { writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { BLOQUES } from '../src/data/campus';
import { ESPACIOS_SEED } from '../src/data/espacios';

const q = (value: string | null): string => (value === null ? 'null' : `'${value.replace(/'/g, "''")}'`);

const lines: string[] = [
  '-- NeoMap · UMNG Sede Calle 100',
  '-- Datos semilla. Ejecuta primero schema.sql. Archivo generado con `npm run seed:sql`.',
  '-- Las coordenadas (coord_x, coord_y) están en las unidades de planta del mapa isométrico.',
  '',
  'insert into public.bloques (id, nombre, pisos_disponibles, descripcion) values',
  BLOQUES.map(
    (b) => `  (${q(b.id)}, ${q(b.nombre)}, array[${b.pisos.map(q).join(', ')}], ${q(b.descripcion)})`,
  ).join(',\n'),
  'on conflict (id) do update',
  '  set nombre = excluded.nombre,',
  '      pisos_disponibles = excluded.pisos_disponibles,',
  '      descripcion = excluded.descripcion;',
  '',
  'insert into public.espacios',
  '  (id, codigo, nombre, bloque_id, piso, categoria, descripcion, imagen_url, coord_x, coord_y)',
  'values',
  ESPACIOS_SEED.map(
    (e) =>
      `  (${q(e.id)}, ${q(e.codigo)}, ${q(e.nombre)}, ${q(e.bloque_id)}, ${q(e.piso)}, ${q(e.categoria)}, ${q(e.descripcion)}, null, ${e.coord_x}, ${e.coord_y})`,
  ).join(',\n'),
  'on conflict (id) do nothing;',
  '',
];

const out = fileURLToPath(new URL('../supabase/seed.sql', import.meta.url));
writeFileSync(out, lines.join('\n'));
console.log(`seed.sql: ${BLOQUES.length} bloques, ${ESPACIOS_SEED.length} espacios`);
