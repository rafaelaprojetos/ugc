/**
 * IMPORTAR MÍDIAS — pega o que está em "VIDEOS DO SITE" e prepara para o site.
 *
 * Cada gaveta numerada vira um grupo de slots. Os arquivos entram em ordem
 * alfabética; para mandar na ordem, basta pôr "1 ", "2 " na frente do nome.
 *
 *   node scripts/importar-midias.mjs            → processa tudo que falta
 *   node scripts/importar-midias.mjs --refazer  → processa de novo, mesmo o que já existe
 *   node scripts/importar-midias.mjs --so 11    → só a gaveta que começa com 11
 *
 * Compressão e posters saem do binário em scripts/comprimir-video.m, compilado
 * na hora. A máquina não tem ffmpeg; isso usa o AVFoundation do próprio macOS.
 */
import { execFileSync } from 'node:child_process'
import { existsSync, mkdirSync, readdirSync, statSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const raiz = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const entrada = path.join(raiz, 'VIDEOS DO SITE')
const assets = path.join(raiz, 'public', 'assets')
const binario = path.join(raiz, 'node_modules', '.cache', 'comprimir-video')

/** Qualidade dos vídeos. */
const LADO_MAIOR = 1280
const BITS_VIDEO = 1_200_000
const BITS_AUDIO = 128_000
/** O GitHub recusa arquivo acima de 100MB; fico com folga em 90. */
const TETO_BYTES = 90 * 1024 * 1024

/** Número da gaveta → como os slots daquele grupo se chamam. */
const gavetas = {
  '02': { pasta: 'videos/sobre', nome: (n) => `sobre-video-${n}` },
  '03': { pasta: 'videos/virais', nome: (n) => `virais-video-${n}` },
  '04': { pasta: 'videos/tech', nome: (n) => `tech-video-${n}` },
  '05': { pasta: 'videos/personagem', nome: (n) => `personagem-video-${n}` },
  '06': { pasta: 'videos/vlog', nome: (n) => `vlog-video-${n}` },
  '07': { pasta: 'videos/contraste', nome: (n) => `contraste-video-${n}` },
  '08': { pasta: 'videos/tiktok-shop', nome: (n) => `tiktok-shop-video-${n}` },
  '09': { pasta: 'videos/falando-com-a-camera', nome: (n) => `falando-com-a-camera-video-${n}` },
  '10': { pasta: 'videos/dupla-criativa', nome: (n) => `dupla-criativa-video-${n}` },
  '11': { pasta: 'videos/anuncios', nome: (n) => `anuncios-video-${n}` },
  '12': { pasta: 'videos/viagens', nome: (n) => `viagens-video-${n}` },
  '13': { pasta: 'videos/cases', nome: (n) => `case-${n}-video` },
}

const refazer = process.argv.includes('--refazer')
// sem --so, indexOf devolve -1 e argv[0] é o caminho do node: aí tudo seria filtrado
const posSo = process.argv.indexOf('--so')
const soGaveta = posSo === -1 ? null : process.argv[posSo + 1]

function compilar() {
  mkdirSync(path.dirname(binario), { recursive: true })
  const fonte = path.join(raiz, 'scripts', 'comprimir-video.m')
  if (existsSync(binario) && statSync(binario).mtimeMs > statSync(fonte).mtimeMs) return
  execFileSync('clang', [
    '-fobjc-arc', '-O2', '-w',
    '-framework', 'Foundation', '-framework', 'AVFoundation',
    '-framework', 'CoreMedia', '-framework', 'CoreVideo',
    '-framework', 'ImageIO', '-framework', 'CoreGraphics',
    '-o', binario, fonte,
  ])
}

function duracao(arquivo) {
  try {
    const s = execFileSync('mdls', ['-raw', '-name', 'kMDItemDurationSeconds', arquivo], {
      encoding: 'utf8',
    }).trim()
    const n = Number.parseFloat(s)
    return Number.isFinite(n) ? n : 0
  } catch {
    return 0
  }
}

/** Taxa que respeita o teto de tamanho: vídeo muito longo recebe taxa menor. */
function taxaPara(segundos) {
  if (segundos <= 0) return BITS_VIDEO
  const cabe = Math.floor((TETO_BYTES * 8) / segundos) - BITS_AUDIO
  return Math.max(400_000, Math.min(BITS_VIDEO, cabe))
}

const mb = (p) => (statSync(p).size / 1024 / 1024).toFixed(1)

compilar()

let feitos = 0
let pulados = 0
let pesoTotal = 0

for (const gaveta of readdirSync(entrada).sort()) {
  const num = gaveta.slice(0, 2)
  const destino = gavetas[num]
  if (!destino) continue
  if (soGaveta && num !== soGaveta.padStart(2, '0')) continue

  const dir = path.join(entrada, gaveta)
  if (!statSync(dir).isDirectory()) continue

  const arquivos = readdirSync(dir)
    .filter((f) => /\.(mp4|mov|m4v)$/i.test(f))
    .sort((a, b) => a.localeCompare(b, 'pt-BR', { numeric: true }))

  if (arquivos.length === 0) continue
  console.log(`\n── ${gaveta}`)

  const pastaVideo = path.join(assets, destino.pasta)
  const pastaPoster = path.join(assets, 'posters')
  mkdirSync(pastaVideo, { recursive: true })
  mkdirSync(pastaPoster, { recursive: true })

  arquivos.forEach((arquivo, i) => {
    const slot = destino.nome(i + 1)
    const saidaVideo = path.join(pastaVideo, `${slot}.mp4`)
    const saidaPoster = path.join(pastaPoster, `${slot}.jpg`)

    if (!refazer && existsSync(saidaVideo) && existsSync(saidaPoster)) {
      pesoTotal += statSync(saidaVideo).size
      pulados++
      console.log(`   = ${slot.padEnd(32)} já pronto`)
      return
    }

    const origem = path.join(dir, arquivo)
    const seg = duracao(origem)
    const taxa = taxaPara(seg)
    const marca = taxa < BITS_VIDEO ? ` (taxa menor: ${Math.round(seg / 60)}min)` : ''

    try {
      const dim = execFileSync(
        binario,
        ['video', origem, saidaVideo, String(LADO_MAIOR), String(taxa), String(BITS_AUDIO)],
        { encoding: 'utf8' },
      ).trim()
      // poster um pouco depois do início: o primeiro quadro costuma ser escuro
      execFileSync(binario, [
        'poster', saidaVideo, saidaPoster, '720', String(Math.min(1.5, Math.max(0.2, seg / 10))),
      ])
      pesoTotal += statSync(saidaVideo).size
      feitos++
      console.log(`   ✓ ${slot.padEnd(32)} ${dim}  ${mb(saidaVideo)} MB${marca}`)
    } catch (e) {
      console.log(`   ✗ ${slot.padEnd(32)} FALHOU — ${arquivo}`)
      console.log(`     ${String(e.stderr ?? e.message).trim().split('\n')[0]}`)
    }
  })
}

console.log(
  `\n${feitos} processados, ${pulados} já prontos. ` +
    `Peso dos vídeos: ${(pesoTotal / 1024 / 1024).toFixed(0)} MB`,
)
