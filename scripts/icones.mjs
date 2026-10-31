#!/usr/bin/env node
/**
 * icones.mjs — gera todos os ✨ do site a partir do emoji do sistema.
 *
 *   npm run icones
 *
 * 1. Compila e roda scripts/gerar-icones.m (AppKit) → PNGs do cursor e dos favicons
 * 2. Monta public/favicon.ico (16 + 32) a partir dos PNGs
 *
 * Só precisa rodar de novo se você quiser trocar o emoji.
 */
import { execFile as execFileCb } from 'node:child_process'
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { promisify } from 'node:util'

const execFile = promisify(execFileCb)
const raiz = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const bin = path.join(raiz, 'node_modules/.cache/gerar-icones')

async function gerarPngs() {
  await mkdir(path.dirname(bin), { recursive: true })
  await mkdir(path.join(raiz, 'public/cursor'), { recursive: true })
  await mkdir(path.join(raiz, 'public/icones'), { recursive: true })
  await execFile('clang', [
    '-framework', 'AppKit', '-framework', 'Foundation', '-fobjc-arc',
    '-o', bin, path.join(raiz, 'scripts/gerar-icones.m'),
  ])
  const { stdout } = await execFile(bin, [], { cwd: raiz })
  process.stdout.write(stdout)
}

/** ICO com PNGs embutidos (suportado por todos os navegadores atuais). */
async function gerarIco(tamanhos = [16, 32]) {
  const imagens = await Promise.all(
    tamanhos.map(async (t) => ({
      tamanho: t,
      dados: await readFile(path.join(raiz, `public/icones/favicon-${t}.png`)),
    })),
  )

  const cabecalho = Buffer.alloc(6)
  cabecalho.writeUInt16LE(0, 0) // reservado
  cabecalho.writeUInt16LE(1, 2) // tipo: ícone
  cabecalho.writeUInt16LE(imagens.length, 4)

  let offset = 6 + imagens.length * 16
  const entradas = imagens.map(({ tamanho, dados }) => {
    const e = Buffer.alloc(16)
    e.writeUInt8(tamanho >= 256 ? 0 : tamanho, 0) // largura
    e.writeUInt8(tamanho >= 256 ? 0 : tamanho, 1) // altura
    e.writeUInt8(0, 2) // paleta
    e.writeUInt8(0, 3) // reservado
    e.writeUInt16LE(1, 4) // planos
    e.writeUInt16LE(32, 6) // bits por pixel
    e.writeUInt32LE(dados.length, 8)
    e.writeUInt32LE(offset, 12)
    offset += dados.length
    return e
  })

  const ico = Buffer.concat([cabecalho, ...entradas, ...imagens.map((i) => i.dados)])
  await writeFile(path.join(raiz, 'public/favicon.ico'), ico)
  console.log(`  ok  public/favicon.ico (${tamanhos.join(' + ')}, ${(ico.length / 1024).toFixed(1)}kB)`)
}

await gerarPngs()
console.log('ICO:')
await gerarIco()
