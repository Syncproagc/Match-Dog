import { useState } from 'react'
import { savePet } from '../lib/api'
import { CameraIcon, CloseIcon, PlusIcon } from '../components/Icons'
import { TEMPERAMENTS, breedTypeLabel, purposeLabel, sociabilityLabel } from '../lib/labels'
import type { Pet, PetInput, User } from '../lib/types'

type Opt<T> = [T, string]
const SPECIES: Opt<PetInput['species']>[] = [['dog', 'Cachorro'], ['cat', 'Gato'], ['other', 'Outro']]
const SEX: Opt<NonNullable<PetInput['sex']>>[] = [['male', 'Macho'], ['female', 'Fêmea']]
const BREED_TYPE = Object.entries(breedTypeLabel) as Opt<NonNullable<PetInput['breed_type']>>[]
const PURPOSE = Object.entries(purposeLabel) as Opt<NonNullable<PetInput['purpose']>>[]
const SOCIABILITY = Object.entries(sociabilityLabel) as Opt<NonNullable<PetInput['sociability']>>[]
const MAX_EXTRA = 5
const YES_NO: Opt<boolean>[] = [[true, 'Sim'], [false, 'Não']]

// Botões de escolha única; tocar de novo na opção marcada limpa a resposta
function Choice<T extends string | boolean>({ label, value, options, onChange }: { label: string; value: T | null; options: Opt<T>[]; onChange: (v: T | null) => void }) {
  return (
    <fieldset className="field">
      <legend>{label}</legend>
      <div className="segmented" role="radiogroup" aria-label={label}>
        {options.map(([v, l]) => (
          <button key={String(v)} type="button" role="radio" aria-checked={value === v} className={value === v ? 'on' : ''} onClick={() => onChange(value === v ? null : v)}>{l}</button>
        ))}
      </div>
    </fieldset>
  )
}

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
    photos: pet?.photos ?? [],
    temperament: pet?.temperament ?? [],
    purpose: pet?.purpose ?? null,
    sociability: pet?.sociability ?? null,
    breed_type: pet?.breed_type ?? 'purebred',
    sire_breed: pet?.sire_breed ?? '',
    dam_breed: pet?.dam_breed ?? '',
    has_pedigree: pet?.has_pedigree ?? null,
    registry: pet?.registry ?? '',
    times_bred: pet?.times_bred ?? null,
    has_offspring: pet?.has_offspring ?? null,
  })
  const [photo, setPhoto] = useState<File | null>(null)
  const [extra, setExtra] = useState<File[]>([])
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  const set = <K extends keyof PetInput>(k: K, v: PetInput[K]) => setForm((f) => ({ ...f, [k]: v }))
  const toggleTemper = (t: string) => set('temperament', form.temperament.includes(t) ? form.temperament.filter((x) => x !== t) : [...form.temperament, t])
  const preview = photo ? URL.createObjectURL(photo) : form.photo_url
  const room = MAX_EXTRA - form.photos.length - extra.length
  const addExtra = (files: FileList | null) => files && setExtra((x) => [...x, ...Array.from(files)].slice(0, MAX_EXTRA - form.photos.length))
  const mixed = form.breed_type === 'mixed'
  const purebred = form.breed_type === 'purebred'
  const female = form.sex === 'female'

  const submit = async (e?: React.FormEvent) => {
    e?.preventDefault()
    if (!form.name.trim()) return setError('Dê um nome ao seu pet.')
    if (mixed && !form.sire_breed?.trim() && !form.dam_breed?.trim()) return setError('Informe a raça do pai, da mãe ou de ambos.')
    setBusy(true)
    setError('')
    try {
      // Campos que não se aplicam à resposta atual são limpos antes de salvar
      const clean: PetInput = {
        ...form,
        breed: purebred ? form.breed : null,
        sire_breed: mixed ? form.sire_breed : null,
        dam_breed: mixed ? form.dam_breed : null,
        registry: form.has_pedigree ? form.registry : null,
        times_bred: female ? form.times_bred : null,
        has_offspring: female ? form.has_offspring : null,
      }
      onSaved(await savePet(user, clean, photo, pet, extra))
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

      <fieldset className="field">
        <legend>Mais fotos ({form.photos.length + extra.length}/{MAX_EXTRA})</legend>
        <div className="thumbs">
          {form.photos.map((src) => (
            <div key={src} className="thumb">
              <img src={src} alt="Foto extra do pet" />
              <button type="button" aria-label="Remover foto" onClick={() => set('photos', form.photos.filter((p) => p !== src))}><CloseIcon size={14} /></button>
            </div>
          ))}
          {extra.map((f, i) => (
            <div key={f.name + i} className="thumb">
              <img src={URL.createObjectURL(f)} alt="Nova foto do pet" />
              <button type="button" aria-label="Remover foto" onClick={() => setExtra((x) => x.filter((_, j) => j !== i))}><CloseIcon size={14} /></button>
            </div>
          ))}
          {room > 0 && (
            <label className="thumb add" aria-label="Adicionar fotos">
              <PlusIcon />
              <input type="file" accept="image/*" multiple hidden onChange={(e) => { addExtra(e.target.files); e.target.value = '' }} />
            </label>
          )}
        </div>
      </fieldset>

      <h2 className="form-section">Sobre o pet</h2>
      <div className="field">
        <label htmlFor="pet-name">Nome</label>
        <input id="pet-name" placeholder="Como ele se chama?" required value={form.name} onChange={(e) => set('name', e.target.value)} />
      </div>
      <Choice label="Espécie" value={form.species} options={SPECIES} onChange={(v) => v && set('species', v)} />
      <Choice label="Sexo" value={form.sex} options={SEX} onChange={(v) => set('sex', v)} />
      <div className="row">
        <div className="field age">
          <label htmlFor="pet-age">Idade</label>
          <input type="number" min={0} id="pet-age" placeholder="Anos" value={form.age_years ?? ''} onChange={(e) => set('age_years', e.target.value === '' ? null : Number(e.target.value))} />
        </div>
        <div className="field grow">
          <label htmlFor="pet-city">Cidade</label>
          <input id="pet-city" placeholder="Onde ele mora" value={form.city ?? ''} onChange={(e) => set('city', e.target.value)} />
        </div>
      </div>

      <h2 className="form-section">Raça e registro</h2>
      <Choice label="Tipo de raça" value={form.breed_type} options={BREED_TYPE} onChange={(v) => set('breed_type', v ?? 'purebred')} />
      {purebred && (
        <div className="field">
          <label htmlFor="pet-breed">Raça</label>
          <input id="pet-breed" placeholder="Ex.: Beagle" value={form.breed ?? ''} onChange={(e) => set('breed', e.target.value)} />
        </div>
      )}
      {mixed && (
        <div className="row">
          <div className="field grow">
            <label htmlFor="pet-sire">Raça do pai</label>
            <input id="pet-sire" placeholder="Ex.: Labrador" value={form.sire_breed ?? ''} onChange={(e) => set('sire_breed', e.target.value)} />
          </div>
          <div className="field grow">
            <label htmlFor="pet-dam">Raça da mãe</label>
            <input id="pet-dam" placeholder="Ex.: Poodle" value={form.dam_breed ?? ''} onChange={(e) => set('dam_breed', e.target.value)} />
          </div>
        </div>
      )}
      {form.breed_type === 'caramelo' && <p className="notice">Mistura de várias raças ou sem raça definida fica como caramelo (SRD).</p>}
      <Choice label="Tem pedigree ou registro?" value={form.has_pedigree} options={YES_NO} onChange={(v) => set('has_pedigree', v)} />
      {form.has_pedigree && (
        <div className="field">
          <label htmlFor="pet-registry">Entidade ou número do registro (opcional)</label>
          <input id="pet-registry" placeholder="Ex.: CBKC 123456" value={form.registry ?? ''} onChange={(e) => set('registry', e.target.value)} />
        </div>
      )}

      <h2 className="form-section">Temperamento e convívio</h2>
      <fieldset className="field">
        <legend>Temperamento</legend>
        <div className="chips">
          {TEMPERAMENTS.map((t) => (
            <button key={t} type="button" aria-pressed={form.temperament.includes(t)} className={form.temperament.includes(t) ? 'chip on' : 'chip'} onClick={() => toggleTemper(t)}>{t}</button>
          ))}
        </div>
      </fieldset>
      <Choice label="Como se dá com os outros?" value={form.sociability} options={SOCIABILITY} onChange={(v) => set('sociability', v)} />
      <Choice label="Função" value={form.purpose} options={PURPOSE} onChange={(v) => set('purpose', v)} />

      {female && (
        <>
          <h2 className="form-section">Histórico reprodutivo</h2>
          <div className="field">
            <label htmlFor="pet-times-bred">Quantas vezes já cruzou?</label>
            <input type="number" min={0} id="pet-times-bred" placeholder="0 se nunca cruzou" value={form.times_bred ?? ''} onChange={(e) => set('times_bred', e.target.value === '' ? null : Number(e.target.value))} />
          </div>
          <Choice label="Já teve crias?" value={form.has_offspring} options={YES_NO} onChange={(v) => set('has_offspring', v)} />
        </>
      )}

      <h2 className="form-section">Descrição</h2>
      <div className="field">
        <label htmlFor="pet-bio">Como ele é?</label>
        <textarea id="pet-bio" placeholder="Conte em poucas linhas como seu pet é" rows={3} maxLength={280} value={form.bio ?? ''} onChange={(e) => set('bio', e.target.value)} />
      </div>
      {error && <p className="error" role="alert">{error}</p>}
      <button type="button" className="primary" disabled={busy} onClick={() => submit()}>{busy ? 'Salvando...' : 'Salvar'}</button>
    </form>
  )
}
