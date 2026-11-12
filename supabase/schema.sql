-- NeoMap · UMNG Sede Calle 100
-- Esquema completo: ejecútalo una sola vez en Supabase → SQL Editor, antes de seed.sql.

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- Tipos
-- ---------------------------------------------------------------------------
do $$
begin
  if not exists (select 1 from pg_type where typname = 'categoria_espacio') then
    create type public.categoria_espacio as enum (
      'laboratorios',
      'aulas_especiales',
      'oficinas_administrativas',
      'servicios'
    );
  end if;
end
$$;

-- ---------------------------------------------------------------------------
-- Tablas
-- ---------------------------------------------------------------------------
create table if not exists public.bloques (
  id                text primary key,
  nombre            text not null,
  pisos_disponibles text[] not null,
  descripcion       text
);

create table if not exists public.espacios (
  id          uuid primary key default gen_random_uuid(),
  codigo      text,
  nombre      text not null,
  bloque_id   text not null references public.bloques (id) on update cascade on delete restrict,
  piso        text not null,
  categoria   public.categoria_espacio not null,
  descripcion text,
  imagen_url  text,
  coord_x     numeric not null,
  coord_y     numeric not null,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  constraint espacios_piso_valido check (
    piso in ('Sótano', 'Piso 1', 'Piso 2', 'Piso 3', 'Piso 4', 'Piso 5')
  )
);

create index if not exists espacios_bloque_idx on public.espacios (bloque_id);
create index if not exists espacios_categoria_idx on public.espacios (categoria);

-- ---------------------------------------------------------------------------
-- Registro automático de la última actualización
-- ---------------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists espacios_set_updated_at on public.espacios;
create trigger espacios_set_updated_at
  before update on public.espacios
  for each row
  execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- Row Level Security: lectura pública, escritura solo para autenticados
-- ---------------------------------------------------------------------------
alter table public.bloques enable row level security;
alter table public.espacios enable row level security;

drop policy if exists "bloques_select_publico" on public.bloques;
create policy "bloques_select_publico" on public.bloques
  for select to anon, authenticated using (true);

drop policy if exists "bloques_insert_autenticado" on public.bloques;
create policy "bloques_insert_autenticado" on public.bloques
  for insert to authenticated with check (true);

drop policy if exists "bloques_update_autenticado" on public.bloques;
create policy "bloques_update_autenticado" on public.bloques
  for update to authenticated using (true) with check (true);

drop policy if exists "bloques_delete_autenticado" on public.bloques;
create policy "bloques_delete_autenticado" on public.bloques
  for delete to authenticated using (true);

drop policy if exists "espacios_select_publico" on public.espacios;
create policy "espacios_select_publico" on public.espacios
  for select to anon, authenticated using (true);

drop policy if exists "espacios_insert_autenticado" on public.espacios;
create policy "espacios_insert_autenticado" on public.espacios
  for insert to authenticated with check (true);

drop policy if exists "espacios_update_autenticado" on public.espacios;
create policy "espacios_update_autenticado" on public.espacios
  for update to authenticated using (true) with check (true);

drop policy if exists "espacios_delete_autenticado" on public.espacios;
create policy "espacios_delete_autenticado" on public.espacios
  for delete to authenticated using (true);

-- ---------------------------------------------------------------------------
-- Storage: bucket público de fotos de entrada (solo PNG, máx. 5 MB)
-- ---------------------------------------------------------------------------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('espacios-imagenes', 'espacios-imagenes', true, 5242880, array['image/png'])
on conflict (id) do update
  set public = excluded.public,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "espacios_imagenes_select_publico" on storage.objects;
create policy "espacios_imagenes_select_publico" on storage.objects
  for select to anon, authenticated
  using (bucket_id = 'espacios-imagenes');

drop policy if exists "espacios_imagenes_insert_autenticado" on storage.objects;
create policy "espacios_imagenes_insert_autenticado" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'espacios-imagenes');

drop policy if exists "espacios_imagenes_update_autenticado" on storage.objects;
create policy "espacios_imagenes_update_autenticado" on storage.objects
  for update to authenticated
  using (bucket_id = 'espacios-imagenes')
  with check (bucket_id = 'espacios-imagenes');

drop policy if exists "espacios_imagenes_delete_autenticado" on storage.objects;
create policy "espacios_imagenes_delete_autenticado" on storage.objects
  for delete to authenticated
  using (bucket_id = 'espacios-imagenes');
