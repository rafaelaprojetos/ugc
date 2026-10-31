#!/usr/bin/env node
/**
 * paginas.mjs — prepara o /dist para hospedagem estática (GitHub Pages).
 *
 * Roda sozinho depois do `npm run build`.
 *
 * O GitHub Pages serve arquivo, não tem reescrita de rota. Sem isso,
 * abrir rafaelacreator.com/pt direto daria 404. Então geramos:
 *
 *   dist/pt/index.html   com as meta tags em português
 *   dist/en/index.html   com as meta tags em inglês
 *   dist/404.html        para qualquer outro caminho cair no site
 *   dist/CNAME           o domínio próprio
 *   dist/.nojekyll       para o Pages não ignorar pastas com _ no nome
 */
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const raiz = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const dist = path.join(raiz, 'dist')

const pt = JSON.parse(await readFile(path.join(raiz, 'src/content/pt.json'), 'utf8'))
const en = JSON.parse(await readFile(path.join(raiz, 'src/content/en.json'), 'utf8'))
const { site } = await import('../src/content/media.ts')

const html = await readFile(path.join(dist, 'index.html'), 'utf8')

/** Troca o conteúdo de uma meta/link no HTML. */
function trocar(texto, seletor, atributo, valor) {
  const escapado = seletor.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const regex = new RegExp(`(<(?:meta|link)[^>]*${escapado}[^>]*${atributo}=")[^"]*(")`, 'i')
  return texto.replace(regex, `$1${valor}$2`)
}

function paginaDoIdioma(idioma) {
  const c = idioma === 'pt' ? pt : en
  const canonica = site.dominio + site.caminhos[idioma]
  const capa = site.dominio + c.seo.ogImage

  let saida = html
  saida = saida.replace(/<html lang="[^"]*"/, `<html lang="${c.seo.lang}"`)
  saida = saida.replace(/<title>[^<]*<\/title>/, `<title>${c.seo.title}</title>`)
  saida = trocar(saida, 'name="description"', 'content', c.seo.description)
  saida = trocar(saida, 'property="og:title"', 'content', c.seo.title)
  saida = trocar(saida, 'property="og:description"', 'content', c.seo.description)
  saida = trocar(saida, 'property="og:locale"', 'content', c.seo.ogLocale)
  saida = trocar(saida, 'property="og:image"', 'content', capa)
  saida = trocar(saida, 'property="og:url"', 'content', canonica)
  saida = trocar(saida, 'name="twitter:title"', 'content', c.seo.title)
  saida = trocar(saida, 'name="twitter:description"', 'content', c.seo.description)
  saida = trocar(saida, 'name="twitter:image"', 'content', capa)
  saida = trocar(saida, 'rel="canonical"', 'href', canonica)
  return saida
}

for (const idioma of ['pt', 'en']) {
  await mkdir(path.join(dist, idioma), { recursive: true })
  await writeFile(path.join(dist, idioma, 'index.html'), paginaDoIdioma(idioma))
  console.log(`  ok  dist/${idioma}/index.html`)
}

// qualquer caminho desconhecido cai aqui e o app se vira
await writeFile(path.join(dist, '404.html'), paginaDoIdioma('pt'))
console.log('  ok  dist/404.html')

await writeFile(path.join(dist, 'CNAME'), `${new URL(site.dominio).hostname}\n`)
console.log(`  ok  dist/CNAME (${new URL(site.dominio).hostname})`)

await writeFile(path.join(dist, '.nojekyll'), '')
console.log('  ok  dist/.nojekyll')
