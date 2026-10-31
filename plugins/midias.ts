import { existsSync, readdirSync, statSync } from 'node:fs'
import path from 'node:path'
import type { Plugin } from 'vite'
import { extensoes, pastaPosters, slots } from '../src/content/media.ts'

const ID_VIRTUAL = 'virtual:midias'
const ID_RESOLVIDO = `\0${ID_VIRTUAL}`

const EXT_POSTER = ['.webp', '.jpg', '.png']
const PASTAS_IGNORADAS = new Set(['_originais', 'node_modules'])

export type ArquivoDeSlot = {
  /** caminho público, pronto para usar em src="" */
  src: string
  /** thumbnail do vídeo, quando existir */
  poster?: string
  /** true quando o arquivo foi achado fora da pasta declarada */
  foraDoLugar?: boolean
}

/** Lista todos os arquivos de /public/assets, agrupados pelo nome sem extensão. */
function varrerAssets(raizAssets: string): Map<string, string[]> {
  const porNome = new Map<string, string[]>()
  if (!existsSync(raizAssets)) return porNome

  const andar = (dir: string) => {
    for (const entrada of readdirSync(dir)) {
      if (entrada.startsWith('.')) continue
      const completo = path.join(dir, entrada)
      if (statSync(completo).isDirectory()) {
        if (!PASTAS_IGNORADAS.has(entrada)) andar(completo)
        continue
      }
      const nome = path.basename(entrada, path.extname(entrada))
      const relativo = path.relative(raizAssets, completo).split(path.sep).join('/')
      const lista = porNome.get(nome)
      if (lista) lista.push(relativo)
      else porNome.set(nome, [relativo])
    }
  }

  andar(raizAssets)
  return porNome
}

/** Resolve cada slot para o arquivo que existe hoje em /public/assets. */
export function resolverSlots(raizPublic: string): Record<string, ArquivoDeSlot> {
  const raizAssets = path.join(raizPublic, 'assets')
  const encontrados = varrerAssets(raizAssets)
  const mapa: Record<string, ArquivoDeSlot> = {}

  for (const slot of slots) {
    const candidatos = encontrados.get(slot.id)
    if (!candidatos || candidatos.length === 0) continue

    const aceitas = extensoes[slot.tipo]
    const pontuar = (relativo: string) => {
      const ext = path.extname(relativo).toLowerCase()
      const posicaoExt = aceitas.indexOf(ext)
      if (posicaoExt === -1) return null
      const naPastaCerta = path.dirname(relativo) === slot.pasta
      return { relativo, posicaoExt, naPastaCerta }
    }

    const validos = candidatos.map(pontuar).filter((c) => c !== null)
    if (validos.length === 0) continue

    validos.sort(
      (a, b) => Number(b.naPastaCerta) - Number(a.naPastaCerta) || a.posicaoExt - b.posicaoExt,
    )
    const escolhido = validos[0]

    const entrada: ArquivoDeSlot = { src: `/assets/${escolhido.relativo}` }
    if (!escolhido.naPastaCerta) entrada.foraDoLugar = true

    if (slot.tipo === 'video') {
      for (const ext of EXT_POSTER) {
        const poster = path.join(raizAssets, pastaPosters, slot.id + ext)
        if (existsSync(poster)) {
          entrada.poster = `/assets/${pastaPosters}/${slot.id}${ext}`
          break
        }
      }
    }

    mapa[slot.id] = entrada
  }

  return mapa
}

/**
 * Entrega o módulo virtual `virtual:midias` com o mapa slot → arquivo.
 * Em desenvolvimento, fica de olho em /public/assets: colocou ou tirou arquivo,
 * a página recarrega já com a mídia nova.
 */
export function pluginMidias(): Plugin {
  let raizPublic = ''

  return {
    name: 'rc:midias',

    configResolved(config) {
      raizPublic = config.publicDir
    },

    resolveId(id) {
      if (id === ID_VIRTUAL) return ID_RESOLVIDO
    },

    load(id) {
      if (id !== ID_RESOLVIDO) return
      const mapa = resolverSlots(raizPublic)
      const foraDoLugar = Object.entries(mapa)
        .filter(([, v]) => v.foraDoLugar)
        .map(([k]) => k)

      if (foraDoLugar.length > 0) {
        this.warn(
          `mídia fora da pasta declarada: ${foraDoLugar.join(', ')} — rode "npm run midias" para ver onde deveria estar`,
        )
      }

      return `export const arquivos = ${JSON.stringify(mapa, null, 2)}\n`
    },

    configureServer(server) {
      const raizAssets = path.join(raizPublic, 'assets')
      server.watcher.add(raizAssets)

      const aoMudar = (arquivo: string) => {
        if (!arquivo.startsWith(raizAssets)) return
        const modulo = server.moduleGraph.getModuleById(ID_RESOLVIDO)
        if (modulo) server.moduleGraph.invalidateModule(modulo)
        server.ws.send({ type: 'full-reload' })
        server.config.logger.info(
          `  mídia atualizada: ${path.relative(raizAssets, arquivo)}`,
          { timestamp: true },
        )
      }

      server.watcher.on('add', aoMudar)
      server.watcher.on('unlink', aoMudar)
      server.watcher.on('change', aoMudar)
    },
  }
}
