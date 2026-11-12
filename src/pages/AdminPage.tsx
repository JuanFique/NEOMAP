import { ImageIcon, LogOut, Map as MapIcon, MapPinned, Pencil, Plus, Search, Trash2 } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { SpaceForm } from '@/components/admin/SpaceForm';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { CategoriaBadge } from '@/components/ui/badge';
import { Button, buttonVariants } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input, Select } from '@/components/ui/input';
import { CATEGORIA_META } from '@/data/categories';
import { useAuth } from '@/lib/auth';
import { createEspacio, deleteEspacio, isSupabaseMode, listEspacios, updateEspacio } from '@/lib/data';
import { BLOQUE_IDS, CATEGORIAS, type Espacio, type EspacioInput } from '@/lib/types';
import { cn, formatDate, normalizeText } from '@/lib/utils';

type Editing = { mode: 'create' } | { mode: 'edit'; espacio: Espacio } | null;

export default function AdminPage() {
  const { email, signOut } = useAuth();
  const [espacios, setEspacios] = useState<Espacio[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [bloque, setBloque] = useState('');
  const [categoria, setCategoria] = useState('');
  const [editing, setEditing] = useState<Editing>(null);
  const [deleting, setDeleting] = useState<Espacio | null>(null);

  const reload = useCallback(async () => {
    try {
      setEspacios(await listEspacios());
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudieron cargar los espacios.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void reload();
  }, [reload]);

  const rows = useMemo(() => {
    const tokens = normalizeText(query).split(/\s+/).filter(Boolean);
    return espacios.filter((e) => {
      if (bloque && e.bloque_id !== bloque) return false;
      if (categoria && e.categoria !== categoria) return false;
      if (!tokens.length) return true;
      const hay = normalizeText(`${e.nombre} ${e.codigo ?? ''} ${e.piso} ${e.descripcion ?? ''}`);
      return tokens.every((t) => hay.includes(t));
    });
  }, [espacios, query, bloque, categoria]);

  const save = async (input: EspacioInput) => {
    if (editing?.mode === 'edit') await updateEspacio(editing.espacio.id, input);
    else await createEspacio(input);
    setEditing(null);
    await reload();
  };

  const confirmDelete = async () => {
    if (!deleting) return;
    try {
      await deleteEspacio(deleting.id);
      setDeleting(null);
      await reload();
    } catch (err) {
      setDeleting(null);
      setError(err instanceof Error ? err.message : 'No se pudo eliminar el espacio.');
    }
  };

  return (
    <div className="min-h-[100dvh] bg-slate-50">
      <header className="sticky top-0 z-20 border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-3 px-4 py-3">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-navy text-white">
              <MapPinned className="h-4 w-4" aria-hidden />
            </div>
            <div className="leading-tight">
              <p className="text-sm font-bold text-slate-900">NeoMap Admin</p>
              <p className="text-[11px] text-slate-500">{email}</p>
            </div>
            {!isSupabaseMode && (
              <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold text-amber-700">
                Modo demo local
              </span>
            )}
          </div>
          <div className="ml-auto flex items-center gap-2">
            <Link to="/" className={cn(buttonVariants({ variant: 'outline', size: 'sm' }))}>
              <MapIcon className="h-3.5 w-3.5" aria-hidden />
              Ver Mapa Público
            </Link>
            <Button variant="ghost" size="sm" onClick={() => void signOut()}>
              <LogOut className="h-3.5 w-3.5" aria-hidden />
              Cerrar sesión
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl space-y-4 px-4 py-5">
        <div className="flex flex-wrap items-end gap-3">
          <div>
            <h1 className="text-xl font-bold text-slate-900">Espacios del campus</h1>
            <p className="text-xs text-slate-500">
              {rows.length} de {espacios.length} espacios
            </p>
          </div>
          <Button className="ml-auto" onClick={() => setEditing({ mode: 'create' })}>
            <Plus className="h-4 w-4" aria-hidden />
            Nuevo espacio
          </Button>
        </div>

        <div className="grid gap-2 sm:grid-cols-[1fr_10rem_14rem]">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-slate-400" aria-hidden />
            <Input
              className="pl-9"
              placeholder="Buscar por nombre, código o piso…"
              aria-label="Buscar espacios"
              value={query}
              onChange={(ev) => setQuery(ev.target.value)}
            />
          </div>
          <Select aria-label="Filtrar por bloque" value={bloque} onChange={(ev) => setBloque(ev.target.value)}>
            <option value="">Todos los bloques</option>
            {BLOQUE_IDS.map((b) => (
              <option key={b} value={b}>
                Bloque {b}
              </option>
            ))}
          </Select>
          <Select aria-label="Filtrar por categoría" value={categoria} onChange={(ev) => setCategoria(ev.target.value)}>
            <option value="">Todas las categorías</option>
            {CATEGORIAS.map((c) => (
              <option key={c} value={c}>
                {CATEGORIA_META[c].label}
              </option>
            ))}
          </Select>
        </div>

        {error && (
          <p role="alert" className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </p>
        )}

        <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
          <table className="w-full min-w-[46rem] text-left text-sm">
            <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-4 py-3 font-semibold">Código</th>
                <th className="px-4 py-3 font-semibold">Nombre</th>
                <th className="px-4 py-3 font-semibold">Bloque</th>
                <th className="px-4 py-3 font-semibold">Piso</th>
                <th className="px-4 py-3 font-semibold">Categoría</th>
                <th className="px-4 py-3 font-semibold">Imagen</th>
                <th className="px-4 py-3 text-right font-semibold">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {rows.map((e) => (
                <tr key={e.id} className="hover:bg-slate-50/60">
                  <td className="px-4 py-2.5 text-slate-500">{e.codigo ?? '—'}</td>
                  <td className="px-4 py-2.5">
                    <p className="font-semibold text-slate-800">{e.nombre}</p>
                    <p className="text-[11px] text-slate-400">Actualizado: {formatDate(e.updated_at)}</p>
                  </td>
                  <td className="px-4 py-2.5">{e.bloque_id}</td>
                  <td className="whitespace-nowrap px-4 py-2.5">{e.piso}</td>
                  <td className="px-4 py-2.5">
                    <CategoriaBadge categoria={e.categoria} className="whitespace-nowrap" />
                  </td>
                  <td className="px-4 py-2.5">
                    {e.imagen_url ? (
                      <img src={e.imagen_url} alt="" className="h-9 w-14 rounded border border-slate-200 object-cover" />
                    ) : (
                      <span className="flex h-9 w-14 items-center justify-center rounded border border-dashed border-slate-200 text-slate-300">
                        <ImageIcon className="h-4 w-4" aria-label="Sin imagen" />
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-2.5">
                    <div className="flex justify-end gap-1">
                      <Button variant="ghost" size="icon" aria-label={`Editar ${e.nombre}`} onClick={() => setEditing({ mode: 'edit', espacio: e })}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="text-red-600 hover:bg-red-50" aria-label={`Eliminar ${e.nombre}`} onClick={() => setDeleting(e)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
              {!rows.length && (
                <tr>
                  <td colSpan={7} className="px-4 py-10 text-center text-sm text-slate-500">
                    {loading ? 'Cargando espacios…' : 'No hay espacios que coincidan con los filtros.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </main>

      <Dialog open={editing !== null} onOpenChange={(open) => !open && setEditing(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-slate-900">
              {editing?.mode === 'edit' ? 'Editar espacio' : 'Nuevo espacio'}
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500">
              Completa los datos y ubica el pin haciendo clic en el plano.
            </DialogDescription>
          </DialogHeader>
          {editing && (
            <SpaceForm
              key={editing.mode === 'edit' ? editing.espacio.id : 'nuevo'}
              initial={editing.mode === 'edit' ? editing.espacio : null}
              onSubmit={save}
              onCancel={() => setEditing(null)}
            />
          )}
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleting !== null} onOpenChange={(open) => !open && setDeleting(null)}>
        <AlertDialogContent>
          <AlertDialogTitle className="text-base font-bold text-slate-900">¿Eliminar este espacio?</AlertDialogTitle>
          <AlertDialogDescription className="mt-2 text-sm text-slate-600">
            Se eliminará <b>{deleting?.nombre}</b> del mapa. Esta acción no se puede deshacer.
          </AlertDialogDescription>
          <div className="mt-5 flex justify-end gap-2">
            <AlertDialogCancel className={cn(buttonVariants({ variant: 'outline' }))}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              className={cn(buttonVariants({ variant: 'destructive' }))}
              onClick={(ev) => {
                ev.preventDefault();
                void confirmDelete();
              }}
            >
              Eliminar
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
