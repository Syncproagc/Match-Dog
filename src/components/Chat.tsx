import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { getMessages, isDemo, sendMessage } from '../lib/api'
import { breedLabel } from '../lib/labels'
import type { Message, Pet } from '../lib/types'
import { BackIcon, SendIcon } from './Icons'

const time = (iso: string) => new Date(iso).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })

export function Chat({ myPet, other, onBack }: { myPet: Pet; other: Pet; onBack: () => void }) {
  const [messages, setMessages] = useState<Message[] | null>(null)
  const [text, setText] = useState('')
  const [error, setError] = useState('')
  const [sending, setSending] = useState(false)
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
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onBack()
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', onKey)
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = prev
    }
  }, [onBack])

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

  return createPortal(
    <section className="chat" role="dialog" aria-modal="true" aria-label={`Conversa com ${other.name}`}>
      <header className="chat-head">
        <button className="icon-btn" aria-label="Voltar para os matches" onClick={onBack}><BackIcon /></button>
        <img className="avatar" src={other.photo_url ?? ''} alt="" />
        <div className="chat-who">
          <strong>{other.name}</strong>
          <span className="muted">{[breedLabel(other), other.city].filter(Boolean).join(' · ')}</span>
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
    </section>,
    document.body,
  )
}
