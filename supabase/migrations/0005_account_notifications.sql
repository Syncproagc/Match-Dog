-- Conta, notificações e desfazer match

-- Preferências de notificação (uma linha por usuário)
create table public.user_settings (
  user_id uuid primary key references auth.users (id) on delete cascade,
  notify_matches boolean not null default true,
  notify_messages boolean not null default true,
  updated_at timestamptz not null default now()
);
alter table public.user_settings enable row level security;
create policy "ver próprias preferências" on public.user_settings
  for select to authenticated using (user_id = auth.uid());
create policy "criar próprias preferências" on public.user_settings
  for insert to authenticated with check (user_id = auth.uid());
create policy "editar próprias preferências" on public.user_settings
  for update to authenticated using (user_id = auth.uid());

-- Até quando cada pet leu a conversa com outro pet.
-- Mensagem recebida depois de read_at (ou match sem linha) conta como não lida.
create table public.conversation_reads (
  pet_id uuid not null references public.pets (id) on delete cascade,
  other_pet_id uuid not null references public.pets (id) on delete cascade,
  read_at timestamptz not null default now(),
  primary key (pet_id, other_pet_id)
);
alter table public.conversation_reads enable row level security;
create policy "ver próprias leituras" on public.conversation_reads
  for select to authenticated using (public.owns_pet(pet_id));
create policy "registrar própria leitura" on public.conversation_reads
  for insert to authenticated with check (public.owns_pet(pet_id));
create policy "atualizar própria leitura" on public.conversation_reads
  for update to authenticated using (public.owns_pet(pet_id));
create policy "apagar própria leitura" on public.conversation_reads
  for delete to authenticated using (public.owns_pet(pet_id));

-- Matches que já existem não devem aparecer como novos
insert into public.conversation_reads (pet_id, other_pet_id)
select pet_a_id, pet_b_id from public.matches
union
select pet_b_id, pet_a_id from public.matches
on conflict do nothing;

-- Desfazer match: qualquer um dos dois pode encerrar o match e apagar a conversa
create policy "desfazer próprio match" on public.matches
  for delete to authenticated
  using (public.owns_pet(pet_a_id) or public.owns_pet(pet_b_id));
create policy "apagar conversa do próprio match" on public.messages
  for delete to authenticated
  using (public.owns_pet(from_pet_id) or public.owns_pet(to_pet_id));

-- Fotos: o dono pode listar e apagar os próprios arquivos
create policy "listar própria pasta" on storage.objects
  for select to authenticated
  using (bucket_id = 'pet-photos' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "apagar na própria pasta" on storage.objects
  for delete to authenticated
  using (bucket_id = 'pet-photos' and (storage.foldername(name))[1] = auth.uid()::text);

-- Excluir a própria conta. Pets, swipes, matches, mensagens e preferências
-- saem junto por cascata (on delete cascade).
create function public.delete_my_account() returns void
language plpgsql security definer set search_path = public, auth as $$
begin
  if auth.uid() is null then
    raise exception 'não autenticado';
  end if;
  delete from auth.users where id = auth.uid();
end;
$$;
revoke all on function public.delete_my_account() from public, anon;
grant execute on function public.delete_my_account() to authenticated;
