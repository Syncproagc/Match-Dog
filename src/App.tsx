import { useEffect, useState } from 'react'
import { getMyPet, getUser, onAuthChange, signOut } from './lib/api'
import type { Pet, User } from './lib/types'
import { Login } from './pages/Login'
import { PetForm } from './pages/PetForm'
import { Discover } from './pages/Discover'
import { Matches } from './pages/Matches'
import { ChatIcon, PawIcon, StackIcon } from './components/Icons'

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

  if (user === undefined) return <div className="boot"><PawIcon /></div>
  if (!user) return <Login onLogin={setUser} />
  if (pet === undefined) return <div className="boot"><PawIcon /></div>

  const logout = async () => {
    await signOut()
    setUser(null)
    setPet(undefined)
    setTab('discover')
  }

  return (
    <div className="app">
      <header>
        <span className="brand"><PawIcon /> Match Dog</span>
        <div className="head-right">
          {pet?.photo_url && <img className="avatar" src={pet.photo_url} alt={pet.name} />}
          <button className="link" onClick={logout}>Sair</button>
        </div>
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
        <nav aria-label="Principal">
          <button className={tab === 'discover' ? 'active' : ''} aria-current={tab === 'discover' ? 'page' : undefined} onClick={() => setTab('discover')}><StackIcon /><span>Descobrir</span></button>
          <button className={tab === 'matches' ? 'active' : ''} aria-current={tab === 'matches' ? 'page' : undefined} onClick={() => setTab('matches')}><ChatIcon /><span>Matches</span></button>
          <button className={tab === 'profile' ? 'active' : ''} aria-current={tab === 'profile' ? 'page' : undefined} onClick={() => setTab('profile')}><PawIcon /><span>Meu pet</span></button>
        </nav>
      )}
    </div>
  )
}
