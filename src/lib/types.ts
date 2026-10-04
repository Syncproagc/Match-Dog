export type Species = 'dog' | 'cat' | 'other'
export type Sex = 'male' | 'female'

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
  photo_url: string | null
}

export type PetInput = Omit<Pet, 'id' | 'owner_id'>

export interface User {
  id: string
  email: string
}
