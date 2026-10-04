import { useEffect, useState } from 'react'
import { SwipeCard } from '../components/SwipeCard'
import { FilterSheet } from '../components/FilterSheet'
import { FilterIcon, PawIcon } from '../components/Icons'
import { distanceKm, distanceLabel, petPoint } from '../lib/geo'
import { countFilters, loadFilters, matchesFilters, noFilters, saveFilters, type Filters } from '../lib/filters'
import { getCandidates, swipe } from '../lib/api'
import type { Pet } from '../lib/types'

const CONFETTI = Array.from({ length: 28 }, (_, i) => ({ left: (i * 37) % 100, delay: (i % 7) * 0.12, dur: 2.4 + (i % 5) * 0.35, hue: i % 4, rot: (i * 53) % 360 }))

export function Discover({ myPet }: { myPet: Pet }) {
  const [queue, setQueue] = useState<Pet[] | null>(null)
  const [match, setMatch] = useState<Pet | null>(null)
  const [error, setError] = useState('')
  const [filters, setFilters] = useState<Filters>(loadFilters)
  const [showFilters, setShowFilters] = useState(false)

  useEffect(() => {
    if (!match) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setMatch(null)
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [match])

  useEffect(() => {
    getCandidates(myPet).then(setQueue, (e) => setError(e.message))
  }, [myPet])

  const update = (f: Filters) => {
    setFilters(f)
    saveFilters(f)
  }
  const origin = petPoint(myPet)
  const visible = queue?.filter((p) => matchesFilters(p, filters, origin)) ?? []
  const distanceTo = (p: Pet) => {
    const pt = petPoint(p)
    return origin && pt ? distanceLabel(distanceKm(origin, pt)) : null
  }
  const active = countFilters(filters)

  const onSwipe = async (liked: boolean) => {
    const current = visible[0]
    if (!current) return
    setQueue((q) => q?.filter((p) => p.id !== current.id) ?? null)
    try {
      if (await swipe(myPet, current, liked)) setMatch(current)
    } catch (e) {
      setQueue((q) => (q ? [current, ...q] : q))
      setError((e as Error).message)
    }
  }

  if (error && !queue) return <p className="error page" role="alert">{error}</p>
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
      <div className="discover-bar">
        <p className="muted">{visible.length} {visible.length === 1 ? 'pet para descobrir' : 'pets para descobrir'}</p>
        <button type="button" className={active ? 'filter-btn on' : 'filter-btn'} onClick={() => setShowFilters(true)}>
          <FilterIcon /> Filtros{active > 0 && <span className="badge">{active}</span>}
        </button>
      </div>
      {error && (
        <p className="error" role="alert">
          {error} <button type="button" className="link" onClick={() => setError('')}>Fechar</button>
        </p>
      )}
      {visible.length ? (
        <SwipeCard key={visible[0].id} pet={visible[0]} next={visible[1]} distance={distanceTo(visible[0])} onSwipe={onSwipe} />
      ) : (
        <div className="empty">
          <div className="empty-art" aria-hidden>
            <span /><span /><span><PawIcon /></span>
          </div>
          {queue.length ? (
            <>
              <h2>Ninguém com esses filtros</h2>
              <p className="muted">{queue.length} {queue.length === 1 ? 'pet está' : 'pets estão'} escondido{queue.length === 1 ? '' : 's'} pelos filtros. Afrouxe algum para ver mais.</p>
              <button type="button" className="secondary" onClick={() => update(noFilters)}>Limpar filtros</button>
            </>
          ) : (
            <>
              <h2>Você viu todos por aqui</h2>
              <p className="muted">Novos pets aparecem quando outros donos se cadastram. Volte mais tarde.</p>
            </>
          )}
        </div>
      )}
      {showFilters && <FilterSheet value={filters} total={visible.length} hasOrigin={origin != null} onChange={update} onClose={() => setShowFilters(false)} />}
      {match && (
        <div className="overlay" role="dialog" aria-modal="true" aria-label="Deu match" onClick={() => setMatch(null)}>
          {CONFETTI.map((c, i) => (
            <i key={i} className={`confetti c${c.hue}`} style={{ left: `${c.left}%`, animationDelay: `${c.delay}s`, animationDuration: `${c.dur}s`, rotate: `${c.rot}deg` }} />
          ))}
          <p className="eyebrow">Curtida recíproca</p>
          <h1>Deu match</h1>
          <div className="match-photos">
            <img src={myPet.photo_url ?? ''} alt={myPet.name} className="tilt-l" />
            <img src={match.photo_url ?? ''} alt={match.name} className="tilt-r" />
          </div>
          <p>{myPet.name} e {match.name} se curtiram. Que tal marcar um passeio?</p>
          <button className="primary" autoFocus onClick={() => setMatch(null)}>Continuar descobrindo</button>
        </div>
      )}
    </div>
  )
}
