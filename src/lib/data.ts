import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { ESPACIOS_SEED } from '../data/espacios';
import type { Espacio, EspacioInput } from './types';

const SUPABASE_URL = (import.meta.env.VITE_SUPABASE_URL as string | undefined)?.trim();
const SUPABASE_ANON_KEY = (import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined)?.trim();

/** Sin credenciales la app funciona sola, con datos y sesión en localStorage. */
export const isSupabaseMode = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);

export const supabase: SupabaseClient | null = isSupabaseMode
  ? createClient(SUPABASE_URL as string, SUPABASE_ANON_KEY as string)
  : null;

export const DEMO_ADMIN = { email: 'admin@unimilitar.edu.co', password: 'NeoMap2026*' } as const;
export const BUCKET_IMAGENES = 'espacios-imagenes';
export const MAX_IMAGE_BYTES = 5 * 1024 * 1024;

const LS_ESPACIOS = 'neomap.espacios.v2';
const LS_SESSION = 'neomap.session.v1';

/* ------------------------------ Modo local ------------------------------ */

function localRead(): Espacio[] {
  try {
    const raw = localStorage.getItem(LS_ESPACIOS);
    if (raw) {
      const parsed: unknown = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed as Espacio[];
    }
  } catch {
    // Almacenamiento no disponible o dañado: se usa el catálogo semilla.
  }
  return ESPACIOS_SEED.map((e) => ({ ...e }));
}

function localWrite(espacios: Espacio[]): void {
  try {
    localStorage.setItem(LS_ESPACIOS, JSON.stringify(espacios));
  } catch {
    throw new Error(
      'No se pudo guardar en el navegador (almacenamiento lleno). Usa una imagen más liviana.',
    );
  }
}

function newId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) return crypto.randomUUID();
  return `local-${Date.now()}-${Math.round(Math.random() * 1e9)}`;
}

function sortEspacios(espacios: Espacio[]): Espacio[] {
  return [...espacios].sort((a, b) => a.nombre.localeCompare(b.nombre, 'es'));
}

/* -------------------------------- Espacios ------------------------------- */

export async function listEspacios(): Promise<Espacio[]> {
  if (!supabase) return sortEspacios(localRead());
  const { data, error } = await supabase.from('espacios').select('*').order('nombre');
  if (error) throw new Error(error.message);
  return (data as Espacio[]).map((e) => ({
    ...e,
    coord_x: Number(e.coord_x),
    coord_y: Number(e.coord_y),
  }));
}

export async function createEspacio(input: EspacioInput): Promise<Espacio> {
  if (!supabase) {
    const now = new Date().toISOString();
    const espacio: Espacio = { ...input, id: newId(), created_at: now, updated_at: now };
    localWrite([...localRead(), espacio]);
    return espacio;
  }
  const { data, error } = await supabase.from('espacios').insert(input).select().single();
  if (error) throw new Error(error.message);
  return data as Espacio;
}

export async function updateEspacio(id: string, input: EspacioInput): Promise<Espacio> {
  if (!supabase) {
    const all = localRead();
    const idx = all.findIndex((e) => e.id === id);
    if (idx < 0) throw new Error('El espacio ya no existe.');
    const espacio: Espacio = { ...all[idx], ...input, updated_at: new Date().toISOString() };
    all[idx] = espacio;
    localWrite(all);
    return espacio;
  }
  const { data, error } = await supabase
    .from('espacios')
    .update(input)
    .eq('id', id)
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data as Espacio;
}

export async function deleteEspacio(id: string): Promise<void> {
  if (!supabase) {
    localWrite(localRead().filter((e) => e.id !== id));
    return;
  }
  const { error } = await supabase.from('espacios').delete().eq('id', id);
  if (error) throw new Error(error.message);
}

/** Valida el PNG; devuelve un mensaje de error o `null` si es válido. */
export function validarImagen(file: File): string | null {
  if (file.type !== 'image/png' && !file.name.toLowerCase().endsWith('.png')) {
    return 'La imagen debe ser un archivo PNG.';
  }
  if (file.size > MAX_IMAGE_BYTES) return 'La imagen supera el máximo de 5 MB.';
  return null;
}

export function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error('No se pudo leer la imagen.'));
    reader.readAsDataURL(file);
  });
}

/** Sube el PNG al bucket (Supabase) o lo convierte a Data URL (modo local). */
export async function uploadImagen(file: File): Promise<string> {
  const invalid = validarImagen(file);
  if (invalid) throw new Error(invalid);
  if (!supabase) return fileToDataUrl(file);
  const path = `${newId()}.png`;
  const { error } = await supabase.storage
    .from(BUCKET_IMAGENES)
    .upload(path, file, { contentType: 'image/png', upsert: false });
  if (error) throw new Error(error.message);
  return supabase.storage.from(BUCKET_IMAGENES).getPublicUrl(path).data.publicUrl;
}

/* ----------------------------- Autenticación ----------------------------- */

export async function signIn(email: string, password: string): Promise<string> {
  if (!supabase) {
    if (email.trim().toLowerCase() === DEMO_ADMIN.email && password === DEMO_ADMIN.password) {
      localStorage.setItem(LS_SESSION, DEMO_ADMIN.email);
      return DEMO_ADMIN.email;
    }
    throw new Error('Correo o contraseña incorrectos.');
  }
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw new Error('Correo o contraseña incorrectos.');
  return data.user?.email ?? email;
}

export async function signOut(): Promise<void> {
  if (!supabase) {
    localStorage.removeItem(LS_SESSION);
    return;
  }
  await supabase.auth.signOut();
}

export async function getSessionEmail(): Promise<string | null> {
  if (!supabase) {
    try {
      return localStorage.getItem(LS_SESSION);
    } catch {
      return null;
    }
  }
  const { data } = await supabase.auth.getSession();
  return data.session?.user.email ?? null;
}

export function onAuthChange(cb: (email: string | null) => void): () => void {
  if (!supabase) return () => undefined;
  const { data } = supabase.auth.onAuthStateChange((_event, session) => {
    cb(session?.user.email ?? null);
  });
  return () => data.subscription.unsubscribe();
}
