import { useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { describe } from '../lib/useNotifications'
import type { NotificationItem, Pet } from '../lib/types'
import { CloseIcon } from './Icons'

const ago = (iso: string) => {
  const min = Math.max(0, Math.round((Date.now() - new Date(iso).getTime()) / 60000))
  if (min < 1) return 'agora'
  if (min < 60) return `há ${min} min`
  const h = Math.round(min / 60)
  return h < 24 ? `há ${h} h` : `há ${Math.round(h / 24)} d`
}

// Lista de avisos: matches novos e mensagens não lidas
export function NotificationSheet({ items, onOpen, onClose }: { items: NotificationItem[]; onOpen: (pet: Pet) => void; onClose: () => void }) {
  const closeRef = useRef<HTMLButtonElement>(null)
  useEffect(() => {
    closeRef.current?.focus()
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  return createPortal(
    <div className="sheet-backdrop" onClick={onClose}>
      <section className="sheet notif-sheet" role="dialog" aria-modal="true" aria-label="Avisos" onClick={(e) => e.stopPropagation()}>
        <header className="filter-head">
          <h2>Avisos</h2>
          <button type="button" ref={closeRef} className="icon-btn" aria-label="Fechar" onClick={onClose}><CloseIcon size={18} /></button>
        </header>
        {items.length === 0 ? (
          <p className="muted notif-empty">Nada novo por aqui. Quando houver um match ou uma mensagem, ela aparece nesta lista.</p>
        ) : (
          <ul className="notif-list">
            {items.map((i) => (
              <li key={`${i.kind}-${i.pet.id}`}>
                <button type="button" onClick={() => onOpen(i.pet)}>
                  <img className="avatar" src={i.pet.photo_url ?? ''} alt="" />
                  <span className="notif-text">
                    <strong>{i.kind === 'match' ? 'Novo match' : i.count > 1 ? `${i.count} mensagens novas` : 'Nova mensagem'}</strong>
                    <span className="muted">{i.kind === 'match' ? `Você e ${i.pet.name} se curtiram. Diga oi.` : `${i.pet.name}: ${i.last.body}`}</span>
                  </span>
                  {i.kind === 'message' && <time className="muted" dateTime={i.last.created_at}>{ago(i.last.created_at)}</time>}
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>,
    document.body,
  )
}

// Aviso curto que aparece sobre a tela quando chega algo novo
export function Toast({ item, onOpen, onClose }: { item: NotificationItem; onOpen: () => void; onClose: () => void }) {
  useEffect(() => {
    const id = setTimeout(onClose, 6000)
    return () => clearTimeout(id)
  }, [item, onClose])
  return (
    <div className="toast" role="status">
      <button type="button" className="toast-body" onClick={onOpen}>
        <img className="avatar" src={item.pet.photo_url ?? ''} alt="" />
        <span>{describe(item)}</span>
      </button>
      <button type="button" className="icon-btn toast-close" aria-label="Dispensar aviso" onClick={onClose}><CloseIcon size={16} /></button>
    </div>
  )
}
