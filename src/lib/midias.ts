import { arquivos } from 'virtual:midias'
import { extensoes, type Slot } from '@/content/media'

export type { Slot }

/** O arquivo que existe hoje para esse slot, ou null se a pasta ainda está vazia. */
export function arquivoDoSlot(id: string) {
  return arquivos[id] ?? null
}

/** Caminho e nome que o arquivo precisa ter para o site achá-lo sozinho. */
export function caminhoEsperado(s: Slot) {
  return `/assets/${s.pasta}/${s.id}${extensoes[s.tipo][0]}`
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
