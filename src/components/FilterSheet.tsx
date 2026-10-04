import { useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { CloseIcon } from './Icons'
import { breedTypeLabel, purposeLabel, sexLabel, sociabilityLabel, speciesLabel } from '../lib/labels'
import { countFilters, noFilters, type Filters } from '../lib/filters'

interface Props {
  value: Filters
  total: number
  hasOrigin: boolean
  onChange: (f: Filters) => void
  onClose: () => void
}

const MAX_RADIUS = 150

type ListKey = 'species' | 'sex' | 'sociability' | 'purpose' | 'breed_type'
const GROUPS: { key: ListKey; label: string; options: Record<string, string> }[] = [
  { key: 'species', label: 'Espécie', options: speciesLabel },
  { key: 'sex', label: 'Sexo', options: sexLabel },
  { key: 'sociability', label: 'Convívio', options: sociabilityLabel },
  { key: 'purpose', label: 'Função', options: purposeLabel },
  { key: 'breed_type', label: 'Tipo de raça', options: breedTypeLabel },
]

export function FilterSheet({ value, total, hasOrigin, onChange, onClose }: Props) {
  const closeRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    closeRef.current?.focus()
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', onKey)
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = prev
    }
  }, [onClose])

  const toggle = (key: ListKey, opt: string) => {
    const cur = value[key] as string[]
    onChange({ ...value, [key]: cur.includes(opt) ? cur.filter((x) => x !== opt) : [...cur, opt] })
  }
  const active = countFilters(value)

  return createPortal(
    <div className="sheet-backdrop" onClick={onClose}>
      <section className="sheet filter-sheet" role="dialog" aria-modal="true" aria-label="Filtros" onClick={(e) => e.stopPropagation()}>
        <header className="filter-head">
          <h2>Filtros</h2>
          <button ref={closeRef} className="icon-btn" aria-label="Fechar" onClick={onClose}><CloseIcon size={20} /></button>
        </header>
        <div className="sheet-scroll filter-body">
          <fieldset className="field">
            <legend>Distância</legend>
            <div className="range-head">
              <output htmlFor="filter-radius" className="range-value">{value.radiusKm == null ? 'Sem limite' : value.radiusKm === 0 ? 'Mesmo local' : `Até ${value.radiusKm} km`}</output>
              <button type="button" className="link" disabled={!hasOrigin || value.radiusKm == null} onClick={() => onChange({ ...value, radiusKm: null })}>Sem limite</button>
            </div>
            <input
              id="filter-radius"
              className="range"
              type="range"
              min={0}
              max={MAX_RADIUS}
              step={1}
              disabled={!hasOrigin}
              aria-label="Distância máxima em quilômetros"
              value={value.radiusKm ?? MAX_RADIUS}
              style={{ '--pct': `${((value.radiusKm ?? MAX_RADIUS) / MAX_RADIUS) * 100}%` } as React.CSSProperties}
              onChange={(e) => onChange({ ...value, radiusKm: Number(e.target.value) })}
            />
            <div className="range-scale" aria-hidden><span>0 km</span><span>75 km</span><span>150 km</span></div>
            {!hasOrigin && <p className="muted filter-note">Defina a localização do seu pet em "Meu pet" para filtrar por distância.</p>}
          </fieldset>
          {GROUPS.map((g) => (
            <fieldset className="field" key={g.key}>
              <legend>{g.label}</legend>
              <div className="chips">
                {Object.entries(g.options).map(([opt, label]) => {
                  const on = (value[g.key] as string[]).includes(opt)
                  return <button key={opt} type="button" aria-pressed={on} className={on ? 'chip on' : 'chip'} onClick={() => toggle(g.key, opt)}>{label}</button>
                })}
              </div>
            </fieldset>
          ))}
          <fieldset className="field">
            <legend>Registro</legend>
            <div className="chips">
              <button type="button" aria-pressed={value.pedigreeOnly} className={value.pedigreeOnly ? 'chip on' : 'chip'} onClick={() => onChange({ ...value, pedigreeOnly: !value.pedigreeOnly })}>Só com pedigree</button>
            </div>
          </fieldset>
          <div className="field">
            <label htmlFor="filter-city">Cidade</label>
            <input id="filter-city" placeholder="Ex.: Curitiba" value={value.city} onChange={(e) => onChange({ ...value, city: e.target.value })} />
          </div>
          <p className="muted filter-note">Quem não informou um dado não aparece quando você filtra por ele.</p>
        </div>
        <div className="sheet-actions filter-actions">
          <button type="button" className="link" disabled={!active} onClick={() => onChange(noFilters)}>Limpar</button>
          <button type="button" className="primary" onClick={onClose}>Ver {total} {total === 1 ? 'pet' : 'pets'}</button>
        </div>
      </section>
    </div>,
    document.body,
  )
}
