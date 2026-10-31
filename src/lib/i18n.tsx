import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { site } from '@/content/media'
import type { Idioma } from '@/content/types'
import {
  CHAVE_STORAGE,
  dicionarios,
  I18nContext,
  idiomaDoCaminho,
  idiomaInicial,
  type ContextoI18n,
} from '@/lib/i18n-contexto'
import { secaoNoTopo } from '@/lib/secoes'
import { aplicarSeo } from '@/lib/seo'

export function ProvedorIdioma({ children }: { children: ReactNode }) {
  const [idioma, setIdioma] = useState<Idioma>(idiomaInicial)
  const secaoParaManter = useRef<string | null>(null)

  const trocarIdioma = useCallback((novo: Idioma) => {
    // guarda onde a pessoa estava: o texto muda de tamanho entre os idiomas,
    // então é a seção que importa, não a posição em pixels
    secaoParaManter.current = window.scrollY > 80 ? secaoNoTopo() : null
    setIdioma(novo)
    try {
      localStorage.setItem(CHAVE_STORAGE, novo)
    } catch {
      /* sem persistência, sem problema */
    }
    const destino = site.caminhos[novo] + window.location.hash
    if (window.location.pathname + window.location.hash !== destino) {
      window.history.pushState(null, '', destino)
    }
  }, [])

  const c = dicionarios[idioma]

  // Volta para a mesma seção depois que o conteúdo troca, antes de pintar
  useLayoutEffect(() => {
    const id = secaoParaManter.current
    if (!id) return
    secaoParaManter.current = null
    document.getElementById(id)?.scrollIntoView({ behavior: 'instant' })
  }, [idioma])

  // Regra 10 + domínio: SEO, canonical e hreflang acompanham o idioma
  useEffect(() => {
    aplicarSeo(c, idioma)
  }, [c, idioma])

  // Chegou em "/" (ou caminho desconhecido): normaliza para /pt ou /en
  useEffect(() => {
    if (idiomaDoCaminho(window.location.pathname)) return
    window.history.replaceState(null, '', site.caminhos[idioma] + window.location.hash)
  }, [idioma])

  // Botão voltar/avançar do navegador troca o idioma junto
  useEffect(() => {
    const aoVoltar = () => {
      const doCaminho = idiomaDoCaminho(window.location.pathname)
      if (doCaminho) setIdioma(doCaminho)
    }
    window.addEventListener('popstate', aoVoltar)
    return () => window.removeEventListener('popstate', aoVoltar)
  }, [])

  const valor = useMemo<ContextoI18n>(
    () => ({ idioma, trocarIdioma, c }),
    [idioma, trocarIdioma, c],
  )

  return <I18nContext value={valor}>{children}</I18nContext>
}
