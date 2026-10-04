import { useState } from 'react'
import { isDemo, signIn } from '../lib/api'
import type { User } from '../lib/types'

export function Login({ onLogin }: { onLogin: (u: User) => void }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [signUp, setSignUp] = useState(false)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setBusy(true)
    setError('')
    try {
      onLogin(await signIn(email, password, signUp))
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="login">
      <h1 className="logo">🐾 Match Dog</h1>
      <p className="muted">Encontre o par perfeito para o seu pet</p>
      {isDemo && <p className="notice">Modo demo: qualquer e-mail e senha funcionam.</p>}
      <form onSubmit={submit} className="form">
        <input type="email" placeholder="E-mail" required value={email} onChange={(e) => setEmail(e.target.value)} />
        <input type="password" placeholder="Senha" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} />
        {error && <p className="error">{error}</p>}
        <button className="primary" disabled={busy}>{signUp ? 'Criar conta' : 'Entrar'}</button>
      </form>
      <button className="link" onClick={() => setSignUp(!signUp)}>
        {signUp ? 'Já tenho conta' : 'Criar uma conta'}
      </button>
    </div>
  )
}
