import { arquivos } from 'virtual:midias'
import { extensoes, type Slot } from '@/content/media'

export type { Slot }

/**
 * Onde o site está servido: '/' em domínio próprio, '/portfolio/' no
 * GitHub Pages de projeto. O Vite preenche isso no build.
 */
export const base = import.meta.env.BASE_URL

/** O arquivo que existe hoje para esse slot, ou null se a pasta ainda está vazia. */
export function arquivoDoSlot(id: string) {
  const achado = arquivos[id]
  if (!achado) return null
  return {
    ...achado,
    src: base + achado.src,
    poster: achado.poster ? base + achado.poster : undefined,
  }
}

/** Caminho e nome que o arquivo precisa ter para o site achá-lo sozinho. */
export function caminhoEsperado(s: Slot) {
  return `/assets/${s.pasta}/${s.id}${extensoes[s.tipo][0]}`
}

/** Endereço de uma rota de idioma, já com a base do lugar onde o site está. */
export function caminhoDoIdioma(idioma: 'pt' | 'en') {
  return `${base}${idioma}`
}

/** Todas as extensões aceitas para esse slot, para mostrar na página /slots. */
export function extensoesAceitas(s: Slot) {
  return extensoes[s.tipo].join(' ')
}

export const proporcoes = {
  '9:16': 'aspect-[9/16]',
  '4:5': 'aspect-[4/5]',
  '16:9': 'aspect-[16/9]',
  '1:1': 'aspect-square',
  circulo: 'aspect-square rounded-full',
} as const
