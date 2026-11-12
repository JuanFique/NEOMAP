import { Lock, MapPinned } from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { CategoryFilters } from '@/components/hud/CategoryFilters';
import { FloorSelector } from '@/components/hud/FloorSelector';
import { SearchBar } from '@/components/hud/SearchBar';
import { SpaceDetail } from '@/components/hud/SpaceDetail';
import { ZoomControls } from '@/components/hud/ZoomControls';
import CampusMap, { type CampusMapHandle, type FitOptions } from '@/components/map/CampusMap';
import { isSupabaseMode, listEspacios } from '@/lib/data';
import { FLOOR_H } from '@/lib/iso';
import { buildRoute } from '@/lib/route';
import { PISO_LEVEL, type Categoria, type Espacio, type Piso } from '@/lib/types';
import { normalizeText } from '@/lib/utils';

function haystack(e: Espacio): string {
  return normalizeText(
    [e.nombre, e.codigo ?? '', `bloque ${e.bloque_id}`, e.piso, e.descripcion ?? ''].join(' '),
  );
}

/** Espacio que tapan los paneles flotantes, para encuadrar en el área libre. */
function panelPadding(): FitOptions {
  const desktop = window.matchMedia('(min-width: 640px)').matches;
  return desktop ? { padRight: 370 } : { padBottom: window.innerHeight * 0.4, padTop: 205 };
}

export default function MapPage() {
  const mapRef = useRef<CampusMapHandle>(null);
  const [espacios, setEspacios] = useState<Espacio[]>([]);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [cats, setCats] = useState<Set<Categoria>>(new Set());
  const [activeFloor, setActiveFloor] = useState<Piso | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [routeId, setRouteId] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    listEspacios()
      .then((data) => {
        if (alive) setEspacios(data);
      })
      .catch((err: unknown) => {
        if (alive) setLoadError(err instanceof Error ? err.message : 'No se pudieron cargar los espacios.');
      });
    return () => {
      alive = false;
    };
  }, []);

  const tokens = useMemo(() => normalizeText(query).split(/\s+/).filter(Boolean), [query]);
  const filterActive = tokens.length > 0 || cats.size > 0;

  const matches = useMemo(() => {
    if (!filterActive) return espacios;
    return espacios.filter((e) => {
      if (cats.size > 0 && !cats.has(e.categoria)) return false;
      if (!tokens.length) return true;
      const hay = haystack(e);
      return tokens.every((t) => hay.includes(t));
    });
  }, [espacios, tokens, cats, filterActive]);

  const matchIds = useMemo(
    () => (filterActive ? new Set(matches.map((e) => e.id)) : null),
    [filterActive, matches],
  );

  const selected = espacios.find((e) => e.id === selectedId) ?? null;
  const route = useMemo(() => {
    const target = espacios.find((e) => e.id === routeId);
    return target ? buildRoute(target) : null;
  }, [espacios, routeId]);

  const selectSpace = useCallback((e: Espacio) => {
    setSelectedId(e.id);
    setActiveFloor(e.piso);
    setRouteId((current) => (current === e.id ? current : null));
    mapRef.current?.fitWorld(
      [{ x: e.coord_x, y: e.coord_y, z: PISO_LEVEL[e.piso] * FLOOR_H }],
      { ...panelPadding(), maxZoom: 1.7 },
    );
  }, []);

  const traceRoute = useCallback(() => {
    if (!selected) return;
    const r = buildRoute(selected);
    setActiveFloor(selected.piso);
    setRouteId(selected.id);
    mapRef.current?.fitWorld(r.points, panelPadding());
  }, [selected]);

  const changeFloor = useCallback(
    (piso: Piso | null) => {
      setActiveFloor(piso);
      // La ruta pertenece al piso de su destino: al cambiar de piso se retira.
      if (route && selected && piso !== selected.piso) setRouteId(null);
    },
    [route, selected],
  );

  const toggleCat = useCallback((categoria: Categoria) => {
    setCats((prev) => {
      const next = new Set(prev);
      if (next.has(categoria)) next.delete(categoria);
      else next.add(categoria);
      return next;
    });
  }, []);

  const clearFilters = useCallback(() => {
    setQuery('');
    setCats(new Set());
  }, []);

  return (
    <main className="relative h-[100dvh] w-full overflow-hidden">
      <CampusMap
        ref={mapRef}
        espacios={espacios}
        activeFloor={activeFloor}
        selectedId={selectedId}
        matchIds={matchIds}
        route={route}
        onSelect={selectSpace}
      />

      {/* HUD superior izquierdo */}
      <div className="pointer-events-none absolute inset-x-0 top-0 z-20 p-3 sm:right-auto sm:w-[30rem] sm:p-4">
        <div className="pointer-events-auto space-y-2">
          <div className="flex items-center gap-2">
            <div className="flex h-11 shrink-0 items-center gap-2 rounded-xl bg-navy px-3 text-white shadow-md">
              <MapPinned className="h-4 w-4" aria-hidden />
              <span className="text-sm font-bold tracking-tight">NeoMap</span>
            </div>
            <div className="min-w-0 flex-1">
              <SearchBar query={query} onQueryChange={setQuery} results={matches} onPick={selectSpace} />
            </div>
          </div>
          <CategoryFilters active={cats} onToggle={toggleCat} showClear={filterActive} onClear={clearFilters} />
          {filterActive && (
            <p className="hidden rounded-full bg-white/90 px-3 py-1 text-xs font-medium text-slate-600 shadow-sm sm:inline-block">
              {matches.length === 1 ? '1 espacio coincide' : `${matches.length} espacios coinciden`}
            </p>
          )}
          <div className="sm:hidden">
            <FloorSelector active={activeFloor} onChange={changeFloor} horizontal />
          </div>
          {loadError && (
            <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">{loadError}</p>
          )}
        </div>
      </div>

      {/* Selector de piso */}
      <div className="absolute left-4 top-1/2 z-10 hidden -translate-y-1/3 sm:block">
        <FloorSelector active={activeFloor} onChange={changeFloor} />
      </div>

      {/* Resumen de ruta */}
      {route && (
        <div className="pointer-events-none absolute inset-x-0 bottom-5 z-10 hidden justify-center px-3 sm:flex">
          <p className="rounded-full border border-amber-200 bg-white px-4 py-2 text-center text-xs font-semibold text-slate-700 shadow-md">
            <span className="mr-1.5 inline-block h-2 w-2 rounded-full bg-gold align-middle" aria-hidden />
            {route.resumen}
          </p>
        </div>
      )}

      {/* Controles inferiores */}
      {!selected && (
        <Link
          to="/admin"
          className="absolute bottom-4 left-3 z-10 flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-600 shadow-md hover:bg-slate-50 sm:left-4"
        >
          <Lock className="h-3.5 w-3.5" aria-hidden />
          Admin
          {!isSupabaseMode && <span className="rounded-full bg-amber-100 px-1.5 text-[10px] text-amber-700">demo</span>}
        </Link>
      )}
      <div className={`absolute right-3 z-10 sm:bottom-4 sm:right-4 ${selected ? 'bottom-[calc(40dvh+0.75rem)]' : 'bottom-4'}`}>
        <ZoomControls
          onZoomIn={() => mapRef.current?.zoomIn()}
          onZoomOut={() => mapRef.current?.zoomOut()}
          onReset={() => mapRef.current?.reset()}
        />
      </div>

      {selected && (
        <SpaceDetail
          espacio={selected}
          routeActive={routeId === selected.id}
          resumen={routeId === selected.id ? route?.resumen : undefined}
          onTrace={traceRoute}
          onClearRoute={() => setRouteId(null)}
          onClose={() => {
            setSelectedId(null);
            setRouteId(null);
          }}
        />
      )}
    </main>
  );
}
