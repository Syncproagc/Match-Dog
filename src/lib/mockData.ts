import type { Pet } from './types'

const photo = (id: string) => `https://images.unsplash.com/${id}?w=600&h=800&fit=crop`

// likesBack: se o pet de demonstração devolve o like (simula o outro dono)
export const seedPets: (Pet & { likesBack: boolean })[] = [
  { id: 'p1', owner_id: 'u1', name: 'Thor', species: 'dog', breed: 'Golden Retriever', age_years: 3, sex: 'male', city: 'São Paulo', bio: 'Amo bolinhas e piscina.', photo_url: photo('photo-1552053831-71594a27632d'), likesBack: true },
  { id: 'p2', owner_id: 'u2', name: 'Luna', species: 'dog', breed: 'Husky Siberiano', age_years: 2, sex: 'female', city: 'Curitiba', bio: 'Uivo quando estou feliz. Sempre.', photo_url: photo('photo-1605568427561-40dd23c2acea'), likesBack: true },
  { id: 'p3', owner_id: 'u3', name: 'Mel', species: 'cat', breed: 'SRD', age_years: 4, sex: 'female', city: 'Rio de Janeiro', bio: 'Sonecas ao sol são minha religião.', photo_url: photo('photo-1514888286974-6c03e2ca1dba'), likesBack: false },
  { id: 'p4', owner_id: 'u4', name: 'Bob', species: 'dog', breed: 'Beagle', age_years: 5, sex: 'male', city: 'Belo Horizonte', bio: 'Meu nariz me leva a aventuras.', photo_url: photo('photo-1505628346881-b72b27e84530'), likesBack: true },
  { id: 'p5', owner_id: 'u5', name: 'Nina', species: 'dog', breed: 'Pug', age_years: 1, sex: 'female', city: 'Porto Alegre', bio: 'Pequena, barulhenta e muito fofa.', photo_url: photo('photo-1517849845537-4d257902454a'), likesBack: false },
  { id: 'p6', owner_id: 'u6', name: 'Simba', species: 'cat', breed: 'Maine Coon', age_years: 3, sex: 'male', city: 'Florianópolis', bio: 'Rei da casa, aceito carinho às vezes.', photo_url: photo('photo-1543852786-1cf6624b9987'), likesBack: true },
]
