import { useEffect } from 'react'

/**
 * Trava o scroll do fundo enquanto o menu (ou um modal) está aberto.
 *
 * `overflow: hidden` no body **não segura o Safari do iPhone** — lá a página
 * continua rolando atrás do modal. O que funciona é prender o body com
 * `position: fixed` no deslocamento atual e devolver a posição ao fechar.
 */
export function useTravaScroll(ativo: boolean) {
  useEffect(() => {
    if (!ativo) return

    const body = document.body
    const alturaDaRolagem = window.scrollY
    const antes = {
      overflow: body.style.overflow,
      position: body.style.position,
      top: body.style.top,
      left: body.style.left,
      right: body.style.right,
      width: body.style.width,
      paddingRight: body.style.paddingRight,
    }
    // sem isso a página pula para a direita quando a barra de rolagem some
    const compensacao = window.innerWidth - document.documentElement.clientWidth

    body.style.overflow = 'hidden'
    body.style.position = 'fixed'
    body.style.top = `-${alturaDaRolagem}px`
    body.style.left = '0'
    body.style.right = '0'
    body.style.width = '100%'
    if (compensacao > 0) body.style.paddingRight = `${compensacao}px`

    return () => {
      body.style.overflow = antes.overflow
      body.style.position = antes.position
      body.style.top = antes.top
      body.style.left = antes.left
      body.style.right = antes.right
      body.style.width = antes.width
      body.style.paddingRight = antes.paddingRight
      // 'instant' porque o html tem scroll-behavior: smooth — sem isso a página
      // volta deslizando e o usuário vê um solavanco ao fechar
      window.scrollTo({ top: alturaDaRolagem, left: 0, behavior: 'instant' })
    }
  }, [ativo])
}
