import { supabase } from './supabase'
import { demoPet, seedPets } from './mockData'
import type { Message, Pet, PetInput, User } from './types'

export const isDemo = !supabase

// ---------- Modo demo: tudo em localStorage ----------
interface DemoState {
  user: User | null
  myPet: Pet | null
  swipes: Record<string, boolean>
  matches: string[]
  messages: Message[]
}

const KEY = 'match-dog-demo'
const empty: DemoState = { user: null, myPet: null, swipes: {}, matches: [], messages: [] }

function load(): DemoState {
  try {
    return { ...empty, ...JSON.parse(localStorage.getItem(KEY) ?? '{}') }
  } catch {
    return { ...empty }
  }
}
function save(s: DemoState) {
  try {
    localStorage.setItem(KEY, JSON.stringify(s))
  } catch {
    /* ignore */
  }
}

const fileToDataUrl = (f: File) =>
  new Promise<string>((res, rej) => {
    const r = new FileReader()
    r.onload = () => res(r.result as string)
    r.onerror = rej
    r.readAsDataURL(f)
  })

const stripSeed = (seed: (typeof seedPets)[number]): Pet => {
  const p: Partial<typeof seed> = { ...seed }
  delete p.likesBack
  return p as Pet
}

// ---------- API ----------
export async function getUser(): Promise<User | null> {
  if (!supabase) return load().user
  const { data } = await supabase.auth.getUser()
  return data.user ? { id: data.user.id, email: data.user.email ?? '' } : null
}

export function onAuthChange(cb: (u: User | null) => void): () => void {
  if (!supabase) return () => {}
  const { data } = supabase.auth.onAuthStateChange((_e, session) =>
    cb(session?.user ? { id: session.user.id, email: session.user.email ?? '' } : null),
  )
  return () => data.subscription.unsubscribe()
}

export async function signIn(email: string, password: string, signUp: boolean): Promise<User> {
  if (!supabase) {
    const user = { id: 'demo-user', email }
    save({ ...load(), user })
    return user
  }
  const { data, error } = signUp
    ? await supabase.auth.signUp({ email, password })
    : await supabase.auth.signInWithPassword({ email, password })
  if (error) throw error
  if (!data.user) throw new Error('Confirme seu e-mail para continuar.')
  if (signUp && !data.session) throw new Error('Enviamos um link de confirmação para seu e-mail.')
  return { id: data.user.id, email: data.user.email ?? email }
}

/** Modo demo: entra direto com um pet de exemplo já cadastrado */
export async function enterDemo(): Promise<User> {
  const user = { id: 'demo-user', email: 'visitante@matchdog.app' }
  const s = load()
  save({ ...s, user, myPet: s.myPet ?? { ...demoPet, owner_id: user.id } })
  return user
}

export async function signOut() {
  if (!supabase) return save({ ...empty })
  await supabase.auth.signOut()
}

export async function getMyPet(user: User): Promise<Pet | null> {
  if (!supabase) { const p = load().myPet; return p && { ...p, temperament: p.temperament ?? [], photos: p.photos ?? [], lat: p.lat ?? null, lng: p.lng ?? null } }
  const { data, error } = await supabase
    .from('pets')
    .select('*')
    .eq('owner_id', user.id)
    .order('created_at')
    .limit(1)
    .maybeSingle()
  if (error) throw error
  return data
}

export async function savePet(user: User, input: PetInput, photo: File | null, existing: Pet | null, extra: File[] = []): Promise<Pet> {
  if (!supabase) {
    const photo_url = photo ? await fileToDataUrl(photo) : input.photo_url
    const photos = [...input.photos, ...(await Promise.all(extra.map(fileToDataUrl)))]
    const pet: Pet = { ...input, photo_url, photos, id: existing?.id ?? 'my-pet', owner_id: user.id }
    save({ ...load(), myPet: pet })
    return pet
  }
  let photo_url = input.photo_url
  if (photo) {
    const path = `${user.id}/${crypto.randomUUID()}-${photo.name}`
    const up = await supabase.storage.from('pet-photos').upload(path, photo)
    if (up.error) throw up.error
    photo_url = supabase.storage.from('pet-photos').getPublicUrl(path).data.publicUrl
  }
  const photos = [...input.photos]
  for (const f of extra) {
    const path = `${user.id}/${crypto.randomUUID()}-${f.name}`
    const up = await supabase.storage.from('pet-photos').upload(path, f)
    if (up.error) throw up.error
    photos.push(supabase.storage.from('pet-photos').getPublicUrl(path).data.publicUrl)
  }
  const row = { ...input, photo_url, photos, owner_id: user.id }
  const q = existing
    ? supabase.from('pets').update(row).eq('id', existing.id)
    : supabase.from('pets').insert(row)
  const { data, error } = await q.select().single()
  if (error) throw error
  return data
}

/** Pets que meu pet ainda não avaliou */
export async function getCandidates(myPet: Pet): Promise<Pet[]> {
  if (!supabase) {
    const { swipes } = load()
    return seedPets.filter((p) => !(p.id in swipes)).map(stripSeed)
  }
  const { data: done, error: e1 } = await supabase
    .from('swipes')
    .select('target_pet_id')
    .eq('swiper_pet_id', myPet.id)
  if (e1) throw e1
  const exclude = [myPet.id, ...(done ?? []).map((s) => s.target_pet_id)]
  const { data, error } = await supabase
    .from('pets')
    .select('*')
    .neq('owner_id', myPet.owner_id)
    .not('id', 'in', `(${exclude.join(',')})`)
    .limit(50)
  if (error) throw error
  return data
}

/** Registra like/dislike. Retorna true se deu match. */
export async function swipe(myPet: Pet, target: Pet, liked: boolean): Promise<boolean> {
  if (!supabase) {
    const s = load()
    s.swipes[target.id] = liked
    const matched = liked && !!seedPets.find((p) => p.id === target.id)?.likesBack
    if (matched && !s.matches.includes(target.id)) s.matches.push(target.id)
    save(s)
    return matched
  }
  const { error } = await supabase
    .from('swipes')
    .upsert({ swiper_pet_id: myPet.id, target_pet_id: target.id, liked })
  if (error) throw error
  if (!liked) return false
  const [a, b] = [myPet.id, target.id].sort()
  const { data } = await supabase.from('matches').select('id').eq('pet_a_id', a).eq('pet_b_id', b).maybeSingle()
  return !!data
}

export async function getMatches(myPet: Pet): Promise<Pet[]> {
  if (!supabase) {
    const { matches } = load()
    return seedPets.filter((p) => matches.includes(p.id)).map(stripSeed)
  }
  const { data, error } = await supabase
    .from('matches')
    .select('pet_a:pets!matches_pet_a_id_fkey(*), pet_b:pets!matches_pet_b_id_fkey(*)')
    .or(`pet_a_id.eq.${myPet.id},pet_b_id.eq.${myPet.id}`)
    .order('created_at', { ascending: false })
  if (error) throw error
  return (data as unknown as { pet_a: Pet; pet_b: Pet }[]).map((m) => (m.pet_a.id === myPet.id ? m.pet_b : m.pet_a))
}

// ---------- Chat ----------
const pairKey = (a: string, b: string) => [a, b].sort().join(':')
const inPair = (m: Message, a: string, b: string) => pairKey(m.from_pet_id, m.to_pet_id) === pairKey(a, b)

// No modo demo, o outro dono é simulado com respostas prontas
const DEMO_REPLIES = [
  'Oi! Que bom que deu match.',
  'Vamos marcar um passeio no parque?',
  'Sábado de manhã seria bom para a gente.',
  'Combinado. Leve água para os dois.',
  'Tenho certeza de que eles vão se dar bem.',
]

function demoReply(myPet: Pet, other: Pet) {
  setTimeout(() => {
    const s = load()
    const count = s.messages.filter((m) => m.from_pet_id === other.id && inPair(m, myPet.id, other.id)).length
    s.messages.push({
      id: crypto.randomUUID(),
      from_pet_id: other.id,
      to_pet_id: myPet.id,
      body: DEMO_REPLIES[count % DEMO_REPLIES.length],
      created_at: new Date().toISOString(),
    })
    save(s)
  }, 1500 + Math.random() * 1500)
}

export async function getMessages(myPet: Pet, other: Pet): Promise<Message[]> {
  if (!supabase) return load().messages.filter((m) => inPair(m, myPet.id, other.id))
  const { data, error } = await supabase
    .from('messages')
    .select('*')
    .or(`and(from_pet_id.eq.${myPet.id},to_pet_id.eq.${other.id}),and(from_pet_id.eq.${other.id},to_pet_id.eq.${myPet.id})`)
    .order('created_at')
  if (error) throw error
  return data
}

export async function sendMessage(myPet: Pet, other: Pet, body: string): Promise<Message> {
  if (!supabase) {
    const s = load()
    const msg: Message = { id: crypto.randomUUID(), from_pet_id: myPet.id, to_pet_id: other.id, body, created_at: new Date().toISOString() }
    s.messages.push(msg)
    save(s)
    demoReply(myPet, other)
    return msg
  }
  const { data, error } = await supabase.from('messages').insert({ from_pet_id: myPet.id, to_pet_id: other.id, body }).select().single()
  if (error) throw error
  return data
}

/** Última mensagem de cada conversa, indexada pelo id do outro pet */
export async function getLastMessages(myPet: Pet): Promise<Record<string, Message>> {
  let all: Message[]
  if (!supabase) {
    all = load().messages.filter((m) => m.from_pet_id === myPet.id || m.to_pet_id === myPet.id)
  } else {
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .or(`from_pet_id.eq.${myPet.id},to_pet_id.eq.${myPet.id}`)
      .order('created_at', { ascending: false })
      .limit(200)
    if (error) throw error
    all = [...data].reverse()
  }
  const last: Record<string, Message> = {}
  for (const m of all) last[m.from_pet_id === myPet.id ? m.to_pet_id : m.from_pet_id] = m
  return last
}
