import { useContext } from 'react'
import { I18nContext, type ContextoI18n } from '@/lib/i18n-contexto'

/** Acessa o conteúdo do idioma atual e a função de trocar idioma. */
export function useIdioma(): ContextoI18n {
  const ctx = useContext(I18nContext)
  if (!ctx) throw new Error('useIdioma precisa estar dentro de <ProvedorIdioma>')
  return ctx
}
