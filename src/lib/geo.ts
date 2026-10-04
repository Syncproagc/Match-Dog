import type { Pet } from './types'

export interface Point {
  lat: number
  lng: number
}

// Capitais e cidades grandes, para quem prefere escolher a cidade a usar o GPS
export const CITIES: Record<string, Point> = {
  'São Paulo': { lat: -23.55, lng: -46.63 }, 'Rio de Janeiro': { lat: -22.91, lng: -43.17 }, 'Belo Horizonte': { lat: -19.92, lng: -43.94 },
  'Brasília': { lat: -15.79, lng: -47.88 }, 'Salvador': { lat: -12.97, lng: -38.51 }, 'Fortaleza': { lat: -3.73, lng: -38.53 },
  'Recife': { lat: -8.05, lng: -34.88 }, 'Porto Alegre': { lat: -30.03, lng: -51.23 }, 'Curitiba': { lat: -25.43, lng: -49.27 },
  'Manaus': { lat: -3.12, lng: -60.02 }, 'Belém': { lat: -1.46, lng: -48.5 }, 'Goiânia': { lat: -16.68, lng: -49.25 },
  'São Luís': { lat: -2.53, lng: -44.3 }, 'Maceió': { lat: -9.67, lng: -35.74 }, 'Natal': { lat: -5.79, lng: -35.21 },
  'Teresina': { lat: -5.09, lng: -42.8 }, 'João Pessoa': { lat: -7.12, lng: -34.86 }, 'Campo Grande': { lat: -20.47, lng: -54.62 },
  'Cuiabá': { lat: -15.6, lng: -56.1 }, 'Florianópolis': { lat: -27.6, lng: -48.55 }, 'Vitória': { lat: -20.32, lng: -40.34 },
  'Aracaju': { lat: -10.91, lng: -37.07 }, 'Porto Velho': { lat: -8.76, lng: -63.9 }, 'Macapá': { lat: 0.03, lng: -51.07 },
  'Rio Branco': { lat: -9.97, lng: -67.81 }, 'Boa Vista': { lat: 2.82, lng: -60.67 }, 'Palmas': { lat: -10.18, lng: -48.33 },
  'Campinas': { lat: -22.91, lng: -47.06 }, 'Santos': { lat: -23.96, lng: -46.33 }, 'Ribeirão Preto': { lat: -21.18, lng: -47.81 },
  'Sorocaba': { lat: -23.5, lng: -47.46 }, 'São José dos Campos': { lat: -23.22, lng: -45.9 }, 'Niterói': { lat: -22.88, lng: -43.1 },
  'Uberlândia': { lat: -18.92, lng: -48.28 }, 'Londrina': { lat: -23.31, lng: -51.16 }, 'Joinville': { lat: -26.3, lng: -48.85 },
  'Caxias do Sul': { lat: -29.17, lng: -51.18 }, 'Santo André': { lat: -23.66, lng: -46.54 }, 'Guarulhos': { lat: -23.46, lng: -46.53 },
  'Osasco': { lat: -23.53, lng: -46.79 }, 'São Bernardo do Campo': { lat: -23.69, lng: -46.56 }, 'Juiz de Fora': { lat: -21.76, lng: -43.35 },
  'Maringá': { lat: -23.42, lng: -51.94 }, 'Feira de Santana': { lat: -12.27, lng: -38.97 }, 'Campina Grande': { lat: -7.23, lng: -35.88 },
  'Blumenau': { lat: -26.92, lng: -49.07 }, 'Pelotas': { lat: -31.77, lng: -52.34 }, 'Petrópolis': { lat: -22.51, lng: -43.18 },
}

const norm = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').trim().toLowerCase()
const byName = new Map(Object.entries(CITIES).map(([name, pt]) => [norm(name), pt]))

export const cityPoint = (name: string | null | undefined): Point | null => (name ? byName.get(norm(name)) ?? null : null)

// Duas casas decimais (cerca de 1 km): a localização exata de uma casa não é exposta a outros usuários
export const roundPoint = (p: Point): Point => ({ lat: Math.round(p.lat * 100) / 100, lng: Math.round(p.lng * 100) / 100 })

export const petPoint = (p: Pet): Point | null => (p.lat != null && p.lng != null ? { lat: p.lat, lng: p.lng } : null)

/** Distância em km pela fórmula de haversine */
export function distanceKm(a: Point, b: Point): number {
  const rad = (d: number) => (d * Math.PI) / 180
  const dLat = rad(b.lat - a.lat)
  const dLng = rad(b.lng - a.lng)
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(dLng / 2) ** 2
  return 2 * 6371 * Math.asin(Math.sqrt(h))
}

export function distanceLabel(km: number | null): string | null {
  if (km == null) return null
  if (km < 2) return 'a menos de 2 km'
  if (km < 10) return `a ${Math.round(km)} km`
  return `a ${Math.round(km / 5) * 5} km`
}

export function currentPosition(): Promise<Point> {
  return new Promise((res, rej) => {
    if (!navigator.geolocation) return rej(new Error('Este aparelho não oferece localização.'))
    navigator.geolocation.getCurrentPosition(
      (pos) => res(roundPoint({ lat: pos.coords.latitude, lng: pos.coords.longitude })),
      () => rej(new Error('Não foi possível obter sua localização. Escolha sua cidade na lista.')),
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 600000 },
    )
  })
}
