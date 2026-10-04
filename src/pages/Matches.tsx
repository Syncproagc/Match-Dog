import { useEffect, useState } from 'react'
import { Chat } from '../components/Chat'
import { getLastMessages, getMatches } from '../lib/api'
import { breedLabel } from '../lib/labels'
import type { Message, Pet } from '../lib/types'

export function Matches({ myPet }: { myPet: Pet }) {
  const [list, setList] = useState<Pet[] | null>(null)
  const [error, setError] = useState('')
  const [open, setOpen] = useState<Pet | null>(null)
  const [last, setLast] = useState<Record<string, Message>>({})

  useEffect(() => {
    getMatches(myPet).then(setList, (e) => setError(e.message))
  }, [myPet])

  // Recarrega a prévia das conversas sempre que o chat fecha
  useEffect(() => {
    if (!open) getLastMessages(myPet).then(setLast, () => {})
  }, [myPet, open])

  if (error) return <p className="error page">{error}</p>
  if (!list)
    return (
      <ul className="matches page">
        {[0, 1, 2, 3].map((i) => <li key={i} className="skeleton-row" />)}
      </ul>
    )
  if (!list.length)
    return (
      <div className="empty page">
        <h2>Nenhum match ainda</h2>
        <p className="muted">Quando alguém curtir seu pet de volta, ele aparece aqui.</p>
      </div>
    )

  return (
    <section className="page">
      <h1 className="page-title">Matches <span className="count">{list.length}</span></h1>
      <ul className="matches">
      {list.map((p, i) => (
        <li key={p.id} style={{ '--i': i } as React.CSSProperties}>
          <button type="button" className="match-tile" onClick={() => setOpen(p)} aria-label={`Conversar com ${p.name}`}>
            <img src={p.photo_url ?? ''} alt={`Foto de ${p.name}`} />
            <div>
              <strong>{p.name}</strong>
              <span>{last[p.id] ? `${last[p.id].from_pet_id === myPet.id ? 'Você: ' : ''}${last[p.id].body}` : [breedLabel(p), p.city].filter(Boolean).join(' · ')}</span>
            </div>
          </button>
        </li>
      ))}
    </ul>
      {open && <Chat myPet={myPet} other={open} onBack={() => setOpen(null)} />}
    </section>
  )
}
