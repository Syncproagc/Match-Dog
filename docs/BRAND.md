# Identidade visual do Match Dog

## Ideia
Dois cães face a face, com os focinhos se encontrando no centro, formam um coração. É a promessa do app: o encontro vem antes do like.

## Logo
- **Símbolo:** dois cães que formam um coração. Versão com volume (gradientes e sombra suave), sem textura.
- **Logotipo:** `match dog` em minúsculas, Fraunces extrabold, com o símbolo no lugar do "o": "match d♥g".
- **Uso no código:** `BrandMark` (símbolo) e `Wordmark` (logotipo) em `src/components/BrandMark.tsx`. Não recrie o desenho à mão.

### Arquivos em `public/brand/`
| Arquivo | Quando usar |
|---|---|
| `mark.svg` | Símbolo com volume, em fundo claro |
| `mark-light.svg` | Símbolo com volume, em fundo coral ou escuro |
| `mark-flat.svg` | Versão chapada, em fundo claro (adesivo, impressão, uma cor) |
| `mark-flat-light.svg` | Versão chapada, em fundo coral ou escuro |
| `app-icon.svg` | Ícone do app, símbolo sobre coral (o `public/favicon.svg` é o mesmo desenho) |

### Cuidados
- Use a versão clara em fundo claro e a versão "light" em fundo coral ou escuro.
- Em tamanhos pequenos (favicon, ícone) os detalhes dos cães se perdem e o coração continua legível. Abaixo de 24 px prefira a versão chapada.
- Não gire, não estique, não troque as cores do símbolo.

## Cores
| Uso | Valor |
|---|---|
| Coral da marca (logo, ícone) | `#e8735a` |
| Coral dos botões e destaques do app | `#d9583f` (mais escuro, para dar contraste ao texto creme) |
| Creme | `#fff7f0` |
| Café (texto) | `#1a1411` |
| Menta (curtida) | `#5cbf8c` no escuro, `#3c9a6b` no claro |

As cores do app estão como variáveis CSS em `src/index.css`, com tema claro e escuro.

## Tipografia
- **Títulos e logotipo:** Fraunces (600 a 800)
- **Texto e interface:** DM Sans (400 a 600)

Ambas vêm do Google Fonts, carregadas em `index.html`.

## Tom de voz (proposta, ainda não validada)
Amigo de parquinho: frases curtas, calor, humor leve, pouco emoji, tratamento por "você".
- Match: "Deu match! Que tal marcar um passeio?"
- Sem resultados: "Você viu todos por aqui. Volte mais tarde."

## Pendências
- Ajustar o centro do símbolo, onde os focinhos ficam apertados em tamanhos pequenos.
- Confirmar tom de voz e paleta de apoio.
- Gerar ícones PNG (180, 192 e 512 px) a partir de `app-icon.svg` para iOS e PWA.
