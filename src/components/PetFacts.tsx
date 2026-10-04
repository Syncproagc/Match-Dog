import { ageLabel, breedLabel, breedTypeLabel, breedingLabel, pedigreeLabel, purposeLabel, sociabilityLabel } from '../lib/labels'
import type { Pet } from '../lib/types'

export function PetFacts({ pet }: { pet: Pet }) {
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
  if (!filled.length) return null
  return (
    <dl className="facts">
      {filled.map(([k, v]) => (
        <div key={k}><dt>{k}</dt><dd>{v}</dd></div>
      ))}
    </dl>
  )
}
