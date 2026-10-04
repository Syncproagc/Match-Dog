import { useState } from 'react'
import { savePet } from '../lib/api'
import type { Pet, PetInput, User } from '../lib/types'

interface Props {
  user: User
  pet: Pet | null
  onSaved: (p: Pet) => void
}

export function PetForm({ user, pet, onSaved }: Props) {
  const [form, setForm] = useState<PetInput>({
    name: pet?.name ?? '',
    species: pet?.species ?? 'dog',
    breed: pet?.breed ?? '',
    age_years: pet?.age_years ?? null,
    sex: pet?.sex ?? null,
    city: pet?.city ?? '',
    bio: pet?.bio ?? '',
    photo_url: pet?.photo_url ?? null,
  })
  const [photo, setPhoto] = useState<File | null>(null)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  const set = <K extends keyof PetInput>(k: K, v: PetInput[K]) => setForm((f) => ({ ...f, [k]: v }))
  const preview = photo ? URL.createObjectURL(photo) : form.photo_url

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setBusy(true)
    setError('')
    try {
      onSaved(await savePet(user, form, photo, pet))
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <form onSubmit={submit} className="form page">
      <h2>{pet ? 'Perfil do seu pet' : 'Cadastre seu pet'}</h2>
      <label className="photo-pick">
        {preview ? <img src={preview} alt="" /> : <span>📷 Adicionar foto</span>}
        <input type="file" accept="image/*" hidden onChange={(e) => setPhoto(e.target.files?.[0] ?? null)} />
      </label>
      <input placeholder="Nome" required value={form.name} onChange={(e) => set('name', e.target.value)} />
      <div className="row">
        <select value={form.species} onChange={(e) => set('species', e.target.value as PetInput['species'])}>
          <option value="dog">Cachorro</option>
          <option value="cat">Gato</option>
          <option value="other">Outro</option>
        </select>
        <select value={form.sex ?? ''} onChange={(e) => set('sex', (e.target.value || null) as PetInput['sex'])}>
          <option value="">Sexo</option>
          <option value="male">Macho</option>
          <option value="female">Fêmea</option>
        </select>
      </div>
      <div className="row">
        <input placeholder="Raça" value={form.breed ?? ''} onChange={(e) => set('breed', e.target.value)} />
        <input
          type="number"
          min={0}
          placeholder="Idade"
          value={form.age_years ?? ''}
          onChange={(e) => set('age_years', e.target.value === '' ? null : Number(e.target.value))}
        />
      </div>
      <input placeholder="Cidade" value={form.city ?? ''} onChange={(e) => set('city', e.target.value)} />
      <textarea placeholder="Conte um pouco sobre seu pet" rows={3} value={form.bio ?? ''} onChange={(e) => set('bio', e.target.value)} />
      {error && <p className="error">{error}</p>}
      <button className="primary" disabled={busy}>{busy ? 'Salvando...' : 'Salvar'}</button>
    </form>
  )
}
