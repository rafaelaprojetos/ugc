import { site } from '@/content/media'
import type { Conteudo, Idioma } from '@/content/types'

function meta(seletor: string, valor: string) {
  document.head.querySelector(seletor)?.setAttribute('content', valor)
}

function link(seletor: string, valor: string) {
  document.head.querySelector(seletor)?.setAttribute('href', valor)
}

export function urlCanonica(idioma: Idioma) {
  return site.dominio + site.caminhos[idioma]
}

/**
 * Regra 10: title, description, Open Graph, canonical e hreflang
 * acompanham o idioma escolhido.
 */
export function aplicarSeo(c: Conteudo, idioma: Idioma) {
  const { seo } = c
  const canonica = urlCanonica(idioma)
  const capa = site.dominio + seo.ogImage

  document.documentElement.lang = seo.lang
  document.title = seo.title

  meta('meta[name="description"]', seo.description)
  meta('meta[property="og:title"]', seo.title)
  meta('meta[property="og:description"]', seo.description)
  meta('meta[property="og:locale"]', seo.ogLocale)
  meta('meta[property="og:locale:alternate"]', idioma === 'pt' ? 'en_US' : 'pt_BR')
  meta('meta[property="og:image"]', capa)
  meta('meta[property="og:image:alt"]', seo.ogImageAlt)
  meta('meta[property="og:url"]', canonica)
  meta('meta[name="twitter:title"]', seo.title)
  meta('meta[name="twitter:description"]', seo.description)
  meta('meta[name="twitter:image"]', capa)

  link('link[rel="canonical"]', canonica)
  link('link[rel="alternate"][hreflang="pt-BR"]', urlCanonica('pt'))
  link('link[rel="alternate"][hreflang="en"]', urlCanonica('en'))
  link('link[rel="alternate"][hreflang="x-default"]', urlCanonica('pt'))
}
