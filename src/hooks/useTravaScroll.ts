import { useEffect } from 'react'

/** Trava o scroll do fundo enquanto o menu (ou um modal) está aberto. */
export function useTravaScroll(ativo: boolean) {
  useEffect(() => {
    if (!ativo) return
    const anterior = document.body.style.overflow
    const compensacao = window.innerWidth - document.documentElement.clientWidth
    document.body.style.overflow = 'hidden'
    if (compensacao > 0) document.body.style.paddingRight = `${compensacao}px`
    return () => {
      document.body.style.overflow = anterior
      document.body.style.paddingRight = ''
    }
  }, [ativo])
}
