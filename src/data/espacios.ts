import type { BloqueId, Categoria, Espacio, Piso } from '../lib/types';

/**
 * Catálogo semilla de la sede Calle 100, tomado de pisos.pdf y acotado al
 * alcance del Project Charter: no incluye salones regulares, auditorios,
 * salas de profesores, tiendas/cafeterías ni zonas comunes.
 *
 * `coord_x` / `coord_y` están en las mismas coordenadas de planta que el mapa.
 */
type Fila = [
  nombre: string,
  bloque: BloqueId,
  piso: Piso,
  categoria: Categoria,
  x: number,
  y: number,
  descripcion: string,
  codigo?: string,
];

const FILAS: Fila[] = [
  // Bloque A · Piso 1
  ['Scale Up A', 'A', 'Piso 1', 'aulas_especiales', 77.5, 126, 'Espacio de aprendizaje activo y trabajo colaborativo en el primer nivel del Bloque A.'],

  // Bloque A · Piso 2
  ['Acreditación Institucional', 'A', 'Piso 2', 'oficinas_administrativas', 77.8, 76, 'Oficina de gestión de calidad y procesos de acreditación institucional.'],
  ['División Logística y Vicerrectoría', 'A', 'Piso 2', 'oficinas_administrativas', 94.5, 98, 'Dependencia administrativa de logística y apoyo a vicerrectoría.'],
  ['Oficina TIC', 'A', 'Piso 2', 'oficinas_administrativas', 52.3, 120.5, 'Soporte tecnológico, infraestructura y servicios de tecnologías de la información.'],
  ['Vicerrectoría de Investigaciones', 'A', 'Piso 2', 'oficinas_administrativas', 90.3, 131.5, 'Dirección y gestión de proyectos y grupos de investigación.'],
  ['Notas, Recibos y Finanzas', 'A', 'Piso 2', 'servicios', 115.5, 131.5, 'Atención estudiantil para trámites financieros, recibos de matrícula y registro de notas.'],

  // Sótano
  ['Enfermería Sótano', 'C', 'Sótano', 'servicios', 67, 46.3, 'Punto de atención primaria en salud y primeros auxilios.'],
  ['Inglés y Música (Sótano)', 'C', 'Sótano', 'aulas_especiales', 67, 33.5, 'Aulas dedicadas a formación en idiomas y actividades musicales.'],
  ['Calidad de Aguas', 'D', 'Sótano', 'laboratorios', 62, 13.5, 'Laboratorio especializado en análisis físico-químico y calidad del recurso hídrico.'],
  ['Coordinación Sótano', 'D', 'Sótano', 'oficinas_administrativas', 82, 20, 'Oficina de coordinación operativa y académica de laboratorios.'],
  ['Lab. Física Mecánica e Hidráulica', 'D', 'Sótano', 'laboratorios', 50.8, 26.3, 'Laboratorio de prácticas de mecánica clásica y fluidos.'],
  ['Lab. Física Calor y Ondas', 'D', 'Sótano', 'laboratorios', 58.3, 26.3, 'Laboratorio de termodinámica básica y fenómenos ondulatorios.'],
  ['Lab. Electricidad y Magnetismo', 'D', 'Sótano', 'laboratorios', 65.8, 26.3, 'Laboratorio de circuitos, electromagnetismo y mediciones eléctricas.'],
  ['Lab. Óptica y Acústica', 'D', 'Sótano', 'laboratorios', 73.3, 26.3, 'Laboratorio de experimentación óptica y acústica aplicada.'],
  ['Lab. Química', 'E', 'Sótano', 'laboratorios', 92, 21.1, 'Laboratorio general de prácticas químicas.'],
  ['Lab. Tratamiento de Aguas y Saneamiento', 'E', 'Sótano', 'laboratorios', 92, 29.4, 'Laboratorio de ingeniería ambiental y potabilización.'],
  ['Lab. Química I Ciencias SB', 'E', 'Sótano', 'laboratorios', 92, 37.6, 'Laboratorio de ciencias básicas y química fundamental.'],
  ['Lab. Simulación Analítica IA', 'E', 'Sótano', 'laboratorios', 92, 45.9, 'Laboratorio computacional de simulación e inteligencia artificial aplicada.'],
  ['Almacén y Oficina de Seguridad', 'E', 'Sótano', 'servicios', 95, 64, 'Almacén de insumos técnicos y control de seguridad física.'],
  ['Lab. Térmica', 'E', 'Sótano', 'laboratorios', 112, 20.4, 'Laboratorio de transferencia de calor y sistemas térmicos.'],
  ['Lab. Robótica IA', 'E', 'Sótano', 'laboratorios', 112, 27.3, 'Laboratorio de robótica móvil, manipuladores y sistemas inteligentes.'],
  ['Lab. I Ingeniería en Multimedia', 'E', 'Sótano', 'laboratorios', 112, 34.1, 'Laboratorio especializado en producción digital, gráficos 3D y desarrollo multimedia.'],
  ['Lab. Automatización y Control', 'E', 'Sótano', 'laboratorios', 112, 40.9, 'Laboratorio de PLC, instrumentación y control industrial.'],
  ['Lab. Comunicaciones, Antenas y Microondas', 'E', 'Sótano', 'laboratorios', 112, 47.8, 'Laboratorio de telecomunicaciones, radiofrecuencia y propagación.'],
  ['Lab. Química II', 'E', 'Sótano', 'laboratorios', 112, 54.6, 'Laboratorio avanzado de análisis químico.'],

  // Piso 1
  ['Decanatura, Vicerrectoría y Dirección de Procesos', 'B', 'Piso 1', 'oficinas_administrativas', 62, 53.5, 'Oficinas directivas y administrativas del Bloque B.'],
  ['Centro de Experiencia', 'B', 'Piso 1', 'servicios', 82, 53.5, 'Espacio de atención, orientación y experiencia universitaria.'],
  ['Enfermería Piso 1', 'C', 'Piso 1', 'servicios', 67, 46.3, 'Servicio médico y atención de enfermería del primer nivel.'],
  ['Inglés y Música (Piso 1)', 'C', 'Piso 1', 'aulas_especiales', 67, 33.5, 'Salas de práctica de idiomas y ensamble musical.'],
  ['Biblioteca | Programa de Ingeniería', 'C', 'Piso 1', 'servicios', 67, 26.3, 'Sala de consulta bibliográfica y recursos académicos de ingeniería.'],
  ['Relaciones Internacionales', 'C', 'Piso 1', 'oficinas_administrativas', 92, 26.1, 'Gestión de movilidad académica, convenios e intercambios.'],
  ['Oficina de Protección, Patrimonio y Seguridad', 'C', 'Piso 1', 'oficinas_administrativas', 92, 33.4, 'Coordinación de seguridad integral y protección patrimonial.'],
  ['CORSE y Aula de Seguridad', 'C', 'Piso 1', 'aulas_especiales', 92, 46.3, 'Espacio de capacitación y gestión operativa CORSE.'],
  ['Decanatura Facultad de Ingeniería', 'D', 'Piso 1', 'oficinas_administrativas', 53.7, 13.5, 'Decanatura y equipo funcional de la Facultad de Ingeniería.'],
  ['Dirección de Posgrados Facultad de Ingeniería', 'D', 'Piso 1', 'oficinas_administrativas', 67, 13.5, 'Coordinación administrativa de especializaciones y maestrías.'],
  ['Programa de Ingeniería Industrial', 'D', 'Piso 1', 'oficinas_administrativas', 80.3, 13.5, 'Dirección y atención académica de Ingeniería Industrial.'],
  ['Consultorio Asesoría Centro de Investigaciones', 'E', 'Piso 1', 'oficinas_administrativas', 112, 12.9, 'Asesoría metodológica y gestión de investigación.'],
  ['Programa de Ingeniería en Multimedia', 'E', 'Piso 1', 'oficinas_administrativas', 112, 24.7, 'Dirección del programa, coordinación académica y atención a estudiantes de Multimedia.'],
  ['Programa de Ingeniería en Telecomunicaciones', 'E', 'Piso 1', 'oficinas_administrativas', 112, 30.6, 'Dirección y gestión académica de Telecomunicaciones.'],
  ['Programa de Administración de Empresas', 'E', 'Piso 1', 'oficinas_administrativas', 112, 36.4, 'Oficina de coordinación académica de Administración de Empresas.'],
  ['Dirección de Medios Educativos y TIC (Tutores y Psicología)', 'E', 'Piso 1', 'servicios', 112, 54.1, 'Apoyo psicopedagógico, tutorías académicas y recursos educativos.'],
  ['Zona de Bancos', 'E', 'Piso 1', 'servicios', 111, 66, 'Área de cajeros electrónicos y servicios bancarios en la esquina suroriental.'],

  // Piso 2
  ['Sala de Sistemas', 'C', 'Piso 2', 'laboratorios', 32, 33.5, 'Sala de cómputo de acceso estudiantil con software académico, sobre el Pasillo occidental.'],
  ['Biblioteca | Programa de Ingeniería (Piso 2)', 'C', 'Piso 2', 'servicios', 67, 26.3, 'Segundo nivel de la biblioteca y salas de lectura.'],
  ['Decanatura y Posgrados Ingeniería (Piso 2)', 'D', 'Piso 2', 'oficinas_administrativas', 67, 13.5, 'Oficinas administrativas del segundo nivel del Bloque D.'],

  // Piso 4
  ['Rama Estudiantil IEEE', 'E', 'Piso 4', 'servicios', 111, 49, 'Espacio de actividades, proyectos y capítulos estudiantiles IEEE.'],
  ['Asuntos Disciplinarios', 'E', 'Piso 4', 'oficinas_administrativas', 104, 62, 'Oficina institucional de gestión y procesos disciplinarios.'],
  ['Baños Piso 4', 'E', 'Piso 4', 'servicios', 92.5, 34, 'Batería de baños del cuarto piso del Bloque E.'],

  // Piso 5
  ['Centro de Realidad Virtual', 'E', 'Piso 5', 'laboratorios', 92.5, 34, 'Laboratorio inmersivo de realidad virtual, simulación 3D y experiencias interactivas.'],
  ['Laboratorio de Redes Teleco', 'E', 'Piso 5', 'laboratorios', 92.5, 45, 'Laboratorio de infraestructura de redes, enrutamiento y telemática.'],
  ['Lab. Ingeniería en Multimedia 2', 'E', 'Piso 5', 'laboratorios', 111, 16, 'Laboratorio de cómputo avanzado para diseño interactivo, animación y motores gráficos.'],
  ['Lab. Ingeniería en Multimedia 3', 'E', 'Piso 5', 'laboratorios', 111, 28, 'Laboratorio de producción audiovisual, postproducción y desarrollo web/interactivo.'],
  ['Electrónica y Comunicaciones', 'E', 'Piso 5', 'laboratorios', 111, 40, 'Laboratorio de sistemas electrónicos y comunicaciones digitales.'],
  ['Doctorado en Innovación', 'E', 'Piso 5', 'oficinas_administrativas', 111, 52, 'Sala académica y de investigación del programa de Doctorado en Innovación.'],
];

const SEED_DATE = '2026-11-12T00:00:00.000Z';

export const ESPACIOS_SEED: Espacio[] = FILAS.map(
  ([nombre, bloque_id, piso, categoria, coord_x, coord_y, descripcion, codigo], i) => ({
    id: `00000000-0000-4000-8000-${String(i + 1).padStart(12, '0')}`,
    codigo: codigo ?? null,
    nombre,
    bloque_id,
    piso,
    categoria,
    descripcion,
    imagen_url: null,
    coord_x,
    coord_y,
    created_at: SEED_DATE,
    updated_at: SEED_DATE,
  }),
);
