#!/usr/bin/env node
/**
 * arquivo-unico.mjs — gera UM index.html com o site inteiro dentro.
 *
 *   npm run arquivo-unico
 *
 * Serve para subir o site arrastando um arquivo só, sem git e sem pasta.
 * CSS, JavaScript, fontes, cursor e ícone viram texto dentro do próprio HTML.
 *
 * Limitação que vem junto: vídeo e foto de verdade NÃO cabem aqui. Enquanto os
 * slots estiverem vazios (molduras listradas) tudo bem. Quando as mídias
 * entrarem, o jeito certo passa a ser publicar a pasta inteira.
 */
import { readFile, readdir, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const raiz = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const dist = path.join(raiz, 'dist')

const tipos = {
  '.woff2': 'font/woff2',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.jpg': 'image/jpeg',
  '.webp': 'image/webp',
}

async function dataUri(arquivoRelativo) {
  const limpo = arquivoRelativo.replace(/^\.?\//, '').split('?')[0]
  const completo = path.join(dist, limpo)
  const dados = await readFile(completo)
  const tipo = tipos[path.extname(limpo).toLowerCase()] ?? 'application/octet-stream'
  return `data:${tipo};base64,${dados.toString('base64')}`
}

// 0. textos e links num bloco legível, para editar sem precisar do projeto
const pt = JSON.parse(await readFile(path.join(raiz, 'src/content/pt.json'), 'utf8'))
const en = JSON.parse(await readFile(path.join(raiz, 'src/content/en.json'), 'utf8'))
const { links } = await import('../src/content/media.ts')

const blocoConteudo = `
    <!-- ===================================================================
         TEXTOS E LINKS DO SITE — você pode editar aqui.

         Abra este arquivo num editor de texto (TextEdit, VS Code, Bloco de
         Notas), troque o que está DEPOIS dos dois pontos, entre aspas, e salve.
         Depois é só subir o arquivo de novo no GitHub.

         Regras para não quebrar:
           · mantenha as aspas "assim"
           · mantenha as vírgulas no fim de cada linha
           · não apague chaves { } nem colchetes [ ]
           · acentos podem, emoji também

         Se errar alguma coisa, o site volta sozinho para os textos originais.
         ==================================================================== -->
    <script id="rc-conteudo" type="application/json">
${JSON.stringify({ pt, en, links }, null, 2)
  .split('\n')
  .map((linha) => '      ' + linha)
  .join('\n')}
    </script>
`

let html = await readFile(path.join(dist, 'index.html'), 'utf8')
html = html.replace('</head>', () => `${blocoConteudo}  </head>`)
const arquivos = await readdir(path.join(dist, 'assets'))

// 1. CSS para dentro, com fontes e cursor virando data URI
const nomeCss = arquivos.find((f) => f.endsWith('.css'))
let css = await readFile(path.join(dist, 'assets', nomeCss), 'utf8')
// só caminhos de arquivo de verdade: dentro das data URIs do CSS existem
// url(%23g) apontando para filtros SVG, que não são arquivo nenhum
const extensoes = Object.keys(tipos)
const refs = [
  ...new Set(
    [...css.matchAll(/url\(["']?([^"')]+)["']?\)/g)]
      .map((m) => m[1])
      .filter((ref) => extensoes.some((ext) => ref.toLowerCase().split('?')[0].endsWith(ext))),
  ),
]
for (const ref of refs) {
  const uri = await dataUri(ref)
  css = css.replaceAll(ref, () => uri)
}
// sempre com função no lugar de texto: CSS e JS têm $ e crase, que o replace
// interpretaria como comando ($&, $`, $') e duplicaria o documento inteiro
html = html.replace(
  new RegExp(`\\s*<link[^>]*href="[^"]*${nomeCss}"[^>]*>`),
  () => `\n    <style>${css}</style>`,
)

// 2. JavaScript para dentro
const nomeJs = arquivos.find((f) => f.endsWith('.js'))
const js = await readFile(path.join(dist, 'assets', nomeJs), 'utf8')
html = html.replace(
  new RegExp(`\\s*<script[^>]*src="[^"]*${nomeJs}"[^>]*></script>`),
  () => `\n    <script type="module">${js}</script>`,
)

// 3. Ícone da aba para dentro; o resto dos links de ícone sai (pesa e não cabe)
const iconeSvg = await dataUri('favicon.svg')
html = html.replace(/href="[^"]*favicon\.svg"/, () => `href="${iconeSvg}"`)
// as fontes agora estão dentro do CSS: o preload apontaria para arquivo que não existe
html = html.replace(/\s*<link\s+rel="preload"[\s\S]*?\/>/g, '')
html = html.replace(/\s*<link[^>]*(favicon\.ico|icones\/|site\.webmanifest)[^>]*>/g, '')

// 4. A CSP por meta bloquearia o próprio script embutido
html = html.replace(/\s*<!--[\s\S]*?-->\s*<meta\s+http-equiv="Content-Security-Policy"[\s\S]*?\/>/, '')

const saida = path.join(raiz, 'portfolio-index.html')
await writeFile(saida, html)

const tamanho = Buffer.byteLength(html) / 1024
console.log(`\n  ok  portfolio-index.html  (${tamanho.toFixed(0)} kB, tudo dentro)`)
console.log('      fontes, cursor, estilos e JavaScript embutidos')
console.log('      sem rotas /pt e /en: o seletor de idioma troca o conteúdo sem mudar a URL\n')
