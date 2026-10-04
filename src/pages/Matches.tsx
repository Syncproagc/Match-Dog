import { useEffect, useState } from 'react'
import { BrandMark } from '../components/BrandMark'
import { getMatches } from '../lib/api'
import type { Pet } from '../lib/types'

export function Matches({ myPet }: { myPet: Pet }) {
  const [list, setList] = useState<Pet[] | null>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    getMatches(myPet).then(setList, (e) => setError(e.message))
  }, [myPet])

  if (error) return <p className="error page">{error}</p>
  if (!list)
    return (
      <ul className="matches page">
        {[0, 1, 2].map((i) => <li key={i} className="skeleton-row" />)}
      </ul>
    )
  if (!list.length)
    return (
      <div className="empty page">
        <BrandMark size={72} />
        <h2>Nenhum match ainda</h2>
        <p className="muted">Quando alguém curtir seu pet de volta, ele aparece aqui.</p>
      </div>
    )

  return (
    <section className="page">
      <h1 className="page-title">Matches <span className="count">{list.length}</span></h1>
      <ul className="matches">
      {list.map((p) => (
        <li key={p.id}>
          <img src={p.photo_url ?? ''} alt={`Foto de ${p.name}`} />
          <div>
            <strong>{p.name}</strong>
            <span className="muted">{[p.breed, p.city].filter(Boolean).join(' · ')}</span>
          </div>
        </li>
      ))}
    </ul>
    </section>
  )
}
