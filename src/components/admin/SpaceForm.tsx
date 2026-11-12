import { ImagePlus, Trash2 } from 'lucide-react';
import { useEffect, useMemo, useState, type ChangeEvent, type FormEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Input, Label, Select, Textarea } from '@/components/ui/input';
import { CATEGORIA_META } from '@/data/categories';
import { BLOQUE_BY_ID, pisosDeBloque } from '@/data/campus';
import { fileToDataUrl, uploadImagen, validarImagen } from '@/lib/data';
import { centroid } from '@/lib/iso';
import { BLOQUE_IDS, CATEGORIAS, type BloqueId, type Categoria, type Espacio, type EspacioInput, type Piso } from '@/lib/types';
import { CoordinatePicker } from './CoordinatePicker';

interface Props {
  initial: Espacio | null;
  onSubmit: (input: EspacioInput) => Promise<void>;
  onCancel: () => void;
}

function centroDe(bloque: BloqueId): [number, number] {
  const [cx, cy] = centroid(BLOQUE_BY_ID[bloque].parts[0].poly);
  return [Math.round(cx * 10) / 10, Math.round(cy * 10) / 10];
}

export function SpaceForm({ initial, onSubmit, onCancel }: Props) {
  const [nombre, setNombre] = useState(initial?.nombre ?? '');
  const [codigo, setCodigo] = useState(initial?.codigo ?? '');
  const [bloque, setBloque] = useState<BloqueId>(initial?.bloque_id ?? 'E');
  const [piso, setPiso] = useState<Piso>(initial?.piso ?? 'Piso 1');
  const [categoria, setCategoria] = useState<Categoria>(initial?.categoria ?? 'laboratorios');
  const [descripcion, setDescripcion] = useState(initial?.descripcion ?? '');
  const [coord, setCoord] = useState<[number, number]>(
    initial ? [initial.coord_x, initial.coord_y] : centroDe('E'),
  );
  const [imagenUrl, setImagenUrl] = useState<string | null>(initial?.imagen_url ?? null);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const pisos = useMemo(() => pisosDeBloque(bloque), [bloque]);

  // El piso se restringe a los niveles reales del bloque elegido.
  useEffect(() => {
    if (!pisos.includes(piso)) setPiso(pisos.includes('Piso 1') ? 'Piso 1' : pisos[0]);
  }, [pisos, piso]);

  const onBloque = (next: BloqueId) => {
    const cambiaZona = BLOQUE_BY_ID[next].zona !== BLOQUE_BY_ID[bloque].zona;
    setBloque(next);
    // Al pasar entre la zona frontal y el complejo el pin anterior queda fuera del plano.
    if (cambiaZona || !initial) setCoord(centroDe(next));
  };

  const onFile = async (ev: ChangeEvent<HTMLInputElement>) => {
    const picked = ev.target.files?.[0] ?? null;
    ev.target.value = '';
    if (!picked) return;
    const invalid = validarImagen(picked);
    if (invalid) {
      setError(invalid);
      return;
    }
    setError(null);
    setFile(picked);
    setPreview(await fileToDataUrl(picked));
  };

  const submit = async (ev: FormEvent) => {
    ev.preventDefault();
    if (!nombre.trim()) {
      setError('El nombre es obligatorio.');
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const url = file ? await uploadImagen(file) : imagenUrl;
      await onSubmit({
        nombre: nombre.trim(),
        codigo: codigo.trim() || null,
        bloque_id: bloque,
        piso,
        categoria,
        descripcion: descripcion.trim() || null,
        imagen_url: url,
        coord_x: coord[0],
        coord_y: coord[1],
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo guardar el espacio.');
      setBusy(false);
    }
  };

  const shown = preview ?? imagenUrl;

  return (
    <form onSubmit={submit} className="grid gap-5 md:grid-cols-2">
      <div className="space-y-3">
        <div>
          <Label htmlFor="f-nombre">Nombre *</Label>
          <Input id="f-nombre" required value={nombre} onChange={(ev) => setNombre(ev.target.value)} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label htmlFor="f-codigo">Código (opcional)</Label>
            <Input id="f-codigo" value={codigo} onChange={(ev) => setCodigo(ev.target.value)} placeholder="E-501" />
          </div>
          <div>
            <Label htmlFor="f-categoria">Categoría</Label>
            <Select id="f-categoria" value={categoria} onChange={(ev) => setCategoria(ev.target.value as Categoria)}>
              {CATEGORIAS.map((c) => (
                <option key={c} value={c}>
                  {CATEGORIA_META[c].label}
                </option>
              ))}
            </Select>
          </div>
          <div>
            <Label htmlFor="f-bloque">Bloque</Label>
            <Select id="f-bloque" value={bloque} onChange={(ev) => onBloque(ev.target.value as BloqueId)}>
              {BLOQUE_IDS.map((b) => (
                <option key={b} value={b}>
                  Bloque {b}
                </option>
              ))}
            </Select>
          </div>
          <div>
            <Label htmlFor="f-piso">Piso</Label>
            <Select id="f-piso" value={piso} onChange={(ev) => setPiso(ev.target.value as Piso)}>
              {pisos.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </Select>
          </div>
        </div>
        <div>
          <Label htmlFor="f-descripcion">Descripción corta</Label>
          <Textarea id="f-descripcion" value={descripcion} maxLength={240} onChange={(ev) => setDescripcion(ev.target.value)} />
        </div>
        <div>
          <Label htmlFor="f-imagen">Imagen PNG de la entrada (máx. 5 MB)</Label>
          <div className="flex items-start gap-3">
            <div className="flex h-20 w-32 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-slate-200 bg-slate-100 text-[11px] text-slate-400">
              {shown ? <img src={shown} alt="Vista previa" className="h-full w-full object-cover" /> : 'Sin imagen'}
            </div>
            <div className="space-y-2">
              <label
                htmlFor="f-imagen"
                className="inline-flex h-8 cursor-pointer items-center gap-2 rounded-md border border-slate-200 bg-white px-3 text-xs font-medium text-slate-800 hover:bg-slate-50"
              >
                <ImagePlus className="h-3.5 w-3.5" aria-hidden />
                {shown ? 'Cambiar PNG' : 'Subir PNG'}
              </label>
              <input id="f-imagen" type="file" accept=".png,image/png" className="sr-only" onChange={onFile} />
              {shown && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-red-600"
                  onClick={() => {
                    setFile(null);
                    setPreview(null);
                    setImagenUrl(null);
                  }}
                >
                  <Trash2 className="h-3.5 w-3.5" aria-hidden />
                  Quitar imagen
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <div>
          <Label>Ubicación en el plano · Bloque {bloque} · {piso}</Label>
          <CoordinatePicker
            bloque={bloque}
            piso={piso}
            x={coord[0]}
            y={coord[1]}
            color={CATEGORIA_META[categoria].color}
            onPick={(x, y) => setCoord([x, y])}
          />
        </div>
        {error && (
          <p role="alert" className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
            {error}
          </p>
        )}
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onCancel} disabled={busy}>
            Cancelar
          </Button>
          <Button type="submit" disabled={busy}>
            {busy ? 'Guardando…' : initial ? 'Guardar cambios' : 'Crear espacio'}
          </Button>
        </div>
      </div>
    </form>
  );
}
