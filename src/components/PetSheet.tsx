import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import type { Pet } from '../lib/types'
import { BackIcon, CloseIcon, HeartIcon, PinIcon } from './Icons'
import { PetFacts } from './PetFacts'
import { speciesLabel } from '../lib/labels'

interface Props {
  pet: Pet
  distance?: string | null
  onClose: () => void
  onDecide?: (liked: boolean) => void
}

// Ficha completa do pet: galeria, descrição e todos os dados informados pelo dono
export function PetSheet({ pet, distance, onClose, onDecide }: Props) {
  const photos = [pet.photo_url, ...(pet.photos ?? [])].filter((p): p is string => Boolean(p))
  const [index, setIndex] = useState(0)
  const closeRef = useRef<HTMLButtonElement>(null)
  const trackRef = useRef<HTMLDivElement>(null)
  const drag = useRef<{ x: number; left: number } | null>(null)
  const [dragging, setDragging] = useState(false)

  const goTo = (i: number) => {
    const el = trackRef.current
    if (el) el.scrollTo({ left: Math.max(0, Math.min(photos.length - 1, i)) * el.clientWidth, behavior: 'smooth' })
  }
  // Com o mouse não há gesto de arrastar nativo: simulamos para a galeria também funcionar no computador
  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.pointerType !== 'mouse') return
    drag.current = { x: e.clientX, left: e.currentTarget.scrollLeft }
    setDragging(true)
    e.currentTarget.setPointerCapture(e.pointerId)
  }
  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (drag.current) e.currentTarget.scrollLeft = drag.current.left - (e.clientX - drag.current.x)
  }
  const endDrag = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!drag.current) return
    const moved = drag.current.x - e.clientX
    const w = e.currentTarget.clientWidth
    const base = Math.round(drag.current.left / w)
    drag.current = null
    setDragging(false)
    goTo(Math.abs(moved) > w * 0.15 ? base + (moved > 0 ? 1 : -1) : base)
  }

  useEffect(() => {
    closeRef.current?.focus()
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', onKey)
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = prev
    }
  }, [onClose])

  return createPortal(
    <div className="sheet-backdrop" onClick={onClose}>
      <section className="sheet" role="dialog" aria-modal="true" aria-label={`Perfil de ${pet.name}`} onClick={(e) => e.stopPropagation()}>
        <button ref={closeRef} className="sheet-close" aria-label="Fechar" onClick={onClose}><CloseIcon size={20} /></button>
        <div className="sheet-scroll">
          {photos.length > 0 ? (
            <div className="gallery">
              <div
                ref={trackRef}
                className={dragging ? 'gallery-track dragging' : 'gallery-track'}
                tabIndex={0}
                aria-label="Fotos do pet"
                onScroll={(e) => setIndex(Math.round(e.currentTarget.scrollLeft / e.currentTarget.clientWidth))}
                onPointerDown={onPointerDown}
                onPointerMove={onPointerMove}
                onPointerUp={endDrag}
                onPointerCancel={endDrag}
                onKeyDown={(e) => {
                  if (e.key === 'ArrowRight') goTo(index + 1)
                  if (e.key === 'ArrowLeft') goTo(index - 1)
                }}
              >
                {photos.map((src, i) => (
                  <img key={src + i} src={src} alt={`Foto ${i + 1} de ${pet.name}`} draggable={false} />
                ))}
              </div>
              {photos.length > 1 && index > 0 && (
                <button type="button" className="gallery-arrow prev" aria-label="Foto anterior" onClick={() => goTo(index - 1)}><BackIcon /></button>
              )}
              {photos.length > 1 && index < photos.length - 1 && (
                <button type="button" className="gallery-arrow next" aria-label="Próxima foto" onClick={() => goTo(index + 1)}><BackIcon /></button>
              )}
              {photos.length > 1 && (
                <div className="gallery-dots" aria-hidden>
                  {photos.map((_, i) => <i key={i} className={i === index ? 'on' : ''} />)}
                </div>
              )}
            </div>
          ) : (
            <div className="gallery gallery-empty">{pet.name[0]}</div>
          )}
          <div className="sheet-body">
            <p className="eyebrow muted">{speciesLabel[pet.species]}</p>
            <h2 className="sheet-name">{pet.name}{pet.age_years != null && <small>{pet.age_years}</small>}</h2>
            {(pet.city || distance) && <p className="city muted"><PinIcon /> {[pet.city, distance].filter(Boolean).join(' · ')}</p>}
            {pet.temperament?.length > 0 && (
              <ul className="chips-static">{pet.temperament.map((t) => <li key={t}>{t}</li>)}</ul>
            )}
            {pet.bio && (
              <>
                <h3>Sobre {pet.name}</h3>
                <p className="sheet-bio">{pet.bio}</p>
              </>
            )}
            <h3>Ficha</h3>
            <PetFacts pet={pet} />
          </div>
        </div>
        {onDecide && (
        <div className="sheet-actions">
          <button className="round nope" aria-label="Passar" onClick={() => onDecide(false)}><CloseIcon /></button>
          <button className="round like" aria-label="Curtir" onClick={() => onDecide(true)}><HeartIcon /></button>
        </div>
        )}
      </section>
    </div>,
    document.body,
  )
}
