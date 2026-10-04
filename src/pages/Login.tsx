import { useState } from 'react'
import { enterDemo, isDemo, signIn } from '../lib/api'
import { HeartIcon, PawIcon } from '../components/Icons'
import type { User } from '../lib/types'

export function Login({ onLogin }: { onLogin: (u: User) => void }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [signUp, setSignUp] = useState(false)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  // Sem depender do submit nativo: alguns visualizadores bloqueiam envio de formulário
  const submit = async (e?: React.FormEvent) => {
    e?.preventDefault()
    if (!/^\S+@\S+\.\S+$/.test(email)) return setError('Digite um e-mail válido.')
    if (password.length < 6) return setError('A senha precisa ter pelo menos 6 caracteres.')
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
      <div className="login-art" aria-hidden>
        <span className="mini-card c1" />
        <span className="mini-card c2" />
        <span className="mini-card c3"><HeartIcon size={34} /></span>
      </div>
      <div className="login-copy">
        <p className="brand"><PawIcon /> Match Dog</p>
        <h1>Amizades de quatro patas começam com um deslize.</h1>
        <p className="muted">Encontre companhia para passeios, brincadeiras e cruzas responsáveis perto de você.</p>
      </div>
      {isDemo && <p className="notice">Modo demo: entre como visitante ou use qualquer e-mail e uma senha de 6 caracteres.</p>}
      <form onSubmit={(e) => e.preventDefault()} className="form">
        <input id="email" aria-label="E-mail" type="email" name="email" autoComplete="email" placeholder="E-mail" required value={email} onChange={(e) => setEmail(e.target.value)} />
        <input id="password" aria-label="Senha" type="password" name="password" autoComplete={signUp ? 'new-password' : 'current-password'} placeholder="Senha" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} />
        {error && <p className="error" role="alert">{error}</p>}
        <button type="submit" className="primary" disabled={busy} onClick={submit}>{signUp ? 'Criar conta' : 'Entrar'}</button>
      </form>
      {isDemo && (
        <button type="button" className="secondary" onClick={async () => onLogin(await enterDemo())}>
          Entrar como visitante
        </button>
      )}
      <button type="button" className="link" onClick={() => setSignUp(!signUp)}>
        {signUp ? 'Já tenho conta. Entrar' : 'Ainda não tem conta? Criar agora'}
      </button>
    </div>
  )
}
