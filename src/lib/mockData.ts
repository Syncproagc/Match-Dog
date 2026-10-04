import type { Pet } from './types'

// Retrato ilustrado em SVG (sem depender de imagens externas)
const palettes: Record<string, [string, string]> = {
  p1: ['#ffb347', '#ff7a59'],
  p2: ['#7fb2ff', '#4c5fd7'],
  p3: ['#f7a8c4', '#c86b98'],
  p4: ['#c9a27a', '#8a5a3b'],
  p5: ['#ffd36e', '#e09b3d'],
  p6: ['#8fd3b6', '#3f8f7a'],
}
const emojiFor: Record<string, string> = { p1: '🐕', p2: '🐺', p3: '🐈', p4: '🐶', p5: '🐶', p6: '🐱' }
const photo = (id: string) => {
  const [a, b] = palettes[id]
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 400"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${a}"/><stop offset="1" stop-color="${b}"/></linearGradient></defs><rect width="300" height="400" fill="url(#g)"/><circle cx="240" cy="70" r="90" fill="#fff" fill-opacity=".12"/><circle cx="40" cy="330" r="70" fill="#fff" fill-opacity=".1"/><text x="150" y="215" font-size="150" text-anchor="middle" dominant-baseline="middle">${emojiFor[id]}</text></svg>`
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`
}

// likesBack: se o pet de demonstração devolve o like (simula o outro dono)
export const seedPets: (Pet & { likesBack: boolean })[] = [
  { id: 'p1', owner_id: 'u1', name: 'Thor', species: 'dog', breed: 'Golden Retriever', age_years: 3, sex: 'male', city: 'São Paulo', bio: 'Amo bolinhas e piscina.', photo_url: photo('p1'), likesBack: true },
  { id: 'p2', owner_id: 'u2', name: 'Luna', species: 'dog', breed: 'Husky Siberiano', age_years: 2, sex: 'female', city: 'Curitiba', bio: 'Uivo quando estou feliz. Sempre.', photo_url: photo('p2'), likesBack: true },
  { id: 'p3', owner_id: 'u3', name: 'Mel', species: 'cat', breed: 'SRD', age_years: 4, sex: 'female', city: 'Rio de Janeiro', bio: 'Sonecas ao sol são minha religião.', photo_url: photo('p3'), likesBack: false },
  { id: 'p4', owner_id: 'u4', name: 'Bob', species: 'dog', breed: 'Beagle', age_years: 5, sex: 'male', city: 'Belo Horizonte', bio: 'Meu nariz me leva a aventuras.', photo_url: photo('p4'), likesBack: true },
  { id: 'p5', owner_id: 'u5', name: 'Nina', species: 'dog', breed: 'Pug', age_years: 1, sex: 'female', city: 'Porto Alegre', bio: 'Pequena, barulhenta e muito fofa.', photo_url: photo('p5'), likesBack: false },
  { id: 'p6', owner_id: 'u6', name: 'Simba', species: 'cat', breed: 'Maine Coon', age_years: 3, sex: 'male', city: 'Florianópolis', bio: 'Rei da casa, aceito carinho às vezes.', photo_url: photo('p6'), likesBack: true },
]
