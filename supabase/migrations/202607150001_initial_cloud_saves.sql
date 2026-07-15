create table public.profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.game_saves (
  user_id uuid primary key references auth.users(id) on delete cascade,
  schema_version integer not null,
  revision bigint not null default 1 check (revision > 0),
  state jsonb not null,
  updated_by_device uuid not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.game_commands (
  command_id uuid primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  device_id uuid not null,
  base_revision bigint not null,
  command_type text not null,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  applied_at timestamptz,
  result_revision bigint
);

create index game_commands_user_created_idx on public.game_commands(user_id, created_at);

alter table public.profiles enable row level security;
alter table public.game_saves enable row level security;
alter table public.game_commands enable row level security;

create policy "users read own profile" on public.profiles for select to authenticated using ((select auth.uid()) = user_id);
create policy "users update own profile" on public.profiles for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "users read own save" on public.game_saves for select to authenticated using ((select auth.uid()) = user_id);
create policy "users insert own save" on public.game_saves for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "users update own save" on public.game_saves for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "users read own commands" on public.game_commands for select to authenticated using ((select auth.uid()) = user_id);
create policy "users insert own commands" on public.game_commands for insert to authenticated with check ((select auth.uid()) = user_id);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  insert into public.profiles (user_id, display_name)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'full_name', split_part(new.email, '@', 1)));
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

create or replace function public.save_game_snapshot(
  p_expected_revision bigint,
  p_schema_version integer,
  p_state jsonb,
  p_device_id uuid
)
returns setof public.game_saves
language plpgsql
security invoker
set search_path = ''
as $$
begin
  if auth.uid() is null then raise exception 'authentication required'; end if;

  if p_expected_revision is null then
    return query
      insert into public.game_saves (user_id, schema_version, revision, state, updated_by_device)
      values (auth.uid(), p_schema_version, 1, p_state, p_device_id)
      on conflict (user_id) do nothing
      returning *;
  else
    return query
      update public.game_saves
      set schema_version = p_schema_version,
          revision = revision + 1,
          state = p_state,
          updated_by_device = p_device_id,
          updated_at = now()
      where user_id = auth.uid() and revision = p_expected_revision
      returning *;
  end if;
end;
$$;

grant execute on function public.save_game_snapshot(bigint, integer, jsonb, uuid) to authenticated;
