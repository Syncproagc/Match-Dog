import { useEffect, useState } from 'react'
import { getMatches } from '../lib/api'
import type { Pet } from '../lib/types'

export function Matches({ myPet }: { myPet: Pet }) {
  const [list, setList] = useState<Pet[] | null>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    getMatches(myPet).then(setList, (e) => setError(e.message))
  }, [myPet])

  if (error) return <p className="error page">{error}</p>
  if (!list) return <p className="muted page">Carregando...</p>
  if (!list.length) return <p className="muted page">Nenhum match ainda. Continue curtindo! ❤️</p>

  return (
    <ul className="matches page">
      {list.map((p) => (
        <li key={p.id}>
          <img src={p.photo_url ?? ''} alt="" />
          <div>
            <strong>{p.name}</strong>
            <span className="muted">{[p.breed, p.city].filter(Boolean).join(' · ')}</span>
          </div>
        </li>
      ))}
    </ul>
  )
}
