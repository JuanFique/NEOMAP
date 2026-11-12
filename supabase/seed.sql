-- NeoMap · UMNG Sede Calle 100
-- Datos semilla. Ejecuta primero schema.sql. Archivo generado con `npm run seed:sql`.
-- Las coordenadas (coord_x, coord_y) están en las unidades de planta del mapa isométrico.

insert into public.bloques (id, nombre, pisos_disponibles, descripcion) values
  ('A', 'Bloque A', array['Piso 1', 'Piso 2'], 'Zona frontal junto a la Entrada Principal; incluye el ala Scale Up A.'),
  ('B', 'Bloque B', array['Piso 1', 'Piso 2', 'Piso 3'], 'Ala sur del complejo principal.'),
  ('C', 'Bloque C', array['Sótano', 'Piso 1', 'Piso 2', 'Piso 3'], 'Ala central del complejo principal.'),
  ('D', 'Bloque D', array['Sótano', 'Piso 1', 'Piso 2', 'Piso 3'], 'Ala norte del complejo principal.'),
  ('E', 'Bloque E', array['Sótano', 'Piso 1', 'Piso 2', 'Piso 3', 'Piso 4', 'Piso 5'], 'Torre oriental de cinco pisos con la esquina suroriental achaflanada.')
on conflict (id) do update
  set nombre = excluded.nombre,
      pisos_disponibles = excluded.pisos_disponibles,
      descripcion = excluded.descripcion;

insert into public.espacios
  (id, codigo, nombre, bloque_id, piso, categoria, descripcion, imagen_url, coord_x, coord_y)
values
  ('00000000-0000-4000-8000-000000000001', null, 'Scale Up A', 'A', 'Piso 1', 'aulas_especiales', 'Espacio de aprendizaje activo y trabajo colaborativo en el primer nivel del Bloque A.', null, 77.5, 126),
  ('00000000-0000-4000-8000-000000000002', null, 'Acreditación Institucional', 'A', 'Piso 2', 'oficinas_administrativas', 'Oficina de gestión de calidad y procesos de acreditación institucional.', null, 77.8, 76),
  ('00000000-0000-4000-8000-000000000003', null, 'División Logística y Vicerrectoría', 'A', 'Piso 2', 'oficinas_administrativas', 'Dependencia administrativa de logística y apoyo a vicerrectoría.', null, 94.5, 98),
  ('00000000-0000-4000-8000-000000000004', null, 'Oficina TIC', 'A', 'Piso 2', 'oficinas_administrativas', 'Soporte tecnológico, infraestructura y servicios de tecnologías de la información.', null, 52.3, 120.5),
  ('00000000-0000-4000-8000-000000000005', null, 'Vicerrectoría de Investigaciones', 'A', 'Piso 2', 'oficinas_administrativas', 'Dirección y gestión de proyectos y grupos de investigación.', null, 90.3, 131.5),
  ('00000000-0000-4000-8000-000000000006', null, 'Notas, Recibos y Finanzas', 'A', 'Piso 2', 'servicios', 'Atención estudiantil para trámites financieros, recibos de matrícula y registro de notas.', null, 115.5, 131.5),
  ('00000000-0000-4000-8000-000000000007', null, 'Enfermería Sótano', 'C', 'Sótano', 'servicios', 'Punto de atención primaria en salud y primeros auxilios.', null, 67, 46.3),
  ('00000000-0000-4000-8000-000000000008', null, 'Inglés y Música (Sótano)', 'C', 'Sótano', 'aulas_especiales', 'Aulas dedicadas a formación en idiomas y actividades musicales.', null, 67, 33.5),
  ('00000000-0000-4000-8000-000000000009', null, 'Calidad de Aguas', 'D', 'Sótano', 'laboratorios', 'Laboratorio especializado en análisis físico-químico y calidad del recurso hídrico.', null, 62, 13.5),
  ('00000000-0000-4000-8000-000000000010', null, 'Coordinación Sótano', 'D', 'Sótano', 'oficinas_administrativas', 'Oficina de coordinación operativa y académica de laboratorios.', null, 82, 20),
  ('00000000-0000-4000-8000-000000000011', null, 'Lab. Física Mecánica e Hidráulica', 'D', 'Sótano', 'laboratorios', 'Laboratorio de prácticas de mecánica clásica y fluidos.', null, 50.8, 26.3),
  ('00000000-0000-4000-8000-000000000012', null, 'Lab. Física Calor y Ondas', 'D', 'Sótano', 'laboratorios', 'Laboratorio de termodinámica básica y fenómenos ondulatorios.', null, 58.3, 26.3),
  ('00000000-0000-4000-8000-000000000013', null, 'Lab. Electricidad y Magnetismo', 'D', 'Sótano', 'laboratorios', 'Laboratorio de circuitos, electromagnetismo y mediciones eléctricas.', null, 65.8, 26.3),
  ('00000000-0000-4000-8000-000000000014', null, 'Lab. Óptica y Acústica', 'D', 'Sótano', 'laboratorios', 'Laboratorio de experimentación óptica y acústica aplicada.', null, 73.3, 26.3),
  ('00000000-0000-4000-8000-000000000015', null, 'Lab. Química', 'E', 'Sótano', 'laboratorios', 'Laboratorio general de prácticas químicas.', null, 92, 21.1),
  ('00000000-0000-4000-8000-000000000016', null, 'Lab. Tratamiento de Aguas y Saneamiento', 'E', 'Sótano', 'laboratorios', 'Laboratorio de ingeniería ambiental y potabilización.', null, 92, 29.4),
  ('00000000-0000-4000-8000-000000000017', null, 'Lab. Química I Ciencias SB', 'E', 'Sótano', 'laboratorios', 'Laboratorio de ciencias básicas y química fundamental.', null, 92, 37.6),
  ('00000000-0000-4000-8000-000000000018', null, 'Lab. Simulación Analítica IA', 'E', 'Sótano', 'laboratorios', 'Laboratorio computacional de simulación e inteligencia artificial aplicada.', null, 92, 45.9),
  ('00000000-0000-4000-8000-000000000019', null, 'Almacén y Oficina de Seguridad', 'E', 'Sótano', 'servicios', 'Almacén de insumos técnicos y control de seguridad física.', null, 95, 64),
  ('00000000-0000-4000-8000-000000000020', null, 'Lab. Térmica', 'E', 'Sótano', 'laboratorios', 'Laboratorio de transferencia de calor y sistemas térmicos.', null, 112, 20.4),
  ('00000000-0000-4000-8000-000000000021', null, 'Lab. Robótica IA', 'E', 'Sótano', 'laboratorios', 'Laboratorio de robótica móvil, manipuladores y sistemas inteligentes.', null, 112, 27.3),
  ('00000000-0000-4000-8000-000000000022', null, 'Lab. I Ingeniería en Multimedia', 'E', 'Sótano', 'laboratorios', 'Laboratorio especializado en producción digital, gráficos 3D y desarrollo multimedia.', null, 112, 34.1),
  ('00000000-0000-4000-8000-000000000023', null, 'Lab. Automatización y Control', 'E', 'Sótano', 'laboratorios', 'Laboratorio de PLC, instrumentación y control industrial.', null, 112, 40.9),
  ('00000000-0000-4000-8000-000000000024', null, 'Lab. Comunicaciones, Antenas y Microondas', 'E', 'Sótano', 'laboratorios', 'Laboratorio de telecomunicaciones, radiofrecuencia y propagación.', null, 112, 47.8),
  ('00000000-0000-4000-8000-000000000025', null, 'Lab. Química II', 'E', 'Sótano', 'laboratorios', 'Laboratorio avanzado de análisis químico.', null, 112, 54.6),
  ('00000000-0000-4000-8000-000000000026', null, 'Decanatura, Vicerrectoría y Dirección de Procesos', 'B', 'Piso 1', 'oficinas_administrativas', 'Oficinas directivas y administrativas del Bloque B.', null, 62, 53.5),
  ('00000000-0000-4000-8000-000000000027', null, 'Centro de Experiencia', 'B', 'Piso 1', 'servicios', 'Espacio de atención, orientación y experiencia universitaria.', null, 82, 53.5),
  ('00000000-0000-4000-8000-000000000028', null, 'Enfermería Piso 1', 'C', 'Piso 1', 'servicios', 'Servicio médico y atención de enfermería del primer nivel.', null, 67, 46.3),
  ('00000000-0000-4000-8000-000000000029', null, 'Inglés y Música (Piso 1)', 'C', 'Piso 1', 'aulas_especiales', 'Salas de práctica de idiomas y ensamble musical.', null, 67, 33.5),
  ('00000000-0000-4000-8000-000000000030', null, 'Biblioteca | Programa de Ingeniería', 'C', 'Piso 1', 'servicios', 'Sala de consulta bibliográfica y recursos académicos de ingeniería.', null, 67, 26.3),
  ('00000000-0000-4000-8000-000000000031', null, 'Relaciones Internacionales', 'C', 'Piso 1', 'oficinas_administrativas', 'Gestión de movilidad académica, convenios e intercambios.', null, 92, 26.1),
  ('00000000-0000-4000-8000-000000000032', null, 'Oficina de Protección, Patrimonio y Seguridad', 'C', 'Piso 1', 'oficinas_administrativas', 'Coordinación de seguridad integral y protección patrimonial.', null, 92, 33.4),
  ('00000000-0000-4000-8000-000000000033', null, 'CORSE y Aula de Seguridad', 'C', 'Piso 1', 'aulas_especiales', 'Espacio de capacitación y gestión operativa CORSE.', null, 92, 46.3),
  ('00000000-0000-4000-8000-000000000034', null, 'Decanatura Facultad de Ingeniería', 'D', 'Piso 1', 'oficinas_administrativas', 'Decanatura y equipo funcional de la Facultad de Ingeniería.', null, 53.7, 13.5),
  ('00000000-0000-4000-8000-000000000035', null, 'Dirección de Posgrados Facultad de Ingeniería', 'D', 'Piso 1', 'oficinas_administrativas', 'Coordinación administrativa de especializaciones y maestrías.', null, 67, 13.5),
  ('00000000-0000-4000-8000-000000000036', null, 'Programa de Ingeniería Industrial', 'D', 'Piso 1', 'oficinas_administrativas', 'Dirección y atención académica de Ingeniería Industrial.', null, 80.3, 13.5),
  ('00000000-0000-4000-8000-000000000037', null, 'Consultorio Asesoría Centro de Investigaciones', 'E', 'Piso 1', 'oficinas_administrativas', 'Asesoría metodológica y gestión de investigación.', null, 112, 12.9),
  ('00000000-0000-4000-8000-000000000038', null, 'Programa de Ingeniería en Multimedia', 'E', 'Piso 1', 'oficinas_administrativas', 'Dirección del programa, coordinación académica y atención a estudiantes de Multimedia.', null, 112, 24.7),
  ('00000000-0000-4000-8000-000000000039', null, 'Programa de Ingeniería en Telecomunicaciones', 'E', 'Piso 1', 'oficinas_administrativas', 'Dirección y gestión académica de Telecomunicaciones.', null, 112, 30.6),
  ('00000000-0000-4000-8000-000000000040', null, 'Programa de Administración de Empresas', 'E', 'Piso 1', 'oficinas_administrativas', 'Oficina de coordinación académica de Administración de Empresas.', null, 112, 36.4),
  ('00000000-0000-4000-8000-000000000041', null, 'Dirección de Medios Educativos y TIC (Tutores y Psicología)', 'E', 'Piso 1', 'servicios', 'Apoyo psicopedagógico, tutorías académicas y recursos educativos.', null, 112, 54.1),
  ('00000000-0000-4000-8000-000000000042', null, 'Zona de Bancos', 'E', 'Piso 1', 'servicios', 'Área de cajeros electrónicos y servicios bancarios en la esquina suroriental.', null, 111, 66),
  ('00000000-0000-4000-8000-000000000043', null, 'Sala de Sistemas', 'C', 'Piso 2', 'laboratorios', 'Sala de cómputo de acceso estudiantil con software académico, sobre el Pasillo occidental.', null, 32, 33.5),
  ('00000000-0000-4000-8000-000000000044', null, 'Biblioteca | Programa de Ingeniería (Piso 2)', 'C', 'Piso 2', 'servicios', 'Segundo nivel de la biblioteca y salas de lectura.', null, 67, 26.3),
  ('00000000-0000-4000-8000-000000000045', null, 'Decanatura y Posgrados Ingeniería (Piso 2)', 'D', 'Piso 2', 'oficinas_administrativas', 'Oficinas administrativas del segundo nivel del Bloque D.', null, 67, 13.5),
  ('00000000-0000-4000-8000-000000000046', null, 'Rama Estudiantil IEEE', 'E', 'Piso 4', 'servicios', 'Espacio de actividades, proyectos y capítulos estudiantiles IEEE.', null, 111, 49),
  ('00000000-0000-4000-8000-000000000047', null, 'Asuntos Disciplinarios', 'E', 'Piso 4', 'oficinas_administrativas', 'Oficina institucional de gestión y procesos disciplinarios.', null, 104, 62),
  ('00000000-0000-4000-8000-000000000048', null, 'Baños Piso 4', 'E', 'Piso 4', 'servicios', 'Batería de baños del cuarto piso del Bloque E.', null, 92.5, 34),
  ('00000000-0000-4000-8000-000000000049', null, 'Centro de Realidad Virtual', 'E', 'Piso 5', 'laboratorios', 'Laboratorio inmersivo de realidad virtual, simulación 3D y experiencias interactivas.', null, 92.5, 34),
  ('00000000-0000-4000-8000-000000000050', null, 'Laboratorio de Redes Teleco', 'E', 'Piso 5', 'laboratorios', 'Laboratorio de infraestructura de redes, enrutamiento y telemática.', null, 92.5, 45),
  ('00000000-0000-4000-8000-000000000051', null, 'Lab. Ingeniería en Multimedia 2', 'E', 'Piso 5', 'laboratorios', 'Laboratorio de cómputo avanzado para diseño interactivo, animación y motores gráficos.', null, 111, 16),
  ('00000000-0000-4000-8000-000000000052', null, 'Lab. Ingeniería en Multimedia 3', 'E', 'Piso 5', 'laboratorios', 'Laboratorio de producción audiovisual, postproducción y desarrollo web/interactivo.', null, 111, 28),
  ('00000000-0000-4000-8000-000000000053', null, 'Electrónica y Comunicaciones', 'E', 'Piso 5', 'laboratorios', 'Laboratorio de sistemas electrónicos y comunicaciones digitales.', null, 111, 40),
  ('00000000-0000-4000-8000-000000000054', null, 'Doctorado en Innovación', 'E', 'Piso 5', 'oficinas_administrativas', 'Sala académica y de investigación del programa de Doctorado en Innovación.', null, 111, 52)
on conflict (id) do nothing;
