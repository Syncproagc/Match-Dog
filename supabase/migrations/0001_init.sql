-- Match Dog: schema inicial
create table public.pets (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users (id) on delete cascade,
  name text not null,
  species text not null default 'dog' check (species in ('dog', 'cat', 'other')),
  breed text,
  age_years int check (age_years >= 0),
  sex text check (sex in ('male', 'female')),
  city text,
  bio text,
  photo_url text,
  created_at timestamptz not null default now()
);
create index pets_owner_idx on public.pets (owner_id);

create table public.swipes (
  swiper_pet_id uuid not null references public.pets (id) on delete cascade,
  target_pet_id uuid not null references public.pets (id) on delete cascade,
  liked boolean not null,
  created_at timestamptz not null default now(),
  primary key (swiper_pet_id, target_pet_id),
  check (swiper_pet_id <> target_pet_id)
);

create table public.matches (
  id uuid primary key default gen_random_uuid(),
  pet_a_id uuid not null references public.pets (id) on delete cascade,
  pet_b_id uuid not null references public.pets (id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (pet_a_id, pet_b_id),
  check (pet_a_id < pet_b_id)
);

-- Cria o match quando o like é recíproco
create function public.handle_swipe() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if new.liked and exists (
    select 1 from swipes
    where swiper_pet_id = new.target_pet_id
      and target_pet_id = new.swiper_pet_id
      and liked
  ) then
    insert into matches (pet_a_id, pet_b_id)
    values (least(new.swiper_pet_id, new.target_pet_id), greatest(new.swiper_pet_id, new.target_pet_id))
    on conflict do nothing;
  end if;
  return new;
end;
$$;

create trigger on_swipe after insert or update on public.swipes
for each row execute function public.handle_swipe();

-- RLS
alter table public.pets enable row level security;
alter table public.swipes enable row level security;
alter table public.matches enable row level security;

create function public.owns_pet(pet uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from pets where id = pet and owner_id = auth.uid());
$$;

create policy "pets visíveis para logados" on public.pets
  for select to authenticated using (true);
create policy "dono cria pet" on public.pets
  for insert to authenticated with check (owner_id = auth.uid());
create policy "dono edita pet" on public.pets
  for update to authenticated using (owner_id = auth.uid());
create policy "dono apaga pet" on public.pets
  for delete to authenticated using (owner_id = auth.uid());

create policy "ver próprios swipes" on public.swipes
  for select to authenticated using (public.owns_pet(swiper_pet_id));
create policy "swipe com próprio pet" on public.swipes
  for insert to authenticated with check (public.owns_pet(swiper_pet_id));
create policy "atualizar próprio swipe" on public.swipes
  for update to authenticated using (public.owns_pet(swiper_pet_id));

create policy "ver próprios matches" on public.matches
  for select to authenticated
  using (public.owns_pet(pet_a_id) or public.owns_pet(pet_b_id));

-- Fotos
insert into storage.buckets (id, name, public) values ('pet-photos', 'pet-photos', true)
on conflict do nothing;
create policy "upload na própria pasta" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'pet-photos' and (storage.foldername(name))[1] = auth.uid()::text);
