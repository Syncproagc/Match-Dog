import { useEffect, useState } from 'react'
import { SwipeCard } from '../components/SwipeCard'
import { BrandMark } from '../components/BrandMark'
import { getCandidates, swipe } from '../lib/api'
import type { Pet } from '../lib/types'

export function Discover({ myPet }: { myPet: Pet }) {
  const [queue, setQueue] = useState<Pet[] | null>(null)
  const [match, setMatch] = useState<Pet | null>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    getCandidates(myPet).then(setQueue, (e) => setError(e.message))
  }, [myPet])

  const onSwipe = async (liked: boolean) => {
    if (!queue?.length) return
    const [current, ...rest] = queue
    setQueue(rest)
    try {
      if (await swipe(myPet, current, liked)) setMatch(current)
    } catch (e) {
      setError((e as Error).message)
    }
  }

  if (error) return <p className="error page">{error}</p>
  if (!queue)
    return (
      <div className="discover">
        <div className="deck-wrap">
          <div className="deck"><div className="card skeleton" /></div>
        </div>
      </div>
    )

  return (
    <div className="discover">
      {queue.length ? (
        <SwipeCard key={queue[0].id} pet={queue[0]} next={queue[1]} onSwipe={onSwipe} />
      ) : (
        <div className="empty">
          <BrandMark size={72} />
          <h2>Você viu todos por aqui</h2>
          <p className="muted">Novos pets aparecem quando outros donos se cadastram. Volte mais tarde.</p>
        </div>
      )}
      {match && (
        <div className="overlay" onClick={() => setMatch(null)}>
          <BrandMark size={84} tone="light" />
          <h1>Deu match!</h1>
          <div className="match-photos">
            <img src={myPet.photo_url ?? ''} alt={myPet.name} className="tilt-l" />
            <img src={match.photo_url ?? ''} alt={match.name} className="tilt-r" />
          </div>
          <p>{myPet.name} e {match.name} se curtiram. Que tal marcar um passeio?</p>
          <button className="primary">Continuar descobrindo</button>
        </div>
      )}
    </div>
  )
}
