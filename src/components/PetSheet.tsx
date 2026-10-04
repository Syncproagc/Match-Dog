import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import type { Pet } from '../lib/types'
import { CloseIcon, HeartIcon, PinIcon } from './Icons'
import { PetFacts } from './PetFacts'
import { speciesLabel } from '../lib/labels'

interface Props {
  pet: Pet
  onClose: () => void
  onDecide: (liked: boolean) => void
}

// Ficha completa do pet: galeria, descrição e todos os dados informados pelo dono
export function PetSheet({ pet, onClose, onDecide }: Props) {
  const photos = [pet.photo_url, ...(pet.photos ?? [])].filter((p): p is string => Boolean(p))
  const [index, setIndex] = useState(0)
  const closeRef = useRef<HTMLButtonElement>(null)

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
              <div className="gallery-track" onScroll={(e) => setIndex(Math.round(e.currentTarget.scrollLeft / e.currentTarget.clientWidth))}>
                {photos.map((src, i) => (
                  <img key={src + i} src={src} alt={`Foto ${i + 1} de ${pet.name}`} draggable={false} />
                ))}
              </div>
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
            {pet.city && <p className="city muted"><PinIcon /> {pet.city}</p>}
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
        <div className="sheet-actions">
          <button className="round nope" aria-label="Passar" onClick={() => onDecide(false)}><CloseIcon /></button>
          <button className="round like" aria-label="Curtir" onClick={() => onDecide(true)}><HeartIcon /></button>
        </div>
      </section>
    </div>,
    document.body,
  )
}
