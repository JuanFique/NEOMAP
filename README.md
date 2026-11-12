# NeoMap

Mapa isométrico interactivo de la **Universidad Militar Nueva Granada — Sede Calle 100**. Permite explorar el campus, ver cada piso en corte, buscar espacios por texto o categoría, consultar su detalle y trazar una ruta visual desde la Entrada Principal. Incluye un panel administrativo protegido para crear, editar y eliminar espacios.

## Ejecutar

Requiere Node.js 18 o superior.

```bash
npm install
```

```bash
npm run dev
```

Abre http://localhost:5173. Sin configuración adicional la app arranca en **modo demo local**: usa el catálogo incluido y guarda los cambios en el `localStorage` del navegador.

| Ruta | Qué es |
| --- | --- |
| `/` | Mapa público |
| `/admin/login` | Inicio de sesión del panel |
| `/admin` | Gestión de espacios (requiere sesión) |

Credenciales del modo demo: `admin@unimilitar.edu.co` / `NeoMap2026*`.

Otros comandos:

| Comando | Para qué |
| --- | --- |
| `npm run build` | Verifica tipos y genera `dist/` |
| `npm run preview` | Sirve el build de producción |
| `npm run seed:sql` | Regenera `supabase/seed.sql` desde `src/data/espacios.ts` |

## Conectar Supabase

1. Crea un proyecto en [supabase.com](https://supabase.com).
2. En **SQL Editor** ejecuta `supabase/schema.sql` y después `supabase/seed.sql`.
3. En **Authentication → Users** crea un usuario por cada administrador (correo y contraseña). Todos tienen el mismo nivel de permisos.
4. Copia `.env.example` como `.env` y completa los valores de **Project Settings → API**:

   ```
   VITE_SUPABASE_URL=https://xxxx.supabase.co
   VITE_SUPABASE_ANON_KEY=...
   ```

5. Reinicia `npm run dev`. Con ambas variables presentes la app usa Supabase para datos, autenticación e imágenes (bucket público `espacios-imagenes`, solo PNG de hasta 5 MB).

`schema.sql` deja la lectura abierta al público y restringe crear, editar y eliminar a usuarios autenticados (RLS), y actualiza `updated_at` automáticamente en cada edición.

## Desplegar en Vercel

1. Importa el repositorio en [vercel.com](https://vercel.com); `vercel.json` ya define el build y el rewrite para que `/admin` funcione al recargar.
2. Si usas Supabase, agrega `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY` en **Settings → Environment Variables** y vuelve a desplegar. Sin ellas el sitio publicado queda en modo demo.

## Estructura

```
src/
  components/
    map/      Motor SVG isométrico: prismas, corte por piso, pines, ruta, cámara
    hud/      Buscador, filtros, selector de piso, zoom, panel de detalle
    admin/    Guardia de sesión, formulario y selector de coordenadas
    ui/       Primitivas de interfaz (botón, campos, diálogos)
  data/       Geometría del campus, zonas por piso, catálogo semilla, categorías
  lib/        Proyección isométrica, rutas, acceso a datos y autenticación
  pages/      Mapa público, login y panel
supabase/     schema.sql y seed.sql
scripts/      Generador de seed.sql
```

Todo el mapa se dibuja por código (`src/lib/iso.ts` + `src/data/campus.ts`); no hay archivos SVG externos. Edificios, zonas, pines y rutas comparten las mismas coordenadas de planta: `x` crece hacia el oriente y `y` hacia el sur.

## Diseño

- **Interfaz:** sigue la identidad de [umng.edu.co](https://umng.edu.co): azul `#043074`, amarillo `#FDC600`, tipografía Noto Sans y botones tipo píldora en mayúsculas. Los colores están en `tailwind.config.js` bajo `umng`.
- **Mapa:** la implantación sigue la vista aérea de la sede. El complejo principal es una barra frontal (el Pasillo, con los accesos D, C y B), tres alas separadas por patios cubiertos y la barra oriental del Bloque E; el Bloque A es la torre al sur. Alrededor se dibujan la plazoleta, las canchas, el parqueadero y las vías como contexto. Los edificios usan ladrillo y cubiertas grises, sin ventanas ni detalle de fachada.
- **Pisos:** `pisos.pdf` dibuja el complejo comprimido en sentido norte-sur. `pdfY()` en `src/data/campus.ts` lleva esas medidas a la proporción real, así que las zonas y el catálogo se pueden seguir digitando con las medidas del PDF.

## Alcance del catálogo

El catálogo semilla (54 espacios) sigue el Project Charter: laboratorios, aulas especiales, oficinas administrativas y servicios. Quedan fuera salones regulares, auditorios, salas de profesores, tiendas/cafeterías y zonas comunes; sus salas sí aparecen dibujadas y rotuladas en el corte de cada piso, pero sin pin ni ficha. Cualquier espacio se puede agregar después desde el panel.

Las rutas son generales y fijas (Entrada Principal → Pasillo → escaleras → bloque y piso), sin navegación interior detallada ni geolocalización.
