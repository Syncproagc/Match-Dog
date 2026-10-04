-- Mensagens entre pets que deram match
create table public.messages (
  id uuid primary key default gen_random_uuid(),
  from_pet_id uuid not null references public.pets (id) on delete cascade,
  to_pet_id uuid not null references public.pets (id) on delete cascade,
  body text not null check (char_length(body) between 1 and 1000),
  created_at timestamptz not null default now(),
  check (from_pet_id <> to_pet_id)
);
create index messages_pair_idx on public.messages (from_pet_id, to_pet_id, created_at);
create index messages_to_idx on public.messages (to_pet_id, created_at);

alter table public.messages enable row level security;

create policy "ver mensagens dos próprios pets" on public.messages
  for select to authenticated
  using (public.owns_pet(from_pet_id) or public.owns_pet(to_pet_id));

-- Só envia com o próprio pet e só para quem já deu match
create policy "enviar mensagem após o match" on public.messages
  for insert to authenticated
  with check (
    public.owns_pet(from_pet_id)
    and exists (
      select 1 from public.matches
      where pet_a_id = least(from_pet_id, to_pet_id)
        and pet_b_id = greatest(from_pet_id, to_pet_id)
    )
  );
