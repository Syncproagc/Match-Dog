import { useCallback, useEffect, useState } from 'react'
import { defaultSettings, getMyPet, getSettings, getUser, onAuthChange, signOut } from './lib/api'
import { useNotifications } from './lib/useNotifications'
import type { Pet, Settings, User } from './lib/types'
import { Login } from './pages/Login'
import { PetForm } from './pages/PetForm'
import { Discover } from './pages/Discover'
import { Matches } from './pages/Matches'
import { Profile } from './pages/Profile'
import { Account } from './pages/Account'
import { NotificationSheet, Toast } from './components/Notifications'
import { BellIcon, ChatIcon, PawIcon, StackIcon, UserIcon } from './components/Icons'
import { Wordmark } from './components/BrandMark'

type Tab = 'discover' | 'matches' | 'profile' | 'account'

export default function App() {
  const [user, setUser] = useState<User | null | undefined>(undefined)
  const [pet, setPet] = useState<Pet | null | undefined>(undefined)
  const [tab, setTab] = useState<Tab>('discover')
  const [editing, setEditing] = useState(false)
  const [settings, setSettings] = useState<Settings>(defaultSettings)
  const [bell, setBell] = useState(false)
  const [chatWith, setChatWith] = useState<string | null>(null)
  const [activeChat, setActiveChat] = useState<string | null>(null)

  useEffect(() => {
    getUser().then(setUser)
    return onAuthChange(setUser)
  }, [])

  useEffect(() => {
    if (user) getMyPet(user).then(setPet, () => setPet(null))
  }, [user])

  useEffect(() => {
    if (user) getSettings(user).then(setSettings, () => {})
  }, [user])

  const openChat = useCallback((p: Pet) => {
    setBell(false)
    setTab('matches')
    setChatWith(p.id)
  }, [])
  const notif = useNotifications(pet, settings, openChat)
  const chatOpened = useCallback(() => setChatWith(null), [])

  if (user === undefined) return <div className="boot"><PawIcon /></div>
  if (!user) return <Login onLogin={setUser} />
  if (pet === undefined) return <div className="boot"><PawIcon /></div>

  const logout = async () => {
    await signOut()
    setUser(null)
    setPet(undefined)
    setSettings(defaultSettings)
    setTab('discover')
  }

  return (
    <div className="app">
      <header>
        <span className="brand"><Wordmark /></span>
        <div className="head-right">
          {pet && (
            <button type="button" className="icon-btn bell" aria-label={notif.count ? `Avisos, ${notif.count} novos` : 'Avisos'} onClick={() => setBell(true)}>
              <BellIcon />
              {notif.count > 0 && <span className="badge bell-badge" aria-hidden="true">{notif.count > 9 ? '9+' : notif.count}</span>}
            </button>
          )}
          {pet?.photo_url && <img className="avatar" src={pet.photo_url} alt={pet.name} />}
          <button className="link" onClick={logout}>Sair</button>
        </div>
      </header>
      <main>
        {!pet ? (
          <PetForm user={user} pet={null} onSaved={setPet} />
        ) : tab === 'discover' ? (
          <Discover myPet={pet} onMatch={notif.mute} onSetLocation={() => { setTab('profile'); setEditing(true) }} />
        ) : tab === 'matches' ? (
          <Matches myPet={pet} openPetId={chatWith} onOpened={chatOpened} onChanged={notif.refresh} onActive={setActiveChat} unread={Object.fromEntries(notif.items.flatMap((i) => (i.kind === 'message' ? [[i.pet.id, i.count]] : [])))} />
        ) : tab === 'account' ? (
          <Account
            user={user}
            pet={pet}
            settings={settings}
            onSettings={setSettings}
            onUser={setUser}
            onLogout={logout}
            onDeleted={() => { setUser(null); setPet(undefined); setSettings(defaultSettings); setTab('discover') }}
          />
        ) : !editing ? (
          <Profile pet={pet} onEdit={() => setEditing(true)} />
        ) : (
          <PetForm user={user} pet={pet} onSaved={(p) => { setPet(p); setEditing(false) }} />
        )}
      </main>
      {bell && <NotificationSheet items={notif.items} onOpen={openChat} onClose={() => setBell(false)} />}
      {notif.fresh && !bell && notif.fresh.pet.id !== activeChat && <Toast item={notif.fresh} onOpen={() => { openChat(notif.fresh!.pet); notif.clearFresh() }} onClose={notif.clearFresh} />}
      {pet && (
        <nav aria-label="Principal">
          <button className={tab === 'discover' ? 'active' : ''} aria-label="Descobrir" aria-current={tab === 'discover' ? 'page' : undefined} onClick={() => setTab('discover')}><StackIcon /><span>Descobrir</span></button>
          <button className={tab === 'matches' ? 'active' : ''} aria-label="Matches" aria-current={tab === 'matches' ? 'page' : undefined} onClick={() => setTab('matches')}><ChatIcon /><span>Matches</span>{notif.count > 0 && tab !== 'matches' && <i className="nav-dot" aria-hidden="true" />}</button>
          <button className={tab === 'profile' ? 'active' : ''} aria-label="Meu pet" aria-current={tab === 'profile' ? 'page' : undefined} onClick={() => { setTab('profile'); setEditing(false) }}><PawIcon /><span>Meu pet</span></button>
          <button className={tab === 'account' ? 'active' : ''} aria-label="Conta" aria-current={tab === 'account' ? 'page' : undefined} onClick={() => setTab('account')}><UserIcon /><span>Conta</span></button>
        </nav>
      )}
    </div>
  )
}
