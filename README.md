# Match Dog

Aplicativo para tutores encontrarem companhia para o pet: passeios, brincadeiras e cruzas responsáveis. Deslize para curtir; quando a curtida é recíproca, dá match.

React + TypeScript + Vite, com Supabase para autenticação e dados.

## Rodando localmente

```bash
npm install
npm run dev
```

Sem variáveis de ambiente o app abre em **modo demo**, com dados salvos no navegador. Na tela de login, use "Entrar como visitante".

Para usar o Supabase de verdade, copie `.env.example` para `.env` e preencha `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY`. O esquema do banco está em `supabase/migrations/0001_init.sql`.

## Scripts

| Comando | O que faz |
|---|---|
| `npm run dev` | Servidor de desenvolvimento |
| `npm run build` | Checagem de tipos e build de produção |
| `npm run lint` | Oxlint |
| `npm run preview` | Serve o build localmente |

## Identidade visual

O símbolo, o logotipo, as cores, as fontes e o tom de voz estão em [`docs/BRAND.md`](docs/BRAND.md). No código, use `BrandMark` e `Wordmark` de `src/components/BrandMark.tsx`. Arquivos prontos para uso ficam em `public/brand/`.
