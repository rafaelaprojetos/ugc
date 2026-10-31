#!/usr/bin/env node
/**
 * midias.mjs — o painel de controle das mídias do site.
 *
 *   npm run midias                 lista o que já tem arquivo e o que falta
 *   npm run midias -- --processar  comprime vídeos, gera posters, converte para WebP
 *   npm run midias -- --vazios     mostra só os slots que ainda estão vazios
 *
 * Os slots são definidos em src/content/media.ts — este script lê de lá.
 * O --processar precisa do ffmpeg:  brew install ffmpeg
 */
import { execFile as execFileCb } from 'node:child_process'
import { mkdir, readdir, rename, stat } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { promisify } from 'node:util'
import { extensoes, pastaPosters, slots } from '../src/content/media.ts'

const execFile = promisify(execFileCb)
const raiz = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const raizAssets = path.join(raiz, 'public/assets')
const dirPosters = path.join(raizAssets, pastaPosters)
const dirOriginais = path.join(raizAssets, '_originais')

const TAMANHO_ALVO_MB = 3.9
const LARGURA_MAX = 720
const ALTURA_MAX = 1280
const AUDIO_KBPS = 96

const argumentos = new Set(process.argv.slice(2))
const processar = argumentos.has('--processar')
const soVazios = argumentos.has('--vazios')

const PASTAS_IGNORADAS = new Set(['_originais'])
const EXT_POSTER = ['.webp', '.jpg', '.png']

const mb = (bytes) => (bytes / 1024 / 1024).toFixed(1)
const existe = (p) => stat(p).then(() => true, () => false)

// ---------------------------------------------------------------------------
// Varredura
// ---------------------------------------------------------------------------

async function listarTudo(dir, base = dir) {
  const achados = []
  let entradas
  try {
    entradas = await readdir(dir, { withFileTypes: true })
  } catch {
    return achados
  }
  for (const entrada of entradas) {
    if (entrada.name.startsWith('.')) continue
    const completo = path.join(dir, entrada.name)
    if (entrada.isDirectory()) {
      if (PASTAS_IGNORADAS.has(entrada.name)) continue
      achados.push(...(await listarTudo(completo, base)))
      continue
    }
    achados.push({
      completo,
      relativo: path.relative(base, completo).split(path.sep).join('/'),
      nome: path.basename(entrada.name, path.extname(entrada.name)),
      ext: path.extname(entrada.name).toLowerCase(),
    })
  }
  return achados
}

/** Resolve cada slot para o arquivo que existe hoje. Mesma regra do plugin do Vite. */
function casarSlots(arquivos) {
  const porNome = new Map()
  for (const a of arquivos) {
    const lista = porNome.get(a.nome)
    if (lista) lista.push(a)
    else porNome.set(a.nome, [a])
  }

  const mapa = new Map()
  for (const slot of slots) {
    const candidatos = (porNome.get(slot.id) ?? [])
      .filter((a) => extensoes[slot.tipo].includes(a.ext))
      .map((a) => ({ ...a, naPastaCerta: path.dirname(a.relativo) === slot.pasta }))
      .sort(
        (x, y) =>
          Number(y.naPastaCerta) - Number(x.naPastaCerta) ||
          extensoes[slot.tipo].indexOf(x.ext) - extensoes[slot.tipo].indexOf(y.ext),
      )
    if (candidatos.length > 0) mapa.set(slot.id, candidatos[0])
  }
  return mapa
}

// ---------------------------------------------------------------------------
// ffmpeg
// ---------------------------------------------------------------------------

async function temFfmpeg() {
  try {
    await execFile('ffmpeg', ['-version'])
    await execFile('ffprobe', ['-version'])
    return true
  } catch {
    return false
  }
}

async function duracao(arquivo) {
  const { stdout } = await execFile('ffprobe', [
    '-v', 'error',
    '-show_entries', 'format=duration',
    '-of', 'default=nw=1:nk=1',
    arquivo,
  ])
  const segundos = Number.parseFloat(stdout.trim())
  return Number.isFinite(segundos) && segundos > 0 ? segundos : 0
}

/** Guarda o arquivo original em _originais/ antes de substituí-lo. */
async function guardarOriginal(completo) {
  const relativo = path.relative(raizAssets, completo)
  const destino = path.join(dirOriginais, relativo)
  await mkdir(path.dirname(destino), { recursive: true })
  await rename(completo, destino)
  return destino
}

async function comprimirVideo(slot, arquivo) {
  const destino = path.join(raizAssets, slot.pasta, `${slot.id}.mp4`)
  const { size } = await stat(arquivo.completo)

  if (arquivo.ext === '.mp4' && size <= TAMANHO_ALVO_MB * 1024 * 1024 * 1.05) {
    return { acao: 'mantido', destino, tamanho: size }
  }

  const segundos = await duracao(arquivo.completo)
  const bitrate = segundos
    ? Math.round(Math.min(3500, Math.max(600, (TAMANHO_ALVO_MB * 8192) / segundos - AUDIO_KBPS)))
    : 2200

  const temporario = path.join(raizAssets, slot.pasta, `.${slot.id}.tmp.mp4`)
  await execFile('ffmpeg', [
    '-y', '-i', arquivo.completo,
    '-vf', `scale='min(${LARGURA_MAX},iw)':'min(${ALTURA_MAX},ih)':force_original_aspect_ratio=decrease,scale=trunc(iw/2)*2:trunc(ih/2)*2`,
    '-c:v', 'libx264', '-profile:v', 'high', '-level', '4.0', '-preset', 'slow',
    '-b:v', `${bitrate}k`, '-maxrate', `${Math.round(bitrate * 1.4)}k`, '-bufsize', `${bitrate * 2}k`,
    '-pix_fmt', 'yuv420p',
    '-c:a', 'aac', '-b:a', `${AUDIO_KBPS}k`, '-ac', '2',
    '-movflags', '+faststart',
    temporario,
  ])

  await guardarOriginal(arquivo.completo)
  await rename(temporario, destino)
  const depois = await stat(destino)
  return { acao: 'comprimido', destino, tamanho: depois.size, antes: size }
}

async function gerarPoster(slot, videoPath) {
  for (const ext of EXT_POSTER) {
    if (await existe(path.join(dirPosters, slot.id + ext))) return false
  }
  const segundos = await duracao(videoPath)
  const instante = segundos > 2 ? Math.min(1.5, segundos / 3) : 0
  await mkdir(dirPosters, { recursive: true })
  await execFile('ffmpeg', [
    '-y', '-ss', String(instante), '-i', videoPath,
    '-frames:v', '1',
    '-vf', `scale='min(${LARGURA_MAX},iw)':-2`,
    '-c:v', 'libwebp', '-quality', '80',
    path.join(dirPosters, `${slot.id}.webp`),
  ])
  return true
}

async function converterParaWebp(slot, arquivo) {
  if (arquivo.ext === '.webp' || arquivo.ext === '.svg') return { acao: 'mantido' }
  const destino = path.join(raizAssets, slot.pasta, `${slot.id}.webp`)
  await execFile('ffmpeg', [
    '-y', '-i', arquivo.completo,
    '-vf', "scale='min(1600,iw)':-2",
    '-c:v', 'libwebp', '-quality', '82',
    destino,
  ])
  await guardarOriginal(arquivo.completo)
  return { acao: 'convertido', destino }
}

// ---------------------------------------------------------------------------
// Comandos
// ---------------------------------------------------------------------------

async function rodarProcessamento(mapa) {
  if (!(await temFfmpeg())) {
    console.log('\n  ffmpeg não encontrado — nada foi processado.')
    console.log('  Instale com:  brew install ffmpeg\n')
    return
  }

  console.log('\nProcessando…')
  let mexidos = 0

  for (const slot of slots) {
    const arquivo = mapa.get(slot.id)
    if (!arquivo) continue

    try {
      if (slot.tipo === 'video') {
        const r = await comprimirVideo(slot, arquivo)
        if (r.acao === 'comprimido') {
          console.log(`  ${slot.id}: ${mb(r.antes)}MB → ${mb(r.tamanho)}MB`)
          mexidos++
        }
        if (await gerarPoster(slot, r.destino)) {
          console.log(`  ${slot.id}: poster gerado`)
          mexidos++
        }
      } else {
        const r = await converterParaWebp(slot, arquivo)
        if (r.acao === 'convertido') {
          console.log(`  ${slot.id}: convertido para WebP`)
          mexidos++
        }
      }
    } catch (erro) {
      console.error(`  ${slot.id}: falhou — ${erro.stderr ? String(erro.stderr).split('\n').at(-2) : erro.message}`)
    }
  }

  if (mexidos === 0) console.log('  Nada a fazer: tudo já estava pronto.')
  console.log('  Originais guardados em public/assets/_originais/\n')
}

function imprimirLista(mapa, arquivos) {
  const grupos = [...new Set(slots.map((s) => s.grupo))]
  const preenchidos = slots.filter((s) => mapa.has(s.id))

  for (const grupo of grupos) {
    const doGrupo = slots.filter((s) => s.grupo === grupo)
    const prontos = doGrupo.filter((s) => mapa.has(s.id))
    if (soVazios && prontos.length === doGrupo.length) continue

    console.log(`\n${grupo}  (${prontos.length}/${doGrupo.length})`)
    for (const slot of doGrupo) {
      const arquivo = mapa.get(slot.id)
      if (arquivo && soVazios) continue
      if (arquivo) {
        const foraDoLugar = path.dirname(arquivo.relativo) !== slot.pasta
        const semPoster =
          slot.tipo === 'video' &&
          !EXT_POSTER.some((e) => arquivos.some((a) => a.relativo === `${pastaPosters}/${slot.id}${e}`))
        const avisos = [
          foraDoLugar ? `fora do lugar, era ${slot.pasta}/` : '',
          semPoster ? 'sem poster' : '',
        ].filter(Boolean)
        console.log(
          `  ok  ${slot.id.padEnd(32)} assets/${arquivo.relativo}${avisos.length ? `  (${avisos.join(', ')})` : ''}`,
        )
      } else {
        console.log(
          `  --  ${slot.id.padEnd(32)} falta: assets/${slot.pasta}/${slot.id}${extensoes[slot.tipo][0]}`,
        )
      }
    }
  }

  // arquivos que não casam com nenhum slot: provável erro de digitação
  const idsConhecidos = new Set(slots.map((s) => s.id))
  const extMidia = new Set(Object.values(extensoes).flat())
  const soltos = arquivos.filter(
    (a) =>
      extMidia.has(a.ext) &&
      !idsConhecidos.has(a.nome) &&
      !a.relativo.startsWith(`${pastaPosters}/`) &&
      !a.relativo.startsWith('og/'),
  )
  if (soltos.length > 0) {
    console.log('\nSem slot correspondente (confira o nome):')
    for (const a of soltos) console.log(`  ??  assets/${a.relativo}`)
  }

  console.log(
    `\n${preenchidos.length} de ${slots.length} slots com arquivo — faltam ${slots.length - preenchidos.length}.\n`,
  )
}

const arquivos = await listarTudo(raizAssets)
const mapa = casarSlots(arquivos)

if (processar) {
  await rodarProcessamento(mapa)
  const depois = await listarTudo(raizAssets)
  imprimirLista(casarSlots(depois), depois)
} else {
  imprimirLista(mapa, arquivos)
}
