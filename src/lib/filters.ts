import { distanceKm, type Point } from './geo'
import type { BreedType, Pet, Purpose, Sex, Sociability, Species } from './types'

export interface Filters {
  species: Species[]
  sex: Sex[]
  sociability: Sociability[]
  purpose: Purpose[]
  breed_type: BreedType[]
  pedigreeOnly: boolean
  city: string
  radiusKm: number | null
}

export const noFilters: Filters = { species: [], sex: [], sociability: [], purpose: [], breed_type: [], pedigreeOnly: false, city: '', radiusKm: null }

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
  f.species.length + f.sex.length + f.sociability.length + f.purpose.length + f.breed_type.length + (f.pedigreeOnly ? 1 : 0) + (f.city.trim() ? 1 : 0) + (f.radiusKm != null ? 1 : 0)

// Um filtro ativo só aceita pets que informaram aquele dado
export function matchesFilters(p: Pet, f: Filters, origin: Point | null): boolean {
  const pick = <T,>(sel: T[], v: T | null) => sel.length === 0 || (v != null && sel.includes(v))
  if (!pick(f.species, p.species)) return false
  if (!pick(f.sex, p.sex)) return false
  if (!pick(f.sociability, p.sociability)) return false
  if (!pick(f.purpose, p.purpose)) return false
  if (!pick(f.breed_type, p.breed_type)) return false
  if (f.pedigreeOnly && !p.has_pedigree) return false
  if (f.radiusKm != null && origin) {
    if (p.lat == null || p.lng == null) return false
    if (distanceKm(origin, { lat: p.lat, lng: p.lng }) > f.radiusKm) return false
  }
  const city = f.city.trim().toLowerCase()
  if (city && !(p.city ?? '').toLowerCase().includes(city)) return false
  return true
}
