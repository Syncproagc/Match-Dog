import { useEffect, useState } from 'react'
import { BrandMark } from '../components/BrandMark'
import { Chat } from '../components/Chat'
import { getLastMessages, getMatches } from '../lib/api'
import { breedLabel } from '../lib/labels'
import type { Message, Pet } from '../lib/types'

interface Props {
  myPet: Pet
  /** Abre direto a conversa com este pet (vindo de um aviso) */
  openPetId?: string | null
  onOpened?: () => void
  /** Avisa que a lista de notificações pode ter mudado */
  onChanged?: () => void
  unread?: Record<string, number>
  /** Informa qual conversa está aberta, para não avisar do que o usuário já está vendo */
  onActive?: (petId: string | null) => void
}

export function Matches({ myPet, openPetId, onOpened, onChanged, unread = {}, onActive }: Props) {
  const [list, setList] = useState<Pet[] | null>(null)
  const [error, setError] = useState('')
  const [open, setOpen] = useState<Pet | null>(null)
  const [last, setLast] = useState<Record<string, Message>>({})

  useEffect(() => {
    getMatches(myPet).then(setList, (e) => setError(e.message))
  }, [myPet])

  // Aviso tocado: abre a conversa assim que a lista carrega (ajuste de estado durante a renderização)
  const [handled, setHandled] = useState<string | null>(null)
  if (!openPetId && handled) setHandled(null)
  if (openPetId && list && openPetId !== handled) {
    setHandled(openPetId)
    const pet = list.find((p) => p.id === openPetId)
    if (pet) setOpen(pet)
  }
  useEffect(() => {
    if (openPetId && list && openPetId === handled) onOpened?.()
  }, [openPetId, list, handled, onOpened])

  useEffect(() => {
    onActive?.(open?.id ?? null)
    return () => onActive?.(null)
  }, [open, onActive])

  // Recarrega a prévia das conversas quando o chat fecha e quando chegam mensagens novas
  const unreadKey = Object.entries(unread).join()
  useEffect(() => {
    if (!open) getLastMessages(myPet).then(setLast, () => {})
  }, [myPet, open, unreadKey])

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
        <BrandMark size={72} />
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
            {unread[p.id] > 0 && <span className="badge match-badge" aria-label={`${unread[p.id]} mensagens não lidas`}>{unread[p.id]}</span>}
            <div>
              <strong>{p.name}</strong>
              <span>{last[p.id] ? `${last[p.id].from_pet_id === myPet.id ? 'Você: ' : ''}${last[p.id].body}` : [breedLabel(p), p.city].filter(Boolean).join(' · ')}</span>
            </div>
          </button>
        </li>
      ))}
    </ul>
      {open && (
        <Chat
          myPet={myPet}
          other={open}
          onBack={() => setOpen(null)}
          onRead={onChanged}
          onUnmatched={() => {
            setList((l) => l && l.filter((p) => p.id !== open.id))
            setOpen(null)
            onChanged?.()
          }}
        />
      )}
    </section>
  )
}
