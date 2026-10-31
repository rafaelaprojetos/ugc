#!/usr/bin/env node
/**
 * fontes.mjs — rebaixa as fontes do Google Fonts para dentro do site.
 *
 *   npm run fontes
 *
 * Só precisa rodar de novo se você trocar de fonte ou de peso.
 * As declarações @font-face ficam no topo de src/index.css.
 */
import { mkdir, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const raiz = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const destino = path.join(raiz, 'public/fontes')

const URL_CSS =
  'https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,800' +
  '&family=Inter:wght@400;500;600;700&display=swap'

// User-Agent de Chrome: sem isso o Google devolve formatos antigos, não woff2
const UA =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36'

const SUBSETS = ['latin', 'latin-ext']

const css = await fetch(URL_CSS, { headers: { 'User-Agent': UA } }).then((r) => r.text())
const blocos = [...css.matchAll(/\/\*\s*([a-z0-9-]+)\s*\*\/\s*(@font-face\s*\{[^}]*\})/g)]

await mkdir(destino, { recursive: true })
const vistos = new Set()

for (const [, subset, bloco] of blocos) {
  if (!SUBSETS.includes(subset)) continue

  const familia = /font-family:\s*'([^']+)'/.exec(bloco)[1]
  const peso = /font-weight:\s*([^;]+);/.exec(bloco)[1].trim()
  const url = /url\((https:\/\/fonts\.gstatic\.com[^)]+)\)/.exec(bloco)[1]

  // Inter vem como fonte variável: o mesmo arquivo para todos os pesos
  const variavel = familia === 'Inter'
  const nome = variavel
    ? `inter-variavel-${subset}.woff2`
    : `${familia.toLowerCase().replace(/ /g, '-')}-${peso}-${subset}.woff2`
  if (vistos.has(nome)) continue
  vistos.add(nome)

  const dados = Buffer.from(await fetch(url, { headers: { 'User-Agent': UA } }).then((r) => r.arrayBuffer()))
  await writeFile(path.join(destino, nome), dados)
  console.log(`  ok  public/fontes/${nome} (${(dados.length / 1024).toFixed(1)}kB)`)
}

console.log('\nAs regras @font-face estão no topo de src/index.css — confira se os nomes batem.\n')
