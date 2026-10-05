import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { getMessages, isDemo, markRead, sendMessage, unmatch } from '../lib/api'
import { breedLabel } from '../lib/labels'
import type { Message, Pet } from '../lib/types'
import { BackIcon, MoreIcon, SendIcon } from './Icons'
import { Confirm } from './Confirm'
import { PetSheet } from './PetSheet'

const time = (iso: string) => new Date(iso).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })

interface Props {
  myPet: Pet
  other: Pet
  onBack: () => void
  /** Chamado quando a conversa é marcada como lida */
  onRead?: () => void
  onUnmatched: () => void
}

export function Chat({ myPet, other, onBack, onRead, onUnmatched }: Props) {
  const [messages, setMessages] = useState<Message[] | null>(null)
  const [text, setText] = useState('')
  const [error, setError] = useState('')
  const [sending, setSending] = useState(false)
  const [profile, setProfile] = useState(false)
  const [menu, setMenu] = useState(false)
  const [confirming, setConfirming] = useState(false)
  const [undoing, setUndoing] = useState(false)
  const [undoError, setUndoError] = useState('')
  const profileRef = useRef(false)
  useEffect(() => {
    profileRef.current = profile || confirming
  }, [profile, confirming])
  const onReadRef = useRef(onRead)
  useEffect(() => {
    onReadRef.current = onRead
  }, [onRead])
  const endRef = useRef<HTMLDivElement>(null)

  // Atualiza a conversa de tempos em tempos para mostrar respostas novas
  useEffect(() => {
    let alive = true
    const load = () => getMessages(myPet, other).then((m) => alive && setMessages(m), (e) => alive && setError(e.message))
    load()
    const id = setInterval(load, isDemo ? 1200 : 4000)
    return () => {
      alive = false
      clearInterval(id)
    }
  }, [myPet, other])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && !profileRef.current && onBack()
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', onKey)
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = prev
    }
  }, [onBack])

  // Conversa aberta conta como lida, inclusive para mensagens que chegam com ela aberta
  const lastId = messages?.[messages.length - 1]?.id
  useEffect(() => {
    if (!messages) return
    markRead(myPet, other).then(() => onReadRef.current?.(), () => {})
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [myPet, other, lastId, messages === null])

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' })
  }, [messages?.length])

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    const body = text.trim()
    if (!body || sending) return
    setSending(true)
    setError('')
    try {
      const msg = await sendMessage(myPet, other, body)
      setMessages((m) => [...(m ?? []), msg])
      setText('')
    } catch (err) {
      setError('Não foi possível enviar. Tente de novo.')
      console.error(err)
    } finally {
      setSending(false)
    }
  }

  const undo = async () => {
    setUndoing(true)
    setUndoError('')
    try {
      await unmatch(myPet, other)
      onUnmatched()
    } catch (err) {
      console.error(err)
      setUndoError('Não foi possível desfazer agora. Tente de novo.')
      setUndoing(false)
    }
  }

  return createPortal(
    <section className="chat" role="dialog" aria-modal="true" aria-label={`Conversa com ${other.name}`}>
      <header className="chat-head">
        <button className="icon-btn" aria-label="Voltar para os matches" onClick={onBack}><BackIcon /></button>
        <button type="button" className="chat-profile" aria-label={`Ver perfil de ${other.name}`} onClick={() => setProfile(true)}>
          <img className="avatar" src={other.photo_url ?? ''} alt="" />
          <span className="chat-who">
            <strong>{other.name}</strong>
            <span className="muted">{[breedLabel(other), other.city].filter(Boolean).join(' · ')}</span>
          </span>
        </button>
        <div className="chat-menu-wrap">
          <button type="button" className="icon-btn" aria-label="Mais opções" aria-haspopup="menu" aria-expanded={menu} onClick={() => setMenu((v) => !v)}><MoreIcon /></button>
          {menu && (
            <div className="chat-menu" role="menu">
              <button type="button" role="menuitem" onClick={() => { setMenu(false); setUndoError(''); setConfirming(true) }}>Desfazer match</button>
            </div>
          )}
        </div>
      </header>
      <div className="chat-list" aria-live="polite">
        {messages && messages.length === 0 && (
          <p className="chat-empty muted">Vocês deram match. Diga oi para o dono de {other.name} e combinem um passeio.</p>
        )}
        {messages?.map((m) => (
          <div key={m.id} className={m.from_pet_id === myPet.id ? 'bubble mine' : 'bubble'}>
            <p>{m.body}</p>
            <time dateTime={m.created_at}>{time(m.created_at)}</time>
          </div>
        ))}
        <div ref={endRef} />
      </div>
      {error && <p className="error chat-error" role="alert">{error}</p>}
      <form className="chat-compose" onSubmit={submit}>
        <input id="chat-text" aria-label="Mensagem" placeholder={`Mensagem para ${other.name}`} maxLength={1000} autoComplete="off" value={text} onChange={(e) => setText(e.target.value)} />
        <button type="submit" className="send" aria-label="Enviar" disabled={!text.trim() || sending}><SendIcon /></button>
      </form>
      {profile && <PetSheet pet={other} onClose={() => setProfile(false)} />}
      {confirming && (
        <Confirm
          title={`Desfazer match com ${other.name}?`}
          confirmLabel="Desfazer match"
          danger
          busy={undoing}
          error={undoError}
          onConfirm={undo}
          onCancel={() => setConfirming(false)}
        >
          <p>A conversa é apagada para os dois e vocês deixam de aparecer um para o outro. Não dá para desfazer.</p>
        </Confirm>
      )}
    </section>,
    document.body,
  )
}
