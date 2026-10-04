import { useRef, useState } from 'react'
import type { Pet } from '../lib/types'

const THRESHOLD = 110
const speciesLabel = { dog: '🐶', cat: '🐱', other: '🐾' }

interface Props {
  pet: Pet
  onSwipe: (liked: boolean) => void
}

export function SwipeCard({ pet, onSwipe }: Props) {
  const [dx, setDx] = useState(0)
  const [leaving, setLeaving] = useState<null | boolean>(null)
  const start = useRef<number | null>(null)
  const [dragging, setDragging] = useState(false)

  const finish = (liked: boolean) => {
    setLeaving(liked)
    setTimeout(() => onSwipe(liked), 250)
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

  const x = leaving === null ? dx : leaving ? 600 : -600
  const style = {
    transform: `translateX(${x}px) rotate(${x / 20}deg)`,
    transition: !dragging ? 'transform 0.25s ease' : 'none',
  }

  return (
    <>
      <div
        className="card"
        style={style}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
      >
        {pet.photo_url ? (
          <img src={pet.photo_url} alt={pet.name} draggable={false} />
        ) : (
          <div className="card-placeholder">{speciesLabel[pet.species]}</div>
        )}
        <span className="stamp like" style={{ opacity: Math.max(0, dx / THRESHOLD) }}>AU!</span>
        <span className="stamp nope" style={{ opacity: Math.max(0, -dx / THRESHOLD) }}>NÃO</span>
        <div className="card-info">
          <h2>
            {pet.name}
            {pet.age_years != null && <span>, {pet.age_years}</span>}
          </h2>
          <p>
            {speciesLabel[pet.species]} {pet.breed}
            {pet.city && ` · ${pet.city}`}
          </p>
          {pet.bio && <p className="bio">{pet.bio}</p>}
        </div>
      </div>
      <div className="actions">
        <button className="round nope" aria-label="Passar" onClick={() => finish(false)}>✕</button>
        <button className="round like" aria-label="Curtir" onClick={() => finish(true)}>♥</button>
      </div>
    </>
  )
}
