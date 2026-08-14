do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'game_saves'
  ) then
    alter publication supabase_realtime add table public.game_saves;
  end if;
end
$$;
