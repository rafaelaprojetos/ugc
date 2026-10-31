import { createContext } from 'react'
import en from '@/content/en.json'
import pt from '@/content/pt.json'
import { site } from '@/content/media'
import type { Conteudo, Idioma } from '@/content/types'

export const dicionarios: Record<Idioma, Conteudo> = { pt, en }
export const CHAVE_STORAGE = 'rc:idioma'

export type ContextoI18n = {
  idioma: Idioma
  trocarIdioma: (idioma: Idioma) => void
  /** todo o conteúdo do idioma atual */
  c: Conteudo
}

export const I18nContext = createContext<ContextoI18n | null>(null)

/** /pt e /en são as URLs oficiais; qualquer outro caminho cai na detecção. */
export function idiomaDoCaminho(caminho: string): Idioma | null {
  const limpo = caminho.replace(/\/+$/, '').toLowerCase()
  if (limpo === site.caminhos.en) return 'en'
  if (limpo === site.caminhos.pt) return 'pt'
  return null
}

export function idiomaInicial(): Idioma {
  const doCaminho = idiomaDoCaminho(window.location.pathname)
  if (doCaminho) return doCaminho

  try {
    const salvo = localStorage.getItem(CHAVE_STORAGE)
    if (salvo === 'pt' || salvo === 'en') return salvo
  } catch {
    /* localStorage bloqueado — segue na detecção do navegador */
  }
  return navigator.language.toLowerCase().startsWith('pt') ? 'pt' : 'en'
}
