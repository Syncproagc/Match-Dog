import { useCallback, useEffect, useRef, useState } from 'react'
import { getNotifications, isDemo } from './api'
import { showBrowserAlert } from './alerts'
import type { NotificationItem, Notifications, Pet, Settings } from './types'

const keyOf = (i: NotificationItem) => (i.kind === 'match' ? `match:${i.pet.id}` : `msg:${i.pet.id}:${i.last.id}`)
export const describe = (i: NotificationItem) =>
  i.kind === 'match' ? `Deu match com ${i.pet.name}` : `${i.pet.name}: ${i.last.body}`

/**
 * Consulta de tempos em tempos matches novos e mensagens não lidas.
 * `fresh` traz o aviso mais recente que chegou depois do primeiro carregamento.
 */
export function useNotifications(myPet: Pet | null | undefined, settings: Settings, onOpen: (pet: Pet) => void) {
  const [data, setData] = useState<Notifications>({ count: 0, items: [] })
  const [fresh, setFresh] = useState<NotificationItem | null>(null)
  const announced = useRef<Set<string> | null>(null)
  const openRef = useRef(onOpen)
  useEffect(() => {
    openRef.current = onOpen
  }, [onOpen])

  const refresh = useCallback(async () => {
    if (!myPet) return
    const next = await getNotifications(myPet, settings)
    setData(next)
    if (announced.current === null) {
      announced.current = new Set(next.items.map(keyOf))
      return
    }
    const added = next.items.filter((i) => !announced.current!.has(keyOf(i)))
    next.items.forEach((i) => announced.current!.add(keyOf(i)))
    if (!added.length) return
    const latest = added[added.length - 1]
    if (document.hidden) showBrowserAlert('Match Dog', describe(latest), () => openRef.current(latest.pet))
    else setFresh(latest)
  }, [myPet, settings])

  useEffect(() => {
    announced.current = null
  }, [myPet?.id])

  useEffect(() => {
    if (!myPet) return
    const id = setInterval(() => refresh().catch(() => {}), isDemo ? 2500 : 8000)
    const first = setTimeout(() => refresh().catch(() => {}), 0)
    return () => {
      clearInterval(id)
      clearTimeout(first)
    }
  }, [myPet, refresh])

  /** Evita avisar de algo que o usuário já viu na tela, como o match que acabou de acontecer */
  const mute = useCallback((pet: Pet) => {
    announced.current?.add(`match:${pet.id}`)
  }, [])

  return { ...data, fresh, clearFresh: () => setFresh(null), refresh, mute }
}
