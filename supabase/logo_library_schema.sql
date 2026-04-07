create extension if not exists pgcrypto;

create table if not exists public.favorite_logos (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  favorite_key text not null,
  design_id text,
  logo_name text not null,
  business_name text not null,
  slogan text not null default '',
  industry_label text not null default 'Brand identity',
  theme_color text not null default '#111827',
  background_color text not null default '#ffffff',
  svg_markup text,
  fallback_url text,
  editable_payload jsonb,
  preview_data_url text,
  is_favorite boolean not null default true,
  favorited_at timestamptz,
  is_saved boolean not null default false,
  saved_at timestamptz,
  is_downloaded boolean not null default false,
  downloaded_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint favorite_logos_user_key unique (user_id, favorite_key)
);

create index if not exists favorite_logos_user_id_idx
  on public.favorite_logos (user_id);

create index if not exists favorite_logos_user_updated_at_idx
  on public.favorite_logos (user_id, updated_at desc);

create index if not exists favorite_logos_user_is_favorite_idx
  on public.favorite_logos (user_id, is_favorite, updated_at desc);

create index if not exists favorite_logos_user_is_saved_idx
  on public.favorite_logos (user_id, is_saved, updated_at desc);

create index if not exists favorite_logos_user_is_downloaded_idx
  on public.favorite_logos (user_id, is_downloaded, updated_at desc);

create or replace function public.set_favorite_logos_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

drop trigger if exists favorite_logos_set_updated_at on public.favorite_logos;

create trigger favorite_logos_set_updated_at
before update on public.favorite_logos
for each row
execute function public.set_favorite_logos_updated_at();

alter table public.favorite_logos enable row level security;

drop policy if exists "favorite_logos_select_own" on public.favorite_logos;
create policy "favorite_logos_select_own"
on public.favorite_logos
for select
using (auth.uid() = user_id);

drop policy if exists "favorite_logos_insert_own" on public.favorite_logos;
create policy "favorite_logos_insert_own"
on public.favorite_logos
for insert
with check (auth.uid() = user_id);

drop policy if exists "favorite_logos_update_own" on public.favorite_logos;
create policy "favorite_logos_update_own"
on public.favorite_logos
for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "favorite_logos_delete_own" on public.favorite_logos;
create policy "favorite_logos_delete_own"
on public.favorite_logos
for delete
using (auth.uid() = user_id);
