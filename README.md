# Rafaela Chagas | UGC Creator

Portfólio estático em Vite + React + TypeScript + Tailwind CSS + Framer Motion.
Mobile-first, pronto para deploy na Vercel.

## Rodar

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # gera /dist
npm run preview    # testa o build
npm run typecheck  # checa os tipos
npm run midias     # lista os slots de mídia: o que já tem arquivo e o que falta
npm run icones     # regera o cursor ✨ e os favicons a partir do emoji
npm run fontes     # rebaixa as fontes para dentro do site
```

## Publicar

Passo a passo completo em [DEPLOY.md](DEPLOY.md).

## Antes do primeiro deploy

1. Copie `.env.example` para `.env` e crie sua chave do Web3Forms:

   - Abra https://web3forms.com
   - Em "Email Address", escreva **rafaelachagas@seuinfluencer.com.br** — é para esse
     endereço que os pedidos de orçamento vão chegar
   - Clique em "Create Access Key" e confirme pelo e-mail que chegar
   - Copie a chave e cole em `VITE_WEB3FORMS_KEY=` no `.env`
   - Na Vercel: Settings → Environment Variables → adicione a mesma variável

   Sem ela, o formulário mostra "ainda não foi configurado" em vez de enviar.

2. Opcional: `VITE_HCAPTCHA_SITEKEY` liga o captcha invisível. Vazio, fica só o honeypot.
3. Suba `public/assets/og/capa.webp` (1200x630).
4. Na Vercel, aponte `rafaelacreator.com` e `www.rafaelacreator.com` para o projeto —
   o `vercel.json` já redireciona o www para o domínio sem www.

## Onde eu edito o quê

| Quero mudar | Arquivo |
| --- | --- |
| Qualquer texto em português | `src/content/pt.json` |
| Qualquer texto em inglês | `src/content/en.json` |
| Slots de mídia, marcas e links | `src/content/media.ts` |
| Cores, fontes, raios e sombras | `src/index.css` (bloco `@theme`) |
| Ordem das seções | `src/App.tsx` |

**Nenhum texto fica escrito dentro dos componentes.** Os dois arquivos de conteúdo
têm a mesma estrutura: se você adicionar um campo no `pt.json`, adicione no
`en.json` também — o `npm run typecheck` avisa se faltar.

## Mídia — como colocar uma foto ou vídeo

O site está em modo placeholder: cada foto, vídeo, logo e sticker tem um **slot** com nome
fixo. Enquanto o arquivo não existe, aparece uma moldura listrada com o nome do slot escrito
no meio. **Você nunca precisa editar código para colocar uma mídia.**

1. Descubra o nome do slot:

   ```bash
   npm run midias
   ```

   Ou abra `http://localhost:5173/slots` com o site rodando — mostra tudo em grade.

2. Salve o arquivo com **exatamente** o nome do slot, na pasta que o comando indicou.
   Exemplo: o slot `tech-video-3` vai em `public/assets/videos/tech/tech-video-3.mp4`.

3. Rode:

   ```bash
   npm run midias -- --processar
   ```

   Comprime o vídeo para ~4MB (H.264, 720p), gera a thumbnail e converte foto para WebP.
   Os arquivos originais ficam guardados em `public/assets/_originais/`.

Pronto — o site troca o placeholder pelo arquivo sozinho.

Extensões aceitas: vídeo `.mp4 .mov` · foto `.webp .jpg .jpeg .png` · logo `.svg .png .webp`

Precisa do ffmpeg uma vez: `brew install ffmpeg`

Falta subir `public/assets/og/capa.webp` (1200x630) — é a imagem que aparece quando
o link é compartilhado.

### Preencher antes de publicar

Em `src/content/media.ts`, no bloco `links`:
`whatsappSocio` (só números com DDI, ex: 5511988887777) liga o botão "Falar com a Seu
Influencer". Enquanto estiver vazio, o botão aparece apagado em vez de levar a lugar nenhum.

`whatsapp` é o **link inteiro** do seu WhatsApp — pode colar um wa.me, um link curto ou um
link de grupo. O número nunca aparece escrito no site.

### Nome da marca em cada vídeo

Em `src/content/media.ts`, no bloco `marcasDosVideos`. Cada vídeo tem uma linha:

```
'tech-video-1': 'CapCut',
```

O nome aparece numa etiqueta no topo do vídeo. Deixe vazio e a etiqueta não aparece.
Fica num lugar só (e não nos dois JSONs) porque nome de marca não muda de idioma.

### Mudar a lista de slots

Em `src/content/media.ts`. Para ter 6 vídeos de tech em vez de 8, troque o número na linha
`...videos('Tech', 'tech', 8)`. Para trocar o nome de uma marca, edite a lista `marcas`.

## Tokens da identidade

| Token | Cor | Onde usar |
| --- | --- | --- |
| `rosa` | `#E89AD2` | barra do topo, faixas, destaques |
| `rosa-claro` | `#EDBBD8` | pastas, cards secundários |
| `lilas` | `#B8B0F6` | títulos grandes |
| `lima` | `#DDEA5C` | títulos grandes, faixas de destaque |
| `bege` | `#E7DFD5` | barras estilo navegador |
| `tinta` | `#111111` | texto e contornos |
| `branco` | `#FFFFFF` | — |

Use como classes do Tailwind: `bg-rosa`, `text-lilas`, `border-tinta`,
`rounded-video` (28px), `font-display`, `text-gigante`.

Fundo de céu: classe `fundo-ceu` (gradiente `#A9C4E8` → `#ECE6F2` com nuvens).

## Componentes da identidade

| Componente | Para quê |
| --- | --- |
| `FitaTitulo` | título de seção com efeito fita adesiva |
| `JanelaMac` | janela estilo macOS (barra bege + 3 bolinhas + busca) |
| `CardFoto` | foto como janela com nome de arquivo no topo |
| `Pasta` | pasta rosa-claro decorativa |
| `Etiqueta` | pill de rótulo, ex: "12 milhões de views" |
| `Sticker` | sticker 3D com flutuação em loop |
| `Secao` | casca de seção com o `id` certo da navegação |

## Segurança

Está tudo no `vercel.json` e no formulário. O ponto que mais dá problema no dia a dia:
**a CSP só libera o próprio site, Google Fonts, `api.web3forms.com` e `*.hcaptcha.com`.**
Se um dia o site for carregar algo de outro domínio (um player, uma fonte, um script),
tem que adicionar lá — senão o navegador bloqueia sem avisar.

As regras completas do projeto estão em `CLAUDE.md`.

## Deploy na Vercel

Importe o repositório. O `vercel.json` já define framework Vite, build `npm run build`,
saída `dist`, headers de segurança, redirecionamento do www e as rotas `/pt` e `/en`.
