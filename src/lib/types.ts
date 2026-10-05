export type Species = 'dog' | 'cat' | 'other'
export type Sex = 'male' | 'female'
export type Purpose = 'work' | 'home'
export type Sociability = 'sociable' | 'people_only' | 'animals_only' | 'antisocial'
export type BreedType = 'purebred' | 'mixed' | 'caramelo'

export interface Pet {
  id: string
  owner_id: string
  name: string
  species: Species
  breed: string | null
  age_years: number | null
  sex: Sex | null
  city: string | null
  lat: number | null
  lng: number | null
  bio: string | null
  temperament: string[]
  purpose: Purpose | null
  sociability: Sociability | null
  breed_type: BreedType | null
  sire_breed: string | null
  dam_breed: string | null
  has_pedigree: boolean | null
  registry: string | null
  times_bred: number | null
  has_offspring: boolean | null
  photo_url: string | null
  photos: string[]
}

export type PetInput = Omit<Pet, 'id' | 'owner_id'>

export interface User {
  id: string
  email: string
}

export interface Message {
  id: string
  from_pet_id: string
  to_pet_id: string
  body: string
  created_at: string
}

export interface Settings {
  notify_matches: boolean
  notify_messages: boolean
}

export type NotificationItem =
  | { kind: 'match'; pet: Pet }
  | { kind: 'message'; pet: Pet; count: number; last: Message }

export interface Notifications {
  /** Mensagens não lidas somadas a matches ainda não abertos */
  count: number
  items: NotificationItem[]
}
