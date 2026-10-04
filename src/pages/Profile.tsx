import { PinIcon } from '../components/Icons'
import type { Pet } from '../lib/types'

const speciesLabel = { dog: 'Cachorro', cat: 'Gato', other: 'Pet' }
const sexLabel = { male: 'Macho', female: 'Fêmea' }

export function Profile({ pet, onEdit }: { pet: Pet; onEdit: () => void }) {
  const tags = [pet.breed, pet.sex && sexLabel[pet.sex]].filter(Boolean)
  return (
    <section className="page profile">
      <p className="eyebrow muted">Como os outros donos veem {pet.name}</p>
      <article className="profile-card">
        {pet.photo_url ? <img src={pet.photo_url} alt={`Foto de ${pet.name}`} /> : <div className="card-placeholder">{pet.name[0]}</div>}
        <div className="card-info">
          <p className="eyebrow">{speciesLabel[pet.species]}</p>
          <h2>{pet.name}{pet.age_years != null && <small>{pet.age_years}</small>}</h2>
          {tags.length > 0 && <ul className="tags">{tags.map((t) => <li key={String(t)}>{t}</li>)}</ul>}
          {pet.city && <p className="city"><PinIcon /> {pet.city}</p>}
          {pet.bio && <p className="bio">{pet.bio}</p>}
        </div>
      </article>
      <button type="button" className="secondary" onClick={onEdit}>Editar perfil</button>
    </section>
  )
}
