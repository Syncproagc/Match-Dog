-- Características detalhadas do pet
alter table public.pets
  add column temperament text[] not null default '{}',
  add column purpose text check (purpose in ('work', 'home')),
  add column sociability text check (sociability in ('sociable', 'people_only', 'animals_only', 'antisocial')),
  add column breed_type text check (breed_type in ('purebred', 'mixed')),
  add column breed2 text,
  add column has_pedigree boolean,
  add column registry text,
  add column times_bred int check (times_bred >= 0),
  add column has_offspring boolean;
