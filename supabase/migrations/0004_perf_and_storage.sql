-- Índices para as consultas do app (FKs sem índice ficam lentas com RLS e cascades)
create index if not exists swipes_target_idx on public.swipes (target_pet_id);
create index if not exists matches_pet_a_idx on public.matches (pet_a_id);
create index if not exists matches_pet_b_idx on public.matches (pet_b_id);

-- auth.uid() em subselect: avaliado uma vez por query em vez de por linha
create or replace function public.owns_pet(pet uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from pets where id = pet and owner_id = (select auth.uid()));
$$;

drop policy "dono cria pet" on public.pets;
drop policy "dono edita pet" on public.pets;
drop policy "dono apaga pet" on public.pets;
create policy "dono cria pet" on public.pets
  for insert to authenticated with check (owner_id = (select auth.uid()));
create policy "dono edita pet" on public.pets
  for update to authenticated using (owner_id = (select auth.uid())) with check (owner_id = (select auth.uid()));
create policy "dono apaga pet" on public.pets
  for delete to authenticated using (owner_id = (select auth.uid()));

-- Swipe só pode ser atualizado para o próprio pet (with check faltava)
drop policy "atualizar próprio swipe" on public.swipes;
create policy "atualizar próprio swipe" on public.swipes
  for update to authenticated using (public.owns_pet(swiper_pet_id)) with check (public.owns_pet(swiper_pet_id));

-- Storage: dono pode trocar/apagar suas fotos; upload com limite de tipo/tamanho
update storage.buckets
  set file_size_limit = 8388608, allowed_mime_types = array['image/jpeg', 'image/png', 'image/webp', 'image/heic']
  where id = 'pet-photos';
create policy "apagar da própria pasta" on storage.objects
  for delete to authenticated
  using (bucket_id = 'pet-photos' and (storage.foldername(name))[1] = (select auth.uid())::text);
create policy "atualizar na própria pasta" on storage.objects
  for update to authenticated
  using (bucket_id = 'pet-photos' and (storage.foldername(name))[1] = (select auth.uid())::text);
