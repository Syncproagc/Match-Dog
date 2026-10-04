export type Species = 'dog' | 'cat' | 'other'
export type Sex = 'male' | 'female'
export type Purpose = 'work' | 'home'
export type Sociability = 'sociable' | 'people_only' | 'animals_only' | 'antisocial'
export type BreedType = 'purebred' | 'mixed'

export interface Pet {
  id: string
  owner_id: string
  name: string
  species: Species
  breed: string | null
  age_years: number | null
  sex: Sex | null
  city: string | null
  bio: string | null
  temperament: string[]
  purpose: Purpose | null
  sociability: Sociability | null
  breed_type: BreedType | null
  breed2: string | null
  has_pedigree: boolean | null
  registry: string | null
  times_bred: number | null
  has_offspring: boolean | null
  photo_url: string | null
}

export type PetInput = Omit<Pet, 'id' | 'owner_id'>

export interface User {
  id: string
  email: string
}
