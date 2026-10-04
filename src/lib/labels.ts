import type { BreedType, Pet, Purpose, Sex, Sociability, Species } from './types'

export const speciesLabel: Record<Species, string> = { dog: 'Cachorro', cat: 'Gato', other: 'Pet' }
export const sexLabel: Record<Sex, string> = { male: 'Macho', female: 'Fêmea' }
export const purposeLabel: Record<Purpose, string> = { work: 'De trabalho', home: 'Só de companhia' }
export const sociabilityLabel: Record<Sociability, string> = {
  sociable: 'Sociável com todos',
  people_only: 'Só gosta de gente',
  animals_only: 'Só gosta de outros bichos',
  antisocial: 'Meio antissocial',
}
export const breedTypeLabel: Record<BreedType, string> = { purebred: 'Raça pura', mixed: 'Mistura (pai e mãe de raças diferentes)', caramelo: 'Caramelo (várias raças)' }
export const TEMPERAMENTS = ['Calmo', 'Brincalhão', 'Energético', 'Dócil', 'Carinhoso', 'Protetor', 'Tímido', 'Independente', 'Obediente']

export const ageLabel = (n: number) => `${n} ${n === 1 ? 'ano' : 'anos'}`

export function breedLabel(p: Pet) {
  if (p.breed_type === 'caramelo') return 'Caramelo (SRD)'
  if (p.breed_type === 'mixed') {
    const parts = [p.sire_breed && `Pai ${p.sire_breed}`, p.dam_breed && `mãe ${p.dam_breed}`].filter(Boolean)
    return parts.length ? parts.join(' · ') : 'Mistura de raças'
  }
  return p.breed || null
}

export function breedingLabel(p: Pet) {
  if (p.sex !== 'female') return null
  const parts: string[] = []
  if (p.times_bred != null) parts.push(p.times_bred === 0 ? 'Nunca cruzou' : `${p.times_bred} ${p.times_bred === 1 ? 'cruza' : 'cruzas'}`)
  if (p.has_offspring != null) parts.push(p.has_offspring ? 'já teve crias' : 'sem crias')
  const s = parts.join(', ')
  return s ? s[0].toUpperCase() + s.slice(1) : null
}

export function pedigreeLabel(p: Pet) {
  if (p.has_pedigree == null) return null
  return p.has_pedigree ? (p.registry ? `Pedigree · ${p.registry}` : 'Com pedigree') : 'Sem pedigree'
}

// Etiquetas curtas para o card de swipe
export function cardFacts(p: Pet): string[] {
  return [
    breedLabel(p),
    p.sex && sexLabel[p.sex],
    p.sociability && sociabilityLabel[p.sociability],
    p.purpose && purposeLabel[p.purpose],
    p.has_pedigree ? 'Pedigree' : null,
    breedingLabel(p),
  ].filter((x): x is string => Boolean(x))
}
