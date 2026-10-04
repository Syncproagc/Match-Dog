import type { BreedType, Pet, Purpose, Sex, Sociability, Species } from './types'

export interface Filters {
  species: Species[]
  sex: Sex[]
  sociability: Sociability[]
  purpose: Purpose[]
  breed_type: BreedType[]
  pedigreeOnly: boolean
  city: string
}

export const noFilters: Filters = { species: [], sex: [], sociability: [], purpose: [], breed_type: [], pedigreeOnly: false, city: '' }

const KEY = 'match-dog-filters'

export function loadFilters(): Filters {
  try {
    return { ...noFilters, ...JSON.parse(localStorage.getItem(KEY) ?? '{}') }
  } catch {
    return noFilters
  }
}

export function saveFilters(f: Filters) {
  try {
    localStorage.setItem(KEY, JSON.stringify(f))
  } catch {
    /* sem armazenamento: o filtro vale só nesta sessão */
  }
}

export const countFilters = (f: Filters) =>
  f.species.length + f.sex.length + f.sociability.length + f.purpose.length + f.breed_type.length + (f.pedigreeOnly ? 1 : 0) + (f.city.trim() ? 1 : 0)

// Um filtro ativo só aceita pets que informaram aquele dado
export function matchesFilters(p: Pet, f: Filters): boolean {
  const pick = <T,>(sel: T[], v: T | null) => sel.length === 0 || (v != null && sel.includes(v))
  if (!pick(f.species, p.species)) return false
  if (!pick(f.sex, p.sex)) return false
  if (!pick(f.sociability, p.sociability)) return false
  if (!pick(f.purpose, p.purpose)) return false
  if (!pick(f.breed_type, p.breed_type)) return false
  if (f.pedigreeOnly && !p.has_pedigree) return false
  const city = f.city.trim().toLowerCase()
  if (city && !(p.city ?? '').toLowerCase().includes(city)) return false
  return true
}
