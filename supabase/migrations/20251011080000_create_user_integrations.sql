create table if not exists public.user_integrations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  provider text not null,
  access_token text,
  refresh_token text,
  scope text,
  token_type text,
  expiry_date timestamptz,
  connected_at timestamptz not null default timezone('utc', now()),
  unique (user_id, provider)
);

alter table public.user_integrations enable row level security;

do $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'user_integrations'
      and policyname = 'Users manage their integrations'
  ) then
    create policy "Users manage their integrations"
      on public.user_integrations
      for all
      using (auth.uid() = user_id)
      with check (auth.uid() = user_id);
  end if;
end
$$;
