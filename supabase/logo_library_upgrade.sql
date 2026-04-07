alter table if exists public.favorite_logos
  add column if not exists is_favorite boolean,
  add column if not exists favorited_at timestamptz,
  add column if not exists is_saved boolean,
  add column if not exists saved_at timestamptz;

update public.favorite_logos
set
  is_favorite = coalesce(is_favorite, true),
  favorited_at = coalesce(favorited_at, created_at)
where is_favorite is null or favorited_at is null;

update public.favorite_logos
set
  is_saved = coalesce(is_saved, false)
where is_saved is null;

alter table if exists public.favorite_logos
  alter column is_favorite set default true,
  alter column is_saved set default false;

update public.favorite_logos
set
  is_favorite = true
where is_favorite is null;

update public.favorite_logos
set
  is_saved = false
where is_saved is null;

alter table if exists public.favorite_logos
  alter column is_favorite set not null,
  alter column is_saved set not null;

create index if not exists favorite_logos_user_is_favorite_idx
  on public.favorite_logos (user_id, is_favorite, updated_at desc);

create index if not exists favorite_logos_user_is_saved_idx
  on public.favorite_logos (user_id, is_saved, updated_at desc);

create index if not exists favorite_logos_user_is_downloaded_idx
  on public.favorite_logos (user_id, is_downloaded, updated_at desc);
