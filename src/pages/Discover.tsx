import { useEffect, useState } from 'react'
import { SwipeCard } from '../components/SwipeCard'
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
  if (!queue) return <p className="muted page">Carregando...</p>

  return (
    <div className="discover">
      {queue.length ? (
        <SwipeCard key={queue[0].id} pet={queue[0]} onSwipe={onSwipe} />
      ) : (
        <p className="muted empty">Não há mais pets por perto. Volte mais tarde! 🐾</p>
      )}
      {match && (
        <div className="overlay" onClick={() => setMatch(null)}>
          <h1>Deu Match! 🎉</h1>
          <div className="match-photos">
            <img src={myPet.photo_url ?? ''} alt={myPet.name} />
            <img src={match.photo_url ?? ''} alt={match.name} />
          </div>
          <p>{myPet.name} e {match.name} se curtiram!</p>
          <button className="primary">Continuar</button>
        </div>
      )}
    </div>
  )
}
