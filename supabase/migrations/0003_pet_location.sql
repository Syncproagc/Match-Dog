-- Localização aproximada do pet (arredondada em ~1 km pelo app) para filtro por raio
alter table public.pets
  add column lat double precision check (lat between -90 and 90),
  add column lng double precision check (lng between -180 and 180);
