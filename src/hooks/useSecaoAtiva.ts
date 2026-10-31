import { useEffect, useState } from 'react'

/**
 * Descobre qual seção está na tela para destacar o link na barra do topo.
 * Usa a posição de scroll (previsível) em vez de IntersectionObserver.
 */
export function useSecaoAtiva(ids: readonly string[]): string {
  const [ativa, setAtiva] = useState(ids[0] ?? '')

  useEffect(() => {
    let frame = 0

    const calcular = () => {
      frame = 0
      const navH = Number.parseInt(
        getComputedStyle(document.documentElement).getPropertyValue('--nav-h'),
        10,
      )
      const limite = (Number.isNaN(navH) ? 56 : navH) + 24

      let atual = ids[0] ?? ''
      for (const id of ids) {
        const el = document.getElementById(id)
        if (!el) continue
        if (el.getBoundingClientRect().top - limite <= 0) atual = id
      }

      // Chegou no fim da página: destaca a última seção
      const fim = window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 4
      if (fim && ids.length > 0) atual = ids[ids.length - 1]

      setAtiva(atual)
    }

    const agendar = () => {
      if (frame) return
      frame = requestAnimationFrame(calcular)
    }

    calcular()
    window.addEventListener('scroll', agendar, { passive: true })
    window.addEventListener('resize', agendar)
    return () => {
      if (frame) cancelAnimationFrame(frame)
      window.removeEventListener('scroll', agendar)
      window.removeEventListener('resize', agendar)
    }
  }, [ids])

  return ativa
}
