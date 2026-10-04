import { PinIcon } from '../components/Icons'
import { ageLabel, breedLabel, breedTypeLabel, breedingLabel, pedigreeLabel, purposeLabel, sociabilityLabel, speciesLabel } from '../lib/labels'
import type { Pet } from '../lib/types'

export function Profile({ pet, onEdit }: { pet: Pet; onEdit: () => void }) {
  const facts: [string, string | null][] = [
    ['Idade', pet.age_years != null ? ageLabel(pet.age_years) : null],
    ['Raça', breedLabel(pet)],
    ['Tipo', pet.breed_type ? breedTypeLabel[pet.breed_type] : null],
    ['Registro', pedigreeLabel(pet)],
    ['Convívio', pet.sociability ? sociabilityLabel[pet.sociability] : null],
    ['Função', pet.purpose ? purposeLabel[pet.purpose] : null],
    ['Reprodução', breedingLabel(pet)],
  ]
  const filled = facts.filter((f): f is [string, string] => f[1] != null)
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
      {filled.length > 0 && (
        <dl className="facts">
          {filled.map(([k, v]) => (
            <div key={k}><dt>{k}</dt><dd>{v}</dd></div>
          ))}
        </dl>
      )}
      <button type="button" className="secondary" onClick={onEdit}>Editar perfil</button>
    </section>
  )
}
