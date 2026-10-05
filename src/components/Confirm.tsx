import { useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'

interface Props {
  title: string
  children: React.ReactNode
  confirmLabel: string
  danger?: boolean
  busy?: boolean
  error?: string
  /** Impede confirmar enquanto for falso, por exemplo até digitar a palavra de segurança */
  canConfirm?: boolean
  onConfirm: () => void
  onCancel: () => void
}

// Confirmação em folha na parte de baixo, para ações que não dá para desfazer
export function Confirm({ title, children, confirmLabel, danger, busy, error, canConfirm = true, onConfirm, onCancel }: Props) {
  const cancelRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    cancelRef.current?.focus()
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && !busy && onCancel()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [busy, onCancel])

  return createPortal(
    <div className="sheet-backdrop" onClick={() => !busy && onCancel()}>
      <section className="sheet confirm-sheet" role="alertdialog" aria-modal="true" aria-label={title} onClick={(e) => e.stopPropagation()}>
        <h2>{title}</h2>
        <div className="confirm-body">{children}</div>
        {error && <p className="error" role="alert">{error}</p>}
        <div className="confirm-actions">
          <button type="button" ref={cancelRef} className="secondary" disabled={busy} onClick={onCancel}>Cancelar</button>
          <button type="button" className={danger ? 'primary danger' : 'primary'} disabled={busy || !canConfirm} onClick={onConfirm}>
            {busy ? 'Aguarde…' : confirmLabel}
          </button>
        </div>
      </section>
    </div>,
    document.body,
  )
}
