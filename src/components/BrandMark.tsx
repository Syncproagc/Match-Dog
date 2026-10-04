import { useId } from 'react'

// Símbolo do Match Dog: dois cães face a face formam o coração.
// "color" para fundos claros, "light" para fundos coral ou escuros.
const PALETTE = {
  color: {
    body: ['#f7a18a', '#e8735a', '#c2533b'],
    head: ['#fbb29d', '#ec7b62', '#cf5d46'],
    ear: ['#c85a42', '#8f3626'],
    muz: ['#fff6ee', '#f3cdbb'],
    nose: '#2a1a14',
  },
  light: {
    body: ['#ffffff', '#fff0e7', '#efc3b1'],
    head: ['#ffffff', '#fff3ec', '#f2cbb9'],
    ear: ['#f9d3c6', '#e29b84'],
    muz: ['#ffffff', '#ffe3d5'],
    nose: '#4a2418',
  },
} as const

const HALF = 'M48.5 92C29 80 9 62 9 42C9 26 21 18 32 22C41 25 46 31 48.5 38Z'
const EAR = 'M18 27C8 29 7 46 13 50C19 53 23 46 22 38Z'

export function BrandMark({ size = 28, tone = 'color' }: { size?: number | string; tone?: 'color' | 'light' }) {
  const p = `bm${useId().replace(/:/g, '')}`
  const c = PALETTE[tone]
  return (
    <svg viewBox="-6 0 112 100" width={size} height={size} fill="none" aria-hidden="true" className="brand-mark">
      <defs>
        <radialGradient id={`${p}b`} cx=".32" cy=".26" r=".95">
          <stop offset="0" stopColor={c.body[0]} /><stop offset=".55" stopColor={c.body[1]} /><stop offset="1" stopColor={c.body[2]} />
        </radialGradient>
        <radialGradient id={`${p}h`} cx=".35" cy=".3" r=".85">
          <stop offset="0" stopColor={c.head[0]} /><stop offset=".6" stopColor={c.head[1]} /><stop offset="1" stopColor={c.head[2]} />
        </radialGradient>
        <linearGradient id={`${p}e`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor={c.ear[0]} /><stop offset="1" stopColor={c.ear[1]} />
        </linearGradient>
        <radialGradient id={`${p}m`} cx=".4" cy=".35" r=".8">
          <stop offset="0" stopColor={c.muz[0]} /><stop offset="1" stopColor={c.muz[1]} />
        </radialGradient>
        <filter id={`${p}s`} x="-10%" y="-10%" width="120%" height="120%">
          <feDropShadow dx="0" dy="1" stdDeviation="1.1" floodColor="#3b130a" floodOpacity=".22" />
        </filter>
        <g id={`${p}half`}>
          <path d={HALF} fill={`url(#${p}b)`} filter={`url(#${p}s)`} />
          <ellipse cx="41" cy="58" rx="6.5" ry="4.6" transform="rotate(-20 41 58)" fill={`url(#${p}m)`} filter={`url(#${p}s)`} />
          <circle cx="28" cy="37" r="15" fill={`url(#${p}h)`} filter={`url(#${p}s)`} />
          <path d={EAR} fill={`url(#${p}e)`} filter={`url(#${p}s)`} />
          <ellipse cx="40.5" cy="42" rx="7.2" ry="5.6" fill={`url(#${p}m)`} />
          <g transform="translate(46 40.5)">
            <ellipse rx="3.1" ry="2.5" fill={c.nose} />
            <ellipse cx="-.9" cy="-.9" rx="1.1" ry=".6" fill="#fff" opacity=".55" />
          </g>
          <g transform="translate(33.5 33)">
            <circle r="2.7" fill={c.nose} />
            <circle cx="-.8" cy="-.9" r=".9" fill="#fff" opacity=".9" />
          </g>
        </g>
      </defs>
      <use href={`#${p}half`} />
      <use href={`#${p}half`} transform="translate(100 0) scale(-1 1)" />
      <path d="M50 44V90" stroke="#3b130a" strokeOpacity=".3" strokeWidth="1.6" />
    </svg>
  )
}

// Logotipo: o símbolo ocupa o lugar do "o" de dog.
export function Wordmark({ tone = 'color' }: { tone?: 'color' | 'light' }) {
  return (
    <span className="wordmark">
      match d<BrandMark size="1.05em" tone={tone} />g
    </span>
  )
}
