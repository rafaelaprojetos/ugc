# Regras do projeto

Portfólio de Rafaela Chagas, UGC creator. Vite + React + TS + Tailwind v4 + Framer Motion.
Site estático na Vercel, domínio **rafaelacreator.com**. Mobile-first.

Estas regras valem para **todas as seções**. Ao criar uma seção nova, conferir a lista inteira.

## Conteúdo

1. Nenhum texto escrito dentro de componente. Tudo em `src/content/pt.json` e `src/content/en.json`.
2. Toda mídia é um **slot** declarado em `src/content/media.ts` (nome fixo, pasta fixa, formato fixo).
   Nunca escrever caminho de arquivo direto no JSX — usar `<SlotVideo id="tech-video-3" />` e irmãos.
   Os textos ligam-se aos slots pelo mesmo `id`.
3. Os dois JSONs têm a mesma estrutura — `Conteudo = typeof pt`, então o `tsc` acusa se faltar campo no `en.json`.

## Layouts — três de verdade, não um encolhido

| Faixa | Tailwind | Como é |
| --- | --- | --- |
| até 767px | padrão | 1 coluna; carrossel com swipe e snap onde houver várias mídias; toque mínimo 44px; título grande sem cortar palavra |
| 768–1023px | `md:` | grids de 2 a 3 colunas |
| 1024px+ | `lg:` | colagem completa, sobreposições, hover |

- **Menu hambúrguer até 1023px.** Os 7 links não cabem em 834px, e tablet também é toque:
  a barra completa só aparece em `lg:`. Alvo de toque de 44px vale até `lg:` pelo mesmo motivo.
- Colagem com posição absoluta só em `lg:`. No tablet vira grade — o nome gigante da capa
  cobriria as fotos se a colagem começasse em `md:`.
- Título grande leva `whitespace-nowrap`: nome de pessoa não quebra no meio.
- Animação em loop e `scale` de hover **em camadas diferentes**: no mesmo elemento a
  animação sobrescreve o `scale` e o hover não acontece (ver `Marcas.tsx`).
- Rótulo, etiqueta ou pill que existe no layout final tem que existir no placeholder também,
  senão o layout muda quando a mídia entra (ver a etiqueta de views em `SlotVideo`).

- Hover só no desktop. O `hover:` do Tailwind v4 já sai dentro de `@media (hover:hover)` — não escrever hover em CSS solto.
- Toque mínimo: classe `alvo-toque` (44x44).
- Várias mídias → `<Carrossel>` + `<CarrosselItem>`.
- Sem scroll horizontal no mobile; margem lateral `var(--gutter)` (16px mobile, 32px desktop) via `container-site`.
- **Ao terminar cada seção, mostrar prints em 375px e 1280px.**

## Mídia — sistema de slots

O site está em **modo placeholder**: o layout já tem o tamanho real de cada mídia e mostra
uma moldura listrada com o nome do slot enquanto o arquivo não existe. Nada pula quando a
mídia entra.

- Componentes: `<SlotVideo>`, `<SlotFoto>`, `<SlotLogo>`, `<Sticker>` — todos recebem só o `id` do slot.
  Sem arquivo → `<PlaceholderMidia>`. Com arquivo → a mídia de verdade. Nenhum `if` na seção.
- Detecção automática: o plugin `plugins/midias.ts` varre `/public/assets` e gera o módulo
  virtual `virtual:midias`. Em dev, colocar ou tirar arquivo recarrega a página sozinho.
- Nome do arquivo = nome do slot. Pasta = a declarada no slot. Arquivo fora do lugar ainda é
  encontrado, mas sai um aviso no terminal e na página `/slots`.
- Vídeo 9:16, `rounded-video` (28px), `preload="none"`, poster obrigatório, lazy.
  Desktop: hover toca mudo; clique abre modal em tela cheia com som e controles. Mobile: toque abre o modal.
  Isso tudo já está dentro do `<SlotVideo>` — não reimplementar por seção.
- Vídeo até ~4MB, H.264 720p; imagens em WebP — `npm run midias -- --processar` faz os dois
  e gera os posters. Os originais vão para `public/assets/_originais/`.
- `npm run build` roda o processamento antes de compilar. Sem ffmpeg ele avisa e segue
  (é o que acontece na Vercel: os arquivos já vão processados no repositório).
- `prefers-reduced-motion` desliga loops (hook `usePrefereMenosMovimento` + bloco no `index.css`).

### Animação de entrada

`useEntrouNaTela` dispara a animação quando a seção aparece. Ele confere a posição na hora
de montar **antes** de ligar o IntersectionObserver: texto que só aparece depois de um
evento pode ficar invisível para sempre se o evento não vier. Número animado vai em
`<ContadorAnimado>` com `aria-hidden`, e a frase completa fica num `sr-only` ao lado.

### Capa e popup

- A capa tem **uma foto só** (`capa-foto`), **16:9 em todas as larguras, inclusive celular**,
  com o nome por cima no canto de baixo à esquerda. O véu escuro degradê na metade de baixo
  é o que mantém o nome legível com qualquer imagem que entre no slot.
- O formulário de orçamento mora no `<PopupOrcamento>`, em tela cheia. Abre sozinho em dois
  gatilhos, **o que vier primeiro**: #entregaveis entrando na tela, ou 3 minutos de página
  aberta (só conta com a aba à vista). Uma vez por sessão (`sessionStorage`, com try/catch).
  Depois de aparecer, fica um botão fixo no canto para reabrir.
- Dentro do popup a marca escolhe o canal: e-mail (formulário) ou WhatsApp (link direto).
- O listener de `EVENTO_ABRIR` é registrado **antes** de qualquer `return` do efeito — senão
  os botões de abrir param de funcionar depois que o popup já apareceu uma vez.
  Qualquer botão abre ele disparando `window.dispatchEvent(new CustomEvent(EVENTO_ABRIR))`.
- O nome da marca de cada vídeo fica em `marcasDosVideos` no `media.ts` — um lugar só,
  porque nome de marca não muda de idioma. Vazio = a etiqueta não aparece.
- O WhatsApp em `media.ts` é um **link inteiro**, não um número. A tela mostra uma chamada
  ("Chamar no WhatsApp"), nunca o número.

### Campos opcionais

Em `#cases`, cada campo vazio simplesmente não renderiza (marca, link, cada métrica).
Mesma ideia vale para seções novas: string vazia = elemento some, sem quebrar o layout.

### Listas que viram seção

Subformatos (`subformatos`), marcas (`marcas`) e stickers (`stickers`) são **listas** em
`media.ts`. A seção mapeia a lista; os nomes exibidos ficam no pt/en.json com a mesma chave.
Para acrescentar um subformato: uma linha em `media.ts` + o nome nos dois JSONs + a pasta em
`public/assets/videos/<pasta>/`. Nenhum componente muda. Testado.

### Página /slots

`http://localhost:5173/slots` lista os 68 slots em grade, com preenchido/vazio e o caminho
esperado. **Só existe em desenvolvimento** — no build o trecho é removido pelo tree-shaking
(`import.meta.env.DEV`). Confirmar isso se mexer no `App.tsx`.

## Acessibilidade

- Contraste legível (títulos em fita usam `palavra-contorno` para isso).
- `alt` em imagem, `aria-label` em botão de ícone, navegação por teclado, foco visível.

## Segurança

- Headers no `vercel.json`: CSP restritiva, HSTS, `X-Frame-Options: DENY`, `nosniff`,
  `Referrer-Policy: strict-origin-when-cross-origin`, `Permissions-Policy` bloqueando câmera/microfone/localização.
- CSP libera só: o próprio site, Google Fonts, `api.web3forms.com` e `*.hcaptcha.com` (exigido pelo captcha invisível).
  **Domínio novo no site = atualizar a CSP**, senão o recurso é bloqueado silenciosamente.
- Formulário: validação de e-mail, limite de tamanho por campo, honeypot, hCaptcha invisível,
  botão travado durante o envio e depois dele, intervalo mínimo de 30s. Nada salvo no navegador nem em banco.
- E-mail e WhatsApp sempre via `<LinkProtegido>` + `src/lib/contato.ts` — nunca escritos direto no JSX.
- Links externos com `rel="noopener noreferrer"` (o `externo` do `LinkProtegido` já põe).
- Sem cookie de rastreamento. Medição, se um dia houver, só Vercel Analytics.
- Chaves só em `.env` (`VITE_*`), nunca no código. `.env` está no `.gitignore`.
- `npm audit` limpo antes de publicar.

## Identidade

- Cores, fontes, raios e sombras: bloco `@theme` do `src/index.css`. Não usar hex solto no componente.
- **Fontes hospedadas aqui** (`public/fontes/`, declaradas no topo do `index.css`, regeradas
  por `npm run fontes`). Nada de Google Fonts: tirava 860ms da primeira pintura e obrigava
  a CSP a liberar dois domínios externos.
- Três fontes: `font-display` (Bricolage, títulos), `font-sans` (Inter, corpo) e
  `font-script` (Pacifico, só o nome da capa, com a utilidade `letra-cremosa`).
- Vídeo por nicho em `#formatos` é uma **gaveta de pastas**: chegam fechadas (corpo em
  `grid-rows-[0fr]`, abas empilhadas em escadinha) e abrem em cascata quando a gaveta entra
  na tela — 140ms entre uma pasta e a seguinte. Um `useEntrouNaTela` só, no contêiner.
- **Contraste real, não aparente.** Texto branco sobre o rosa #E89AD2 dá 2.1:1 e reprova.
  Na barra e no menu o texto é `text-tinta`. Rótulo pequeno vai no mínimo `text-tinta/70`
  (`/55` dá 4.17:1, abaixo dos 4.5 exigidos). Palavra de título em cor clara sobre cor clara
  só funciona com `palavra-contorno`.
- Título de seção sempre em `<FitaTitulo>`; molduras em `<JanelaMac>`; rótulos em `<Etiqueta>`.
- Cursor ✨ e favicons saem de `npm run icones` (gera do emoji do sistema via AppKit).

## Idiomas

- URLs oficiais: `https://rafaelacreator.com/pt` e `/en`.
- Na raiz, a ordem é: caminho → preferência salva (`localStorage`, com try/catch) → idioma do
  navegador (português vai para `/pt`, qualquer outro para `/en`).
- A troca não recarrega a página e volta para a mesma seção (`secaoNoTopo` + `useLayoutEffect`
  em `i18n.tsx`). Testado.
- Inglês é de marketing, não literal: "mais virais" → "most viral", "falando com a câmera" →
  "talking head", "vamos trabalhar juntas?" → "let's work together?".
- Valores em reais nos cases continuam em R$ no inglês, com formatação americana (R$ 727.7K).

## SEO e domínio

- `/` normaliza para `/pt` ou `/en` no cliente.
- `src/lib/seo.ts` atualiza title, description, OG, canonical e hreflang a cada troca de idioma.
- `public/sitemap.xml` e `public/robots.txt` apontam para o domínio oficial.

## Antes de publicar

Rodar e conferir:

```bash
npm run build && npx vite preview --port 4173
CHROME_PATH="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" \
  npx lighthouse http://localhost:4173/pt --chrome-flags="--headless=new"
```

Referência da última revisão (build de produção, mobile):
performance 98 · acessibilidade 100 · boas práticas 100 · SEO 100.
Passo a passo do deploy: `DEPLOY.md`.

## Comandos

```bash
npm run dev        # servidor local
npm run build      # tsc + vite build
npm run typecheck  # só os tipos
npm run lint       # oxlint
npm run midias     # lista quais slots têm arquivo e quais faltam
npm run midias -- --processar   # comprime vídeos, gera posters, converte para WebP
npm run midias -- --vazios      # só o que ainda falta
npm run icones     # regera cursor e favicons do emoji ✨
npm run fontes     # rebaixa as fontes do Google para public/fontes/
```
