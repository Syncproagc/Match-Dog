import { useRef, useState } from 'react'
import type { Pet } from '../lib/types'
import { CloseIcon, HeartIcon, PinIcon } from './Icons'

const THRESHOLD = 110
const speciesLabel = { dog: 'Cachorro', cat: 'Gato', other: 'Pet' }
const sexLabel = { male: 'Macho', female: 'Fêmea' }

interface Props {
  pet: Pet
  next?: Pet
  onSwipe: (liked: boolean) => void
}

export function SwipeCard({ pet, next, onSwipe }: Props) {
  const [dx, setDx] = useState(0)
  const [leaving, setLeaving] = useState<null | boolean>(null)
  const [dragging, setDragging] = useState(false)
  const start = useRef<number | null>(null)

  const finish = (liked: boolean) => {
    if (leaving !== null) return
    setLeaving(liked)
    setTimeout(() => onSwipe(liked), 280)
  }

  const onPointerDown = (e: React.PointerEvent) => {
    start.current = e.clientX
    setDragging(true)
    ;(e.target as HTMLElement).setPointerCapture(e.pointerId)
  }
  const onPointerMove = (e: React.PointerEvent) => {
    if (start.current !== null) setDx(e.clientX - start.current)
  }
  const onPointerUp = () => {
    start.current = null
    setDragging(false)
    if (Math.abs(dx) > THRESHOLD) finish(dx > 0)
    else setDx(0)
  }

  const x = leaving === null ? dx : leaving ? 640 : -640
  const progress = Math.min(1, Math.abs(x) / THRESHOLD)
  const tags = [pet.breed, pet.sex && sexLabel[pet.sex]].filter(Boolean)

  return (
    <div className="deck-wrap">
      <div className="deck">
        {next && (
          <div className="card card-behind" style={{ transform: `scale(${0.94 + progress * 0.06}) translateY(${14 - progress * 14}px)` }} aria-hidden>
            {next.photo_url && <img src={next.photo_url} alt="" draggable={false} />}
          </div>
        )}
        <article
          className="card"
          style={{
            transform: `translateX(${x}px) rotate(${x / 22}deg)`,
            transition: dragging ? 'none' : 'transform 0.32s cubic-bezier(.2,.8,.25,1.1)',
          }}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
        >
          {pet.photo_url ? (
            <img src={pet.photo_url} alt={`Foto de ${pet.name}`} draggable={false} />
          ) : (
            <div className="card-placeholder">{pet.name[0]}</div>
          )}
          <span className="stamp like" style={{ opacity: Math.max(0, x / THRESHOLD) }}>Au</span>
          <span className="stamp nope" style={{ opacity: Math.max(0, -x / THRESHOLD) }}>Passo</span>
          <div className="card-info">
            <p className="eyebrow">{speciesLabel[pet.species]}</p>
            <h2>{pet.name}{pet.age_years != null && <small>{pet.age_years}</small>}</h2>
            {tags.length > 0 && (
              <ul className="tags">
                {tags.map((t) => (
                  <li key={String(t)}>{t}</li>
                ))}
              </ul>
            )}
            {pet.city && (
              <p className="city">
                <PinIcon /> {pet.city}
              </p>
            )}
            {pet.bio && <p className="bio">{pet.bio}</p>}
          </div>
        </article>
      </div>
      <div className="actions">
        <button className="round nope" aria-label="Passar" onClick={() => finish(false)}>
          <CloseIcon />
        </button>
        <button className="round like" aria-label="Curtir" onClick={() => finish(true)}>
          <HeartIcon />
        </button>
      </div>
    </div>
  )
}
