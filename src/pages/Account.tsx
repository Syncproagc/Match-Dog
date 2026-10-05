import { useState } from 'react'
import { alertsSupported, browserAlertsOn, setBrowserAlerts } from '../lib/alerts'
import { changeEmail, changePassword, deleteAccount, exportMyData, isDemo, saveSettings } from '../lib/api'
import { Confirm } from '../components/Confirm'
import type { Pet, Settings, User } from '../lib/types'

interface Props {
  user: User
  pet: Pet | null
  settings: Settings
  onSettings: (s: Settings) => void
  onUser: (u: User) => void
  onLogout: () => void
  onDeleted: () => void
}

const WORD = 'EXCLUIR'

export function Account({ user, pet, settings, onSettings, onUser, onLogout, onDeleted }: Props) {
  const [email, setEmail] = useState(user.email)
  const [emailMsg, setEmailMsg] = useState<{ ok: boolean; text: string } | null>(null)
  const [password, setPassword] = useState('')
  const [again, setAgain] = useState('')
  const [passMsg, setPassMsg] = useState<{ ok: boolean; text: string } | null>(null)
  const [prefError, setPrefError] = useState('')
  const [browser, setBrowser] = useState(browserAlertsOn())
  const [exporting, setExporting] = useState(false)
  const [exportError, setExportError] = useState('')
  const [deleting, setDeleting] = useState(false)
  const [word, setWord] = useState('')
  const [busy, setBusy] = useState(false)
  const [delError, setDelError] = useState('')

  const submitEmail = async (e: React.FormEvent) => {
    e.preventDefault()
    const next = email.trim()
    if (!next || next === user.email) return
    setEmailMsg(null)
    try {
      const updated = await changeEmail(user, next)
      if (updated) {
        onUser(updated)
        setEmailMsg({ ok: true, text: 'E-mail atualizado.' })
      } else {
        setEmailMsg({ ok: true, text: 'Enviamos um link de confirmação para o novo e-mail. A troca vale depois de confirmar.' })
      }
    } catch (err) {
      setEmailMsg({ ok: false, text: err instanceof Error ? err.message : 'Não foi possível trocar o e-mail.' })
    }
  }

  const submitPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setPassMsg(null)
    if (password.length < 6) return setPassMsg({ ok: false, text: 'Use pelo menos 6 caracteres.' })
    if (password !== again) return setPassMsg({ ok: false, text: 'As senhas não são iguais.' })
    try {
      await changePassword(password)
      setPassword('')
      setAgain('')
      setPassMsg({ ok: true, text: 'Senha atualizada.' })
    } catch (err) {
      setPassMsg({ ok: false, text: err instanceof Error ? err.message : 'Não foi possível trocar a senha.' })
    }
  }

  const toggle = async (key: keyof Settings, value: boolean) => {
    const next = { ...settings, [key]: value }
    onSettings(next)
    setPrefError('')
    try {
      await saveSettings(user, next)
    } catch {
      onSettings(settings)
      setPrefError('Não foi possível salvar. Tente de novo.')
    }
  }

  const toggleBrowser = async (on: boolean) => setBrowser(await setBrowserAlerts(on))

  const download = async () => {
    setExporting(true)
    setExportError('')
    try {
      const data = await exportMyData(user, pet)
      const url = URL.createObjectURL(new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' }))
      const a = document.createElement('a')
      a.href = url
      a.download = 'meus-dados-match-dog.json'
      a.click()
      URL.revokeObjectURL(url)
    } catch {
      setExportError('Não foi possível reunir os dados. Tente de novo.')
    } finally {
      setExporting(false)
    }
  }

  const remove = async () => {
    setBusy(true)
    setDelError('')
    try {
      await deleteAccount(user)
      onDeleted()
    } catch (err) {
      console.error(err)
      setDelError('Não foi possível excluir agora. Nada foi apagado por completo; tente de novo.')
      setBusy(false)
    }
  }

  return (
    <section className="page account">
      <h1 className="page-title">Conta</h1>

      <section className="acc-section" aria-labelledby="acc-login">
        <h2 id="acc-login">Acesso</h2>
        {isDemo && <p className="notice">Modo demo: as mudanças valem só neste navegador.</p>}
        <form className="acc-form" onSubmit={submitEmail}>
          <div className="field">
            <label htmlFor="acc-email">E-mail</label>
            <input id="acc-email" type="email" required autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          {emailMsg && <p className={emailMsg.ok ? 'notice' : 'error'} role="status">{emailMsg.text}</p>}
          <button type="submit" className="secondary" disabled={!email.trim() || email.trim() === user.email}>Trocar e-mail</button>
        </form>
        <form className="acc-form" onSubmit={submitPassword}>
          <div className="field">
            <label htmlFor="acc-pass">Nova senha</label>
            <input id="acc-pass" type="password" autoComplete="new-password" minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>
          <div className="field">
            <label htmlFor="acc-pass2">Repita a nova senha</label>
            <input id="acc-pass2" type="password" autoComplete="new-password" minLength={6} value={again} onChange={(e) => setAgain(e.target.value)} />
          </div>
          {passMsg && <p className={passMsg.ok ? 'notice' : 'error'} role="status">{passMsg.text}</p>}
          <button type="submit" className="secondary" disabled={!password || !again}>Trocar senha</button>
        </form>
      </section>

      <section className="acc-section" aria-labelledby="acc-notif">
        <h2 id="acc-notif">Avisos</h2>
        <label className="switch-row">
          <span><strong>Novos matches</strong><small>Quando alguém curtir seu pet de volta</small></span>
          <input type="checkbox" role="switch" checked={settings.notify_matches} onChange={(e) => toggle('notify_matches', e.target.checked)} />
        </label>
        <label className="switch-row">
          <span><strong>Novas mensagens</strong><small>Quando um match escrever para você</small></span>
          <input type="checkbox" role="switch" checked={settings.notify_messages} onChange={(e) => toggle('notify_messages', e.target.checked)} />
        </label>
        {alertsSupported() ? (
          <label className="switch-row">
            <span><strong>Avisos no navegador</strong><small>Mostra um aviso quando o app está em segundo plano. Vale só neste aparelho.</small></span>
            <input type="checkbox" role="switch" checked={browser} onChange={(e) => toggleBrowser(e.target.checked)} />
          </label>
        ) : (
          <p className="muted acc-note">Este navegador não oferece avisos do sistema.</p>
        )}
        {prefError && <p className="error" role="alert">{prefError}</p>}
      </section>

      <section className="acc-section" aria-labelledby="acc-data">
        <h2 id="acc-data">Seus dados</h2>
        <p className="muted acc-note">Baixe uma cópia do que guardamos: conta, perfil do pet, matches e mensagens.</p>
        <button type="button" className="secondary" disabled={exporting} onClick={download}>{exporting ? 'Reunindo…' : 'Baixar meus dados'}</button>
        {exportError && <p className="error" role="alert">{exportError}</p>}
      </section>

      <section className="acc-section">
        <button type="button" className="secondary" onClick={onLogout}>Sair da conta</button>
      </section>

      <section className="acc-section danger-zone" aria-labelledby="acc-danger">
        <h2 id="acc-danger">Excluir conta</h2>
        <p className="muted acc-note">Apaga sua conta, o perfil do pet, as fotos, os matches e as conversas. Quem conversava com você deixa de ver essas mensagens. Não dá para desfazer.</p>
        <button type="button" className="secondary danger-outline" onClick={() => { setWord(''); setDelError(''); setDeleting(true) }}>Excluir minha conta</button>
      </section>

      {deleting && (
        <Confirm
          title="Excluir sua conta?"
          confirmLabel="Excluir para sempre"
          danger
          busy={busy}
          error={delError}
          canConfirm={word.trim().toUpperCase() === WORD}
          onConfirm={remove}
          onCancel={() => setDeleting(false)}
        >
          <p>Tudo será apagado e não pode ser recuperado. Para confirmar, digite <strong>{WORD}</strong>.</p>
          <div className="field">
            <label htmlFor="del-word">Palavra de confirmação</label>
            <input id="del-word" autoComplete="off" autoCapitalize="characters" value={word} onChange={(e) => setWord(e.target.value)} />
          </div>
        </Confirm>
      )}
    </section>
  )
}
