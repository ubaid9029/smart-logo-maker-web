-- Table to track API usage per IP for rate limiting
create table if not exists public.api_usage (
  id uuid primary key default gen_random_uuid(),
  ip_address text not null,
  endpoint text not null,
  call_at timestamptz not null default timezone('utc', now())
);

-- Index for fast lookup by IP and timestamp
create index if not exists api_usage_ip_at_idx on public.api_usage (ip_address, call_at desc);

-- RLS: Security
alter table public.api_usage enable row level security;

-- Only service role can manage this, or we can add specific policies.
-- For now, we'll use service role on the backend to bypass RLS.
