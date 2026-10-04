import { useState } from 'react'
import { savePet } from '../lib/api'
import { CameraIcon } from '../components/Icons'
import type { Pet, PetInput, User } from '../lib/types'

const SPECIES: [PetInput['species'], string][] = [['dog', 'Cachorro'], ['cat', 'Gato'], ['other', 'Outro']]
const SEX: [NonNullable<PetInput['sex']>, string][] = [['male', 'Macho'], ['female', 'Fêmea']]

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

  const submit = async (e?: React.FormEvent) => {
    e?.preventDefault()
    if (!form.name.trim()) return setError('Dê um nome ao seu pet.')
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
      <h1 className="page-title">{pet ? 'Perfil do seu pet' : 'Cadastre seu pet'}</h1>
      {!pet && <p className="muted lede">É assim que outros donos vão ver seu pet. Dá para mudar depois.</p>}
      <label className="photo-pick">
        {preview ? <img src={preview} alt="Foto do seu pet" /> : <span className="pick-empty"><CameraIcon />Adicionar foto</span>}
        {preview && <span className="photo-change"><CameraIcon /> Trocar</span>}
        <input type="file" accept="image/*" hidden onChange={(e) => setPhoto(e.target.files?.[0] ?? null)} />
      </label>
      <div className="field">
        <label htmlFor="pet-name">Nome</label>
        <input id="pet-name" placeholder="Como ele se chama?" required value={form.name} onChange={(e) => set('name', e.target.value)} />
      </div>
      <fieldset className="field">
        <legend>Espécie</legend>
        <div className="segmented" role="radiogroup" aria-label="Espécie">
          {SPECIES.map(([v, l]) => (
            <button key={v} type="button" role="radio" aria-checked={form.species === v} className={form.species === v ? 'on' : ''} onClick={() => set('species', v)}>{l}</button>
          ))}
        </div>
      </fieldset>
      <fieldset className="field">
        <legend>Sexo</legend>
        <div className="segmented" role="radiogroup" aria-label="Sexo">
          {SEX.map(([v, l]) => (
            <button key={v} type="button" role="radio" aria-checked={form.sex === v} className={form.sex === v ? 'on' : ''} onClick={() => set('sex', form.sex === v ? null : v)}>{l}</button>
          ))}
        </div>
      </fieldset>
      <div className="row">
        <div className="field grow">
          <label htmlFor="pet-breed">Raça</label>
          <input id="pet-breed" placeholder="Ex.: Beagle" value={form.breed ?? ''} onChange={(e) => set('breed', e.target.value)} />
        </div>
        <div className="field age">
          <label htmlFor="pet-age">Idade</label>
          <input type="number" min={0} id="pet-age" placeholder="Anos" value={form.age_years ?? ''} onChange={(e) => set('age_years', e.target.value === '' ? null : Number(e.target.value))} />
        </div>
      </div>
      <div className="field">
        <label htmlFor="pet-city">Cidade</label>
        <input id="pet-city" placeholder="Onde vocês moram" value={form.city ?? ''} onChange={(e) => set('city', e.target.value)} />
      </div>
      <div className="field">
        <label htmlFor="pet-bio">Sobre</label>
        <textarea id="pet-bio" placeholder="Conte um pouco sobre seu pet" rows={3} value={form.bio ?? ''} onChange={(e) => set('bio', e.target.value)} />
      </div>
      {error && <p className="error">{error}</p>}
      <button type="button" className="primary" disabled={busy} onClick={() => submit()}>{busy ? 'Salvando...' : 'Salvar'}</button>
    </form>
  )
}
