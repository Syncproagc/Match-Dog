import { useEffect, useState } from 'react'
import { getMyPet, getUser, onAuthChange, signOut } from './lib/api'
import type { Pet, User } from './lib/types'
import { Login } from './pages/Login'
import { PetForm } from './pages/PetForm'
import { Discover } from './pages/Discover'
import { Matches } from './pages/Matches'

type Tab = 'discover' | 'matches' | 'profile'

export default function App() {
  const [user, setUser] = useState<User | null | undefined>(undefined)
  const [pet, setPet] = useState<Pet | null | undefined>(undefined)
  const [tab, setTab] = useState<Tab>('discover')

  useEffect(() => {
    getUser().then(setUser)
    return onAuthChange(setUser)
  }, [])

  useEffect(() => {
    if (user) getMyPet(user).then(setPet, () => setPet(null))
  }, [user])

  if (user === undefined) return <p className="muted page">Carregando...</p>
  if (!user) return <Login onLogin={setUser} />
  if (pet === undefined) return <p className="muted page">Carregando...</p>

  const logout = async () => {
    await signOut()
    setUser(null)
    setPet(undefined)
    setTab('discover')
  }

  return (
    <div className="app">
      <header>
        <span className="logo">🐾 Match Dog</span>
        <button className="link" onClick={logout}>Sair</button>
      </header>
      <main>
        {!pet ? (
          <PetForm user={user} pet={null} onSaved={setPet} />
        ) : tab === 'discover' ? (
          <Discover myPet={pet} />
        ) : tab === 'matches' ? (
          <Matches myPet={pet} />
        ) : (
          <PetForm user={user} pet={pet} onSaved={(p) => { setPet(p); setTab('discover') }} />
        )}
      </main>
      {pet && (
        <nav>
          <button className={tab === 'discover' ? 'active' : ''} onClick={() => setTab('discover')}>🔥<span>Descobrir</span></button>
          <button className={tab === 'matches' ? 'active' : ''} onClick={() => setTab('matches')}>💬<span>Matches</span></button>
          <button className={tab === 'profile' ? 'active' : ''} onClick={() => setTab('profile')}>🐶<span>Meu pet</span></button>
        </nav>
      )}
    </div>
  )
}
