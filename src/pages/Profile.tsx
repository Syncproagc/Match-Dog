import { PinIcon } from '../components/Icons'
import { speciesLabel } from '../lib/labels'
import { PetFacts } from '../components/PetFacts'
import type { Pet } from '../lib/types'

export function Profile({ pet, onEdit }: { pet: Pet; onEdit: () => void }) {
  return (
    <section className="page profile">
      <p className="eyebrow muted">Como os outros donos veem {pet.name}</p>
      <article className="profile-card">
        {pet.photo_url ? <img src={pet.photo_url} alt={`Foto de ${pet.name}`} /> : <div className="card-placeholder">{pet.name[0]}</div>}
        <div className="card-info">
          <p className="eyebrow">{[speciesLabel[pet.species], ...pet.temperament].join(' · ')}</p>
          <h2>{pet.name}{pet.age_years != null && <small>{pet.age_years}</small>}</h2>
          {pet.city && <p className="city"><PinIcon /> {pet.city}</p>}
          {pet.bio && <p className="bio">{pet.bio}</p>}
        </div>
      </article>
      <PetFacts pet={pet} />
      <button type="button" className="secondary" onClick={onEdit}>Editar perfil</button>
    </section>
  )
}
